<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recipe extends Model
{
    protected $fillable = [
        'product_id',
        'ingredient_id',
        'quantity_needed',
    ];

    public function ingredient() : BelongsTo{
        return $this->belongsTo(Ingredient::class);
    }
}
