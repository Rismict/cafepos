<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'invoice_number',
        'total_amount',
        'payment_method',
        'payment_status',
        'user_id'
    ];

    public function items() : HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
