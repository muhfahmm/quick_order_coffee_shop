<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

if (!Schema::hasColumn('tb_products', 'hot_available')) {
    Schema::table('tb_products', function (Blueprint $table) {
        $table->boolean('hot_available')->default(true)->after('hot_price');
        $table->boolean('ice_available')->default(true)->after('ice_price');
    });
    echo "Columns hot_available and ice_available added successfully!\n";
} else {
    echo "Columns hot_available and ice_available already exist!\n";
}
