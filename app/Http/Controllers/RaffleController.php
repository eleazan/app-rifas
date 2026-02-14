<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRaffleRequest;
use App\Http\Requests\UpdateRaffleRequest;
use App\Models\Organizer;
use App\Models\Raffle;
use App\Models\Sponsor;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RaffleController extends Controller
{
    public function index()
    {
        $raffles = Raffle::withCount(['prizes', 'tickets'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Admin/Raffles/Index', [
            'raffles' => $raffles,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Raffles/Create', [
            'organizers' => Organizer::orderBy('name')->get(['id', 'name']),
            'sponsors' => Sponsor::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreRaffleRequest $request)
    {
        $data = $request->validated();
        $sponsors = $data['sponsors'] ?? [];
        unset($data['sponsors']);

        $raffle = Raffle::create($data);
        $raffle->sponsors()->sync($sponsors);

        return redirect()->route('raffles.index')
            ->with('success', 'Rifa creada correctamente.');
    }

    public function edit(Raffle $raffle)
    {
        $raffle->load('sponsors:id');

        return Inertia::render('Admin/Raffles/Edit', [
            'raffle' => array_merge($raffle->toArray(), [
                'sponsors' => $raffle->sponsors->pluck('id'),
            ]),
            'organizers' => Organizer::orderBy('name')->get(['id', 'name']),
            'sponsors' => Sponsor::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateRaffleRequest $request, Raffle $raffle)
    {
        $data = $request->validated();
        $sponsors = $data['sponsors'] ?? [];
        unset($data['sponsors']);

        $raffle->update($data);
        $raffle->sponsors()->sync($sponsors);

        return redirect()->route('raffles.index')
            ->with('success', 'Rifa actualizada correctamente.');
    }

    public function destroy(Raffle $raffle)
    {
        if ($raffle->tickets()->exists()) {
            return back()->with('error', 'No se puede eliminar una rifa con boletos vendidos.');
        }

        $raffle->delete();

        return redirect()->route('raffles.index')
            ->with('success', 'Rifa eliminada correctamente.');
    }
}
