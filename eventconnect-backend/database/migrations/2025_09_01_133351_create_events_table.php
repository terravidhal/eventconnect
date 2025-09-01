<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->text('description');
            $table->dateTime('date');
            $table->string('location', 255);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('capacity')->default(0);
            $table->decimal('price', 8, 2)->nullable();
            $table->string('image', 255)->nullable();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->json('tags')->nullable();
            $table->enum('status', ['brouillon', 'publié', 'annulé'])->default('brouillon');
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['date', 'status']);
            $table->index(['category_id']);
            $table->index(['organizer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
