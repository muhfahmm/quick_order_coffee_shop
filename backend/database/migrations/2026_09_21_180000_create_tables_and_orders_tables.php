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
        Schema::create('tb_tables', function (Blueprint $table) {
            $table->id();
            $table->string('table_number');
            $table->string('qr_code_token')->unique();
            $table->string('status')->default('available'); // available, occupied
            $table->timestamps();
        });

        Schema::create('tb_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->foreignId('table_id')->nullable()->constrained('tb_tables')->nullOnDelete();
            $table->string('table_number')->nullable();
            $table->string('customer_name')->default('Guest');
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('status')->default('pending'); // pending, processing, completed, cancelled
            $table->timestamps();
        });

        Schema::create('tb_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('tb_orders')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('tb_products')->nullOnDelete();
            $table->string('product_name');
            $table->integer('quantity')->default(1);
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_order_items');
        Schema::dropIfExists('tb_orders');
        Schema::dropIfExists('tb_tables');
    }
};
