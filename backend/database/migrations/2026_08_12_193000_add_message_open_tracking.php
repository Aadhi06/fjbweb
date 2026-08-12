<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('form_submission_messages', function (Blueprint $table) {
            $table->string('open_token', 64)->nullable()->unique()->after('admin_user_id');
            $table->timestamp('email_opened_at')->nullable()->after('open_token');
            $table->timestamp('page_viewed_at')->nullable()->after('email_opened_at');
        });
    }

    public function down(): void
    {
        Schema::table('form_submission_messages', function (Blueprint $table) {
            $table->dropColumn(['open_token', 'email_opened_at', 'page_viewed_at']);
        });
    }
};
