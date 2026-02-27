<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Raffle extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'ticket_price',
        'bulk_price',
        'bulk_from',
        'total_numbers',
        'status',
        'draw_date',
        'organizer_id',
        'paella_total',
        'paella_price',
        'paella_deadline',
    ];

    protected static function booted(): void
    {
        static::creating(function (Raffle $raffle) {
            if (empty($raffle->slug)) {
                $raffle->slug = static::generateUniqueSlug($raffle->name);
            }
        });

        static::updating(function (Raffle $raffle) {
            if ($raffle->isDirty('name') && !$raffle->isDirty('slug')) {
                $raffle->slug = static::generateUniqueSlug($raffle->name, $raffle->id);
            }
        });
    }

    protected static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $i = 2;

        while (static::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$original}-{$i}";
            $i++;
        }

        return $slug;
    }

    protected function casts(): array
    {
        return [
            'ticket_price'            => 'decimal:2',
            'bulk_price'              => 'decimal:2',
            'bulk_from'               => 'integer',
            'paella_total'    => 'integer',
            'paella_price'    => 'decimal:2',
            'paella_deadline' => 'date',
            'draw_date'               => 'date',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function sponsors(): BelongsToMany
    {
        return $this->belongsToMany(Sponsor::class);
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

    public function paellaSales(): HasMany
    {
        return $this->hasMany(\App\Models\PaellaSale::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
