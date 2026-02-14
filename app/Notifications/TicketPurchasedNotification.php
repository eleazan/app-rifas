<?php

namespace App\Notifications;

use App\Models\Ticket;
use App\Services\EvolutionApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketPurchasedNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected array $tickets,
        protected string $raffleName,
        protected string $ticketPrice,
    ) {}

    public function via(object $notifiable): array
    {
        $channels = [];

        $first = $this->tickets[0] ?? null;
        if (!$first) {
            return $channels;
        }

        if ($first['contact_method'] === 'email' && !empty($first['buyer_email'])) {
            $channels[] = 'mail';
        }

        if ($first['contact_method'] === 'whatsapp' && !empty($first['buyer_phone'])) {
            $channels[] = 'whatsapp';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $first = $this->tickets[0];
        $numbers = collect($this->tickets)->pluck('number')->sort()->implode(', ');
        $count = count($this->tickets);
        $total = number_format($count * (float) $this->ticketPrice, 2);

        return (new MailMessage)
            ->subject("Tu{$this->plural($count)} boleto{$this->plural($count)} de {$this->raffleName}")
            ->greeting("Hola {$first['buyer_name']}!")
            ->line("Gracias por tu compra en la rifa **{$this->raffleName}**.")
            ->line("**Numero{$this->plural($count)}:** {$numbers}")
            ->line("**Total:** \${$total}")
            ->line('Te notificaremos si resultas ganador. Mucha suerte!');
    }

    public function toWhatsapp(object $notifiable): void
    {
        $first = $this->tickets[0];
        $numbers = collect($this->tickets)->pluck('number')->sort()->implode(', ');
        $count = count($this->tickets);
        $total = number_format($count * (float) $this->ticketPrice, 2);

        $message = "🎟️ *{$this->raffleName}*\n\n"
            . "Hola {$first['buyer_name']}!\n"
            . "Tu" . $this->plural($count) . " boleto" . $this->plural($count) . ": *{$numbers}*\n"
            . "Total: \${$total}\n\n"
            . "Te avisaremos si ganas. Mucha suerte! 🍀";

        app(EvolutionApiService::class)->sendText($first['buyer_phone'], $message);
    }

    protected function plural(int $count): string
    {
        return $count > 1 ? 's' : '';
    }
}
