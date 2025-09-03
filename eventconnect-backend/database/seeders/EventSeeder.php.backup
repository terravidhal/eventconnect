<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $events = [
            [
                'title' => 'Soirée Jazz & Blues',
                'description' => 'Une soirée exceptionnelle avec les meilleurs artistes jazz de la région. Ambiance feutrée et cocktails d\'exception.',
                'date' => now()->addDays(7)->setTime(19, 0),
                'location' => 'Salle des Fêtes - 123 Rue de la Musique',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'capacity' => 100,
                'price' => null, // Gratuit
                'category_id' => 1, // Musique
                'tags' => json_encode(['jazz', 'blues', 'concert', 'soirée']),
                'status' => 'publié',
                'organizer_id' => 3, // Association Jazz Local
            ],
            [
                'title' => 'Tournoi de Football Amateur',
                'description' => 'Tournoi de football ouvert à tous les niveaux. Inscriptions par équipe de 8 joueurs.',
                'date' => now()->addDays(14)->setTime(14, 0),
                'location' => 'Stade Municipal - 456 Avenue du Sport',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'capacity' => 80,
                'price' => 15.00,
                'category_id' => 2, // Sport
                'tags' => json_encode(['football', 'tournoi', 'sport', 'amateur']),
                'status' => 'publié',
                'organizer_id' => 4, // Club Sportif Municipal
            ],
            [
                'title' => 'Exposition Art Contemporain',
                'description' => 'Découvrez les œuvres d\'artistes locaux émergents. Vernissage avec cocktail.',
                'date' => now()->addDays(3)->setTime(18, 30),
                'location' => 'Galerie d\'Art Moderne - 789 Boulevard de la Culture',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'capacity' => 50,
                'price' => 25.00,
                'category_id' => 3, // Culture
                'tags' => json_encode(['art', 'contemporain', 'exposition', 'vernissage']),
                'status' => 'publié',
                'organizer_id' => 1, // Admin
            ]
        ];

        foreach ($events as $event) {
            \App\Models\Event::create($event);
        }
    }
}
