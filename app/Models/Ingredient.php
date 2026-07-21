<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    use SoftDeletes;
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

    // New relationship for Batches
    public function batches(): HasMany
    {
        return $this->hasMany(IngredientBatch::class)->where('remaining_quantity', '>', 0)->orderBy('expires_at', 'asc');
    }

}
