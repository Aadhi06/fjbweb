<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_settings', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('day_of_week')->unique();
            $table->boolean('is_open')->default(true);
            $table->string('open_time')->default('10:00');
            $table->string('close_time')->default('18:00');
            $table->integer('slot_duration_minutes')->default(30);
            $table->integer('max_bookings_per_slot')->default(1);
            $table->timestamps();
        });

        $days = [
            ['day_of_week' => 0, 'is_open' => false, 'open_time' => '10:00', 'close_time' => '18:00', 'slot_duration_minutes' => 30, 'max_bookings_per_slot' => 1],
            ['day_of_week' => 1, 'is_open' => true, 'open_time' => '10:00', 'close_time' => '18:00', 'slot_duration_minutes' => 30, 'max_bookings_per_slot' => 1],
            ['day_of_week' => 2, 'is_open' => true, 'open_time' => '10:00', 'close_time' => '18:00', 'slot_duration_minutes' => 30, 'max_bookings_per_slot' => 1],
            ['day_of_week' => 3, 'is_open' => true, 'open_time' => '10:00', 'close_time' => '18:00', 'slot_duration_minutes' => 30, 'max_bookings_per_slot' => 1],
            ['day_of_week' => 4, 'is_open' => true, 'open_time' => '10:00', 'close_time' => '18:00', 'slot_duration_minutes' => 30, 'max_bookings_per_slot' => 1],
            ['day_of_week' => 5, 'is_open' => true, 'open_time' => '10:00', 'close_time' => '18:00', 'slot_duration_minutes' => 30, 'max_bookings_per_slot' => 1],
            ['day_of_week' => 6, 'is_open' => true, 'open_time' => '10:00', 'close_time' => '18:00', 'slot_duration_minutes' => 30, 'max_bookings_per_slot' => 1],
        ];

        $now = now();
        foreach ($days as &$day) {
            $day['created_at'] = $now;
            $day['updated_at'] = $now;
        }

        DB::table('booking_settings')->insert($days);
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_settings');
    }
};
