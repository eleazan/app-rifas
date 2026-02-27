<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('raffles', function (Blueprint $table) {
            $table->unsignedSmallInteger('paella_total')->nullable()->after('bulk_from');
            $table->decimal('paella_price', 10, 2)->nullable()->after('paella_total');
            $table->date('paella_deadline')->nullable()->after('paella_price');
        });
    }

    public function down(): void
    {
        Schema::table('raffles', function (Blueprint $table) {
            $table->dropColumn(['paella_total', 'paella_price', 'paella_deadline']);
        });
    }
};
