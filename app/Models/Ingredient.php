<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    protected $fillable = [
        'name',
        'stock',
        'unit',
        'cost_per_unit',
    ];

    public function movements()
    {
        return $this->hasMany(StockMovement::class)->latest();
    }

}
