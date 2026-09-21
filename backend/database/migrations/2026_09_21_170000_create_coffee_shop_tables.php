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
        Schema::create('tb_admin', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('password');
            $table->string('role')->default('admin');
            $table->timestamps();
        });

        Schema::create('tb_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->string('icon_or_image')->nullable();
            $table->timestamps();
        });

        Schema::create('tb_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('tb_categories')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->string('image')->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_products');
        Schema::dropIfExists('tb_categories');
        Schema::dropIfExists('tb_admin');
    }
};
