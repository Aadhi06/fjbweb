<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MetalRateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RateController extends Controller
{
    public function __construct(private MetalRateService $rateService) {}

    public function index(): JsonResponse
    {
        $rates = $this->rateService->getRates();

        return response()
            ->json([
                'data' => $rates['data'] ?? [],
                'gold_carats' => $rates['gold_carats'] ?? [],
            ])
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    public function calculate(Request $request): JsonResponse
    {
        $request->validate([
            'weight' => 'required|numeric|min:0.01',
            'carat' => 'required|string',
        ]);

        $result = $this->rateService->calculate(
            (float) $request->input('weight'),
            $request->input('carat')
        );

        if (isset($result['error'])) {
            return response()->json(['error' => $result['error']], 404);
        }

        return response()->json(['data' => $result]);
    }
}
