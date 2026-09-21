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
            $table->enum('temperature_type', ['both', 'hot_only', 'ice_only', 'none'])->default('both')->after('is_available');
        });

        Schema::table('tb_order_items', function (Blueprint $table) {
            $table->string('variant_type', 50)->nullable()->after('product_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tb_products', function (Blueprint $table) {
            $table->dropColumn('temperature_type');
        });

        Schema::table('tb_order_items', function (Blueprint $table) {
            $table->dropColumn('variant_type');
        });
    }
};
