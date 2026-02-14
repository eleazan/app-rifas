<?php

namespace App\Console\Commands;

use App\Services\EvolutionApiService;
use Illuminate\Console\Command;

class TestNotification extends Command
{
    protected $signature = 'notify:test
        {phone : Numero de WhatsApp del destinatario (ej: 34612345678)}
        {--type=compra : Tipo de notificacion: compra, ganador}
        {--name=Cliente Test : Nombre del comprador}';

    protected $description = 'Envia una notificacion de prueba por WhatsApp via EvolutionAPI';

    public function handle(EvolutionApiService $evolution): int
    {
        if (!$evolution->isConfigured()) {
            $this->error('EvolutionAPI no esta configurada. Revisa las variables en .env:');
            $this->line('  EVOLUTION_API_URL=http://tu-servidor:8080');
            $this->line('  EVOLUTION_API_KEY=tu-api-key');
            $this->line('  EVOLUTION_INSTANCE=tu-instancia');
            return self::FAILURE;
        }

        $phone = $this->argument('phone');
        $type = $this->option('type');
        $name = $this->option('name');

        $message = match ($type) {
            'compra' => $this->purchaseMessage($name),
            'ganador' => $this->winnerMessage($name),
            default => null,
        };

        if (!$message) {
            $this->error("Tipo de notificacion '{$type}' no reconocido. Usa: compra, ganador");
            return self::FAILURE;
        }

        $this->info("Enviando notificacion '{$type}' a {$phone}...");
        $this->line('');
        $this->line($message);
        $this->line('');

        $success = $evolution->sendText($phone, $message);

        if ($success) {
            $this->info('Mensaje enviado correctamente!');
            return self::SUCCESS;
        }

        $this->error('Error al enviar el mensaje. Revisa los logs para mas detalles.');
        return self::FAILURE;
    }

    protected function purchaseMessage(string $name): string
    {
        $url = url('/rifa/gran-rifa-navidena-2026');

        return "🎟️ *Gran Rifa Navideña 2026*\n\n"
            . "Hola {$name}!\n"
            . "Tus boletos: *07, 23, 45*\n"
            . "Total: 150.00€\n\n"
            . "🏆 Ver premios: {$url}\n\n"
            . "Te avisaremos si ganas. Mucha suerte! 🍀";
    }

    protected function winnerMessage(string $name): string
    {
        return "🎉🎉🎉 *FELICIDADES* 🎉🎉🎉\n\n"
            . "Hola {$name}!\n\n"
            . "Tu boleto *#23* ha sido ganador en la *Gran Rifa Navideña 2026*!\n\n"
            . "🏆 Premio: *iPhone 16 Pro Max*\n\n"
            . "Nos pondremos en contacto contigo para la entrega. Enhorabuena! 🥳";
    }
}
