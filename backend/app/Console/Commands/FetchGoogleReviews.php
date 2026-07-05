<?php

namespace App\Console\Commands;

use App\Services\GoogleReviewService;
use Illuminate\Console\Command;

class FetchGoogleReviews extends Command
{
    protected $signature = 'reviews:fetch';
    protected $description = 'Fetch Google reviews from Places API and cache them';

    public function handle(GoogleReviewService $service): int
    {
        $this->info('Fetching Google reviews...');

        if ($service->fetchAndCacheReviews()) {
            $this->info('Google reviews updated successfully.');
            return self::SUCCESS;
        }

        $this->error('Failed to fetch reviews. Check logs for details.');
        return self::FAILURE;
    }
}
