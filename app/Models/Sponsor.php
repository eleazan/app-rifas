<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Sponsor extends Model
{
    protected $fillable = [
        'name',
        'logo',
        'website',
    ];

    public function raffles(): BelongsToMany
    {
        return $this->belongsToMany(Raffle::class);
    }
}
