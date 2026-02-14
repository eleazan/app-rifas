<?php

namespace App\Http\Requests;

use App\Models\Raffle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $raffleId = $this->input('raffle_id');

        return [
            'raffle_id' => ['required', 'integer', 'exists:raffles,id'],
            'seller_id' => ['required', 'integer', 'exists:sellers,id'],
            'numbers' => ['required', 'array', 'min:1'],
            'numbers.*' => [
                'required',
                'integer',
                'min:0',
                Rule::unique('tickets', 'number')->where('raffle_id', $raffleId),
            ],
            'buyer_name' => ['required', 'string', 'max:255'],
            'buyer_email' => ['nullable', 'email', 'max:255', 'required_without:buyer_phone'],
            'buyer_phone' => ['nullable', 'string', 'max:20', 'required_without:buyer_email'],
            'contact_method' => ['required', Rule::in(['email', 'whatsapp'])],
        ];
    }

    public function messages(): array
    {
        return [
            'numbers.*.unique' => 'El numero :input ya fue vendido.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $raffle = Raffle::find($this->input('raffle_id'));
            if ($raffle && $raffle->status !== 'active') {
                $validator->errors()->add('raffle_id', 'Solo se pueden vender boletos de una rifa activa.');
            }

            if ($raffle) {
                $numbers = $this->input('numbers', []);
                $max = $raffle->total_numbers - 1;
                foreach ($numbers as $number) {
                    if ($number > $max) {
                        $validator->errors()->add('numbers', "El numero {$number} excede el maximo ({$max}).");
                    }
                }
            }
        });
    }
}
