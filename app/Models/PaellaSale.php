<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaellaSale extends Model
{
    protected $fillable = [
        'raffle_id',
        'seller_id',
        'buyer_name',
        'buyer_phone',
        'type',
        'quantity',
    ];

    public function raffle(): BelongsTo
    {
        return $this->belongsTo(Raffle::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }
}
