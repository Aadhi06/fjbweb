<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BlogController extends Controller
{
    // ── Public ────────────────────────────────────────────────────────

    public function index(): JsonResponse
    {
        $blogs = Blog::published()
            ->latest('published_at')
            ->get()
            ->map(fn ($b) => $this->formatPublic($b));

        return response()->json(['data' => $blogs]);
    }

    public function show(string $slug): JsonResponse
    {
        $blog = Blog::where('slug', $slug)->published()->firstOrFail();

        return response()->json(['data' => $this->formatPublic($blog)]);
    }

    // ── Admin ────────────────────────────────────────────────────────

    public function adminIndex(Request $request): JsonResponse
    {
        $query = Blog::with('author')->latest();

        if ($request->filled('status')) {
            $query->where('is_published', $request->status === 'published');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $blogs = $query->paginate($request->integer('per_page', 15));

        $blogs->getCollection()->transform(fn ($b) => $this->formatAdmin($b));

        return response()->json($blogs);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'content'          => 'required|string',
            'excerpt'          => 'nullable|string|max:500',
            'image'            => 'nullable|string|max:500',
            'category'         => 'nullable|string|max:100',
            'status'           => 'nullable|in:draft,published',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;
        while (Blog::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $isPublished = ($validated['status'] ?? 'draft') === 'published';

        $blog = Blog::create([
            'title'            => $validated['title'],
            'slug'             => $slug,
            'content'          => $validated['content'],
            'excerpt'          => $validated['excerpt'] ?? Str::limit(strip_tags($validated['content']), 160),
            'image'            => $validated['image'] ?? null,
            'category'         => $validated['category'] ?? 'General',
            'is_published'     => $isPublished,
            'published_at'     => $isPublished ? now() : null,
            'meta_title'       => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'author_id'        => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Blog post created successfully',
            'data'    => $this->formatAdmin($blog->load('author')),
        ], 201);
    }

    public function update(Request $request, Blog $blog): JsonResponse
    {
        $validated = $request->validate([
            'title'            => 'sometimes|required|string|max:255',
            'content'          => 'sometimes|required|string',
            'excerpt'          => 'nullable|string|max:500',
            'image'            => 'nullable|string|max:500',
            'category'         => 'nullable|string|max:100',
            'status'           => 'nullable|in:draft,published',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $data = [];

        if (isset($validated['title']) && $validated['title'] !== $blog->title) {
            $data['title'] = $validated['title'];
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $counter = 1;
            while (Blog::where('slug', $slug)->where('id', '!=', $blog->id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }
            $data['slug'] = $slug;
        }

        foreach (['content', 'excerpt', 'image', 'category', 'meta_title', 'meta_description'] as $field) {
            if (array_key_exists($field, $validated)) {
                $data[$field] = $validated[$field];
            }
        }

        if (isset($validated['status'])) {
            $wantsPublished = $validated['status'] === 'published';
            $data['is_published'] = $wantsPublished;
            if ($wantsPublished && !$blog->published_at) {
                $data['published_at'] = now();
            } elseif (!$wantsPublished) {
                $data['published_at'] = null;
            }
        }

        $blog->update($data);

        return response()->json([
            'message' => 'Blog post updated successfully',
            'data'    => $this->formatAdmin($blog->fresh()->load('author')),
        ]);
    }

    public function destroy(Blog $blog): JsonResponse
    {
        if ($blog->image && file_exists(public_path($blog->image))) {
            @unlink(public_path($blog->image));
        }

        $blog->delete();

        return response()->json(['message' => 'Blog post deleted successfully']);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
        ]);

        $file = $request->file('image');
        $filename = 'blog_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads/blog'), $filename);

        $url = '/uploads/blog/' . $filename;

        return response()->json([
            'message'   => 'Image uploaded successfully',
            'image_url' => $url,
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private function formatPublic(Blog $blog): array
    {
        return [
            'id'          => $blog->id,
            'title'       => $blog->title,
            'slug'        => $blog->slug,
            'excerpt'     => $blog->excerpt,
            'content'     => $blog->content,
            'image'       => $blog->image,
            'category'    => $blog->category,
            'published_at' => $blog->published_at?->toIso8601String(),
            'created_at'  => $blog->created_at->toIso8601String(),
            'meta_title'       => $blog->meta_title,
            'meta_description' => $blog->meta_description,
        ];
    }

    private function formatAdmin(Blog $blog): array
    {
        return [
            'id'               => $blog->id,
            'title'            => $blog->title,
            'slug'             => $blog->slug,
            'excerpt'          => $blog->excerpt,
            'content'          => $blog->content,
            'image'            => $blog->image,
            'category'         => $blog->category,
            'status'           => $blog->status,
            'is_published'     => $blog->is_published,
            'published_at'     => $blog->published_at?->toIso8601String(),
            'meta_title'       => $blog->meta_title,
            'meta_description' => $blog->meta_description,
            'author'           => $blog->author ? ['id' => $blog->author->id, 'name' => $blog->author->name] : null,
            'created_at'       => $blog->created_at->toIso8601String(),
            'updated_at'       => $blog->updated_at->toIso8601String(),
        ];
    }
}
