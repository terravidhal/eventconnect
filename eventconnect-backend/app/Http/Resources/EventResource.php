<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'date' => $this->date,
            'location' => $this->location,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'capacity' => $this->capacity,
            'price' => $this->price,
            'image' => $this->image,
            'tags' => is_string($this->tags) ? json_decode($this->tags, true) : $this->tags,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relations chargées
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'icon' => $this->category->icon,
                ];
            }),
            
            'organizer' => $this->whenLoaded('organizer', function () {
                return [
                    'id' => $this->organizer->id,
                    'name' => $this->organizer->name,
                    'email' => $this->organizer->email,
                ];
            }),
            
            // Participations (si chargées)
            'participations' => $this->whenLoaded('participations', function () {
                return $this->participations->map(function ($participation) {
                    return [
                        'id' => $participation->id,
                        'status' => $participation->status,
                        'checked_in' => $participation->checked_in,
                        'created_at' => $participation->created_at,
                        'user' => [
                            'id' => $participation->user->id,
                            'name' => $participation->user->name,
                            'email' => $participation->user->email,
                            'avatar' => $participation->user->avatar,
                        ],
                    ];
                });
            }),
            
            // Métadonnées calculées
            'participants_count' => $this->when(isset($this->participants_count), $this->participants_count),
            'available_spots' => $this->when(isset($this->available_spots), $this->available_spots),
            'is_full' => $this->when(isset($this->is_full), $this->is_full),
            'participation_rate' => $this->when(isset($this->participation_rate), $this->participation_rate),
            
            // URLs
            'image_url' => $this->when($this->image, function () {
                return asset('storage/' . $this->image);
            }),
            
            // Liens d'action (si l'utilisateur est connecté)
            'can_edit' => $this->when(auth()->check(), function () {
                return auth()->id() === $this->organizer_id;
            }),
            
            'can_delete' => $this->when(auth()->check(), function () {
                return auth()->id() === $this->organizer_id;
            }),
            
            'can_participate' => $this->when(auth()->check(), function () {
                return auth()->id() !== $this->organizer_id && 
                       $this->status === 'publié' && 
                       !$this->isFull();
            }),
            
            'is_participating' => $this->when(auth()->check(), function () {
                return $this->participations()
                    ->where('user_id', auth()->id())
                    ->exists();
            }),
            
            'participation_status' => $this->when(auth()->check(), function () {
                $participation = $this->participations()
                    ->where('user_id', auth()->id())
                    ->first();
                return $participation ? $participation->status : null;
            }),
        ];
    }
}
