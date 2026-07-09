<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Display the analytics dashboard.
     */
    public function index(): Response
    {
        $stats = $this->analyticsService->getDashboardStats();

        return Inertia::render('Dashboard', [
            'stats' => $stats
        ]);
    }
}