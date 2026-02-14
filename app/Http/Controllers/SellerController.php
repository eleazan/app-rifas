<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSellerRequest;
use App\Http\Requests\UpdateSellerRequest;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SellerController extends Controller
{
    public function index()
    {
        $sellers = Seller::with('user:id,email')
            ->withCount('tickets')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Admin/Sellers/Index', [
            'sellers' => $sellers,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Sellers/Create');
    }

    public function store(StoreSellerRequest $request)
    {
        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'seller',
            ]);

            Seller::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'phone' => $request->phone,
                'commission_pct' => $request->commission_pct ?? 0,
            ]);
        });

        return redirect()->route('sellers.index')
            ->with('success', 'Vendedor creado correctamente.');
    }

    public function edit(Seller $seller)
    {
        $seller->load('user:id,email');

        return Inertia::render('Admin/Sellers/Edit', [
            'seller' => $seller,
        ]);
    }

    public function update(UpdateSellerRequest $request, Seller $seller)
    {
        DB::transaction(function () use ($request, $seller) {
            $seller->update([
                'name' => $request->name,
                'phone' => $request->phone,
                'commission_pct' => $request->commission_pct ?? 0,
                'is_active' => $request->boolean('is_active', true),
            ]);

            $userData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $seller->user->update($userData);
        });

        return redirect()->route('sellers.index')
            ->with('success', 'Vendedor actualizado correctamente.');
    }

    public function destroy(Seller $seller)
    {
        if ($seller->tickets()->exists()) {
            return back()->with('error', 'No se puede eliminar un vendedor con ventas registradas.');
        }

        DB::transaction(function () use ($seller) {
            $seller->user->delete();
            $seller->delete();
        });

        return redirect()->route('sellers.index')
            ->with('success', 'Vendedor eliminado correctamente.');
    }
}
