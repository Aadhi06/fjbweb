<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AdminBookingNotification;
use App\Mail\CustomerBookingConfirmation;
use App\Models\Booking;
use App\Models\BookingSetting;
use App\Models\Setting;
use App\Services\MarketingContactService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function availableSlots(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
        ]);

        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek;

        $setting = BookingSetting::where('day_of_week', $dayOfWeek)->first();

        if (!$setting || !$setting->is_open) {
            return response()->json([
                'date' => $date->toDateString(),
                'day' => $date->format('l'),
                'slots' => [],
                'closed' => true,
            ]);
        }

        $slots = [];
        $openTime = Carbon::parse($setting->open_time);
        $closeTime = Carbon::parse($setting->close_time);
        $duration = $setting->slot_duration_minutes;

        $existingBookings = Booking::where('booking_date', $date->toDateString())
            ->active()
            ->select('booking_time', DB::raw('COUNT(*) as count'))
            ->groupBy('booking_time')
            ->pluck('count', 'booking_time');

        $current = $openTime->copy();
        while ($current->lt($closeTime)) {
            $timeStr = $current->format('H:i');
            $bookedCount = $existingBookings->get($timeStr, 0);
            $available = $bookedCount < $setting->max_bookings_per_slot;

            $slots[] = [
                'time' => $timeStr,
                'available' => $available,
            ];

            $current->addMinutes($duration);
        }

        return response()->json([
            'date' => $date->toDateString(),
            'day' => $date->format('l'),
            'slots' => $slots,
            'closed' => false,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'service_type' => ['required', Rule::in([
                'Sell Gold', 'Sell Diamonds', 'Sell Gemstones',
                'Sell Watches', 'Sell Jewellery', 'Sell Silver', 'General Enquiry',
            ])],
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|string',
            'notes' => 'nullable|string|max:1000',
        ]);

        $date = Carbon::parse($validated['booking_date']);
        $dayOfWeek = $date->dayOfWeek;

        $setting = BookingSetting::where('day_of_week', $dayOfWeek)->first();

        if (!$setting || !$setting->is_open) {
            return response()->json(['message' => 'Bookings are not available on this day.'], 422);
        }

        $existingCount = Booking::where('booking_date', $validated['booking_date'])
            ->where('booking_time', $validated['booking_time'])
            ->active()
            ->count();

        if ($existingCount >= $setting->max_bookings_per_slot) {
            return response()->json(['message' => 'This time slot is no longer available. Please choose another.'], 422);
        }

        $booking = Booking::create($validated);

        try {
            app(MarketingContactService::class)->upsertFromBooking($booking);
        } catch (\Exception $e) {
            Log::error("Failed to sync marketing contact from booking: {$e->getMessage()}");
        }

        try {
            $adminEmail = Setting::get('admin_email', 'info@finejewellerybuyers.co.uk');
            Mail::to($adminEmail)->queue(new AdminBookingNotification($booking));
        } catch (\Exception $e) {
            Log::error("Failed to send admin booking notification: {$e->getMessage()}");
        }

        try {
            Mail::to($booking->email)->queue(new CustomerBookingConfirmation($booking));
        } catch (\Exception $e) {
            Log::error("Failed to send customer booking confirmation: {$e->getMessage()}");
        }

        return response()->json([
            'message' => 'Booking confirmed successfully!',
            'booking' => [
                'id' => $booking->id,
                'name' => $booking->name,
                'email' => $booking->email,
                'service_type' => $booking->service_type,
                'booking_date' => $date->format('l, j F Y'),
                'booking_time' => $booking->booking_time,
                'status' => $booking->status,
            ],
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Booking::query()->orderBy('booking_date', 'desc')->orderBy('booking_time', 'desc');

        if ($request->has('date')) {
            $query->where('booking_date', $request->date);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'cancelled', 'completed'])],
        ]);

        $booking->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Booking status updated.',
            'booking' => $booking->fresh(),
        ]);
    }

    public function settings(): JsonResponse
    {
        $settings = BookingSetting::orderBy('day_of_week')->get();
        return response()->json($settings);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.day_of_week' => 'required|integer|between:0,6',
            'settings.*.is_open' => 'required|boolean',
            'settings.*.open_time' => 'required|string',
            'settings.*.close_time' => 'required|string',
            'settings.*.slot_duration_minutes' => 'required|integer|min:10|max:120',
            'settings.*.max_bookings_per_slot' => 'required|integer|min:1|max:10',
        ]);

        foreach ($validated['settings'] as $setting) {
            BookingSetting::updateOrCreate(
                ['day_of_week' => $setting['day_of_week']],
                $setting
            );
        }

        return response()->json([
            'message' => 'Booking settings updated.',
            'settings' => BookingSetting::orderBy('day_of_week')->get(),
        ]);
    }
}
