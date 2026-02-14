<?php

namespace App\Http\Requests;

use App\Models\Raffle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRaffleRequest extends FormRequest
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
            'status' => ['required', Rule::in(['draft', 'active', 'completed'])],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->status === 'active') {
                $exists = Raffle::where('status', 'active')
                    ->where('id', '!=', $this->route('raffle')->id)
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('status', 'Ya existe una rifa activa. Completa o desactiva la actual primero.');
                }
            }
        });
    }
}
