<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'total_numbers' => 'required|integer|min:1|max:100000',
            'organizer_id' => 'nullable|exists:organizers,id',
            'sponsors' => 'nullable|array',
            'sponsors.*' => 'exists:sponsors,id',
        ];
    }
}
