<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('rates:fetch')->everyMinute();
Schedule::command('reviews:fetch')->daily();
