<?php

namespace App\Http\Controllers;

use App\Models\Raffle;
use App\Models\Seller;
use App\Models\Ticket;
use Inertia\Inertia;

class MySalesController extends Controller
{
    public function index()
    {
        $seller = Seller::where('user_id', auth()->id())->first();

        if (!$seller) {
            return Inertia::render('Seller/MySales', [
                'sales' => [],
                'stats' => ['total_tickets' => 0, 'total_sales' => 0, 'commission' => '0.00'],
                'seller' => null,
            ]);
        }

        $activeRaffle = Raffle::active()->first();

        $tickets = Ticket::where('seller_id', $seller->id)
            ->when($activeRaffle, fn ($q) => $q->where('raffle_id', $activeRaffle->id))
            ->orderByDesc('created_at')
            ->get();

        $sales = $tickets->groupBy('sale_id')->map(function ($group) {
            $first = $group->first();
            return [
                'sale_id' => $first->sale_id,
                'numbers' => $group->pluck('number')->sort()->values()->toArray(),
                'buyer_name' => $first->buyer_name,
                'buyer_phone' => $first->buyer_phone,
                'buyer_email' => $first->buyer_email,
                'contact_method' => $first->contact_method,
                'created_at' => $first->created_at->toISOString(),
            ];
        })->values();

        $totalTickets = $tickets->count();
        $ticketPrice = $activeRaffle ? (float) $activeRaffle->ticket_price : 0;
        $totalRevenue = $totalTickets * $ticketPrice;
        $commission = $totalRevenue * ((float) $seller->commission_pct / 100);

        return Inertia::render('Seller/MySales', [
            'sales' => $sales,
            'stats' => [
                'total_tickets' => $totalTickets,
                'total_sales' => number_format($totalRevenue, 2),
                'commission' => number_format($commission, 2),
                'commission_pct' => $seller->commission_pct,
            ],
            'seller' => ['id' => $seller->id, 'name' => $seller->name],
            'raffleName' => $activeRaffle?->name,
        ]);
    }
}
