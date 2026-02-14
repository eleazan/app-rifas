<?php

namespace App\Http\Controllers;

use App\Models\Raffle;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PublicRaffleController extends Controller
{
    public function active()
    {
        $raffle = Raffle::active()->first();

        return $this->renderRifa($raffle);
    }

    public function show(string $slug)
    {
        $raffle = Raffle::where('slug', $slug)->firstOrFail();

        return $this->renderRifa($raffle);
    }

    protected function renderRifa(?Raffle $raffle)
    {
        if (!$raffle) {
            return Inertia::render('Public/Rifa', [
                'raffle' => null,
            ]);
        }

        $raffle->load([
            'prizes' => fn ($q) => $q->orderBy('sort_order'),
            'organizer',
            'sponsors',
        ]);

        $soldCount = $raffle->tickets()->count();

        return Inertia::render('Public/Rifa', [
            'raffle' => [
                'name' => $raffle->name,
                'slug' => $raffle->slug,
                'description' => $raffle->description,
                'ticket_price' => $raffle->ticket_price,
                'total_numbers' => $raffle->total_numbers,
                'status' => $raffle->status,
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
                'url' => route('rifa.show', $raffle->slug),
                'organizer' => $raffle->organizer ? [
                    'name' => $raffle->organizer->name,
                    'logo' => $raffle->organizer->logo ? Storage::url($raffle->organizer->logo) : null,
                ] : null,
                'sponsors' => $raffle->sponsors->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'logo' => $s->logo ? Storage::url($s->logo) : null,
                    'website' => $s->website,
                ]),
            ],
        ]);
    }
}
