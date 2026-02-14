<?php

namespace App\Http\Controllers;

use App\Models\TicketLock;
use Illuminate\Http\Request;

class TicketLockController extends Controller
{
    const LOCK_MINUTES = 5;

    public function sync(Request $request)
    {
        $request->validate([
            'raffle_id' => 'required|integer|exists:raffles,id',
            'numbers' => 'required|array',
            'numbers.*' => 'integer|min:0',
        ]);

        $raffleId = $request->input('raffle_id');
        $numbers = $request->input('numbers');
        $userId = $request->user()->id;
        $expiresAt = now()->addMinutes(self::LOCK_MINUTES);

        TicketLock::clearExpired();

        // Release numbers this user no longer has selected
        TicketLock::where('raffle_id', $raffleId)
            ->where('user_id', $userId)
            ->whereNotIn('number', $numbers)
            ->delete();

        // Lock newly selected numbers
        $alreadyLocked = TicketLock::where('raffle_id', $raffleId)
            ->whereIn('number', $numbers)
            ->pluck('number', 'user_id');

        $failed = [];

        foreach ($numbers as $number) {
            $lockOwner = $alreadyLocked->search($number);

            if ($lockOwner !== false && $lockOwner !== $userId) {
                // Locked by someone else
                $failed[] = $number;
                continue;
            }

            TicketLock::updateOrCreate(
                ['raffle_id' => $raffleId, 'number' => $number],
                ['user_id' => $userId, 'expires_at' => $expiresAt],
            );
        }

        // Return current locks by others for this raffle
        $lockedByOthers = TicketLock::where('raffle_id', $raffleId)
            ->where('user_id', '!=', $userId)
            ->where('expires_at', '>', now())
            ->pluck('number')
            ->toArray();

        return response()->json([
            'locked_by_others' => $lockedByOthers,
            'failed' => $failed,
        ]);
    }

    public function release(Request $request)
    {
        $request->validate([
            'raffle_id' => 'required|integer|exists:raffles,id',
        ]);

        TicketLock::where('raffle_id', $request->input('raffle_id'))
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['ok' => true]);
    }
}
