<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRaffleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'ticket_price' => 'required|numeric|min:0.01',
            'bulk_price' => ['nullable', 'numeric', 'min:0.01', Rule::requiredIf(fn () => !empty($this->bulk_from))],
            'bulk_from' => ['nullable', 'integer', 'min:2', Rule::requiredIf(fn () => !empty($this->bulk_price))],
            'total_numbers' => 'required|integer|min:1|max:100000',
            'draw_date' => 'nullable|date',
            'organizer_id' => 'nullable|exists:organizers,id',
            'sponsors' => 'nullable|array',
            'sponsors.*' => 'exists:sponsors,id',
        ];
    }
}
