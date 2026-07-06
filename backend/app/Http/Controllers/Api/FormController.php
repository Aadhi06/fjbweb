<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormField;
use App\Models\FormSubmission;
use App\Models\FormSubmissionFile;
use App\Services\FormSubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FormController extends Controller
{
    public function __construct(private FormSubmissionService $submissionService) {}

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
