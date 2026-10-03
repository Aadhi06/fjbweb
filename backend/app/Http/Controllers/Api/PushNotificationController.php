<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushNotificationController extends Controller
{
    public function vapidKey(WebPushService $push): JsonResponse
    {
        return response()->json([
            'public_key' => $push->publicKey(),
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|url|max:2048',
            'keys.p256dh' => 'required|string|max:255',
            'keys.auth' => 'required|string|max:255',
        ]);

        $subscription = PushSubscription::query()->where('endpoint', $validated['endpoint'])->first();
        if (!$subscription) {
            $subscription = new PushSubscription();
            $subscription->endpoint = $validated['endpoint'];
        }

        $subscription->fill([
            'user_id' => $request->user()?->id,
            'public_key' => $validated['keys']['p256dh'],
            'auth_token' => $validated['keys']['auth'],
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
            'last_used_at' => now(),
        ]);
        $subscription->save();

        return response()->json([
            'ok' => true,
            'id' => $subscription->id,
        ]);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string',
        ]);

        PushSubscription::query()->where('endpoint', $validated['endpoint'])->delete();

        return response()->json(['ok' => true]);
    }

    public function test(Request $request, WebPushService $push): JsonResponse
    {
        $push->notifyAdmins(
            'FJB alerts are on',
            'You will get a phone alert for new bookings, enquiries and customer replies.',
            '/admin?tab=messages',
            'fjb-test'
        );

        return response()->json([
            'ok' => true,
            'subscriptions' => PushSubscription::query()->count(),
        ]);
    }
}
