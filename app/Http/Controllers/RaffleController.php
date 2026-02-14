<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRaffleRequest;
use App\Http\Requests\UpdateRaffleRequest;
use App\Models\Raffle;
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
        return Inertia::render('Admin/Raffles/Create');
    }

    public function store(StoreRaffleRequest $request)
    {
        Raffle::create($request->validated());

        return redirect()->route('raffles.index')
            ->with('success', 'Rifa creada correctamente.');
    }

    public function edit(Raffle $raffle)
    {
        return Inertia::render('Admin/Raffles/Edit', [
            'raffle' => $raffle,
        ]);
    }

    public function update(UpdateRaffleRequest $request, Raffle $raffle)
    {
        $raffle->update($request->validated());

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
