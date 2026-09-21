<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    use HasFactory;

    protected $table = 'tb_tables';

    protected $fillable = [
        'table_number',
        'qr_code_token',
        'status',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class, 'table_id');
    }
}
