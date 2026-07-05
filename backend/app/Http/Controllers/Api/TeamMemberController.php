<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TeamMemberController extends Controller
{
    public function index(): JsonResponse
    {
        $members = TeamMember::active()->ordered()->get();

        return response()->json(['data' => $members]);
    }

    public function adminIndex(): JsonResponse
    {
        $members = TeamMember::ordered()->get();

        return response()->json(['data' => $members]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'role'       => 'required|string|max:255',
            'bio'        => 'nullable|string',
            'photo'      => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'nullable|boolean',
        ]);

        $maxOrder = TeamMember::max('sort_order') ?? 0;
        $validated['sort_order'] = $validated['sort_order'] ?? $maxOrder + 1;

        $member = TeamMember::create($validated);

        return response()->json([
            'message' => 'Team member created successfully',
            'data'    => $member,
        ], 201);
    }

    public function update(Request $request, TeamMember $teamMember): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'sometimes|required|string|max:255',
            'role'       => 'sometimes|required|string|max:255',
            'bio'        => 'nullable|string',
            'photo'      => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'nullable|boolean',
        ]);

        $teamMember->update($validated);

        return response()->json([
            'message' => 'Team member updated successfully',
            'data'    => $teamMember->fresh(),
        ]);
    }

    public function destroy(TeamMember $teamMember): JsonResponse
    {
        if ($teamMember->photo) {
            $path = public_path($teamMember->photo);
            if (file_exists($path)) {
                @unlink($path);
            }
        }

        $teamMember->delete();

        return response()->json(['message' => 'Team member deleted successfully']);
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
        ]);

        $file = $request->file('photo');
        $filename = 'team_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads/team'), $filename);

        $url = '/uploads/team/' . $filename;

        return response()->json([
            'message'   => 'Photo uploaded successfully',
            'photo_url' => $url,
        ]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'order'      => 'required|array',
            'order.*.id' => 'required|integer|exists:team_members,id',
            'order.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->input('order') as $item) {
            TeamMember::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }
}
