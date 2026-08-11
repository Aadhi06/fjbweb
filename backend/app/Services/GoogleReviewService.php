<?php

namespace App\Services;

use App\Models\GoogleReviewCache;
use App\Models\ManualReview;
use App\Models\ReviewModeration;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleReviewService
{
    public function fetchAndCacheReviews(): bool
    {
        $apiKey = Setting::get('google_api_key', config('services.google.places_api_key'));
        $placeId = Setting::get('google_place_id', config('services.google.place_id'));

        if (!$apiKey || !$placeId) {
            Log::warning('Google Places API key or Place ID not configured');
            return false;
        }

        try {
            $response = Http::get('https://maps.googleapis.com/maps/api/place/details/json', [
                'place_id' => $placeId,
                'fields' => 'name,rating,user_ratings_total,reviews',
                'key' => $apiKey,
                'reviews_sort' => 'newest',
            ]);

            if (!$response->successful()) {
                Log::error('Google Places API error: ' . $response->body());
                return false;
            }

            $data = $response->json();
            $status = $data['status'] ?? 'UNKNOWN';

            if ($status !== 'OK') {
                $message = $data['error_message'] ?? "Google Places API returned status: {$status}";
                Log::error('Google Places API error: ' . $message);
                Cache::put('google_reviews_last_error', $message, 3600);
                return false;
            }

            Cache::forget('google_reviews_last_error');
            $result = $data['result'] ?? [];
            $reviews = collect($result['reviews'] ?? [])->map(fn ($r) => [
                'author_name' => $r['author_name'] ?? 'Anonymous',
                'rating' => $r['rating'] ?? 5,
                'text' => $r['text'] ?? '',
                'relative_time_description' => $r['relative_time_description'] ?? '',
                'profile_photo_url' => $r['profile_photo_url'] ?? null,
                'time' => $r['time'] ?? 0,
            ])->toArray();

            GoogleReviewCache::updateOrCreate(
                ['place_id' => $placeId],
                [
                    'place_name' => $result['name'] ?? 'Fine Jewellery Buyers',
                    'rating' => $result['rating'] ?? 0,
                    'total_reviews' => $result['user_ratings_total'] ?? 0,
                    'reviews' => $reviews,
                    'fetched_at' => now(),
                ]
            );

            if (isset($result['rating'])) {
                Setting::set('google_rating', $result['rating'], 'number', 'google', 'Google Rating');
            }
            if (isset($result['user_ratings_total'])) {
                Setting::set('total_reviews', $result['user_ratings_total'], 'number', 'google', 'Total Reviews');
            }

            Cache::forget('google_reviews');
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to fetch Google reviews: ' . $e->getMessage());
            return false;
        }
    }

    public function getReviews(): array
    {
        return Cache::remember('google_reviews', 86400, function () {
            $payload = $this->buildReviewPayload(publicOnly: true);
            return $payload;
        });
    }

    /** Full list for admin (includes non-5-star and hidden). */
    public function getAdminGoogleReviews(): array
    {
        return $this->buildReviewPayload(publicOnly: false)['reviews'];
    }

    private function buildReviewPayload(bool $publicOnly): array
    {
        $placeId = Setting::get('google_place_id', config('services.google.place_id'));
        $cached = GoogleReviewCache::where('place_id', $placeId)->latest('fetched_at')->first();

        $moderations = ReviewModeration::all()->keyBy('review_key');

        $googleReviews = collect($cached?->reviews ?? [])->map(function ($r) use ($moderations) {
            $key = ReviewModeration::makeKey(
                $r['author_name'] ?? '',
                $r['time'] ?? 0,
                $r['text'] ?? ''
            );
            $mod = $moderations->get($key);

            return [
                'review_key' => $key,
                'author_name' => $r['author_name'] ?? 'Anonymous',
                'rating' => (int) ($r['rating'] ?? 5),
                'text' => $r['text'] ?? '',
                'relative_time_description' => $r['relative_time_description'] ?? '',
                'profile_photo_url' => $r['profile_photo_url'] ?? null,
                'time' => $r['time'] ?? 0,
                'source' => 'google',
                'is_hidden' => (bool) ($mod?->is_hidden ?? false),
                'reply_text' => $mod?->reply_text,
                'replied_at' => $mod?->replied_at?->toIso8601String(),
            ];
        })->values()->all();

        $hasGoogleReviews = count($googleReviews) > 0;

        $manualReviews = ManualReview::query()
            ->when($publicOnly, fn ($q) => $q->active())
            ->orderBy('sort_order')
            ->orderByDesc('review_date')
            ->get()
            ->map(function ($r) use ($moderations) {
                $key = 'manual:' . $r->id;
                $mod = $moderations->get($key);

                return [
                    'review_key' => $key,
                    'author_name' => $r->name,
                    'rating' => (int) $r->rating,
                    'text' => $r->text,
                    'relative_time_description' => $r->review_date
                        ? $r->review_date->diffForHumans()
                        : 'recently',
                    'profile_photo_url' => $r->photo_url,
                    'time' => $r->review_date ? $r->review_date->timestamp : $r->created_at->timestamp,
                    'source' => 'manual',
                    'manual_id' => $r->id,
                    'is_active' => (bool) $r->is_active,
                    'is_hidden' => (bool) ($mod?->is_hidden ?? false),
                    'reply_text' => $mod?->reply_text,
                    'replied_at' => $mod?->replied_at?->toIso8601String(),
                ];
            })
            ->all();

        $allReviews = array_merge($googleReviews, $manualReviews);

        if ($publicOnly) {
            $allReviews = array_values(array_filter($allReviews, function ($r) {
                if (($r['rating'] ?? 0) < 5) {
                    return false;
                }
                if (!empty($r['is_hidden'])) {
                    return false;
                }
                if (($r['source'] ?? '') === 'manual' && empty($r['is_active'])) {
                    return false;
                }
                return true;
            }));
        }

        usort($allReviews, fn ($a, $b) => ($b['time'] ?? 0) <=> ($a['time'] ?? 0));

        return [
            'place_name' => $cached->place_name ?? Setting::get('business_name', 'Fine Jewellery Buyers'),
            'rating' => $hasGoogleReviews
                ? (float) $cached->rating
                : (float) Setting::get('google_rating', 4.9),
            'total_reviews' => $hasGoogleReviews
                ? (int) $cached->total_reviews
                : (int) Setting::get('total_reviews', 0),
            'reviews' => $allReviews,
            'google_review_count' => count(array_filter($googleReviews, fn ($r) => empty($r['is_hidden']))),
            'manual_review_count' => count(array_filter($manualReviews, fn ($r) => !empty($r['is_active']))),
        ];
    }

    public function getCachedReviewCount(): int
    {
        $placeId = Setting::get('google_place_id', config('services.google.place_id'));
        $cached = GoogleReviewCache::where('place_id', $placeId)->latest('fetched_at')->first();
        return $cached ? count($cached->reviews ?? []) : 0;
    }

    public function getLastFetchedAt(): ?string
    {
        $placeId = Setting::get('google_place_id', config('services.google.place_id'));
        $cached = GoogleReviewCache::where('place_id', $placeId)->latest('fetched_at')->first();
        return $cached?->fetched_at?->toIso8601String();
    }
}
