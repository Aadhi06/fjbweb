<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    public function index(): JsonResponse
    {
        $services = Service::active()->ordered()->get();
        return response()->json(['data' => $services]);
    }

    public function show(string $slug): JsonResponse
    {
        $service = Service::where('slug', $slug)->where('is_active', true)->firstOrFail();
        return response()->json(['data' => $service]);
    }
}
