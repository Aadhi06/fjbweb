<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AntiSpam
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->filled('_honeypot') || $request->filled('website_url')) {
            return response()->json(['message' => 'Thank you for your submission.'], 200);
        }

        if ($request->has('_loaded_at')) {
            $loadedAt = (int) $request->input('_loaded_at');
            $now = round(microtime(true) * 1000);
            if ($now - $loadedAt < 3000) {
                return response()->json(['message' => 'Please try again.'], 429);
            }
        }

        $ip = $request->ip();
        $key = 'form_submit_' . md5($ip);
        $attempts = Cache::get($key, 0);

        if ($attempts >= 5) {
            return response()->json(['message' => 'Too many submissions. Please try again later.'], 429);
        }

        Cache::put($key, $attempts + 1, 60);

        $request->request->remove('_honeypot');
        $request->request->remove('_loaded_at');
        $request->request->remove('website_url');

        return $next($request);
    }
}
