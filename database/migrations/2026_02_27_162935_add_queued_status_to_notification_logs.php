<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE notification_logs MODIFY COLUMN status ENUM('sent', 'failed', 'queued') NOT NULL DEFAULT 'sent'");
    }

    public function down(): void
    {
        DB::statement("UPDATE notification_logs SET status = 'failed' WHERE status = 'queued'");
        DB::statement("ALTER TABLE notification_logs MODIFY COLUMN status ENUM('sent', 'failed') NOT NULL DEFAULT 'sent'");
    }
};
