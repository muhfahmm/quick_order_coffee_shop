<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app_name' => 'Quick Order Coffee Shop API',
        'version' => '1.0.0',
        'status' => 'Active',
        'message' => 'Backend API server is running smoothly.'
    ]);
});
