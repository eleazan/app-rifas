<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaellaSaleRequest;
use App\Jobs\SendWhatsappMessage;
use App\Models\PaellaSale;
use App\Models\Raffle;
use App\Models\Seller;
use Inertia\Inertia;

class PaellaSellController extends Controller
{
    public function index()
    {
        $raffle = Raffle::active()->first();
        $seller = Seller::where('user_id', auth()->id())->first();

        if (!$raffle || !$raffle->paella_price) {
            return Inertia::render('Seller/SellPaella', [
                'raffle' => null,
                'seller' => null,
                'stock'  => null,
            ]);
        }

        return Inertia::render('Seller/SellPaella', [
            'raffle' => [
                'id'       => $raffle->id,
                'name'     => $raffle->name,
                'price'    => $raffle->paella_price,
                'deadline' => $raffle->paella_deadline?->format('Y-m-d'),
            ],
            'stock'  => $this->getStock($raffle),
            'seller' => $seller ? ['id' => $seller->id, 'name' => $seller->name] : null,
        ]);
    }

    public function store(StorePaellaSaleRequest $request)
    {
        $data = $request->validated();
        $raffle = Raffle::find($data['raffle_id']);
        $seller = Seller::where('user_id', auth()->id())->firstOrFail();

        $sale = PaellaSale::create([
            'raffle_id'   => $data['raffle_id'],
            'seller_id'   => $seller->id,
            'buyer_name'  => $data['buyer_name'],
            'buyer_phone' => $data['buyer_phone'],
            'type'        => $data['type'],
            'quantity'    => $data['quantity'],
        ]);

        $this->dispatchWhatsapp($sale, $raffle);

        return redirect()->route('paella.sell')
            ->with('success', "{$data['quantity']} ticket(s) de paella {$data['type']} vendidos a {$data['buyer_name']}.");
    }

    private function getStock(Raffle $raffle): array
    {
        $soldValenciana = PaellaSale::where('raffle_id', $raffle->id)->where('type', 'valenciana')->sum('quantity');
        $soldVegana     = PaellaSale::where('raffle_id', $raffle->id)->where('type', 'vegana')->sum('quantity');
        $soldTotal      = $soldValenciana + $soldVegana;
        $total          = $raffle->paella_total ?? 0;

        return [
            'total'               => $total,
            'sold'                => $soldTotal,
            'remaining'           => max(0, $total - $soldTotal),
            'sold_valenciana'     => $soldValenciana,
            'sold_vegana'         => $soldVegana,
        ];
    }

    private function dispatchWhatsapp(PaellaSale $sale, Raffle $raffle): void
    {
        $plural  = $sale->quantity > 1 ? 's' : '';
        $typeLabel = $sale->type === 'vegana' ? 'vegana' : 'valenciana';
        $total   = number_format($sale->quantity * (float) $raffle->paella_price, 2);

        $message = "🥘 *Paella - {$raffle->name}*\n\n"
            . "Hola {$sale->buyer_name}!\n"
            . "Reserva confirmada: *{$sale->quantity} ticket{$plural} paella {$typeLabel}*\n"
            . "Total: {$total}€\n\n"
            . "📍 Campo de rugby/fútbol de Sant Agustí\n"
            . "🕑 La paella se servirá a las 14:30–15:00h\n\n"
            . "Recuerda recoger tu ticket en el momento del sorteo — estarás en la lista. ✅\n\n"
            . "Nos vemos pronto! 🍀";

        $delay = rand(5, 20);
        SendWhatsappMessage::dispatch(0, $sale->buyer_phone, $message)
            ->onQueue('whatsapp')
            ->delay(now()->addSeconds($delay));
    }
}
