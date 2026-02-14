<?php

namespace App\Http\Controllers;

use App\Models\Raffle;
use App\Models\Seller;
use App\Models\Ticket;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $user = auth()->user();

        if ($user->isSeller()) {
            return $this->sellerDashboard($user);
        }

        return $this->adminDashboard();
    }

    protected function adminDashboard()
    {
        $activeRaffle = Raffle::active()->first();

        $ticketsSold = $activeRaffle
            ? Ticket::where('raffle_id', $activeRaffle->id)->count()
            : 0;

        $revenue = $activeRaffle
            ? $ticketsSold * (float) $activeRaffle->ticket_price
            : 0;

        $sellersCount = Seller::where('is_active', true)->count();

        $topSellers = $activeRaffle
            ? Seller::withCount(['tickets as sales_count' => function ($q) use ($activeRaffle) {
                    $q->where('raffle_id', $activeRaffle->id);
                }])
                ->where('is_active', true)
                ->orderByDesc('sales_count')
                ->limit(5)
                ->get()
                ->map(fn ($s) => [
                    'name' => $s->name,
                    'sales' => $s->sales_count,
                ])
            : [];

        $recentSales = [];
        if ($activeRaffle) {
            $tickets = Ticket::with('seller:id,name')
                ->where('raffle_id', $activeRaffle->id)
                ->orderByDesc('created_at')
                ->get();

            $recentSales = $tickets->groupBy('sale_id')
                ->take(5)
                ->map(function ($group) {
                    $first = $group->first();
                    return [
                        'sale_id' => $first->sale_id,
                        'numbers' => $group->pluck('number')->sort()->values()->toArray(),
                        'buyer_name' => $first->buyer_name,
                        'seller_name' => $first->seller?->name,
                        'created_at' => $first->created_at->diffForHumans(),
                    ];
                })
                ->values();
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'activeRaffle' => $activeRaffle ? $activeRaffle->name : null,
                'ticketsSold' => $ticketsSold,
                'totalNumbers' => $activeRaffle?->total_numbers ?? 0,
                'revenue' => number_format($revenue, 2),
                'sellersCount' => $sellersCount,
                'prizesCount' => $activeRaffle ? $activeRaffle->prizes()->count() : 0,
                'prizesDrawn' => $activeRaffle ? $activeRaffle->prizes()->whereNotNull('winning_number')->count() : 0,
            ],
            'topSellers' => $topSellers,
            'recentSales' => $recentSales,
        ]);
    }

    protected function sellerDashboard($user)
    {
        $seller = Seller::where('user_id', $user->id)->first();
        $activeRaffle = Raffle::active()->first();

        $myTickets = ($seller && $activeRaffle)
            ? Ticket::where('seller_id', $seller->id)
                ->where('raffle_id', $activeRaffle->id)
                ->count()
            : 0;

        $ticketPrice = $activeRaffle ? (float) $activeRaffle->ticket_price : 0;
        $myRevenue = $myTickets * $ticketPrice;
        $myCommission = $seller ? $myRevenue * ((float) $seller->commission_pct / 100) : 0;

        $recentSales = [];
        if ($seller && $activeRaffle) {
            $tickets = Ticket::where('seller_id', $seller->id)
                ->where('raffle_id', $activeRaffle->id)
                ->orderByDesc('created_at')
                ->get();

            $recentSales = $tickets->groupBy('sale_id')
                ->take(5)
                ->map(function ($group) {
                    $first = $group->first();
                    return [
                        'sale_id' => $first->sale_id,
                        'numbers' => $group->pluck('number')->sort()->values()->toArray(),
                        'buyer_name' => $first->buyer_name,
                        'created_at' => $first->created_at->diffForHumans(),
                    ];
                })
                ->values();
        }

        return Inertia::render('Seller/Dashboard', [
            'stats' => [
                'activeRaffle' => $activeRaffle ? $activeRaffle->name : null,
                'myTickets' => $myTickets,
                'myRevenue' => number_format($myRevenue, 2),
                'myCommission' => number_format($myCommission, 2),
                'commissionPct' => $seller?->commission_pct ?? 0,
            ],
            'recentSales' => $recentSales,
        ]);
    }
}
