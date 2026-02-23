<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Http;

class GmailService
{
    private const AUTH_URL    = 'https://accounts.google.com/o/oauth2/v2/auth';
    private const TOKEN_URL   = 'https://oauth2.googleapis.com/token';
    private const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
    private const SEND_URL    = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

    private const SCOPES = [
        'openid',
        'email',
        'https://www.googleapis.com/auth/gmail.send',
    ];

    public function getAuthUrl(): string
    {
        return self::AUTH_URL . '?' . http_build_query([
            'client_id'     => config('services.google.client_id'),
            'redirect_uri'  => route('settings.gmail.callback'),
            'response_type' => 'code',
            'scope'         => implode(' ', self::SCOPES),
            'access_type'   => 'offline',
            'prompt'        => 'consent',
            'state'         => session('gmail_oauth_state'),
        ]);
    }

    public function exchangeCode(string $code): void
    {
        $response = Http::asForm()->post(self::TOKEN_URL, [
            'code'          => $code,
            'client_id'     => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri'  => route('settings.gmail.callback'),
            'grant_type'    => 'authorization_code',
        ]);

        $data = $response->json();

        Setting::set('gmail_access_token', $data['access_token']);
        Setting::set('gmail_token_expires_at', (string) (time() + ($data['expires_in'] ?? 3600)));

        if (!empty($data['refresh_token'])) {
            Setting::set('gmail_refresh_token', $data['refresh_token']);
        }

        $userInfo = Http::withToken($data['access_token'])->get(self::USERINFO_URL)->json();
        Setting::set('gmail_email', $userInfo['email'] ?? '');
    }

    public function refreshIfNeeded(): bool
    {
        $expiresAt = (int) Setting::get('gmail_token_expires_at', '0');

        if ($expiresAt > time() + 60) {
            return true;
        }

        $refreshToken = Setting::get('gmail_refresh_token');
        if (!$refreshToken) {
            return false;
        }

        $response = Http::asForm()->post(self::TOKEN_URL, [
            'client_id'     => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'refresh_token' => $refreshToken,
            'grant_type'    => 'refresh_token',
        ]);

        if ($response->failed()) {
            return false;
        }

        $data = $response->json();

        Setting::set('gmail_access_token', $data['access_token']);
        Setting::set('gmail_token_expires_at', (string) (time() + ($data['expires_in'] ?? 3600)));

        return true;
    }

    public function disconnect(): void
    {
        Setting::remove('gmail_access_token');
        Setting::remove('gmail_refresh_token');
        Setting::remove('gmail_token_expires_at');
        Setting::remove('gmail_email');
    }

    public function isConnected(): bool
    {
        return !empty(Setting::get('gmail_email')) && !empty(Setting::get('gmail_refresh_token'));
    }

    public function getConnectedEmail(): ?string
    {
        $email = Setting::get('gmail_email');
        return $email ?: null;
    }

    public function sendEmail(string $to, string $subject, string $htmlBody): void
    {
        if (!$this->refreshIfNeeded()) {
            throw new \RuntimeException('No se pudo refrescar el token de Gmail. Reconecta la cuenta en Ajustes.');
        }

        $accessToken = Setting::get('gmail_access_token');
        $from = $this->getConnectedEmail();

        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

        $mime = implode("\r\n", [
            "From: {$from}",
            "To: {$to}",
            "Subject: {$encodedSubject}",
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            '',
            $htmlBody,
        ]);

        $encoded = rtrim(strtr(base64_encode($mime), '+/', '-_'), '=');

        $response = Http::withToken($accessToken)->post(self::SEND_URL, [
            'raw' => $encoded,
        ]);

        if (!$response->successful()) {
            $error = $response->json('error.message') ?? $response->body();
            throw new \RuntimeException("Gmail API error ({$response->status()}): {$error}");
        }
    }

    public function buildHtmlFromMailMessage(MailMessage $msg): string
    {
        $greeting = htmlspecialchars($msg->greeting ?? '');
        $intro = implode('', array_map(
            fn ($line) => '<p style="margin:0 0 12px">' . nl2br(htmlspecialchars((string) $line)) . '</p>',
            $msg->introLines ?? []
        ));
        $outro = implode('', array_map(
            fn ($line) => '<p style="margin:0 0 12px">' . nl2br(htmlspecialchars((string) $line)) . '</p>',
            $msg->outroLines ?? []
        ));

        $actionButton = '';
        if (!empty($msg->actionText) && !empty($msg->actionUrl)) {
            $url  = htmlspecialchars($msg->actionUrl);
            $text = htmlspecialchars($msg->actionText);
            $actionButton = <<<HTML
            <div style="text-align:center;margin:24px 0">
                <a href="{$url}"
                   style="background:#f59e0b;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
                    {$text}
                </a>
            </div>
            HTML;
        }

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:sans-serif">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:32px 16px">
                    <table width="600" cellpadding="0" cellspacing="0"
                           style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
                        <tr>
                            <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:24px 32px;text-align:center">
                                <span style="font-size:28px;font-weight:800;color:#fff">Rifa<span style="color:#fbbf24">App</span></span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:32px;color:#334155;font-size:15px;line-height:1.6">
                                {$greeting}
                                <div style="height:12px"></div>
                                {$intro}
                                {$actionButton}
                                {$outro}
                            </td>
                        </tr>
                        <tr>
                            <td style="background:#f8fafc;padding:16px 32px;text-align:center;font-size:12px;color:#94a3b8">
                                RifaApp &mdash; notificación automática
                            </td>
                        </tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        HTML;
    }
}
