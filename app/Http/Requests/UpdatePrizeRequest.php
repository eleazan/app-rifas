<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePrizeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'raffle_id'   => ['required', 'integer', 'exists:raffles,id'],
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image'       => ['sometimes', 'nullable', 'image', 'max:2048'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ];
    }
}
