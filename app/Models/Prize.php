<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prize extends Model
{
    protected $fillable = [
        'raffle_id',
        'name',
        'description',
        'image',
        'sort_order',
        'winning_number',
        'drawn_at',
    ];

    protected function casts(): array
    {
        return [
            'drawn_at' => 'datetime',
        ];
    }

    public function raffle(): BelongsTo
    {
        return $this->belongsTo(Raffle::class);
    }

    public function isDrawn(): bool
    {
        return $this->winning_number !== null;
    }
}
