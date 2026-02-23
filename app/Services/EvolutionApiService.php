<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EvolutionApiService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $instance;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.evolution.url', ''), '/');
        $this->apiKey = config('services.evolution.key', '');
        $this->instance = Setting::get('whatsapp_instance', config('services.evolution.instance', '')) ?? '';
    }

    public function isConfigured(): bool
    {
        return !empty($this->baseUrl) && !empty($this->apiKey) && !empty($this->instance);
    }

    public function createInstance(string $name): ?string
    {
        try {
            $response = Http::withHeaders(['apikey' => $this->apiKey])
                ->post("{$this->baseUrl}/instance/create", [
                    'instanceName' => $name,
                    'integration' => 'WHATSAPP-BAILEYS',
                    'qrcode' => true,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['qrcode']['base64'] ?? $data['base64'] ?? null;
            }

            Log::error('EvolutionAPI createInstance error', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Throwable $e) {
            Log::error('EvolutionAPI createInstance exception: ' . $e->getMessage());
            return null;
        }
    }

    public function getQR(string $name): ?string
    {
        try {
            $response = Http::withHeaders(['apikey' => $this->apiKey])
                ->get("{$this->baseUrl}/instance/connect/{$name}");

            if ($response->successful()) {
                $data = $response->json();
                return $data['base64'] ?? $data['qrcode']['base64'] ?? null;
            }

            Log::error('EvolutionAPI getQR error', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Throwable $e) {
            Log::error('EvolutionAPI getQR exception: ' . $e->getMessage());
            return null;
        }
    }

    public function getConnectionState(string $name): ?string
    {
        try {
            $response = Http::withHeaders(['apikey' => $this->apiKey])
                ->get("{$this->baseUrl}/instance/connectionState/{$name}");

            if ($response->successful()) {
                $data = $response->json();
                return $data['instance']['state'] ?? $data['state'] ?? null;
            }

            Log::error('EvolutionAPI getConnectionState error', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Throwable $e) {
            Log::error('EvolutionAPI getConnectionState exception: ' . $e->getMessage());
            return null;
        }
    }

    public function deleteInstance(string $name): bool
    {
        try {
            $response = Http::withHeaders(['apikey' => $this->apiKey])
                ->delete("{$this->baseUrl}/instance/delete/{$name}");

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error('EvolutionAPI deleteInstance exception: ' . $e->getMessage());
            return false;
        }
    }

    public function sendText(string $phone, string $message): bool
    {
        if (!$this->isConfigured()) {
            Log::warning('EvolutionAPI not configured, skipping WhatsApp message.');
            return false;
        }

        $phone = preg_replace('/[^0-9]/', '', $phone);

        try {
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
            ])->post("{$this->baseUrl}/message/sendText/{$this->instance}", [
                'number' => $phone,
                'text' => $message,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('EvolutionAPI error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('EvolutionAPI exception: ' . $e->getMessage());
            return false;
        }
    }
}
