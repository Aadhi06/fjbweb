<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\FormSubmission;
use App\Models\MarketingContact;
use App\Models\MetalRate;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'new_submissions' => FormSubmission::where('status', 'new')->count(),
                'total_submissions' => FormSubmission::count(),
                'total_bookings' => Booking::count(),
                'pending_bookings' => Booking::where('status', 'pending')->count(),
                'active_rates' => MetalRate::active()->count(),
                'published_blogs' => Blog::published()->count(),
                'marketing_contacts' => MarketingContact::count(),
                'subscribed_contacts' => MarketingContact::where('is_subscribed', true)->count(),
            ],
            'recent_submissions' => FormSubmission::with('form')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'form' => $s->form?->title ?? 'Unknown Form',
                    'status' => $s->status,
                    'data' => $s->data,
                    'created_at' => $s->created_at->diffForHumans(),
                ]),
            'recent_bookings' => Booking::latest()
                ->take(5)
                ->get()
                ->map(fn ($b) => [
                    'id' => $b->id,
                    'name' => $b->name,
                    'service_type' => $b->service_type,
                    'booking_date' => $b->booking_date->format('j M Y'),
                    'booking_time' => $b->booking_time,
                    'status' => $b->status,
                    'created_at' => $b->created_at->diffForHumans(),
                ]),
        ]);
    }
}
