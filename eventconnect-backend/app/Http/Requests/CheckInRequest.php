<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckInRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Seuls les organisateurs peuvent valider les entrées
        return auth()->check() && auth()->user()->isOrganizer();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'qr_code' => 'required|string|max:50',
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
            'qr_code.required' => 'Le code QR est obligatoire.',
            'qr_code.string' => 'Le code QR doit être une chaîne de caractères.',
            'qr_code.max' => 'Le code QR ne peut pas dépasser 50 caractères.',
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
            'qr_code' => 'code QR',
        ];
    }
} 