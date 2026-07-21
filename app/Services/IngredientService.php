<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Collection;

class IngredientService
{
    /**
     * Get ingredients with an optional search filter.
     */
    public function getIngredients(string $search = ''): Collection
    {
        // Eager load the last 15 movements for each ingredient, including the user who did it
        $query = Ingredient::with(['movements' => function($query){
            $query->latest()->take(15)->with('user');
        }])->orderBy('name', 'asc');

        if (!empty($search)) {
            $query->where('name', 'ilike', '%' . $search . '%');
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
     * NEW: Handle Spillage, Expiration, or Wastage
     */
    public function logWastage(Ingredient $ingredient, float $quantity, string $reason): Ingredient
    {
        if ($ingredient->stock < $quantity) {
            throw new \Exception("Cannot waste more stock than currently available.");
        }

        $ingredient->decrement('stock', $quantity);
        $this->logMovement($ingredient, 'waste', -$quantity, $reason);
        
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

    /**
     * Internal helper to record the audit trail
     */
    private function logMovement(Ingredient $ingredient, string $type, float $quantity, string $notes): void
    {
        StockMovement::create([
            'ingredient_id' => $ingredient->id,
            'user_id' => Auth::id(), // Logs the exact person logged in!
            'type' => $type,
            'quantity_changed' => $quantity,
            'balance_after' => $ingredient->fresh()->stock,
            'notes' => $notes,
        ]);
    }
}