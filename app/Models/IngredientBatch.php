<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IngredientBatch extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'ingredient_id', 'batch_number', 'cost_per_unit', 
        'initial_quantity', 'remaining_quantity', 'expires_at'
    ];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
}