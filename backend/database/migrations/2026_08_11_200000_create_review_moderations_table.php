<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_moderations', function (Blueprint $table) {
            $table->id();
            $table->string('review_key')->unique();
            $table->string('author_name')->nullable();
            $table->unsignedTinyInteger('rating')->nullable();
            $table->boolean('is_hidden')->default(false);
            $table->text('reply_text')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_moderations');
    }
};
