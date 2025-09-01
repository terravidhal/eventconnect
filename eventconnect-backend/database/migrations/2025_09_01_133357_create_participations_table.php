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
        Schema::create('participations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['inscrit', 'en_attente', 'annulé'])->default('inscrit');
            $table->string('qr_code', 255)->unique();
            $table->boolean('checked_in')->default(false);
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['user_id']);
            $table->index(['event_id']);
            $table->index(['qr_code']);
            $table->unique(['user_id', 'event_id']); // Un utilisateur ne peut s'inscrire qu'une fois par événement
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participations');
    }
};
