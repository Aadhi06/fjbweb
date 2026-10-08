<?php

namespace App\Services;

use App\Mail\AdminCustomerReplyNotification;
use App\Mail\CustomerSubmissionReply;
use App\Models\Booking;
use App\Models\FormSubmission;
use App\Models\FormSubmissionFile;
use App\Models\FormSubmissionMessage;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class SubmissionConversationService
{
    public function ensureReplyToken(FormSubmission $submission): string
    {
        if (!$submission->reply_token) {
            $submission->update(['reply_token' => Str::random(48)]);
            $submission->refresh();
        }

        return $submission->reply_token;
    }

    public function publicFrontendUrl(): string
    {
        $url = Setting::get('frontend_url');
        if (!is_string($url) || trim($url) === '') {
            $url = (string) config('app.frontend_url', 'https://www.finejewellerybuyers.co.uk');
        }
        $url = rtrim(trim($url), '/');
        if (!str_starts_with($url, 'http')) {
            $url = 'https://www.finejewellerybuyers.co.uk';
        }
        if ($url === 'https://finejewellerybuyers.co.uk') {
            $url = 'https://www.finejewellerybuyers.co.uk';
        }

        return $url;
    }

    public function conversationUrl(FormSubmission $submission): string
    {
        return $this->publicFrontendUrl() . '/enquiry/' . $this->ensureReplyToken($submission);
    }

    public function adminAppUrl(string $tab = 'messages', ?int $submissionId = null): string
    {
        $url = $this->publicFrontendUrl() . '/admin?tab=' . rawurlencode($tab);
        if ($submissionId) {
            $url .= '&submission=' . $submissionId;
        }

        return $url;
    }

    public function findSubmissionByPublicToken(string $token): ?FormSubmission
    {
        $token = trim($token);
        if ($token === '') {
            return null;
        }

        $byReply = FormSubmission::where('reply_token', $token)->first();
        if ($byReply) {
            return $byReply;
        }

        $message = FormSubmissionMessage::where('open_token', $token)->first();

        return $message?->submission;
    }

    public function sendAdminReply(FormSubmission $submission, string $message, ?User $admin = null, bool $isNewConversation = false, array $files = []): FormSubmissionMessage
    {
        $body = $this->messageBodyOrAttachmentLabel($message, $files);
        $record = $this->createChatMessage($submission, 'admin', $body, $admin?->id);

        try {
            $this->storeChatFiles($submission, $record, $files);
        } catch (\Throwable $e) {
            Log::error('Admin chat file save failed: '.$e->getMessage());
        }

        try {
            $submission->update(['status' => 'replied']);
        } catch (\Throwable $e) {
            Log::error('Admin reply status update failed: '.$e->getMessage());
        }

        try {
            $this->setTyping($submission->id, 'admin', false);
        } catch (\Throwable $e) {
            Log::error('Admin typing clear failed: '.$e->getMessage());
        }

        try {
            $this->emailCustomer($submission, $record, $admin?->name, $isNewConversation);
        } catch (\Throwable $e) {
            Log::error('Admin reply email failed: '.$e->getMessage());
        }

        return $record;
    }

    public function sendCustomerReply(FormSubmission $submission, string $message, array $files = []): FormSubmissionMessage
    {
        $body = $this->messageBodyOrAttachmentLabel($message, $files);
        $record = $this->createChatMessage($submission, 'customer', $body);

        try {
            $this->storeChatFiles($submission, $record, $files);
        } catch (\Throwable $e) {
            Log::error('Customer chat file save failed: '.$e->getMessage());
        }

        try {
            $submission->update(['status' => 'new']);
            $this->markAdminMessagesViewed($submission);
            $this->setTyping($submission->id, 'customer', false);
        } catch (\Throwable $e) {
            Log::error('Customer reply follow-up failed: '.$e->getMessage());
        }

        try {
            $this->emailAdmin($submission, $body);
        } catch (\Throwable $e) {
            Log::error('Customer reply email failed: '.$e->getMessage());
        }

        try {
            $this->pushAdmin($submission, $body);
        } catch (\Throwable $e) {
            Log::error('Customer reply push failed: '.$e->getMessage());
        }

        return $record;
    }

    private function createChatMessage(FormSubmission $submission, string $sender, string $body, ?int $adminUserId = null): FormSubmissionMessage
    {
        $payload = [
            'form_submission_id' => $submission->id,
            'sender' => $sender,
            'body' => $body !== '' ? $body : 'Message',
        ];
        if ($adminUserId) {
            $payload['admin_user_id'] = $adminUserId;
        }

        try {
            return FormSubmissionMessage::create($payload);
        } catch (\Throwable $e) {
            Log::warning('Eloquent chat create failed, inserting core columns: '.$e->getMessage());

            $id = \Illuminate\Support\Facades\DB::table('form_submission_messages')->insertGetId([
                'form_submission_id' => $submission->id,
                'sender' => $sender,
                'body' => $payload['body'],
                'admin_user_id' => $adminUserId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $record = FormSubmissionMessage::find($id);
            if (!$record) {
                throw $e;
            }

            return $record;
        }
    }

    private function messageBodyOrAttachmentLabel(string $message, array $files): string
    {
        $body = trim($message);
        if ($body !== '') {
            return $body;
        }

        $hasPdf = false;
        $hasImage = false;
        foreach ($files as $file) {
            $mime = strtolower((string) $file->getMimeType());
            $name = strtolower((string) $file->getClientOriginalName());
            if (str_contains($mime, 'pdf') || str_ends_with($name, '.pdf')) {
                $hasPdf = true;
            }
            if (str_starts_with($mime, 'image/')) {
                $hasImage = true;
            }
        }

        if ($hasPdf && $hasImage) {
            return 'Photo and PDF';
        }
        if ($hasPdf) {
            return 'PDF';
        }
        if ($hasImage) {
            return 'Photo';
        }

        return 'Attachment';
    }

    private function storeChatFiles(FormSubmission $submission, FormSubmissionMessage $message, array $files): void
    {
        if ($files === [] || !$this->chatAttachmentsReady()) {
            if ($files !== []) {
                Log::error('Chat photo was not saved because the attachment column is missing.');
            }
            return;
        }

        foreach ($files as $file) {
            $path = $file->store("submissions/{$submission->id}/chat", 'public');

            FormSubmissionFile::create([
                'form_submission_id' => $submission->id,
                'form_submission_message_id' => $message->id,
                'field_name' => 'chat',
                'original_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }
    }

    private function emailCustomer(FormSubmission $submission, FormSubmissionMessage $message, ?string $adminName, bool $isNewConversation = false): void
    {
        try {
            $mailConfig = app(MailConfigService::class);
            if (!$mailConfig->isConfigured()) {
                $mailConfig->logIfNotConfigured('submission-reply-customer');
                return;
            }

            $email = $this->customerEmail($submission);
            if (!$email) {
                return;
            }

            $mailConfig->applyFromSettings();
            $submission->loadMissing('form');

            Mail::to($email)->send(new CustomerSubmissionReply(
                $submission,
                $message,
                $this->conversationUrl($submission),
                $adminName,
                $isNewConversation,
            ));
        } catch (\Throwable $e) {
            Log::error("Failed to send submission reply to customer: {$e->getMessage()}");
        }
    }

    public function apiBaseUrl(): string
    {
        $url = rtrim((string) config('app.url'), '/');
        if (!$url || str_contains($url, 'localhost') || str_contains($url, '127.0.0.1')) {
            return 'https://api.finejewellerybuyers.co.uk';
        }

        return $url;
    }

    public function openPixelUrl(FormSubmissionMessage $message): string
    {
        return $this->apiBaseUrl() . '/api/mail/open/' . $message->open_token;
    }

    public function trackedConversationUrl(FormSubmission $submission, FormSubmissionMessage $message): string
    {
        $url = $this->conversationUrl($submission);
        $open = trim((string) $message->open_token);
        if ($open !== '') {
            $url .= (str_contains($url, '?') ? '&' : '?') . 'o=' . rawurlencode($open);
        }

        return $url;
    }

    public function setTyping(int $submissionId, string $side, bool $typing): void
    {
        $side = $side === 'admin' ? 'admin' : 'customer';
        $key = "chat_typing.{$submissionId}.{$side}";
        if ($typing) {
            Cache::put($key, now()->timestamp, 8);
            return;
        }

        Cache::forget($key);
    }

    public function isTyping(int $submissionId, string $side): bool
    {
        $side = $side === 'admin' ? 'admin' : 'customer';

        return Cache::has("chat_typing.{$submissionId}.{$side}");
    }

    public function markAdminMessagesViewed(FormSubmission $submission): void
    {
        $submission->messages()
            ->where('sender', 'admin')
            ->whereNull('page_viewed_at')
            ->get()
            ->each(fn (FormSubmissionMessage $m) => $m->markPageViewed());
    }

    public function markMessageOpenedByToken(string $token): ?FormSubmissionMessage
    {
        $message = FormSubmissionMessage::where('open_token', $token)->where('sender', 'admin')->first();
        if ($message) {
            $message->markEmailOpened();
        }

        return $message;
    }

    public function markMessageClickedByToken(string $token): ?FormSubmissionMessage
    {
        $message = FormSubmissionMessage::where('open_token', $token)->where('sender', 'admin')->first();
        if ($message) {
            $message->markPageViewed();
        }

        return $message;
    }

    public function markRead(FormSubmission $submission): void
    {
        $submission->update(['admin_last_read_at' => now()]);
    }

    public function isUnread(FormSubmission $submission): bool
    {
        $latestCustomer = $this->latestMessage($submission, 'customer');

        if (!$latestCustomer) {
            return false;
        }

        if (!$submission->admin_last_read_at) {
            return true;
        }

        return $latestCustomer->created_at->gt($submission->admin_last_read_at);
    }

    public function unreadCount(): int
    {
        return FormSubmission::query()
            ->whereExists(function ($query) {
                $query->selectRaw('1')
                    ->from('form_submission_messages as latest')
                    ->whereColumn('latest.form_submission_id', 'form_submissions.id')
                    ->where('latest.sender', 'customer')
                    ->where('latest.id', function ($sub) {
                        $sub->selectRaw('MAX(id)')
                            ->from('form_submission_messages')
                            ->whereColumn('form_submission_id', 'form_submissions.id');
                    });
            })
            ->count();
    }

    public function formatConversationSummary(FormSubmission $submission, ?FormSubmissionMessage $latest = null): array
    {
        $submission->loadMissing('form');

        $latest ??= $this->latestMessage($submission);
        $name = $this->customerName($submission);
        $email = $this->customerEmail($submission);
        $replied = (bool) $latest && $latest->sender === 'admin';
        $awaitingReply = (bool) $latest && $latest->sender === 'customer';
        $unread = $awaitingReply && (
            !$submission->admin_last_read_at
            || ($latest?->created_at && $latest->created_at->gt($submission->admin_last_read_at))
        );

        return [
            'id' => $submission->id,
            'form_name' => $submission->form?->title ?? 'Enquiry',
            'customer_name' => $name,
            'customer_email' => $email,
            'status' => $submission->status,
            'unread' => $unread,
            'replied' => $replied,
            'awaiting_reply' => $awaitingReply,
            'customer_typing' => false,
            'booking' => $this->linkedBooking($submission, false),
            'last_message' => $latest ? [
                'sender' => $latest->sender,
                'body' => $this->previewBody($latest),
                'created_at' => $latest->created_at?->toIso8601String(),
                'created_at_human' => $latest->created_at->diffForHumans(),
            ] : null,
            'last_message_at' => $latest?->created_at?->toIso8601String() ?? $submission->messages_max_created_at,
            'message_count' => $submission->messages_count ?? 0,
            'created_at_human' => $submission->created_at->diffForHumans(),
        ];
    }

    public function attachBooking(FormSubmission $submission, Booking $booking): void
    {
        $data = $submission->data ?? [];
        $data['_booking_id'] = $booking->id;
        $data['_booking_date'] = $booking->booking_date?->toDateString();
        $data['_booking_time'] = $booking->booking_time;
        $data['_booking_service'] = $booking->service_type;
        if (empty($data['name'])) {
            $data['name'] = $booking->name;
        }
        if (empty($data['email'])) {
            $data['email'] = $booking->email;
        }
        if (empty($data['phone'])) {
            $data['phone'] = $booking->phone;
        }
        $submission->update(['data' => $data]);
    }

    public function linkedBooking(FormSubmission $submission, bool $hydrate = true): ?array
    {
        $id = $submission->data['_booking_id'] ?? null;
        if (!$id) {
            return null;
        }

        $booking = $hydrate ? Booking::find($id) : null;
        if ($booking) {
            return [
                'id' => $booking->id,
                'name' => $booking->name,
                'service_type' => $booking->service_type,
                'booking_date' => $booking->booking_date?->toDateString(),
                'booking_time' => $booking->booking_time,
                'status' => $booking->status,
            ];
        }

        return [
            'id' => (int) $id,
            'service_type' => $submission->data['_booking_service'] ?? null,
            'booking_date' => $submission->data['_booking_date'] ?? null,
            'booking_time' => $submission->data['_booking_time'] ?? null,
            'status' => null,
        ];
    }

    private function emailAdmin(FormSubmission $submission, string $message): void
    {
        try {
            $mailConfig = app(MailConfigService::class);
            if (!$mailConfig->isConfigured()) {
                $mailConfig->logIfNotConfigured('customer-reply-admin');
                return;
            }

            $mailConfig->applyFromSettings();
            $adminEmail = Setting::get('admin_email', 'info@finejewellerybuyers.co.uk');
            Mail::to($adminEmail)->send(new AdminCustomerReplyNotification(
                $submission,
                $message,
                $this->conversationUrl($submission),
            ));
        } catch (\Throwable $e) {
            Log::error("Failed to send customer reply notification to admin: {$e->getMessage()}");
        }
    }

    private function pushAdmin(FormSubmission $submission, string $message): void
    {
        try {
            $preview = trim(preg_replace('/\s+/', ' ', $message) ?? '');
            if (strlen($preview) > 120) {
                $preview = substr($preview, 0, 117).'...';
            }
            app(WebPushService::class)->notifyAdmins(
                'New message from '.$this->customerName($submission),
                $preview !== '' ? $preview : 'Opened the chat and sent a reply.',
                '/admin?tab=messages&submission='.$submission->id,
                'message-'.$submission->id
            );
        } catch (\Throwable $e) {
            Log::error('Failed to send message push: '.$e->getMessage());
        }
    }

    public function customerEmail(FormSubmission $submission): ?string
    {
        $email = collect($submission->data)->first(fn ($v, $k) => str_contains(strtolower((string) $k), 'email'));

        return $email && filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }

    public function customerName(FormSubmission $submission): string
    {
        foreach (['name', 'full_name', 'first_name'] as $key) {
            if (!empty($submission->data[$key])) {
                return (string) $submission->data[$key];
            }
        }

        return 'Customer';
    }

    public function formatMessages(FormSubmission $submission): array
    {
        try {
            $with = ['adminUser:id,name'];
            if ($this->chatAttachmentsReady() && method_exists(FormSubmissionMessage::class, 'attachments')) {
                $with[] = 'attachments';
            }

            return $submission->messages()
                ->with($with)
                ->orderBy('created_at')
                ->get()
                ->map(fn (FormSubmissionMessage $m) => $this->formatMessageRow($m))
                ->all();
        } catch (\Throwable $e) {
            Log::warning('formatMessages attachments failed, retrying without files: '.$e->getMessage());

            return $submission->messages()
                ->with(['adminUser:id,name'])
                ->orderBy('created_at')
                ->get()
                ->map(fn (FormSubmissionMessage $m) => $this->formatMessageRow($m, false))
                ->all();
        }
    }

    private function formatMessageRow(FormSubmissionMessage $m, bool $includeAttachments = true): array
    {
        return [
            'id' => $m->id,
            'sender' => $m->sender,
            'body' => $m->body,
            'admin_name' => $m->adminUser?->name,
            'email_opened_at' => $m->email_opened_at?->toIso8601String(),
            'email_opened_at_human' => $m->email_opened_at?->diffForHumans(),
            'page_viewed_at' => $m->page_viewed_at?->toIso8601String(),
            'page_viewed_at_human' => $m->page_viewed_at?->diffForHumans(),
            'delivery_status' => $m->sender === 'admin'
                ? ($m->page_viewed_at ? 'chat_opened' : ($m->email_opened_at ? 'email_opened' : 'sent'))
                : null,
            'attachments' => $includeAttachments ? $this->formatAttachments($m) : [],
            'created_at' => $m->created_at->toIso8601String(),
            'created_at_human' => $m->created_at->diffForHumans(),
        ];
    }

    public function chatAttachmentsReady(): bool
    {
        static $ready = null;
        if ($ready !== null) {
            return $ready;
        }

        try {
            return $ready = Schema::hasColumn('form_submission_files', 'form_submission_message_id');
        } catch (\Throwable $e) {
            Log::warning('Chat attachment column check failed: '.$e->getMessage());
            return $ready = false;
        }
    }

    private function formatAttachments(FormSubmissionMessage $message): array
    {
        if (!$this->chatAttachmentsReady() || !$message->relationLoaded('attachments')) {
            return [];
        }

        try {
            return $message->attachments->map(fn (FormSubmissionFile $file) => [
                'id' => $file->id,
                'original_name' => $file->original_name,
                'url' => $file->publicUrl(),
                'mime_type' => $file->mime_type,
                'is_image' => $file->isImage(),
                'is_pdf' => $file->isPdf(),
            ])->values()->all();
        } catch (\Throwable $e) {
            Log::warning('Chat attachment format failed: '.$e->getMessage());
            return [];
        }
    }

    private function latestMessage(FormSubmission $submission, ?string $sender = null): ?FormSubmissionMessage
    {
        $query = FormSubmissionMessage::query()
            ->where('form_submission_id', $submission->id)
            ->orderByDesc('id');

        if ($sender) {
            $query->where('sender', $sender);
        }

        return $query->first();
    }

    private function previewBody(FormSubmissionMessage $message): string
    {
        $body = trim((string) $message->body);
        if ($body !== '') {
            return $body;
        }

        $files = $message->relationLoaded('attachments') ? $message->attachments : collect();
        $hasPdf = $files->contains(fn (FormSubmissionFile $file) => $file->isPdf());
        $hasImage = $files->contains(fn (FormSubmissionFile $file) => $file->isImage());

        if ($hasPdf && $hasImage) {
            return 'Photo and PDF';
        }
        if ($hasPdf) {
            return 'PDF';
        }
        if ($hasImage) {
            return 'Photo';
        }

        return 'Attachment';
    }
}
