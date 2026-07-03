<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index() : Response
    {
        $categories = Category::with(['products' =>function ($query){
            $query->where('is_active', true);
        }])->get();

        return Inertia::render('Pos/Index', [
            'categories' => $categories
        ]);
    }
}
