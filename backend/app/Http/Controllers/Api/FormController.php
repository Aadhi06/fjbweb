<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormField;
use App\Models\FormSubmission;
use App\Models\FormSubmissionFile;
use App\Services\FormSubmissionService;
use App\Services\SubmissionConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FormController extends Controller
{
    public function __construct(
        private FormSubmissionService $submissionService,
        private SubmissionConversationService $conversationService,
    ) {}

    public function show(string $slug): JsonResponse
    {
        $form = Form::where('slug', $slug)->where('is_active', true)->with('activeFields')->firstOrFail();

        return response()->json([
            'data' => [
                'id' => $form->id,
                'title' => $form->title,
                'slug' => $form->slug,
                'description' => $form->description,
                'success_message' => $form->success_message,
                'fields' => $form->activeFields->map(fn ($f) => [
                    'id' => $f->id,
                    'name' => $f->name,
                    'label' => $f->label,
                    'type' => $f->type,
                    'placeholder' => $f->placeholder,
                    'required' => $f->required,
                    'options' => $f->options,
                    'order' => $f->order,
                ]),
            ],
        ]);
    }

    public function adminIndex(): JsonResponse
    {
        $submissions = FormSubmission::with(['form', 'files'])
            ->latest()
            ->paginate(20);

        $submissions->getCollection()->transform(fn ($s) => [
            'id' => $s->id,
            'form_name' => $s->form?->title ?? 'Unknown Form',
            'form_slug' => $s->form?->slug,
            'data' => $s->data,
            'files' => $s->files->map(fn ($f) => [
                'id' => $f->id,
                'field_name' => $f->field_name,
                'original_name' => $f->original_name,
                'url' => $f->publicUrl(),
                'mime_type' => $f->mime_type,
                'is_image' => $f->isImage(),
            ]),
            'status' => $s->status,
            'ip_address' => $s->ip_address,
            'created_at' => $s->created_at->toIso8601String(),
            'created_at_human' => $s->created_at->diffForHumans(),
        ]);

        return response()->json($submissions);
    }

    public function adminShow(Request $request, FormSubmission $submission): JsonResponse
    {
        $submission->load(['form', 'files', 'messages.adminUser']);

        if ($request->boolean('mark_read', true)) {
            $this->conversationService->markRead($submission);
            $submission->refresh();
        }

        return response()->json([
            'data' => $this->formatSubmissionDetail($submission),
        ]);
    }

    public function adminMessages(): JsonResponse
    {
        $submissions = FormSubmission::with(['form'])
            ->whereHas('messages')
            ->withCount('messages')
            ->get()
            ->sortByDesc(function ($submission) {
                return $submission->messages()->latest()->value('created_at');
            })
            ->values()
            ->map(fn ($s) => $this->conversationService->formatConversationSummary($s));

        return response()->json(['data' => $submissions]);
    }

    public function adminMessagesUnreadCount(): JsonResponse
    {
        return response()->json([
            'count' => $this->conversationService->unreadCount(),
        ]);
    }

    public function markSubmissionRead(FormSubmission $submission): JsonResponse
    {
        $this->conversationService->markRead($submission);

        return response()->json(['message' => 'Marked as read.']);
    }

    public function adminReply(Request $request, FormSubmission $submission): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|min:1|max:5000',
        ]);

        $message = $this->conversationService->sendAdminReply(
            $submission,
            $validated['message'],
            $request->user(),
        );

        $submission->refresh()->load(['form', 'files', 'messages.adminUser']);

        return response()->json([
            'message' => 'Reply sent to customer.',
            'data' => $this->formatSubmissionDetail($submission),
            'new_message' => [
                'id' => $message->id,
                'sender' => $message->sender,
                'body' => $message->body,
                'created_at' => $message->created_at->toIso8601String(),
                'created_at_human' => $message->created_at->diffForHumans(),
            ],
        ]);
    }

    public function conversationShow(string $token): JsonResponse
    {
        $submission = FormSubmission::where('reply_token', $token)
            ->with('form')
            ->firstOrFail();

        $this->conversationService->markAdminMessagesViewed($submission);

        return response()->json([
            'data' => [
                'form_name' => $submission->form?->title ?? 'Your enquiry',
                'customer_name' => $this->conversationService->customerName($submission),
                'messages' => $this->conversationService->formatMessages($submission->fresh()),
                'created_at_human' => $submission->created_at->diffForHumans(),
            ],
        ]);
    }

    public function conversationReply(Request $request, string $token): JsonResponse
    {
        $submission = FormSubmission::where('reply_token', $token)->firstOrFail();

        $validated = $request->validate([
            'message' => 'required|string|min:1|max:5000',
        ]);

        $this->conversationService->sendCustomerReply($submission, $validated['message']);

        return response()->json([
            'message' => 'Your message has been sent. We will reply shortly.',
            'data' => [
                'messages' => $this->conversationService->formatMessages($submission->fresh()),
            ],
        ]);
    }

    public function mailOpen(string $token)
    {
        $this->conversationService->markMessageOpenedByToken($token);

        // 1x1 transparent GIF
        $gif = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

        return response($gif, 200, [
            'Content-Type' => 'image/gif',
            'Content-Length' => (string) strlen($gif),
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
    }

    public function mailClick(string $token)
    {
        $message = $this->conversationService->markMessageClickedByToken($token);
        $url = $message
            ? $this->conversationService->conversationUrl($message->submission)
            : rtrim(\App\Models\Setting::get('frontend_url', 'https://www.finejewellerybuyers.co.uk'), '/');

        return redirect()->away($url);
    }

    private function formatSubmissionDetail(FormSubmission $submission): array
    {
        return [
            'id' => $submission->id,
            'form_name' => $submission->form?->title ?? 'Unknown Form',
            'form_slug' => $submission->form?->slug,
            'data' => $submission->data,
            'files' => $submission->files->map(fn ($f) => [
                'id' => $f->id,
                'field_name' => $f->field_name,
                'original_name' => $f->original_name,
                'url' => $f->publicUrl(),
                'mime_type' => $f->mime_type,
                'is_image' => $f->isImage(),
            ]),
            'messages' => $this->conversationService->formatMessages($submission),
            'conversation_url' => $this->conversationService->conversationUrl($submission),
            'customer_email' => $this->conversationService->customerEmail($submission),
            'status' => $submission->status,
            'ip_address' => $submission->ip_address,
            'created_at' => $submission->created_at->toIso8601String(),
            'created_at_human' => $submission->created_at->diffForHumans(),
        ];
    }

    public function serveFile(FormSubmissionFile $formSubmissionFile): BinaryFileResponse
    {
        $path = storage_path('app/public/' . $formSubmissionFile->file_path);

        if (!is_file($path)) {
            abort(404);
        }

        return response()->file($path, [
            'Content-Type' => $formSubmissionFile->mime_type ?? 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $formSubmissionFile->original_name . '"',
        ]);
    }

    public function submit(string $slug, Request $request): JsonResponse
    {
        $form = Form::where('slug', $slug)->where('is_active', true)->with('activeFields')->firstOrFail();

        $submission = $this->submissionService->submit($form, $request);

        return response()->json([
            'message' => $form->success_message,
            'submission_id' => $submission->id,
        ], 201);
    }

    public function adminForms(): JsonResponse
    {
        $forms = Form::with(['fields' => fn ($q) => $q->orderBy('order')])
            ->orderBy('title')
            ->get()
            ->map(fn ($form) => [
                'id' => $form->id,
                'title' => $form->title,
                'slug' => $form->slug,
                'description' => $form->description,
                'is_active' => $form->is_active,
                'fields_count' => $form->fields->count(),
                'fields' => $form->fields->map(fn ($f) => $this->formatField($f)),
            ]);

        return response()->json(['data' => $forms]);
    }

    public function storeField(Request $request, Form $form): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|regex:/^[a-z0-9_]+$/|unique:form_fields,name,NULL,id,form_id,' . $form->id,
            'label' => 'required|string|max:255',
            'type' => 'required|in:text,textarea,email,phone,select,checkbox,radio,file,date,number',
            'placeholder' => 'nullable|string|max:255',
            'required' => 'boolean',
            'options' => 'nullable|array',
            'order' => 'nullable|integer|min:0',
        ]);

        $order = $validated['order'] ?? (($form->fields()->max('order') ?? 0) + 1);

        $field = $form->fields()->create([
            ...$validated,
            'order' => $order,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Field added successfully.',
            'field' => $this->formatField($field),
        ], 201);
    }

    public function updateField(Request $request, Form $form, FormField $field): JsonResponse
    {
        if ($field->form_id !== $form->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100|regex:/^[a-z0-9_]+$/|unique:form_fields,name,' . $field->id . ',id,form_id,' . $form->id,
            'label' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:text,textarea,email,phone,select,checkbox,radio,file,date,number',
            'placeholder' => 'nullable|string|max:255',
            'required' => 'boolean',
            'options' => 'nullable|array',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $field->update($validated);

        return response()->json([
            'message' => 'Field updated successfully.',
            'field' => $this->formatField($field->fresh()),
        ]);
    }

    public function reorderFields(Request $request, Form $form): JsonResponse
    {
        $validated = $request->validate([
            'field_ids' => 'required|array|min:1',
            'field_ids.*' => 'integer',
        ]);

        $fieldIds = array_values(array_map('intval', $validated['field_ids']));
        $existingIds = $form->fields()->pluck('id')->map(fn ($id) => (int) $id)->values()->all();

        if (count($fieldIds) !== count($existingIds)) {
            return response()->json([
                'message' => 'Field list is incomplete. Refresh and try again.',
            ], 422);
        }

        $unknown = array_diff($fieldIds, $existingIds);
        if (!empty($unknown)) {
            return response()->json(['message' => 'Invalid field in list.'], 422);
        }

        foreach ($fieldIds as $index => $fieldId) {
            FormField::where('id', $fieldId)
                ->where('form_id', $form->id)
                ->update(['order' => $index + 1]);
        }

        $fields = $form->fields()->orderBy('order')->get()->map(fn ($f) => $this->formatField($f));

        return response()->json([
            'message' => 'Field order updated.',
            'fields' => $fields,
        ]);
    }

    public function deleteField(Form $form, FormField $field): JsonResponse
    {
        if ($field->form_id !== $form->id) {
            abort(404);
        }

        $field->delete();

        return response()->json(['message' => 'Field deleted successfully.']);
    }

    private function formatField(FormField $field): array
    {
        return [
            'id' => $field->id,
            'name' => $field->name,
            'label' => $field->label,
            'type' => $field->type,
            'placeholder' => $field->placeholder,
            'required' => $field->required,
            'options' => $field->options,
            'order' => $field->order,
            'is_active' => $field->is_active,
        ];
    }
}
