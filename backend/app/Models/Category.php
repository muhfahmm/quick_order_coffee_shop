<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'tb_categories';

    protected $fillable = [
        'name',
        'slug',
        'icon_or_image',
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}
