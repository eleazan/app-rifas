<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Models\Raffle;
use App\Models\Seller;
use App\Models\Ticket;
use App\Models\TicketLock;
use App\Services\NotificationLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $raffle = $request->input('raffle_id')
            ? Raffle::find($request->input('raffle_id'))
            : Raffle::active()->first();

        $sales = collect();

        if ($raffle) {
            $tickets = Ticket::with('seller:id,name')
                ->where('raffle_id', $raffle->id)
                ->orderByDesc('created_at')
                ->get();

            $sales = $tickets->groupBy('sale_id')->map(function ($group) {
                $first = $group->first();
                return [
                    'sale_id' => $first->sale_id,
                    'numbers' => $group->pluck('number')->sort()->values()->toArray(),
                    'ticket_ids' => $group->pluck('id')->toArray(),
                    'buyer_name' => $first->buyer_name,
                    'buyer_email' => $first->buyer_email,
                    'buyer_phone' => $first->buyer_phone,
                    'contact_method' => $first->contact_method,
                    'seller_name' => $first->seller?->name,
                    'created_at' => $first->created_at->toISOString(),
                ];
            })->values();
        }

        $raffles = Raffle::orderByDesc('created_at')->get(['id', 'name', 'status']);

        return Inertia::render('Admin/Tickets/Index', [
            'sales' => $sales,
            'raffles' => $raffles,
            'currentRaffleId' => $raffle?->id,
        ]);
    }

    public function create()
    {
        $raffle = Raffle::active()->first();

        if (!$raffle) {
            return redirect()->route('tickets.index')
                ->with('error', 'No hay una rifa activa. Activa una rifa primero.');
        }

        TicketLock::clearExpired();

        $soldNumbers = Ticket::where('raffle_id', $raffle->id)
            ->pluck('number')
            ->toArray();

        $lockedNumbers = TicketLock::where('raffle_id', $raffle->id)
            ->where('user_id', '!=', request()->user()->id)
            ->where('expires_at', '>', now())
            ->pluck('number')
            ->toArray();

        $sellers = Seller::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Tickets/Create', [
            'raffle' => [
                'id' => $raffle->id,
                'name' => $raffle->name,
                'ticket_price' => $raffle->ticket_price,
                'total_numbers' => $raffle->total_numbers,
            ],
            'soldNumbers' => $soldNumbers,
            'lockedNumbers' => $lockedNumbers,
            'sellers' => $sellers,
        ]);
    }

    public function store(StoreTicketRequest $request)
    {
        $data = $request->validated();
        $saleId = Str::uuid()->toString();
        $tickets = [];

        foreach ($data['numbers'] as $number) {
            $tickets[] = Ticket::create([
                'sale_id' => $saleId,
                'raffle_id' => $data['raffle_id'],
                'seller_id' => $data['seller_id'],
                'number' => $number,
                'buyer_name' => $data['buyer_name'],
                'buyer_email' => $data['buyer_email'] ?? null,
                'buyer_phone' => $data['buyer_phone'] ?? null,
                'contact_method' => $data['contact_method'],
            ]);
        }

        $count = count($tickets);

        // Release locks for sold numbers
        TicketLock::where('raffle_id', $data['raffle_id'])
            ->where('user_id', $request->user()->id)
            ->whereIn('number', $data['numbers'])
            ->delete();

        $raffle = Raffle::find($data['raffle_id']);
        $ticketData = collect($tickets)->map(fn ($t) => $t->toArray())->all();
        app(NotificationLogService::class)->sendAndLog($saleId, $ticketData, $raffle, $data['seller_id']);

        return redirect()->route('tickets.create')
            ->with('success', "{$count} " . ($count === 1 ? 'boleto vendido' : 'boletos vendidos') . ' correctamente.');
    }

    public function destroy(Ticket $ticket)
    {
        if ($ticket->sale_id) {
            $count = Ticket::where('sale_id', $ticket->sale_id)->delete();
            return back()->with('success', "{$count} boleto" . ($count > 1 ? 's eliminados' : ' eliminado') . ' correctamente.');
        }

        $ticket->delete();
        return back()->with('success', 'Boleto eliminado correctamente.');
    }
}
