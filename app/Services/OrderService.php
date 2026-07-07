<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class OrderService
{
    /**
     * Handle the entire checkout transaction logic.
     */
    public function createOrder(array $data, int $userId): Order
    {
        // Use a Database Transaction. If ANY step fails (like running out of stock), 
        // the entire transaction rolls back automatically so data never gets corrupted.
        return DB::transaction(function () use ($data, $userId) {
            
            // 1. Generate unique invoice number (e.g., INV-20260703-ABCDE)
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(5));

            // 2. Create the main Order record
            $order = Order::create([
                'invoice_number' => $invoiceNumber,
                'total_amount' => $data['total_amount'],
                'payment_method' => $data['payment_method'],
                'payment_status' => 'paid', // Assuming immediate payment for POS
                'user_id' => $userId,
            ]);

            // 3. Loop through items in the cart
            foreach ($data['items'] as $item) {
                // Save Order Item snapshot
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['selling_price'],
                ]);

                // 4. Track and deduct raw ingredients based on recipes
                $product = Product::with('recipes.ingredient')->find($item['id']);
                
                if ($product && $product->recipes) {
                    foreach ($product->recipes as $recipe) {
                        $ingredient = $recipe->ingredient;
                        
                        // Calculate total amount consumed (recipe quantity * number of items ordered)
                        $quantityConsumed = $recipe->quantity_needed * $item['quantity'];

                        // Optional check: You could throw an exception here if stock goes negative
                        if ($ingredient->stock < $quantityConsumed) {
                            throw new Exception("Insufficient stock for ingredient: {$ingredient->name}");
                        }

                        // Deduct the inventory stock
                        $ingredient->decrement('stock', $quantityConsumed);
                    }
                }
            }

            return $order;
        });
    }
}