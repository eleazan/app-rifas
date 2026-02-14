<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketLock extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'raffle_id',
        'number',
        'user_id',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    public static function clearExpired(): void
    {
        static::where('expires_at', '<', now())->delete();
    }
}
