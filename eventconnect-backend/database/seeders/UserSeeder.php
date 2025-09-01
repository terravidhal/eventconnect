<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un utilisateur administrateur
        \App\Models\User::create([
            'name' => 'Admin EventConnect',
            'email' => 'admin@eventconnect.com',
            'password' => bcrypt('password'),
            'phone' => '0123456789',
            'role' => 'organisateur',
            'email_verified_at' => now(),
        ]);

        // Créer quelques utilisateurs de test
        $users = [
            [
                'name' => 'Jean Dupont',
                'email' => 'jean.dupont@example.com',
                'password' => bcrypt('password'),
                'phone' => '0123456781',
                'role' => 'participant',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Marie Martin',
                'email' => 'marie.martin@example.com',
                'password' => bcrypt('password'),
                'phone' => '0123456782',
                'role' => 'participant',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Association Jazz Local',
                'email' => 'jazz.local@example.com',
                'password' => bcrypt('password'),
                'phone' => '0123456783',
                'role' => 'organisateur',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Club Sportif Municipal',
                'email' => 'sport.municipal@example.com',
                'password' => bcrypt('password'),
                'phone' => '0123456784',
                'role' => 'organisateur',
                'email_verified_at' => now(),
            ]
        ];

        foreach ($users as $user) {
            \App\Models\User::create($user);
        }
    }
}
