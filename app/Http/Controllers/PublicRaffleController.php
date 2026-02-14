<?php

namespace App\Http\Controllers;

use App\Models\Raffle;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PublicRaffleController extends Controller
{
    public function __invoke()
    {
        $raffle = Raffle::active()->first();

        if (!$raffle) {
            return Inertia::render('Public/Rifa', [
                'raffle' => null,
            ]);
        }

        $raffle->load(['prizes' => fn ($q) => $q->orderBy('sort_order')]);

        $soldCount = $raffle->tickets()->count();

        return Inertia::render('Public/Rifa', [
            'raffle' => [
                'name' => $raffle->name,
                'description' => $raffle->description,
                'ticket_price' => $raffle->ticket_price,
                'total_numbers' => $raffle->total_numbers,
                'sold_count' => $soldCount,
                'prizes' => $raffle->prizes->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'description' => $p->description,
                    'image' => $p->image ? Storage::url($p->image) : null,
                    'sort_order' => $p->sort_order,
                    'winning_number' => $p->winning_number,
                    'is_drawn' => $p->isDrawn(),
                ]),
            ],
        ]);
    }
}
