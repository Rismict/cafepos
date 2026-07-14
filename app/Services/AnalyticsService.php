<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ingredient;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Get summary metrics filtered by a specific time period.
     */
    public function getDashboardStats(string $period = 'month'): array
    {
        // Determine the start date based on chosen period
        $startDate = match ($period) {
            'today' => Carbon::today(),
            'week' => Carbon::now()->startOfWeek(),
            'year' => Carbon::now()->startOfYear(),
            default => Carbon::now()->startOfMonth(), // Default to current month
        };

        // 1. Calculate Revenue & Orders inside the time range
        $salesStats = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $startDate)
            ->selectRaw('COALESCE(SUM(total_amount), 0) as total_revenue, COUNT(id) as total_orders')
            ->first();

        // 2. Find Top Selling Products inside the time range
        $topProducts = OrderItem::select('products.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.payment_status', 'paid')
            ->where('orders.created_at', '>=', $startDate)
            ->groupBy('products.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // 3. Low Stock Alerts (Independent of time range)
        $lowStockIngredients = Ingredient::where('stock', '<', 1000)
            ->orderBy('stock', 'asc')
            ->get();

        return [
            'total_revenue' => (float) $salesStats->total_revenue,
            'total_orders'  => (int) $salesStats->total_orders,
            'top_products'  => $topProducts,
            'low_stock'     => $lowStockIngredients,
            'current_period' => $period
        ];
    }
}