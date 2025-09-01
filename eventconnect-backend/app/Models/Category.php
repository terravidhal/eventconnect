<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'description',
        'icon'
    ];

    /**
     * Relation avec les événements
     */
    public function events()
    {
        return $this->hasMany(Event::class);
    }

    /**
     * Obtenir le nombre d'événements dans cette catégorie
     */
    public function getEventsCount()
    {
        return $this->events()->count();
    }
}
