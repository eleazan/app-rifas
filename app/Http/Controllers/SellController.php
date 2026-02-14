<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Models\Raffle;
use App\Models\Seller;
use App\Models\Ticket;
use App\Models\TicketLock;
use App\Services\NotificationLogService;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SellController extends Controller
{
    public function index()
    {
        $raffle = Raffle::active()->first();

        if (!$raffle) {
            return Inertia::render('Seller/Sell', [
                'raffle' => null,
                'soldNumbers' => [],
                'lockedNumbers' => [],
                'seller' => null,
            ]);
        }

        $seller = Seller::where('user_id', auth()->id())->first();

        TicketLock::clearExpired();

        $soldNumbers = Ticket::where('raffle_id', $raffle->id)
            ->pluck('number')
            ->toArray();

        $lockedNumbers = TicketLock::where('raffle_id', $raffle->id)
            ->where('user_id', '!=', auth()->id())
            ->where('expires_at', '>', now())
            ->pluck('number')
            ->toArray();

        return Inertia::render('Seller/Sell', [
            'raffle' => [
                'id' => $raffle->id,
                'name' => $raffle->name,
                'ticket_price' => $raffle->ticket_price,
                'total_numbers' => $raffle->total_numbers,
            ],
            'soldNumbers' => $soldNumbers,
            'lockedNumbers' => $lockedNumbers,
            'seller' => $seller ? ['id' => $seller->id, 'name' => $seller->name] : null,
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

        TicketLock::where('raffle_id', $data['raffle_id'])
            ->where('user_id', $request->user()->id)
            ->whereIn('number', $data['numbers'])
            ->delete();

        $raffle = Raffle::find($data['raffle_id']);
        $ticketData = collect($tickets)->map(fn ($t) => $t->toArray())->all();
        app(NotificationLogService::class)->sendAndLog($saleId, $ticketData, $raffle, $data['seller_id']);

        return redirect()->route('sell.index')
            ->with('success', "{$count} " . ($count === 1 ? 'boleto vendido' : 'boletos vendidos') . ' correctamente.');
    }
}
