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
            ],
            [
                'title' => 'Conférence Tech & Innovation',
                'description' => 'Découvrez les dernières tendances technologiques avec des experts du secteur. Networking et démonstrations.',
                'date' => now()->addDays(10)->setTime(9, 0),
                'location' => 'Centre de Conférences - 321 Rue de l\'Innovation',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'capacity' => 200,
                'price' => 45.00,
                'category_id' => 4, // Tech
                'tags' => json_encode(['tech', 'innovation', 'conférence', 'networking']),
                'status' => 'publié',
                'organizer_id' => 2, // TechCorp
            ],
            [
                'title' => 'Festival de Musique Électronique',
                'description' => 'Une nuit entière dédiée à la musique électronique avec les meilleurs DJs internationaux.',
                'date' => now()->addDays(21)->setTime(22, 0),
                'location' => 'Club Électronique - 654 Avenue de la Nuit',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'capacity' => 300,
                'price' => 60.00,
                'category_id' => 1, // Musique
                'tags' => json_encode(['électronique', 'festival', 'DJ', 'nuit']),
                'status' => 'publié',
                'organizer_id' => 3, // Association Jazz Local
            ],
            [
                'title' => 'Marathon de la Ville',
                'description' => 'Course à pied de 42km à travers les plus beaux quartiers de la ville. Inscriptions ouvertes.',
                'date' => now()->addDays(28)->setTime(8, 0),
                'location' => 'Place de la République - Départ et Arrivée',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'capacity' => 1000,
                'price' => 35.00,
                'category_id' => 2, // Sport
                'tags' => json_encode(['marathon', 'course', 'sport', 'endurance']),
                'status' => 'publié',
                'organizer_id' => 4, // Club Sportif Municipal
            ],
            [
                'title' => 'Atelier de Peinture',
                'description' => 'Apprenez les techniques de peinture à l\'huile avec un artiste professionnel. Matériel fourni.',
                'date' => now()->addDays(5)->setTime(14, 0),
                'location' => 'Atelier d\'Art - 987 Rue des Créateurs',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'capacity' => 15,
                'price' => 80.00,
                'category_id' => 3, // Culture
                'tags' => json_encode(['peinture', 'atelier', 'art', 'créatif']),
                'status' => 'publié',
                'organizer_id' => 1, // Admin
            ],
            [
                'title' => 'Hackathon 48h',
                'description' => 'Compétition de programmation de 48h pour développer des solutions innovantes. Prix à gagner.',
                'date' => now()->addDays(35)->setTime(18, 0),
                'location' => 'Campus Technologique - 147 Rue du Code',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'capacity' => 50,
                'price' => null, // Gratuit
                'category_id' => 4, // Tech
                'tags' => json_encode(['hackathon', 'programmation', 'compétition', 'innovation']),
                'status' => 'publié',
                'organizer_id' => 2, // TechCorp
            ],
            [
                'title' => 'Concert Rock Alternatif',
                'description' => 'Soirée rock avec 3 groupes locaux émergents. Ambiance décontractée et bières artisanales.',
                'date' => now()->addDays(12)->setTime(20, 30),
                'location' => 'Bar Rock - 258 Rue de la Guitare',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'capacity' => 80,
                'price' => 20.00,
                'category_id' => 1, // Musique
                'tags' => json_encode(['rock', 'alternatif', 'concert', 'local']),
                'status' => 'publié',
                'organizer_id' => 3, // Association Jazz Local
            ],
            [
                'title' => 'Tournoi de Tennis',
                'description' => 'Compétition de tennis en simple et double. Tous niveaux acceptés. Inscriptions individuelles ou par équipe.',
                'date' => now()->addDays(18)->setTime(10, 0),
                'location' => 'Club de Tennis - 369 Avenue des Champions',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'capacity' => 32,
                'price' => 25.00,
                'category_id' => 2, // Sport
                'tags' => json_encode(['tennis', 'tournoi', 'compétition', 'sport']),
                'status' => 'publié',
                'organizer_id' => 4, // Club Sportif Municipal
            ]
        ];

        foreach ($events as $event) {
            \App\Models\Event::create($event);
        }
    }
}
