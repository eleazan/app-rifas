<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('raffles', function (Blueprint $table) {
            $table->string('slug')->unique()->nullable()->after('name');
        });

        // Generate slugs for existing raffles
        $used = [];
        foreach (\App\Models\Raffle::all() as $raffle) {
            $slug = Str::slug($raffle->name);
            $original = $slug;
            $i = 2;
            while (in_array($slug, $used)) {
                $slug = "{$original}-{$i}";
                $i++;
            }
            $used[] = $slug;
            $raffle->update(['slug' => $slug]);
        }
    }

    public function down(): void
    {
        Schema::table('raffles', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
