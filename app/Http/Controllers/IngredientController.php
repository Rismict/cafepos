<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Services\IngredientService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class IngredientController extends Controller
{
    protected $ingredientService;

    public function __construct(IngredientService $ingredientService)
    {
        $this->ingredientService = $ingredientService;
    }

    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        
        return Inertia::render('Ingredients/Index', [
            'ingredients' => $this->ingredientService->getIngredients($search),
            'filters' => ['search' => $search]
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ingredients,name',
            'stock' => 'required|numeric|min:0',
            'unit' => 'required|string|max:20',
            'cost_per_unit' => 'required|numeric|min:0',
        ]);

        $this->ingredientService->storeIngredient($validated);
        return redirect()->back()->with('message', 'New ingredient added successfully!');
    }

    /**
     * Update / Rename ingredient details.
     */
    public function update(Request $request, Ingredient $ingredient): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ingredients,name,' . $ingredient->id,
            'unit' => 'required|string|max:20',
            'cost_per_unit' => 'required|numeric|min:0',
        ]);

        $this->ingredientService->updateIngredient($ingredient, $validated);
        return redirect()->back()->with('message', 'Ingredient updated successfully!');
    }

    public function restock(Request $request, Ingredient $ingredient): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
        ]);

        $this->ingredientService->restockIngredient($ingredient, $validated['quantity']);
        return redirect()->back()->with('message', "Restocked {$ingredient->name} successfully!");
    }

    /**
     * Remove ingredient from inventory cleanly.
     */
    public function destroy(Ingredient $ingredient): RedirectResponse
    {
        try {
            $this->ingredientService->deleteIngredient($ingredient);
            return redirect()->back()->with('message', 'Ingredient deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

     /**
     * Log spillage, expiration, or wastage.
     */
    public function waste(Request $request, Ingredient $ingredient): RedirectResponse{
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:255',
        ]);

        try {
            $this->ingredientService->logWastage($ingredient, $validated['quantity'], $validated['reason']);
            return redirect()->back()->with('message', "Wastage logged for {$ingredient->name}.");
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}