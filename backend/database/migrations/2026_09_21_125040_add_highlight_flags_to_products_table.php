<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tb_products', function (Blueprint $table) {
            $table->boolean('is_best_seller')->default(false)->after('temperature_type');
            $table->boolean('is_chef_pick')->default(false)->after('is_best_seller');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_products', function (Blueprint $table) {
            $table->dropColumn(['is_best_seller', 'is_chef_pick']);
        });
    }
};
