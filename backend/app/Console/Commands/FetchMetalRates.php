<?php

namespace App\Console\Commands;

use App\Services\MetalRateService;
use Illuminate\Console\Command;

class FetchMetalRates extends Command
{
    protected $signature = 'rates:fetch';
    protected $description = 'Fetch live metal rates from GoldAPI and update the database';

    public function handle(MetalRateService $service): int
    {
        $this->info('Fetching metal rates...');

        if ($service->fetchAndUpdateRates()) {
            $this->info('Metal rates updated successfully.');
            return self::SUCCESS;
        }

        $this->error('Failed to fetch metal rates. Check logs for details.');
        return self::FAILURE;
    }
}
