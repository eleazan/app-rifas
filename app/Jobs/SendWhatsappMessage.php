<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Services\EvolutionApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsappMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        private ?int $notificationLogId,
        private string $phone,
        private string $message,
    ) {}

    public function backoff(): array
    {
        return [30, 60, 120];
    }

    public function handle(EvolutionApiService $evolution): void
    {
        if (!$evolution->isInstanceConnected()) {
            throw new \RuntimeException('La instancia de WhatsApp no está conectada. Verifica la conexión en Ajustes.');
        }

        $evolution->sendText($this->phone, $this->message);

        if ($this->notificationLogId) {
            NotificationLog::where('id', $this->notificationLogId)
                ->update(['status' => 'sent']);
        }
    }

    public function failed(\Throwable $e): void
    {
        if ($this->notificationLogId) {
            NotificationLog::where('id', $this->notificationLogId)
                ->update(['status' => 'failed', 'error' => $e->getMessage()]);
        }

        Log::error("WhatsApp job falló definitivamente para {$this->phone}: " . $e->getMessage());
    }
}
