<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ManualReview;
use App\Services\GoogleReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ReviewController extends Controller
{
    public function __construct(private GoogleReviewService $reviewService) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->reviewService->getReviews(),
        ]);
    }

    public function adminStatus(): JsonResponse
    {
        return response()->json([
            'cached_google_reviews' => $this->reviewService->getCachedReviewCount(),
            'manual_reviews' => ManualReview::count(),
            'active_manual_reviews' => ManualReview::active()->count(),
            'last_fetched_at' => $this->reviewService->getLastFetchedAt(),
        ]);
    }

    public function fetchNow(): JsonResponse
    {
        $success = $this->reviewService->fetchAndCacheReviews();
        $error = Cache::get('google_reviews_last_error');

        return response()->json([
            'success' => $success,
            'message' => $success
                ? 'Reviews fetched successfully'
                : ($error ?: 'Failed to fetch reviews. Check API key and Place ID.'),
            'cached_google_reviews' => $this->reviewService->getCachedReviewCount(),
            'last_fetched_at' => $this->reviewService->getLastFetchedAt(),
        ], $success ? 200 : 422);
    }

    public function manualIndex(): JsonResponse
    {
        $reviews = ManualReview::orderBy('sort_order')->orderByDesc('review_date')->get();
        return response()->json(['data' => $reviews]);
    }

    public function manualStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'text' => 'required|string|max:2000',
            'review_date' => 'nullable|date',
            'photo_url' => 'nullable|url|max:500',
            'is_active' => 'boolean',
        ]);

        $validated['sort_order'] = ManualReview::max('sort_order') + 1;

        $review = ManualReview::create($validated);
        Cache::forget('google_reviews');

        return response()->json([
            'message' => 'Review created',
            'data' => $review,
        ], 201);
    }

    public function manualUpdate(Request $request, ManualReview $manualReview): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'rating' => 'sometimes|integer|min:1|max:5',
            'text' => 'sometimes|string|max:2000',
            'review_date' => 'nullable|date',
            'photo_url' => 'nullable|url|max:500',
            'is_active' => 'boolean',
        ]);

        $manualReview->update($validated);
        Cache::forget('google_reviews');

        return response()->json([
            'message' => 'Review updated',
            'data' => $manualReview->fresh(),
        ]);
    }

    public function manualDestroy(ManualReview $manualReview): JsonResponse
    {
        $manualReview->delete();
        Cache::forget('google_reviews');

        return response()->json(['message' => 'Review deleted']);
    }
}
