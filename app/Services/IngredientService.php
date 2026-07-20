<?php

namespace App\Services;

use App\Models\Ingredient;
use Illuminate\Database\Eloquent\Collection;

class IngredientService
{
    /**
     * Get ingredients with an optional search filter.
     */
    public function getIngredients(string $search = ''): Collection
    {
        $query = Ingredient::orderBy('name', 'asc');

        if (!empty($search)) {
            $query->where('name', 'ilike', '%' . $search . '%'); // 'ilike' is PostgreSQL's case-insensitive search
        }

        return $query->get();
    }

    /**
     * Store a brand new raw ingredient item.
     */
    public function storeIngredient(array $data): Ingredient
    {
        return Ingredient::create($data);
    }

    /**
     * Update/Rename an ingredient's core details.
     */
    public function updateIngredient(Ingredient $ingredient, array $data): Ingredient
    {
        $ingredient->update($data);
        return $ingredient;
    }

    /**
     * Add supplier restock quantity safely.
     */
    public function restockIngredient(Ingredient $ingredient, float $quantity): Ingredient
    {
        $ingredient->increment('stock', $quantity);
        return $ingredient;
    }

    /**
     * Safely delete an ingredient if it's not tied to any active recipes.
     */
    public function deleteIngredient(Ingredient $ingredient): bool
    {
        // Safety guard: Check if this ingredient is used in any product recipe
        // We will load a dynamic check against the recipes table
        $isUsedInRecipe = \App\Models\Recipe::where('ingredient_id', $ingredient->id)->exists();
        
        if ($isUsedInRecipe) {
            throw new \Exception("Cannot delete '{$ingredient->name}' because it is currently linked to a product recipe.");
        }

        return $ingredient->delete();
    }
}