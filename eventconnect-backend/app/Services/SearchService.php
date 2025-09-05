<?php

namespace App\Services;

use App\Models\Event;
use Illuminate\Database\Eloquent\Builder;

class SearchService
{
    /**
     * Recherche avancée d'événements
     */
    public function searchEvents(array $filters): Builder
    {
        $query = Event::with(['category', 'organizer'])
            ->published()
            ->upcoming();

        // Recherche textuelle
        if (isset($filters['q']) && !empty($filters['q'])) {
            $searchTerm = $filters['q'];
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('location', 'like', "%{$searchTerm}%")
                  ->orWhereJsonContains('tags', $searchTerm);
            });
        }

        // Filtre par catégorie
        if (isset($filters['category_id']) && $filters['category_id']) {
            $query->byCategory($filters['category_id']);
        }

        // Filtre par prix
        if (isset($filters['min_price']) && $filters['min_price'] !== null) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price']) && $filters['max_price'] !== null) {
            $query->where('price', '<=', $filters['max_price']);
        }

        // Filtre par date
        if (isset($filters['date_from']) && $filters['date_from']) {
            $query->where('date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to']) && $filters['date_to']) {
            $query->where('date', '<=', $filters['date_to']);
        }

        // Filtre par lieu (recherche géographique)
        if (isset($filters['location']) && $filters['location']) {
            $query->where('location', 'like', "%{$filters['location']}%");
        }

        // Filtre par capacité disponible
        if (isset($filters['has_spots']) && $filters['has_spots']) {
            $query->whereRaw('capacity > (
                SELECT COUNT(*) FROM participations 
                WHERE participations.event_id = events.id 
                AND participations.status = "inscrit"
            )');
        }

        // Tri des résultats
        $sortBy = $filters['sort_by'] ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'asc';

        switch ($sortBy) {
            case 'price':
                $query->orderBy('price', $sortOrder);
                break;
            case 'popularity':
                $query->withCount('participations')
                      ->orderBy('participations_count', $sortOrder);
                break;
            case 'title':
                $query->orderBy('title', $sortOrder);
                break;
            case 'date':
            default:
                $query->orderBy('date', $sortOrder);
                break;
        }

        return $query;
    }

    /**
     * Obtenir les suggestions de recherche
     */
    public function getSearchSuggestions(string $term): array
    {
        $suggestions = [];

        // Suggestions basées sur les titres d'événements
        $eventTitles = Event::published()
            ->where('title', 'like', "%{$term}%")
            ->limit(5)
            ->pluck('title')
            ->toArray();

        $suggestions = array_merge($suggestions, $eventTitles);

        // Suggestions basées sur les lieux
        $locations = Event::published()
            ->where('location', 'like', "%{$term}%")
            ->distinct()
            ->limit(3)
            ->pluck('location')
            ->toArray();

        $suggestions = array_merge($suggestions, $locations);

        return array_unique($suggestions);
    }

    /**
     * Obtenir les filtres disponibles
     */
    public function getAvailableFilters(): array
    {
        return [
            'categories' => \App\Models\Category::select('id', 'name', 'icon')->get(),
            'price_ranges' => [
                ['min' => 0, 'max' => 10, 'label' => 'Gratuit - 10€'],
                ['min' => 10, 'max' => 25, 'label' => '10€ - 25€'],
                ['min' => 25, 'max' => 50, 'label' => '25€ - 50€'],
                ['min' => 50, 'max' => 100, 'label' => '50€ - 100€'],
                ['min' => 100, 'max' => null, 'label' => 'Plus de 100€'],
            ],
            'date_ranges' => [
                ['label' => 'Cette semaine', 'days' => 7],
                ['label' => 'Ce mois', 'days' => 30],
                ['label' => 'Les 3 prochains mois', 'days' => 90],
            ]
        ];
    }
}
