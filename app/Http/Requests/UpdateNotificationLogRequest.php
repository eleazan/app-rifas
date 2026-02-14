<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $log = $this->route('notificationLog');

        if ($log && $log->channel === 'email') {
            return [
                'recipient' => ['required', 'email', 'max:255'],
            ];
        }

        return [
            'recipient' => ['required', 'regex:/^[0-9+\s\-()]+$/', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'recipient.required' => 'El destinatario es obligatorio.',
            'recipient.email' => 'Debe ser un email valido.',
            'recipient.regex' => 'Debe ser un numero de telefono valido.',
        ];
    }
}
