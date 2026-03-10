<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationLogController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RaffleController;
use App\Http\Controllers\PrizeController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\DrawController;
use App\Http\Controllers\MySalesController;
use App\Http\Controllers\PublicRaffleController;
use App\Http\Controllers\SellController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\OrganizerController;
use App\Http\Controllers\SponsorController;
use App\Http\Controllers\TicketLockController;
use App\Http\Controllers\WhatsappSettingController;
use App\Http\Controllers\GmailSettingController;
use App\Http\Controllers\PaellaSellController;
use App\Http\Controllers\PaellaSalesController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::resource('raffles', RaffleController::class)->except(['show']);
    Route::resource('prizes', PrizeController::class)->except(['show']);
    Route::resource('sellers', SellerController::class)->except(['show']);
    Route::resource('tickets', TicketController::class)->only(['index', 'create', 'store', 'destroy']);
    Route::get('draw', [DrawController::class, 'index'])->name('draw.index');
    Route::post('draw', [DrawController::class, 'draw'])->name('draw.execute');
    Route::post('draw/resend', [DrawController::class, 'resend'])->name('draw.resend');
    Route::resource('organizers', OrganizerController::class)->except(['show']);
    Route::resource('sponsors', SponsorController::class)->except(['show']);

    Route::get('settings/whatsapp', [WhatsappSettingController::class, 'show'])->name('settings.whatsapp');
    Route::post('settings/whatsapp/activate', [WhatsappSettingController::class, 'activate'])->name('settings.whatsapp.activate');
    Route::get('settings/whatsapp/status', [WhatsappSettingController::class, 'status'])->name('settings.whatsapp.status');
    Route::post('settings/whatsapp/deactivate', [WhatsappSettingController::class, 'deactivate'])->name('settings.whatsapp.deactivate');
    Route::post('settings/whatsapp/test', [WhatsappSettingController::class, 'test'])->name('settings.whatsapp.test');

    Route::get('settings/gmail', [GmailSettingController::class, 'show'])->name('settings.gmail');
    Route::get('settings/gmail/redirect', [GmailSettingController::class, 'redirect'])->name('settings.gmail.redirect');
    Route::get('settings/gmail/callback', [GmailSettingController::class, 'callback'])->name('settings.gmail.callback');
    Route::post('settings/gmail/disconnect', [GmailSettingController::class, 'disconnect'])->name('settings.gmail.disconnect');
    Route::post('settings/gmail/test', [GmailSettingController::class, 'test'])->name('settings.gmail.test');
});

Route::middleware(['auth', 'role:admin,seller'])->group(function () {
    Route::post('ticket-locks/sync', [TicketLockController::class, 'sync'])->name('ticket-locks.sync');
    Route::post('ticket-locks/release', [TicketLockController::class, 'release'])->name('ticket-locks.release');

    Route::get('paella/ventas', [PaellaSalesController::class, 'index'])->name('paella.sales');


    Route::get('notification-logs', [NotificationLogController::class, 'index'])->name('notification-logs.index');
    Route::put('notification-logs/{notificationLog}', [NotificationLogController::class, 'update'])->name('notification-logs.update');
    Route::post('notification-logs/{notificationLog}/resend', [NotificationLogController::class, 'resend'])->name('notification-logs.resend');
    Route::get('notification-logs/{notificationLog}/history', [NotificationLogController::class, 'history'])->name('notification-logs.history');
});

Route::middleware(['auth', 'role:seller'])->group(function () {
    Route::get('sell', [SellController::class, 'index'])->name('sell.index');
    Route::post('sell', [SellController::class, 'store'])->name('sell.store');
    Route::get('my-sales', [MySalesController::class, 'index'])->name('my-sales.index');
    Route::get('paella/vender', [PaellaSellController::class, 'index'])->name('paella.sell');
    Route::post('paella/vender', [PaellaSellController::class, 'store'])->name('paella.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/rifa', [PublicRaffleController::class, 'active'])->name('rifa');
Route::get('/rifa/{slug}', [PublicRaffleController::class, 'show'])->name('rifa.show');

require __DIR__.'/auth.php';
