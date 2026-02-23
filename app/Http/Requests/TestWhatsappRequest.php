<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TestWhatsappRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'min:7', 'max:20'],
            'message' => ['required', 'string', 'max:500'],
        ];
    }
}
