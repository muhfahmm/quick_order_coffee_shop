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
        'ice_name',
        'ice_image',
        'is_available',
        'temperature_type',
        'is_best_seller',
        'is_chef_pick',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'is_best_seller' => 'boolean',
        'is_chef_pick' => 'boolean',
        'price' => 'float',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
