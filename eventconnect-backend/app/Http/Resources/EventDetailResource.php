<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventDetailResource extends JsonResource
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
            'tags' => $this->tags,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relations chargées
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'description' => $this->category->description,
                    'icon' => $this->category->icon,
                ];
            }),
            
            'organizer' => $this->whenLoaded('organizer', function () {
                return [
                    'id' => $this->organizer->id,
                    'name' => $this->organizer->name,
                    'email' => $this->organizer->email,
                    'phone' => $this->organizer->phone,
                    'avatar' => $this->organizer->avatar,
                ];
            }),
            
            // Participants (si chargés)
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
            
            // Statistiques
            'participants_count' => $this->participations()->count(),
            'available_spots' => $this->availableSpots(),
            'is_full' => $this->isFull(),
            'participation_rate' => $this->participationRate(),
            
            // URLs
            'image_url' => $this->when($this->image, function () {
                return asset('storage/' . $this->image);
            }),
            
            // Permissions utilisateur
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