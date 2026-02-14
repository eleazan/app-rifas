<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;

class BuyerNotifiable
{
    use Notifiable;

    public function __construct(
        public string $name,
        public ?string $email,
        public ?string $phone,
    ) {}

    public function routeNotificationForMail(): ?string
    {
        return $this->email;
    }
}
