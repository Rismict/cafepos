<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function index(Request $request): Response
    {
        // Sanitize period inputs, default to 'month'
        $period = $request->query('period', 'month');
        if (!in_array($period, ['today', 'week', 'month', 'year'])) {
            $period = 'month';
        }

        $stats = $this->analyticsService->getDashboardStats($period);

        return Inertia::render('Dashboard', [
            'stats' => $stats
        ]);
    }
}