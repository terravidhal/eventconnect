<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Seul l'organisateur de l'événement peut le modifier
        $event = $this->route('event');
        return auth()->check() && $event && $event->organizer_id === auth()->id();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|min:10',
            'date' => 'sometimes|date|after:now',
            'location' => 'sometimes|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'capacity' => 'sometimes|integer|min:1|max:10000',
            'price' => 'nullable|numeric|min:0|max:999999.99',
            'category_id' => 'sometimes|exists:categories,id',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
            'status' => [
                'sometimes',
                Rule::in(['draft', 'published', 'cancelled'])
            ],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'title.string' => 'Le titre doit être une chaîne de caractères.',
            'title.max' => 'Le titre ne peut pas dépasser 255 caractères.',
            'description.string' => 'La description doit être une chaîne de caractères.',
            'description.min' => 'La description doit contenir au moins 10 caractères.',
            'date.date' => 'La date doit être au format date valide.',
            'date.after' => 'La date de l\'événement doit être dans le futur.',
            'location.string' => 'Le lieu doit être une chaîne de caractères.',
            'location.max' => 'Le lieu ne peut pas dépasser 255 caractères.',
            'latitude.numeric' => 'La latitude doit être un nombre.',
            'latitude.between' => 'La latitude doit être comprise entre -90 et 90.',
            'longitude.numeric' => 'La longitude doit être un nombre.',
            'longitude.between' => 'La longitude doit être comprise entre -180 et 180.',
            'capacity.integer' => 'La capacité doit être un nombre entier.',
            'capacity.min' => 'La capacité doit être d\'au moins 1 personne.',
            'capacity.max' => 'La capacité ne peut pas dépasser 10 000 personnes.',
            'price.numeric' => 'Le prix doit être un nombre.',
            'price.min' => 'Le prix ne peut pas être négatif.',
            'price.max' => 'Le prix ne peut pas dépasser 999 999.99.',
            'category_id.exists' => 'La catégorie sélectionnée n\'existe pas.',
            'tags.array' => 'Les tags doivent être dans un tableau.',
            'tags.max' => 'Vous ne pouvez pas ajouter plus de 10 tags.',
            'tags.*.string' => 'Chaque tag doit être une chaîne de caractères.',
            'tags.*.max' => 'Chaque tag ne peut pas dépasser 50 caractères.',
            'status.in' => 'Le statut doit être "draft", "published" ou "cancelled".',
            'image.image' => 'Le fichier doit être une image.',
            'image.mimes' => 'L\'image doit être au format JPEG, PNG, JPG ou GIF.',
            'image.max' => 'L\'image ne peut pas dépasser 2 Mo.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array
     */
    public function attributes(): array
    {
        return [
            'title' => 'titre',
            'description' => 'description',
            'date' => 'date',
            'location' => 'lieu',
            'latitude' => 'latitude',
            'longitude' => 'longitude',
            'capacity' => 'capacité',
            'price' => 'prix',
            'category_id' => 'catégorie',
            'tags' => 'tags',
            'status' => 'statut',
            'image' => 'image',
        ];
    }
} 