<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotificationLog extends Model
{
    protected $fillable = [
        'sale_id',
        'raffle_id',
        'seller_id',
        'channel',
        'recipient',
        'message',
        'status',
        'error',
    ];

    public function raffle(): BelongsTo
    {
        return $this->belongsTo(Raffle::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function audits(): HasMany
    {
        return $this->hasMany(NotificationLogAudit::class);
    }
}
