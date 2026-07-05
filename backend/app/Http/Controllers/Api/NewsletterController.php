<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MarketingContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request, MarketingContactService $service): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:255',
        ]);

        $contact = $service->subscribeFromNewsletter(
            $validated['email'],
            $validated['name'] ?? null,
        );

        return response()->json([
            'message' => 'Thank you for subscribing.',
            'data' => ['email' => $contact->email],
        ], 201);
    }
}
