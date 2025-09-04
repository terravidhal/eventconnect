<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            // Étendre l'ENUM pour inclure 'admin'
            DB::statement("ALTER TABLE users MODIFY role ENUM('participant','organisateur','admin') NOT NULL DEFAULT 'participant'");
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users')) {
            // Revenir à l'ancienne définition (sans 'admin')
            DB::statement("ALTER TABLE users MODIFY role ENUM('participant','organisateur') NOT NULL DEFAULT 'participant'");
        }
    }
}; 