<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingSetting;
use App\Services\BookingMailService;
use App\Services\MarketingContactService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function __construct(private BookingMailService $mailService) {}

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

        $this->mailService->sendAdminNotification($booking);
        $this->mailService->sendReceived($booking);

        return response()->json([
            'message' => 'Booking received! Our team will confirm your appointment by email.',
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

    public function update(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'sometimes|string|max:20',
            'notes' => 'nullable|string|max:1000',
        ]);

        $booking->update($validated);
        $booking->refresh();

        try {
            app(MarketingContactService::class)->upsertFromBooking($booking);
        } catch (\Exception $e) {
            Log::error("Failed to sync marketing contact after booking update: {$e->getMessage()}");
        }

        return response()->json([
            'message' => 'Booking details updated.',
            'booking' => $booking,
        ]);
    }

    public function remind(Booking $booking): JsonResponse
    {
        if (in_array($booking->status, ['cancelled', 'completed'], true)) {
            return response()->json(['message' => 'Cannot remind a cancelled or completed booking.'], 422);
        }

        if (!$booking->email) {
            return response()->json(['message' => 'This booking has no email address.'], 422);
        }

        $sent = $this->mailService->sendReminder($booking);

        if (!$sent) {
            return response()->json([
                'message' => 'Could not send reminder. Check SMTP settings in Admin → Settings.',
            ], 500);
        }

        return response()->json([
            'message' => 'Reminder emailed to ' . $booking->email,
            'booking' => $booking,
        ]);
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'cancelled', 'completed'])],
            'reason' => 'nullable|string|max:500',
        ]);

        $previousStatus = $booking->status;
        $booking->update(['status' => $validated['status']]);
        $booking->refresh();

        if ($validated['status'] === 'confirmed' && $previousStatus !== 'confirmed') {
            $this->mailService->sendConfirmed($booking);
        }

        if ($validated['status'] === 'cancelled' && $previousStatus !== 'cancelled') {
            $this->mailService->sendCancelled($booking, $validated['reason'] ?? null);
        }

        return response()->json([
            'message' => 'Booking status updated.',
            'booking' => $booking,
        ]);
    }

    public function reschedule(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|string',
            'status' => ['nullable', Rule::in(['pending', 'confirmed'])],
        ]);

        $date = Carbon::parse($validated['booking_date']);
        $dayOfWeek = $date->dayOfWeek;
        $setting = BookingSetting::where('day_of_week', $dayOfWeek)->first();

        if (!$setting || !$setting->is_open) {
            return response()->json(['message' => 'Bookings are not available on this day.'], 422);
        }

        $existingCount = Booking::where('booking_date', $validated['booking_date'])
            ->where('booking_time', $validated['booking_time'])
            ->where('id', '!=', $booking->id)
            ->active()
            ->count();

        if ($existingCount >= $setting->max_bookings_per_slot) {
            return response()->json(['message' => 'This time slot is no longer available.'], 422);
        }

        $previousDate = $booking->booking_date->format('l, j F Y');
        $previousTime = $booking->booking_time;
        $previousStatus = $booking->status;

        $booking->update([
            'booking_date' => $validated['booking_date'],
            'booking_time' => $validated['booking_time'],
            'status' => $validated['status'] ?? ($booking->status === 'cancelled' ? 'confirmed' : $booking->status),
        ]);

        $booking->refresh();
        $this->mailService->sendRescheduled($booking, $previousDate, $previousTime);

        if ($booking->status === 'confirmed' && $previousStatus !== 'confirmed') {
            $this->mailService->sendConfirmed($booking);
        }

        return response()->json([
            'message' => 'Booking rescheduled and customer notified.',
            'booking' => $booking,
        ]);
    }

    public function emailTemplates(): JsonResponse
    {
        return response()->json([
            'data' => $this->mailService->getTemplatePreviews(),
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
