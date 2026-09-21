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
            $table->string('hot_name', 150)->nullable()->after('temperature_type');
            $table->string('hot_image', 255)->nullable()->after('hot_name');
            $table->string('ice_name', 150)->nullable()->after('hot_image');
            $table->string('ice_image', 255)->nullable()->after('ice_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_products', function (Blueprint $table) {
            $table->dropColumn(['hot_name', 'hot_image', 'ice_name', 'ice_image']);
        });
    }
};
