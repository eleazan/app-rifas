<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->decimal('price_paid', 10, 2)->nullable()->after('number');
        });

        // Backfill existing tickets with the raffle's ticket_price
        DB::statement('
            UPDATE tickets t
            JOIN raffles r ON r.id = t.raffle_id
            SET t.price_paid = r.ticket_price
            WHERE t.price_paid IS NULL
        ');
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('price_paid');
        });
    }
};
