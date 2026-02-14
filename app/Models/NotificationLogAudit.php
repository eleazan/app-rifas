<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationLogAudit extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'notification_log_id',
        'user_id',
        'action',
        'field',
        'old_value',
        'new_value',
        'resend_status',
        'resend_error',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function notificationLog(): BelongsTo
    {
        return $this->belongsTo(NotificationLog::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
