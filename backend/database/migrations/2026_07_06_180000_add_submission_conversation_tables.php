<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\FormSubmission;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('form_submissions', function (Blueprint $table) {
            $table->string('reply_token', 64)->nullable()->unique()->after('status');
        });

        FormSubmission::whereNull('reply_token')->orWhere('reply_token', '')->chunkById(100, function ($submissions) {
            foreach ($submissions as $submission) {
                $submission->update(['reply_token' => Str::random(48)]);
            }
        });

        Schema::create('form_submission_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_submission_id')->constrained()->cascadeOnDelete();
            $table->string('sender'); // admin | customer
            $table->text('body');
            $table->foreignId('admin_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_submission_messages');
        Schema::table('form_submissions', function (Blueprint $table) {
            $table->dropColumn('reply_token');
        });
    }
};
