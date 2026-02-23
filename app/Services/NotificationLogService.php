<?php

namespace App\Services;

use App\Models\BuyerNotifiable;
use App\Models\NotificationLog;
use App\Models\Raffle;
use App\Notifications\TicketPurchasedNotification;
use App\Services\GmailService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationLogService
{
    public function sendAndLog(string $saleId, array $ticketData, Raffle $raffle, int $sellerId): void
    {
        $first = $ticketData[0] ?? null;
        if (!$first) {
            return;
        }

        $buyer = new BuyerNotifiable(
            $first['buyer_name'],
            $first['buyer_email'] ?? null,
            $first['buyer_phone'] ?? null,
        );

        $notification = new TicketPurchasedNotification(
            $ticketData,
            $raffle->name,
            $raffle->ticket_price,
            route('rifa.show', $raffle->slug),
            $raffle->draw_date?->format('d/m/Y'),
        );

        if (!empty($first['buyer_email'])) {
            $this->sendChannel('email', $saleId, $raffle, $sellerId, $first['buyer_email'], $buyer, $notification);
        }

        if (!empty($first['buyer_phone'])) {
            $this->sendChannel('whatsapp', $saleId, $raffle, $sellerId, $first['buyer_phone'], $buyer, $notification);
        }
    }

    protected function sendChannel(
        string $channel,
        string $saleId,
        Raffle $raffle,
        int $sellerId,
        string $recipient,
        BuyerNotifiable $buyer,
        TicketPurchasedNotification $notification,
    ): void {
        $message = $channel === 'email'
            ? $this->buildEmailSummary($notification, $buyer)
            : $this->buildWhatsappMessage($notification);

        $log = NotificationLog::create([
            'sale_id' => $saleId,
            'raffle_id' => $raffle->id,
            'seller_id' => $sellerId,
            'channel' => $channel,
            'recipient' => $recipient,
            'message' => $message,
            'status' => 'sent',
        ]);

        try {
            if ($channel === 'email') {
                $gmail = app(GmailService::class);
                if ($gmail->isConnected()) {
                    $mailMessage = $notification->toMail($buyer);
                    $gmail->sendEmail(
                        $buyer->email,
                        $mailMessage->subject ?? 'Confirmación de boletos',
                        $gmail->buildHtmlFromMailMessage($mailMessage)
                    );
                } else {
                    $buyer->notify($notification->onlyVia('mail'));
                }
            } else {
                $notification->toWhatsapp($buyer);
            }
        } catch (\Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);
            Log::warning("Notification ({$channel}) failed: " . $e->getMessage());
        }
    }

    protected function buildEmailSummary(TicketPurchasedNotification $notification, BuyerNotifiable $buyer): string
    {
        try {
            $mailMessage = $notification->toMail($buyer);
            return implode("\n", array_map(fn ($line) => is_string($line) ? $line : '', $mailMessage->introLines))
                . "\n" . implode("\n", array_map(fn ($line) => is_string($line) ? $line : '', $mailMessage->outroLines));
        } catch (\Throwable $e) {
            return '[Error building email preview]';
        }
    }

    protected function buildWhatsappMessage(TicketPurchasedNotification $notification): string
    {
        return $notification->getWhatsappMessage();
    }

    public function resendEmail(NotificationLog $log): void
    {
        $tickets = \App\Models\Ticket::where('sale_id', $log->sale_id)->get();
        if ($tickets->isEmpty()) {
            throw new \RuntimeException('No se encontraron boletos para esta venta.');
        }

        $raffle = $log->raffle;
        $ticketData = $tickets->map(fn ($t) => $t->toArray())->all();

        $buyer = new BuyerNotifiable(
            $ticketData[0]['buyer_name'],
            $log->recipient,
            null,
        );

        $notification = new TicketPurchasedNotification(
            $ticketData,
            $raffle->name,
            $raffle->ticket_price,
            route('rifa.show', $raffle->slug),
            $raffle->draw_date?->format('d/m/Y'),
        );

        $gmail = app(GmailService::class);
        if ($gmail->isConnected()) {
            $mailMessage = $notification->toMail($buyer);
            $gmail->sendEmail(
                $log->recipient,
                $mailMessage->subject ?? 'Confirmación de boletos',
                $gmail->buildHtmlFromMailMessage($mailMessage)
            );
        } else {
            $buyer->notify($notification->onlyVia('mail'));
        }
    }

    public function resendWhatsapp(NotificationLog $log): void
    {
        app(EvolutionApiService::class)->sendText($log->recipient, $log->message);
    }
}
