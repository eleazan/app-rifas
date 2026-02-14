<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organizer extends Model
{
    protected $fillable = [
        'name',
        'logo',
    ];

    public function raffles(): HasMany
    {
        return $this->hasMany(Raffle::class);
    }
}
