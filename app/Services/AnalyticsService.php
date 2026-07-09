<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ingredient;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Get summary metrics and low stock alerts.
     */
    public function getDashboardStats(): array
    {
        // 1. Calculate Total Revenue & Total Orders
        $salesStats = Order::where('payment_status', 'paid')
            ->selectRaw('COALESCE(SUM(total_amount), 0) as total_revenue, COUNT(id) as total_orders')
            ->first();

        // 2. Find Top Selling Products (grouped by product name)
        $topProducts = OrderItem::select('products.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->groupBy('products.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // 3. Find Ingredients Running Low (e.g., stock is less than 1000g/ml or 10 units)
        // Adjust threshold based on your shop's operational needs
        $lowStockIngredients = Ingredient::where('stock', '<', 1000)
            ->orderBy('stock', 'asc')
            ->get();

        return [
            'total_revenue' => (float) $salesStats->total_revenue,
            'total_orders'  => (int) $salesStats->total_orders,
            'top_products'  => $topProducts,
            'low_stock'     => $lowStockIngredients,
        ];
    }
}