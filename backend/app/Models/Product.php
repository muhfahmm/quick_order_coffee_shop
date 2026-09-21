<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'tb_products';

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',
        'image',
        'hot_name',
        'hot_image',
        'hot_price',
        'hot_available',
        'ice_name',
        'ice_image',
        'ice_price',
        'ice_available',
        'is_available',
        'temperature_type',
        'is_best_seller',
        'is_chef_pick',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'hot_available' => 'boolean',
        'ice_available' => 'boolean',
        'is_best_seller' => 'boolean',
        'is_chef_pick' => 'boolean',
        'price' => 'float',
        'hot_price' => 'float',
        'ice_price' => 'float',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
