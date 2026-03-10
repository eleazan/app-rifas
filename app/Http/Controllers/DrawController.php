<?php

namespace App\Http\Controllers;

use App\Jobs\SendWhatsappMessage;
use App\Models\Draw;
use App\Models\Prize;
use App\Models\Raffle;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DrawController extends Controller
{
    public function index()
    {
        $raffle = Raffle::active()->first();

        if (!$raffle) {
            return Inertia::render('Admin/Draw/Index', [
                'raffle' => null,
                'prizes' => [],
                'stats' => null,
            ]);
        }

        $raffle->load(['prizes' => fn ($q) => $q->orderBy('sort_order')]);

        $soldCount = $raffle->tickets()->count();
        $drawnNumbers = Draw::where('raffle_id', $raffle->id)->pluck('winning_number')->toArray();

        $draws = Draw::where('raffle_id', $raffle->id)
            ->with(['ticket.seller'])
            ->get()
            ->keyBy('prize_id');

        return Inertia::render('Admin/Draw/Index', [
            'raffle' => [
                'id' => $raffle->id,
                'name' => $raffle->name,
                'total_numbers' => $raffle->total_numbers,
            ],
            'prizes' => $raffle->prizes->map(function ($p) use ($draws) {
                $draw = $draws->get($p->id);
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'image' => $p->image ? Storage::url($p->image) : null,
                    'sort_order' => $p->sort_order,
                    'winning_number' => $p->winning_number,
                    'is_drawn' => $p->isDrawn(),
                    'drawn_at' => $p->drawn_at?->format('d/m/Y H:i'),
                    'winner' => $draw ? [
                        'name' => $draw->ticket->buyer_name,
                        'phone' => $draw->ticket->buyer_phone,
                        'seller' => $draw->ticket->seller?->name,
                    ] : null,
                ];
            }),
            'stats' => [
                'total_tickets' => $soldCount,
                'drawn_count' => count($drawnNumbers),
                'prizes_count' => $raffle->prizes->count(),
            ],
        ]);
    }

    public function draw(Request $request)
    {
        $request->validate([
            'prize_id' => 'required|integer|exists:prizes,id',
        ]);

        $prize = Prize::findOrFail($request->input('prize_id'));
        $raffle = Raffle::active()->first();

        if (!$raffle || $prize->raffle_id !== $raffle->id) {
            return back()->with('error', 'Esta rifa no esta activa.');
        }

        if ($prize->isDrawn()) {
            return back()->with('error', 'Este premio ya fue sorteado.');
        }

        // Get all sold ticket numbers that haven't won yet
        $drawnNumbers = Draw::where('raffle_id', $raffle->id)->pluck('winning_number');

        $eligibleTicket = Ticket::where('raffle_id', $raffle->id)
            ->whereNotIn('number', $drawnNumbers)
            ->inRandomOrder()
            ->first();

        if (!$eligibleTicket) {
            return back()->with('error', 'No hay boletos elegibles para sortear.');
        }

        DB::transaction(function () use ($raffle, $prize, $eligibleTicket) {
            $now = now();

            Draw::create([
                'raffle_id' => $raffle->id,
                'prize_id' => $prize->id,
                'ticket_id' => $eligibleTicket->id,
                'winning_number' => $eligibleTicket->number,
                'drawn_at' => $now,
            ]);

            $prize->update([
                'winning_number' => $eligibleTicket->number,
                'drawn_at' => $now,
            ]);
        });

        if (!empty($eligibleTicket->buyer_phone)) {
            $this->dispatchWinnerWhatsapp($eligibleTicket->buyer_name, $eligibleTicket->buyer_phone, $prize->name, $raffle->name, $eligibleTicket->number);
        }

        return back()->with('draw_result', [
            'prize_name' => $prize->name,
            'winning_number' => $eligibleTicket->number,
            'buyer_name' => $eligibleTicket->buyer_name,
            'buyer_phone' => $eligibleTicket->buyer_phone,
            'buyer_email' => $eligibleTicket->buyer_email,
            'contact_method' => $eligibleTicket->contact_method,
        ]);
    }

    public function resend(Request $request)
    {
        $request->validate(['prize_id' => 'required|integer|exists:prizes,id']);

        $draw = Draw::with(['ticket', 'prize', 'raffle'])->where('prize_id', $request->prize_id)->firstOrFail();

        if (empty($draw->ticket->buyer_phone)) {
            return back()->with('error', 'Este ganador no tiene teléfono registrado.');
        }

        $this->dispatchWinnerWhatsapp(
            $draw->ticket->buyer_name,
            $draw->ticket->buyer_phone,
            $draw->prize->name,
            $draw->raffle->name,
            $draw->winning_number,
        );

        return back()->with('success', 'WhatsApp reenviado al ganador.');
    }

    private function dispatchWinnerWhatsapp(string $buyerName, string $phone, string $prizeName, string $raffleName, int $number): void
    {
        $message = "🎉 ¡Felicidades, {$buyerName}!\n\n"
            . "Has ganado *{$prizeName}* en la rifa *{$raffleName}* "
            . "con el número *{$number}*.\n\n"
            . "Nos pondremos en contacto contigo pronto. ¡Enhorabuena! 🏆";

        try {
            SendWhatsappMessage::dispatch(null, $phone, $message)->onQueue('whatsapp');
        } catch (\Throwable $e) {
            Log::error("Error al enviar WhatsApp al ganador {$phone}: " . $e->getMessage());
        }
    }
}
