<?php

use Database\Seeders\HighValueBlogSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        (new HighValueBlogSeeder())->run();
    }

    public function down(): void
    {
        // Keep published articles if the migration is rolled back.
    }
};
