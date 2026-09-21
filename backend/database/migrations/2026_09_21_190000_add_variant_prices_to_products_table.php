<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tb_products', function (Blueprint $table) {
            $table->decimal('hot_price', 12, 2)->nullable()->after('hot_image');
            $table->decimal('ice_price', 12, 2)->nullable()->after('ice_image');
        });
    }

    public function down(): void
    {
        Schema::table('tb_products', function (Blueprint $table) {
            $table->dropColumn(['hot_price', 'ice_price']);
        });
    }
};
