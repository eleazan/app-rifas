<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Raffle extends Model
{
    protected $fillable = [
        'name',
        'description',
        'ticket_price',
        'total_numbers',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'ticket_price' => 'decimal:2',
        ];
    }

    public function prizes(): HasMany
    {
        return $this->hasMany(Prize::class)->orderBy('sort_order');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function draws(): HasMany
    {
        return $this->hasMany(Draw::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
