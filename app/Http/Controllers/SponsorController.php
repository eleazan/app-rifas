<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSponsorRequest;
use App\Http\Requests\UpdateSponsorRequest;
use App\Models\Sponsor;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SponsorController extends Controller
{
    public function index()
    {
        $sponsors = Sponsor::withCount('raffles')
            ->orderBy('name')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'logo' => $s->logo ? Storage::url($s->logo) : null,
                'website' => $s->website,
                'raffles_count' => $s->raffles_count,
            ]);

        return Inertia::render('Admin/Sponsors/Index', [
            'sponsors' => $sponsors,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Sponsors/Create');
    }

    public function store(StoreSponsorRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('sponsors', 'public');
        }

        Sponsor::create($data);

        return redirect()->route('sponsors.index')
            ->with('success', 'Patrocinador creado correctamente.');
    }

    public function edit(Sponsor $sponsor)
    {
        return Inertia::render('Admin/Sponsors/Edit', [
            'sponsor' => [
                'id' => $sponsor->id,
                'name' => $sponsor->name,
                'logo' => $sponsor->logo ? Storage::url($sponsor->logo) : null,
                'website' => $sponsor->website,
            ],
        ]);
    }

    public function update(UpdateSponsorRequest $request, Sponsor $sponsor)
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if ($sponsor->logo) {
                Storage::disk('public')->delete($sponsor->logo);
            }
            $data['logo'] = $request->file('logo')->store('sponsors', 'public');
        } else {
            unset($data['logo']);
        }

        $sponsor->update($data);

        return redirect()->route('sponsors.index')
            ->with('success', 'Patrocinador actualizado correctamente.');
    }

    public function destroy(Sponsor $sponsor)
    {
        if ($sponsor->raffles()->exists()) {
            return back()->with('error', 'No se puede eliminar un patrocinador con rifas asociadas.');
        }

        if ($sponsor->logo) {
            Storage::disk('public')->delete($sponsor->logo);
        }

        $sponsor->delete();

        return redirect()->route('sponsors.index')
            ->with('success', 'Patrocinador eliminado correctamente.');
    }
}
