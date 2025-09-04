<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = 'admin@example.com';

        $existing = User::where('email', $email)->first();
        if ($existing) {
            $existing->update(['role' => 'admin']);
            return;
        }

        User::create([
            'name' => 'Admin',
            'email' => $email,
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
    }
} 