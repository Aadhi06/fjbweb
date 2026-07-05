<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\MarketingContact;
use Illuminate\Support\Carbon;

class MarketingContactService
{
    public function upsertFromFormSubmission(FormSubmission $submission, Form $form): ?MarketingContact
    {
        $data = $submission->data ?? [];
        $email = $this->extractEmail($data);

        if (!$email) {
            return null;
        }

        $name = $this->extractField($data, ['name', 'full_name', 'first_name']);
        $phone = $this->extractField($data, ['phone', 'phone_number', 'mobile']);
        $hasConsent = $this->hasMarketingConsent($data);
        $now = Carbon::now();

        $tags = array_filter([
            'form:' . $form->slug,
            $this->extractField($data, ['item_type', 'service_type', 'subject', 'gold_type']) ?: null,
        ]);

        $source = [
            'type' => 'form',
            'id' => $submission->id,
            'label' => $form->title,
            'slug' => $form->slug,
            'at' => $submission->created_at?->toIso8601String() ?? $now->toIso8601String(),
        ];

        return $this->upsertContact(
            email: $email,
            name: $name,
            phone: $phone,
            tags: $tags,
            source: $source,
            metadata: $data,
            hasConsent: $hasConsent,
            seenAt: $submission->created_at ?? $now,
        );
    }

    public function upsertFromBooking(Booking $booking): ?MarketingContact
    {
        $email = strtolower(trim($booking->email));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return null;
        }

        $tags = array_filter([
            'booking',
            'service:' . $booking->service_type,
        ]);

        $source = [
            'type' => 'booking',
            'id' => $booking->id,
            'label' => 'Appointment — ' . $booking->service_type,
            'at' => $booking->created_at?->toIso8601String() ?? now()->toIso8601String(),
        ];

        $metadata = [
            'service_type' => $booking->service_type,
            'booking_date' => $booking->booking_date?->format('Y-m-d'),
            'booking_time' => $booking->booking_time,
            'notes' => $booking->notes,
        ];

        return $this->upsertContact(
            email: $email,
            name: $booking->name,
            phone: $booking->phone,
            tags: $tags,
            source: $source,
            metadata: $metadata,
            hasConsent: true,
            seenAt: $booking->created_at ?? now(),
        );
    }

    public function syncAllFromSources(): array
    {
        $created = 0;
        $updated = 0;

        FormSubmission::with('form')->chunk(100, function ($submissions) use (&$created, &$updated) {
            foreach ($submissions as $submission) {
                if (!$submission->form) {
                    continue;
                }
                $before = MarketingContact::where('email', strtolower($this->extractEmail($submission->data ?? []) ?? ''))->first();
                $contact = $this->upsertFromFormSubmission($submission, $submission->form);
                if (!$contact) {
                    continue;
                }
                if ($before) {
                    $updated++;
                } else {
                    $created++;
                }
            }
        });

        Booking::chunk(100, function ($bookings) use (&$created, &$updated) {
            foreach ($bookings as $booking) {
                $email = strtolower(trim($booking->email));
                $before = MarketingContact::where('email', $email)->exists();
                $contact = $this->upsertFromBooking($booking);
                if (!$contact) {
                    continue;
                }
                if ($before) {
                    $updated++;
                } else {
                    $created++;
                }
            }
        });

        return [
            'created' => $created,
            'updated' => $updated,
            'total' => MarketingContact::count(),
        ];
    }

    private function upsertContact(
        string $email,
        ?string $name,
        ?string $phone,
        array $tags,
        array $source,
        array $metadata,
        bool $hasConsent,
        Carbon $seenAt,
    ): MarketingContact {
        $email = strtolower(trim($email));
        $contact = MarketingContact::firstOrNew(['email' => $email]);

        if (!$contact->exists) {
            $contact->first_seen_at = $seenAt;
            $contact->is_subscribed = $hasConsent;
            if ($hasConsent) {
                $contact->consent_at = $seenAt;
            }
        } else {
            if ($hasConsent && !$contact->is_subscribed) {
                $contact->is_subscribed = true;
                $contact->consent_at = $contact->consent_at ?? $seenAt;
            }
        }

        if ($name) {
            $contact->name = $name;
        }
        if ($phone) {
            $contact->phone = $phone;
        }

        $contact->tags = $this->mergeUnique($contact->tags ?? [], $tags);
        $contact->sources = $this->mergeSources($contact->sources ?? [], $source);
        $contact->metadata = array_merge($contact->metadata ?? [], $metadata);
        $contact->last_seen_at = $seenAt;

        $contact->save();

        return $contact;
    }

    public function subscribeFromNewsletter(string $email, ?string $name = null): MarketingContact
    {
        $now = now();
        $source = [
            'type' => 'newsletter_popup',
            'id' => null,
            'label' => 'Newsletter popup',
            'at' => $now->toIso8601String(),
        ];

        return $this->upsertContact(
            email: $email,
            name: $name,
            phone: null,
            tags: ['newsletter', 'newsletter-popup'],
            source: $source,
            metadata: ['source' => 'newsletter_popup'],
            hasConsent: true,
            seenAt: $now,
        );
    }

    private function mergeUnique(array $existing, array $new): array
    {
        return array_values(array_unique(array_merge($existing, $new)));
    }

    private function mergeSources(array $existing, array $source): array
    {
        foreach ($existing as $item) {
            if (($item['type'] ?? '') === ($source['type'] ?? '') && ($item['id'] ?? null) == ($source['id'] ?? null)) {
                return $existing;
            }
        }

        $existing[] = $source;

        return $existing;
    }

    private function extractEmail(array $data): ?string
    {
        foreach ($data as $key => $value) {
            if (is_string($key) && str_contains(strtolower($key), 'email') && is_string($value)) {
                $email = strtolower(trim($value));
                if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    return $email;
                }
            }
        }

        return null;
    }

    private function extractField(array $data, array $keys): ?string
    {
        foreach ($keys as $key) {
            if (!empty($data[$key]) && is_string($data[$key])) {
                return trim($data[$key]);
            }
        }

        return null;
    }

    private function hasMarketingConsent(array $data): bool
    {
        foreach (['consent', 'marketing_consent', 'agree', 'privacy_consent'] as $key) {
            if (!array_key_exists($key, $data)) {
                continue;
            }
            $value = $data[$key];
            if (in_array($value, [true, 1, '1', 'on', 'yes', 'true', 'Yes'], true)) {
                return true;
            }
            if (in_array($value, [false, 0, '0', 'off', 'no', 'false', 'No'], true)) {
                return false;
            }
        }

        return true;
    }
}
