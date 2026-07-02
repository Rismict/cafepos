<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Ingredient;
use App\Models\Recipe;
use Illuminate\Database\Seeder;

class CafeDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Raw Ingredients (Inventory Stock)
        $beans = Ingredient::create([
            'name' => 'Espresso Coffee Beans',
            'stock' => 5000.00, // 5,000 grams (5 kg)
            'unit' => 'grams',
            'cost_per_unit' => 300.00, // Rp 300 per gram
        ]);

        $milk = Ingredient::create([
            'name' => 'Fresh Milk',
            'stock' => 10000.00, // 10,000 ml (10 Liters)
            'unit' => 'ml',
            'cost_per_unit' => 25.00, // Rp 25 per ml
        ]);

        // 2. Seed Categories
        $espressoBar = Category::create([
            'name' => 'Espresso Bar',
            'slug' => 'espresso-bar',
        ]);

        $pastries = Category::create([
            'name' => 'Pastries',
            'slug' => 'pastries',
        ]);

        // 3. Seed Menu Products
        $latte = Product::create([
            'category_id' => $espressoBar->id,
            'name' => 'Iced Latte',
            'sku' => 'COF-LAT-01',
            'cost_price' => 10400.00, // (18g * 300) + (200ml * 25) = Rp 10,400 COGS
            'selling_price' => 28000.00,
            'is_active' => true,
        ]);

        $croissant = Product::create([
            'category_id' => $pastries->id,
            'name' => 'Butter Croissant',
            'sku' => 'PAS-CRO-01',
            'cost_price' => 8000.00, 
            'selling_price' => 18000.00,
            'is_active' => true,
        ]);

        // 4. Link Products to Ingredients via Recipes
        // An Iced Latte requires 18g of Espresso Beans
        Recipe::create([
            'product_id' => $latte->id,
            'ingredient_id' => $beans->id,
            'quantity_needed' => 18.00,
        ]);

        // An Iced Latte also requires 200ml of Fresh Milk
        Recipe::create([
            'product_id' => $latte->id,
            'ingredient_id' => $milk->id,
            'quantity_needed' => 200.00,
        ]);
    }
}