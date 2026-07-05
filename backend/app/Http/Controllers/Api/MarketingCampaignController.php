<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\MarketingCampaignMail;
use App\Models\MarketingCampaign;
use App\Models\MarketingCampaignRecipient;
use App\Models\MarketingContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MarketingCampaignController extends Controller
{
    public function index(): JsonResponse
    {
        $campaigns = MarketingCampaign::with('creator:id,name,email')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $campaigns]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body_html' => 'required|string',
            'audience' => 'nullable|in:subscribed,all',
            'filter_tags' => 'nullable|array',
        ]);

        $campaign = MarketingCampaign::create([
            ...$validated,
            'audience' => $validated['audience'] ?? 'subscribed',
            'status' => 'draft',
            'created_by' => $request->user()?->id,
        ]);

        return response()->json(['message' => 'Campaign created.', 'data' => $campaign], 201);
    }

    public function update(Request $request, MarketingCampaign $campaign): JsonResponse
    {
        if ($campaign->status !== 'draft') {
            return response()->json(['message' => 'Only draft campaigns can be edited.'], 422);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'subject' => 'sometimes|string|max:255',
            'body_html' => 'sometimes|string',
            'audience' => 'nullable|in:subscribed,all',
            'filter_tags' => 'nullable|array',
        ]);

        $campaign->update($validated);

        return response()->json(['message' => 'Campaign updated.', 'data' => $campaign]);
    }

    public function destroy(MarketingCampaign $campaign): JsonResponse
    {
        if ($campaign->status === 'sending') {
            return response()->json(['message' => 'Cannot delete a campaign that is sending.'], 422);
        }

        $campaign->delete();

        return response()->json(['message' => 'Campaign deleted.']);
    }

    public function send(MarketingCampaign $campaign): JsonResponse
    {
        if ($campaign->status !== 'draft') {
            return response()->json(['message' => 'This campaign has already been sent.'], 422);
        }

        $contacts = $this->resolveAudience($campaign);

        if ($contacts->isEmpty()) {
            return response()->json(['message' => 'No contacts match this campaign audience.'], 422);
        }

        $campaign->update([
            'status' => 'sending',
            'total_recipients' => $contacts->count(),
            'sent_count' => 0,
            'failed_count' => 0,
        ]);

        $sent = 0;
        $failed = 0;

        foreach ($contacts as $contact) {
            $recipient = MarketingCampaignRecipient::create([
                'campaign_id' => $campaign->id,
                'contact_id' => $contact->id,
                'email' => $contact->email,
                'name' => $contact->name,
                'status' => 'pending',
            ]);

            try {
                Mail::to($contact->email)->send(new MarketingCampaignMail($campaign, $contact->name ?? ''));

                $recipient->update(['status' => 'sent', 'sent_at' => now()]);
                $contact->update(['last_contacted_at' => now()]);
                $sent++;
            } catch (\Exception $e) {
                Log::error("Campaign email failed for {$contact->email}: {$e->getMessage()}");
                $recipient->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
                $failed++;
            }
        }

        $campaign->update([
            'status' => $failed === $contacts->count() ? 'failed' : 'sent',
            'sent_count' => $sent,
            'failed_count' => $failed,
            'sent_at' => now(),
        ]);

        return response()->json([
            'message' => "Campaign sent to {$sent} contact(s)." . ($failed ? " {$failed} failed." : ''),
            'data' => $campaign->fresh(),
        ]);
    }

    public function show(MarketingCampaign $campaign): JsonResponse
    {
        $campaign->load(['recipients' => fn ($q) => $q->orderByDesc('id')->limit(100)]);

        return response()->json(['data' => $campaign]);
    }

    private function resolveAudience(MarketingCampaign $campaign)
    {
        $query = MarketingContact::query();

        if ($campaign->audience === 'subscribed') {
            $query->where('is_subscribed', true);
        }

        if (!empty($campaign->filter_tags)) {
            $query->where(function ($q) use ($campaign) {
                foreach ($campaign->filter_tags as $tag) {
                    $q->orWhereJsonContains('tags', $tag);
                }
            });
        }

        return $query->orderBy('email')->get();
    }
}
