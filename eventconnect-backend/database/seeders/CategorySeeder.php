<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Musique',
                'description' => 'Concerts, festivals, soirées musicales',
                'icon' => '🎵'
            ],
            [
                'name' => 'Sport',
                'description' => 'Compétitions, tournois, événements sportifs',
                'icon' => '⚽'
            ],
            [
                'name' => 'Culture',
                'description' => 'Expositions, théâtre, cinéma',
                'icon' => '🎨'
            ],
            [
                'name' => 'Gastronomie',
                'description' => 'Dégustations, cours de cuisine, festivals culinaires',
                'icon' => '🍽️'
            ],
            [
                'name' => 'Business',
                'description' => 'Conférences, networking, salons professionnels',
                'icon' => '💼'
            ],
            [
                'name' => 'Technologie',
                'description' => 'Meetups, hackathons, conférences tech',
                'icon' => '💻'
            ],
            [
                'name' => 'Bien-être',
                'description' => 'Yoga, méditation, ateliers santé',
                'icon' => '🧘'
            ],
            [
                'name' => 'Autres',
                'description' => 'Autres types d\'événements',
                'icon' => '🎉'
            ]
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create($category);
        }
    }
}
