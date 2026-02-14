<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateNotificationLogRequest;
use App\Models\NotificationLog;
use App\Models\NotificationLogAudit;
use App\Models\Raffle;
use App\Models\Seller;
use App\Services\NotificationLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class NotificationLogController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isSeller = $user->role === 'seller';

        $query = NotificationLog::with(['raffle:id,name', 'seller:id,name'])
            ->orderByDesc('created_at');

        if ($isSeller) {
            $seller = Seller::where('user_id', $user->id)->first();
            if (!$seller) {
                return $this->renderPage($isSeller, [], [], null);
            }
            $query->where('seller_id', $seller->id);
        }

        if ($request->filled('raffle_id')) {
            $query->where('raffle_id', $request->input('raffle_id'));
        }
        if ($request->filled('channel')) {
            $query->where('channel', $request->input('channel'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $logs = $query->paginate(20)->withQueryString();
        $raffles = Raffle::orderByDesc('created_at')->get(['id', 'name']);

        $page = $isSeller ? 'Seller/NotificationLogs' : 'Admin/NotificationLogs/Index';

        return Inertia::render($page, [
            'logs' => $logs,
            'raffles' => $raffles,
            'filters' => $request->only(['raffle_id', 'channel', 'status']),
        ]);
    }

    public function update(UpdateNotificationLogRequest $request, NotificationLog $notificationLog)
    {
        $this->authorizeAccess($request, $notificationLog);

        $oldRecipient = $notificationLog->recipient;
        $newRecipient = $request->validated()['recipient'];

        if ($oldRecipient !== $newRecipient) {
            $notificationLog->update(['recipient' => $newRecipient]);

            NotificationLogAudit::create([
                'notification_log_id' => $notificationLog->id,
                'user_id' => $request->user()->id,
                'action' => 'edit',
                'field' => 'recipient',
                'old_value' => $oldRecipient,
                'new_value' => $newRecipient,
                'created_at' => now(),
            ]);
        }

        return back()->with('success', 'Destinatario actualizado.');
    }

    public function resend(Request $request, NotificationLog $notificationLog)
    {
        $this->authorizeAccess($request, $notificationLog);

        $service = app(NotificationLogService::class);
        $status = 'sent';
        $error = null;

        try {
            if ($notificationLog->channel === 'email') {
                $service->resendEmail($notificationLog);
            } else {
                $service->resendWhatsapp($notificationLog);
            }
        } catch (\Throwable $e) {
            $status = 'failed';
            $error = $e->getMessage();
            Log::warning("Resend notification failed: {$error}");
        }

        NotificationLogAudit::create([
            'notification_log_id' => $notificationLog->id,
            'user_id' => $request->user()->id,
            'action' => 'resend',
            'resend_status' => $status,
            'resend_error' => $error,
            'created_at' => now(),
        ]);

        if ($status === 'failed') {
            return back()->with('error', 'Error al reenviar: ' . $error);
        }

        return back()->with('success', 'Notificacion reenviada correctamente.');
    }

    public function history(Request $request, NotificationLog $notificationLog)
    {
        $this->authorizeAccess($request, $notificationLog);

        $audits = $notificationLog->audits()
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($audit) => [
                'id' => $audit->id,
                'action' => $audit->action,
                'field' => $audit->field,
                'old_value' => $audit->old_value,
                'new_value' => $audit->new_value,
                'resend_status' => $audit->resend_status,
                'resend_error' => $audit->resend_error,
                'user_name' => $audit->user?->name,
                'created_at' => $audit->created_at?->toISOString(),
            ]);

        return response()->json($audits);
    }

    protected function authorizeAccess(Request $request, NotificationLog $notificationLog): void
    {
        $user = $request->user();
        if ($user->role === 'seller') {
            $seller = Seller::where('user_id', $user->id)->first();
            if (!$seller || $notificationLog->seller_id !== $seller->id) {
                abort(403);
            }
        }
    }
}
