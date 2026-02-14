<?php

namespace App\Services;

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
        $this->instance = config('services.evolution.instance', '');
    }

    public function isConfigured(): bool
    {
        return !empty($this->baseUrl) && !empty($this->apiKey) && !empty($this->instance);
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
