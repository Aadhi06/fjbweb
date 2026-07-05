<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                app(\App\Services\MailConfigService::class)->applyFromSettings();
            }
        } catch (\Throwable) {
            // Database may not be ready during install/migrate.
        }
    }
}
