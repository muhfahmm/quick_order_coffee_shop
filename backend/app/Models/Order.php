<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'tb_orders';

    protected $fillable = [
        'order_code',
        'table_id',
        'table_number',
        'customer_name',
        'total_amount',
        'status',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class, 'table_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }
}
