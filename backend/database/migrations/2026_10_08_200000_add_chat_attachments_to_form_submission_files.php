<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('form_submission_files', function (Blueprint $table) {
            if (!Schema::hasColumn('form_submission_files', 'form_submission_message_id')) {
                $table->foreignId('form_submission_message_id')
                    ->nullable()
                    ->after('form_submission_id')
                    ->constrained('form_submission_messages')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('form_submission_files', function (Blueprint $table) {
            if (Schema::hasColumn('form_submission_files', 'form_submission_message_id')) {
                $table->dropConstrainedForeignId('form_submission_message_id');
            }
        });
    }
};
