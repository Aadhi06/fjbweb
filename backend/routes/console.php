<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('rates:fetch')->everyMinute();
Schedule::command('reviews:fetch')->daily();
Schedule::command('bookings:daily-digest')
    ->dailyAt('08:00')
    ->timezone('Europe/London');
