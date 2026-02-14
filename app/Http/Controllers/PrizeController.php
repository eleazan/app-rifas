<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePrizeRequest;
use App\Http\Requests\UpdatePrizeRequest;
use App\Models\Prize;
use App\Models\Raffle;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PrizeController extends Controller
{
    public function index()
    {
        $raffles = Raffle::with(['prizes' => function ($query) {
            $query->orderBy('sort_order');
        }])->orderBy('name')->get();

        return Inertia::render('Admin/Prizes/Index', [
            'raffles' => $raffles->map(fn ($raffle) => [
                'id'     => $raffle->id,
                'name'   => $raffle->name,
                'status' => $raffle->status,
                'prizes' => $raffle->prizes->map(fn ($prize) => [
                    'id'             => $prize->id,
                    'name'           => $prize->name,
                    'description'    => $prize->description,
                    'image'          => $prize->image ? Storage::url($prize->image) : null,
                    'sort_order'     => $prize->sort_order,
                    'winning_number' => $prize->winning_number,
                    'drawn_at'       => $prize->drawn_at?->toDateTimeString(),
                    'is_drawn'       => $prize->isDrawn(),
                ]),
            ]),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Prizes/Create', [
            'raffles' => Raffle::orderBy('name')->get(['id', 'name', 'status']),
        ]);
    }

    public function store(StorePrizeRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('prizes', 'public');
        }

        Prize::create($data);

        return redirect()->route('prizes.index')
            ->with('success', 'Premio creado correctamente.');
    }

    public function edit(Prize $prize)
    {
        return Inertia::render('Admin/Prizes/Edit', [
            'prize' => [
                'id'          => $prize->id,
                'raffle_id'   => $prize->raffle_id,
                'name'        => $prize->name,
                'description' => $prize->description,
                'image'       => $prize->image ? Storage::url($prize->image) : null,
                'sort_order'  => $prize->sort_order,
            ],
            'raffles' => Raffle::orderBy('name')->get(['id', 'name', 'status']),
        ]);
    }

    public function update(UpdatePrizeRequest $request, Prize $prize)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($prize->image) {
                Storage::disk('public')->delete($prize->image);
            }
            $data['image'] = $request->file('image')->store('prizes', 'public');
        } else {
            unset($data['image']);
        }

        $prize->update($data);

        return redirect()->route('prizes.index')
            ->with('success', 'Premio actualizado correctamente.');
    }

    public function destroy(Prize $prize)
    {
        if ($prize->image) {
            Storage::disk('public')->delete($prize->image);
        }

        $prize->delete();

        return redirect()->route('prizes.index')
            ->with('success', 'Premio eliminado correctamente.');
    }
}
