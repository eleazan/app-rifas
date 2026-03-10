<?php

namespace App\Http\Controllers;

use App\Models\Raffle;
use App\Models\Settlement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SettlementController extends Controller
{
    public function index(Request $request)
    {
        $raffles = Raffle::orderByDesc('created_at')->get(['id', 'name', 'status']);

        $selectedRaffleId = $request->integer('raffle_id') ?: optional(Raffle::where('status', 'active')->first())->id;

        $sellers = [];

        if ($selectedRaffleId) {
            $sellers = DB::table('sellers')
                ->join('tickets', function ($join) use ($selectedRaffleId) {
                    $join->on('tickets.seller_id', '=', 'sellers.id')
                        ->where('tickets.raffle_id', '=', $selectedRaffleId);
                })
                ->select(
                    'sellers.id',
                    'sellers.name',
                    'sellers.commission_pct',
                    DB::raw('SUM(tickets.price_paid) as total_sold')
                )
                ->groupBy('sellers.id', 'sellers.name', 'sellers.commission_pct')
                ->orderBy('sellers.name')
                ->get();

            $settlementTotals = DB::table('settlements')
                ->where('raffle_id', $selectedRaffleId)
                ->select('seller_id', DB::raw('SUM(amount) as total_settled'))
                ->groupBy('seller_id')
                ->get()
                ->keyBy('seller_id');

            $settlementRecords = Settlement::with('recorder:id,name')
                ->where('raffle_id', $selectedRaffleId)
                ->orderByDesc('created_at')
                ->get()
                ->groupBy('seller_id');

            $sellers = $sellers->map(function ($seller) use ($settlementTotals, $settlementRecords) {
                $totalSettled = (float) ($settlementTotals[$seller->id]->total_settled ?? 0);
                $totalSold = (float) $seller->total_sold;

                $records = ($settlementRecords[$seller->id] ?? collect())->map(fn ($s) => [
                    'id'          => $s->id,
                    'amount'      => (float) $s->amount,
                    'notes'       => $s->notes,
                    'created_at'  => $s->created_at->format('d/m/Y H:i'),
                    'recorded_by' => $s->recorder?->name,
                ])->values()->all();

                return [
                    'id'             => $seller->id,
                    'name'           => $seller->name,
                    'commission_pct' => (float) $seller->commission_pct,
                    'total_sold'     => $totalSold,
                    'total_settled'  => $totalSettled,
                    'pending'        => round($totalSold - $totalSettled, 2),
                    'settlements'    => $records,
                ];
            })->values()->all();
        }

        return Inertia::render('Admin/Settlements/Index', [
            'raffles'           => $raffles,
            'selected_raffle_id' => $selectedRaffleId,
            'sellers'           => $sellers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'seller_id' => ['required', 'exists:sellers,id'],
            'raffle_id' => ['required', 'exists:raffles,id'],
            'amount'    => ['required', 'numeric', 'min:0.01'],
            'notes'     => ['nullable', 'string', 'max:500'],
        ]);

        Settlement::create([
            ...$validated,
            'recorded_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Entrega registrada correctamente.');
    }

    public function destroy(Settlement $settlement)
    {
        $settlement->delete();

        return redirect()->back()->with('success', 'Entrega eliminada.');
    }
}
