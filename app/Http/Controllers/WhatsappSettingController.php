<?php

namespace App\Http\Controllers;

use App\Http\Requests\TestWhatsappRequest;
use App\Models\Setting;
use App\Services\EvolutionApiService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappSettingController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Admin/Settings/Whatsapp', [
            'instanceName' => Setting::get('whatsapp_instance'),
            'connected' => Setting::get('whatsapp_connected') === '1',
        ]);
    }

    public function activate(): JsonResponse
    {
        $name = 'rifa-whatsapp';
        $evolution = new EvolutionApiService();

        $qr = $evolution->createInstance($name);

        if ($qr === null) {
            // Instance may already exist — try fetching QR directly
            $qr = $evolution->getQR($name);
        }

        Setting::set('whatsapp_instance', $name);
        Setting::remove('whatsapp_connected');

        return response()->json(['qr' => $qr]);
    }

    public function status(): JsonResponse
    {
        $name = Setting::get('whatsapp_instance');

        if (!$name) {
            return response()->json(['state' => 'idle', 'connected' => false]);
        }

        $evolution = new EvolutionApiService();
        $state = $evolution->getConnectionState($name);

        if ($state === null) {
            return response()->json(['state' => 'error', 'connected' => false]);
        }

        $connected = $state === 'open';

        if ($connected) {
            Setting::set('whatsapp_connected', '1');
        }

        $response = ['state' => $state, 'connected' => $connected];

        if (!$connected) {
            $qr = $evolution->getQR($name);
            if ($qr) {
                $response['qr'] = $qr;
            }
        }

        return response()->json($response);
    }

    public function deactivate(): JsonResponse
    {
        $name = Setting::get('whatsapp_instance');

        if ($name) {
            $evolution = new EvolutionApiService();
            $evolution->deleteInstance($name);
        }

        Setting::remove('whatsapp_instance');
        Setting::remove('whatsapp_connected');

        return response()->json(['success' => true]);
    }

    public function test(TestWhatsappRequest $request): JsonResponse
    {
        $evolution = new EvolutionApiService();

        if (!$evolution->isConfigured()) {
            return response()->json(['success' => false, 'message' => 'WhatsApp no está configurado.'], 422);
        }

        $sent = $evolution->sendText($request->phone, $request->message);

        if (!$sent) {
            return response()->json(['success' => false, 'message' => 'No se pudo enviar el mensaje.'], 422);
        }

        return response()->json(['success' => true]);
    }
}
