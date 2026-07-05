<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MarketingContact;
use App\Services\MarketingContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarketingContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MarketingContact::query()->orderByDesc('last_seen_at');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->get('subscribed') === '1') {
            $query->where('is_subscribed', true);
        } elseif ($request->get('subscribed') === '0') {
            $query->where('is_subscribed', false);
        }

        if ($tag = $request->get('tag')) {
            $query->whereJsonContains('tags', $tag);
        }

        $contacts = $query->paginate($request->get('per_page', 25));

        return response()->json($contacts);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => MarketingContact::count(),
            'subscribed' => MarketingContact::where('is_subscribed', true)->count(),
            'unsubscribed' => MarketingContact::where('is_subscribed', false)->count(),
            'newsletter_subscribers' => MarketingContact::where('is_subscribed', true)
                ->whereJsonContains('tags', 'newsletter-popup')->count(),
            'from_forms' => MarketingContact::whereJsonContains('tags', 'form:free-valuation')
                ->orWhere('tags', 'like', '%form:%')
                ->count(),
            'from_bookings' => MarketingContact::whereJsonContains('tags', 'booking')->count(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'notes' => 'nullable|string|max:2000',
            'is_subscribed' => 'boolean',
        ]);

        $email = strtolower(trim($validated['email']));
        $contact = MarketingContact::firstOrNew(['email' => $email]);

        if (!$contact->exists) {
            $contact->first_seen_at = now();
            $contact->sources = [[
                'type' => 'manual',
                'id' => null,
                'label' => 'Added manually',
                'at' => now()->toIso8601String(),
            ]];
        }

        $contact->fill([
            'name' => $validated['name'] ?? $contact->name,
            'phone' => $validated['phone'] ?? $contact->phone,
            'notes' => $validated['notes'] ?? $contact->notes,
            'is_subscribed' => $validated['is_subscribed'] ?? true,
            'last_seen_at' => now(),
        ]);

        if ($contact->is_subscribed && !$contact->consent_at) {
            $contact->consent_at = now();
        }

        $contact->save();

        return response()->json(['message' => 'Contact saved.', 'data' => $contact], 201);
    }

    public function update(Request $request, MarketingContact $contact): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'notes' => 'nullable|string|max:2000',
            'is_subscribed' => 'boolean',
        ]);

        $contact->fill($validated);

        if ($contact->is_subscribed && !$contact->consent_at) {
            $contact->consent_at = now();
        }

        $contact->save();

        return response()->json(['message' => 'Contact updated.', 'data' => $contact]);
    }

    public function destroy(MarketingContact $contact): JsonResponse
    {
        $contact->delete();

        return response()->json(['message' => 'Contact deleted.']);
    }

    public function sync(MarketingContactService $service): JsonResponse
    {
        $result = $service->syncAllFromSources();

        return response()->json([
            'message' => 'Contacts synced from forms and bookings.',
            'data' => $result,
        ]);
    }
}
