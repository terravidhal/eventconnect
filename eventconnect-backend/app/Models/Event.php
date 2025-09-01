<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'title',
        'description',
        'date',
        'location',
        'latitude',
        'longitude',
        'capacity',
        'price',
        'image',
        'category_id',
        'tags',
        'status',
        'organizer_id'
    ];

    protected $casts = [
        'date' => 'datetime',
        'tags' => 'array',
        'price' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8'
    ];

    /**
     * Relation avec l'organisateur
     */
    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    /**
     * Relation avec la catégorie
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relation avec les participations
     */
    public function participations()
    {
        return $this->hasMany(Participation::class);
    }

    /**
     * Vérifier si l'événement est complet
     */
    public function isFull()
    {
        return $this->participations()->where('status', 'inscrit')->count() >= $this->capacity;
    }

    /**
     * Obtenir le nombre de places disponibles
     */
    public function availableSpots()
    {
        $inscrits = $this->participations()->where('status', 'inscrit')->count();
        return max(0, $this->capacity - $inscrits);
    }

    /**
     * Obtenir le taux de participation
     */
    public function participationRate()
    {
        if ($this->capacity == 0) return 0;
        return round(($this->participations()->where('status', 'inscrit')->count() / $this->capacity) * 100, 2);
    }

    /**
     * Scope pour les événements publiés
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'publié');
    }

    /**
     * Scope pour les événements à venir
     */
    public function scopeUpcoming($query)
    {
        return $query->where('date', '>', now());
    }

    /**
     * Scope pour filtrer par catégorie
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope pour la recherche textuelle
     */
    public function scopeSearch($query, $searchTerm)
    {
        return $query->where(function($q) use ($searchTerm) {
            $q->where('title', 'like', "%{$searchTerm}%")
              ->orWhere('description', 'like', "%{$searchTerm}%")
              ->orWhere('location', 'like', "%{$searchTerm}%")
              ->orWhereJsonContains('tags', $searchTerm);
        });
    }

    /**
     * Scope pour filtrer par prix
     */
    public function scopeByPrice($query, $minPrice = null, $maxPrice = null)
    {
        if ($minPrice !== null) {
            $query->where('price', '>=', $minPrice);
        }
        
        if ($maxPrice !== null) {
            $query->where('price', '<=', $maxPrice);
        }
        
        return $query;
    }

    /**
     * Scope pour filtrer par date
     */
    public function scopeByDate($query, $dateFrom = null, $dateTo = null)
    {
        if ($dateFrom) {
            $query->where('date', '>=', $dateFrom);
        }
        
        if ($dateTo) {
            $query->where('date', '<=', $dateTo);
        }
        
        return $query;
    }

    /**
     * Scope pour les événements avec places disponibles
     */
    public function scopeWithAvailableSpots($query)
    {
        return $query->whereRaw('capacity > (
            SELECT COUNT(*) FROM participations 
            WHERE participations.event_id = events.id 
            AND participations.status = "inscrit"
        )');
    }

    /**
     * Scope pour les événements populaires
     */
    public function scopePopular($query, $limit = 10)
    {
        return $query->withCount('participations')
                    ->orderBy('participations_count', 'desc')
                    ->limit($limit);
    }
}
