<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ManualReview;
use App\Models\ReviewModeration;
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

    public function adminGoogleIndex(): JsonResponse
    {
        return response()->json([
            'data' => $this->reviewService->getAdminGoogleReviews(),
        ]);
    }

    public function moderate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'review_key' => 'required|string|max:128',
            'author_name' => 'nullable|string|max:255',
            'rating' => 'nullable|integer|min:1|max:5',
            'is_hidden' => 'sometimes|boolean',
            'reply_text' => 'nullable|string|max:2000',
            'clear_reply' => 'sometimes|boolean',
        ]);

        $mod = ReviewModeration::firstOrNew(['review_key' => $validated['review_key']]);

        if (array_key_exists('author_name', $validated) && $validated['author_name'] !== null) {
            $mod->author_name = $validated['author_name'];
        }
        if (array_key_exists('rating', $validated) && $validated['rating'] !== null) {
            $mod->rating = $validated['rating'];
        }
        if (array_key_exists('is_hidden', $validated)) {
            $mod->is_hidden = (bool) $validated['is_hidden'];
        }

        if (!empty($validated['clear_reply'])) {
            $mod->reply_text = null;
            $mod->replied_at = null;
        } elseif (array_key_exists('reply_text', $validated)) {
            $text = trim((string) ($validated['reply_text'] ?? ''));
            if ($text === '') {
                $mod->reply_text = null;
                $mod->replied_at = null;
            } else {
                $mod->reply_text = $text;
                $mod->replied_at = now();
            }
        }

        $mod->save();
        Cache::forget('google_reviews');

        return response()->json([
            'message' => 'Review updated',
            'data' => $mod->fresh(),
        ]);
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
        ReviewModeration::where('review_key', 'manual:' . $manualReview->id)->delete();
        $manualReview->delete();
        Cache::forget('google_reviews');

        return response()->json(['message' => 'Review deleted']);
    }
}
