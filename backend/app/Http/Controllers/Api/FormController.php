<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Services\FormSubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        $submissions = FormSubmission::with('form')
            ->latest()
            ->paginate(20);

        $submissions->getCollection()->transform(fn ($s) => [
            'id' => $s->id,
            'form_name' => $s->form?->title ?? 'Unknown Form',
            'form_slug' => $s->form?->slug,
            'data' => $s->data,
            'status' => $s->status,
            'ip_address' => $s->ip_address,
            'created_at' => $s->created_at->toIso8601String(),
            'created_at_human' => $s->created_at->diffForHumans(),
        ]);

        return response()->json($submissions);
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
}
