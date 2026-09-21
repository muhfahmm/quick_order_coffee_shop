<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

if (!Schema::hasColumn('tb_products', 'hot_price')) {
    Schema::table('tb_products', function (Blueprint $table) {
        $table->decimal('hot_price', 12, 2)->nullable();
        $table->decimal('ice_price', 12, 2)->nullable();
    });
    echo "Columns hot_price and ice_price added successfully!\n";
} else {
    echo "Columns hot_price and ice_price already exist!\n";
}
