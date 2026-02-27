<?php

namespace App\Http\Controllers;

use App\Models\PaellaSale;
use App\Models\Raffle;
use App\Models\Seller;
use Inertia\Inertia;

class PaellaSalesController extends Controller
{
    public function index()
    {
        $user   = auth()->user();
        $raffle = Raffle::active()->first();
        $seller = Seller::where('user_id', $user->id)->first();

        $query = PaellaSale::with('seller:id,name')
            ->when($raffle, fn ($q) => $q->where('raffle_id', $raffle->id))
            ->orderByDesc('created_at');

        if ($user->isSeller()) {
            $query->where('seller_id', $seller?->id);
        }

        $sales = $query->get()->map(fn ($s) => [
            'id'          => $s->id,
            'buyer_name'  => $s->buyer_name,
            'buyer_phone' => $s->buyer_phone,
            'type'        => $s->type,
            'quantity'    => $s->quantity,
            'seller_name' => $s->seller?->name,
            'created_at'  => $s->created_at->toISOString(),
        ]);

        $stock = null;
        if ($raffle && $raffle->paella_price) {
            $soldVal  = PaellaSale::where('raffle_id', $raffle->id)->where('type', 'valenciana')->sum('quantity');
            $soldVeg  = PaellaSale::where('raffle_id', $raffle->id)->where('type', 'vegana')->sum('quantity');
            $total    = $raffle->paella_total ?? 0;
            $stock = [
                'total'           => $total,
                'sold'            => $soldVal + $soldVeg,
                'remaining'       => max(0, $total - $soldVal - $soldVeg),
                'sold_valenciana' => $soldVal,
                'sold_vegana'     => $soldVeg,
            ];
        }

        return Inertia::render('Admin/PaellaSales', [
            'sales'      => $sales,
            'stock'      => $stock,
            'raffleName' => $raffle?->name,
            'isAdmin'    => $user->isAdmin(),
        ]);
    }
}
