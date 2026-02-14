<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrganizerRequest;
use App\Http\Requests\UpdateOrganizerRequest;
use App\Models\Organizer;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OrganizerController extends Controller
{
    public function index()
    {
        $organizers = Organizer::withCount('raffles')
            ->orderBy('name')
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'name' => $o->name,
                'logo' => $o->logo ? Storage::url($o->logo) : null,
                'raffles_count' => $o->raffles_count,
            ]);

        return Inertia::render('Admin/Organizers/Index', [
            'organizers' => $organizers,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Organizers/Create');
    }

    public function store(StoreOrganizerRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('organizers', 'public');
        }

        Organizer::create($data);

        return redirect()->route('organizers.index')
            ->with('success', 'Organizador creado correctamente.');
    }

    public function edit(Organizer $organizer)
    {
        return Inertia::render('Admin/Organizers/Edit', [
            'organizer' => [
                'id' => $organizer->id,
                'name' => $organizer->name,
                'logo' => $organizer->logo ? Storage::url($organizer->logo) : null,
            ],
        ]);
    }

    public function update(UpdateOrganizerRequest $request, Organizer $organizer)
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if ($organizer->logo) {
                Storage::disk('public')->delete($organizer->logo);
            }
            $data['logo'] = $request->file('logo')->store('organizers', 'public');
        } else {
            unset($data['logo']);
        }

        $organizer->update($data);

        return redirect()->route('organizers.index')
            ->with('success', 'Organizador actualizado correctamente.');
    }

    public function destroy(Organizer $organizer)
    {
        if ($organizer->raffles()->exists()) {
            return back()->with('error', 'No se puede eliminar un organizador con rifas asociadas.');
        }

        if ($organizer->logo) {
            Storage::disk('public')->delete($organizer->logo);
        }

        $organizer->delete();

        return redirect()->route('organizers.index')
            ->with('success', 'Organizador eliminado correctamente.');
    }
}
