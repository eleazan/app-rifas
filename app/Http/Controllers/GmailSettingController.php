<?php

namespace App\Http\Controllers;

use App\Services\GmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GmailSettingController extends Controller
{
    public function __construct(private GmailService $gmail) {}

    public function show(): Response
    {
        return Inertia::render('Admin/Settings/Gmail', [
            'connected'  => $this->gmail->isConnected(),
            'gmailEmail' => $this->gmail->getConnectedEmail(),
        ]);
    }

    public function redirect(): RedirectResponse
    {
        $state = Str::random(40);
        session(['gmail_oauth_state' => $state]);

        return redirect($this->gmail->getAuthUrl());
    }

    public function callback(Request $request): RedirectResponse
    {
        if ($request->has('error')) {
            return redirect()->route('settings.gmail')
                ->with('error', 'Acceso denegado. No se conectó la cuenta Gmail.');
        }

        if ($request->state !== session('gmail_oauth_state')) {
            return redirect()->route('settings.gmail')
                ->with('error', 'Error de seguridad: state inválido. Inténtalo de nuevo.');
        }

        session()->forget('gmail_oauth_state');

        try {
            $this->gmail->exchangeCode($request->code);
        } catch (\Throwable $e) {
            return redirect()->route('settings.gmail')
                ->with('error', 'Error al conectar la cuenta Gmail: ' . $e->getMessage());
        }

        return redirect()->route('settings.gmail')
            ->with('success', 'Cuenta Gmail conectada correctamente.');
    }

    public function disconnect(): JsonResponse
    {
        $this->gmail->disconnect();

        return response()->json(['success' => true]);
    }

    public function test(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        if (!$this->gmail->isConnected()) {
            return response()->json(['message' => 'Gmail no está conectado.'], 422);
        }

        try {
            $this->gmail->sendEmail(
                $request->email,
                'Prueba de correo — RifaApp',
                '<p>Este es un correo de prueba enviado desde <strong>RifaApp</strong> via Gmail.</p>'
            );
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true]);
    }
}
