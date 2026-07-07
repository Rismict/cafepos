<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Models\Product;
use App\Models\Category;
use App\Services\OrderService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class PosController extends Controller
{
    protected $orderService;
    // Inject the Service Layer via the constructor
    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index() : Response
    {
        $categories = Category::with(['products' =>function ($query){
            $query->where('is_active', true);
        }])->get();

        return Inertia::render('Pos/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Handle incoming checkout requests from the POS frontend interface.
     */
    public function store(Request $request) : RedirectResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.selling_price' => 'required|numeric',
            'total_amount' => 'required|numeric',
            'payment_method' => 'required|string',
        ]);

        try {
            // Run transaction logic via Service Layer
            $order = $this->orderService->createOrder($validated, Auth::id());

            return redirect()->back()->with('message', 'Order Processed Successfully...');
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
