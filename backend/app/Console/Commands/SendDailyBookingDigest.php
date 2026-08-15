<?php

namespace App\Console\Commands;

use App\Services\BookingMailService;
use Illuminate\Console\Command;

class SendDailyBookingDigest extends Command
{
    protected $signature = 'bookings:daily-digest {--force : Send even if already sent today}';
    protected $description = 'Email admin today and tomorrow appointments at 8am';

    public function handle(BookingMailService $mailService): int
    {
        $result = $mailService->sendDailyDigest((bool) $this->option('force'));

        if (!($result['sent'] ?? false)) {
            $this->info($result['message'] ?? 'Digest not sent.');
            return self::SUCCESS;
        }

        $this->info($result['message']);
        return self::SUCCESS;
    }
}
