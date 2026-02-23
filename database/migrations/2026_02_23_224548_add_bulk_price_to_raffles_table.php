<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('raffles', function (Blueprint $table) {
            $table->decimal('bulk_price', 10, 2)->nullable()->after('ticket_price');
            $table->unsignedTinyInteger('bulk_from')->nullable()->after('bulk_price');
        });
    }

    public function down(): void
    {
        Schema::table('raffles', function (Blueprint $table) {
            $table->dropColumn(['bulk_price', 'bulk_from']);
        });
    }
};
