<?php

namespace App\Http\Requests;

use App\Models\PaellaSale;
use App\Models\Raffle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaellaSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'raffle_id'   => 'required|exists:raffles,id',
            'buyer_name'  => 'required|string|max:255',
            'buyer_phone' => 'required|string|max:30',
            'type'        => ['required', Rule::in(['valenciana', 'vegana'])],
            'quantity'    => 'required|integer|min:1|max:50',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $raffle = Raffle::find($this->raffle_id);

            if (!$raffle) {
                return;
            }

            if (!$raffle->paella_price) {
                $validator->errors()->add('raffle_id', 'La paella no está configurada para esta rifa.');
                return;
            }

            if ($raffle->paella_deadline && now()->startOfDay()->gt($raffle->paella_deadline)) {
                $validator->errors()->add('type', 'La fecha límite de venta de paella ha pasado.');
                return;
            }

            $total = $raffle->paella_total;

            if (!$total) {
                $validator->errors()->add('type', 'No hay tickets de paella configurados.');
                return;
            }

            $sold = PaellaSale::where('raffle_id', $raffle->id)->sum('quantity');
            $remaining = $total - $sold;

            if ($this->quantity > $remaining) {
                $validator->errors()->add('quantity', "Solo quedan {$remaining} tickets de paella disponibles.");
            }
        });
    }
}
