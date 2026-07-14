import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React from 'react';

export default function Dashboard({ stats }) {
    const { total_revenue, total_orders, top_products, low_stock, current_period } = stats;

    // Trigger Inertia reload with query params
    const handlePeriodChange = (period) => {
        router.get(route('dashboard'), { period }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">📊 Business Analytics</h2>

                    {/* Time-base Filter Button Group */}
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
                        {['today', 'week', 'month', 'year'].map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePeriodChange(p)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${current_period === p
                                    ? 'bg-white text-amber-800 shadow-sm border border-gray-200/50'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="overflow-hidden bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Revenue ({current_period})</span>
                            <div className="mt-2 text-3xl font-black text-gray-900">
                                Rp {total_revenue.toLocaleString('id-ID')}
                            </div>
                        </div>
                        <div className="overflow-hidden bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Transactions ({current_period})</span>
                            <div className="mt-2 text-3xl font-black text-gray-900">
                                {total_orders} Orders
                            </div>
                        </div>
                    </div>

                    {/* Breakdown lists */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                        {/* Top Products */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">🔥 Top Selling Items</h3>
                            {top_products.length === 0 ? (
                                <p className="text-gray-400 text-sm my-auto text-center py-6">No sales recorded for this period.</p>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {top_products.map((product, index) => (
                                        <div key={index} className="flex justify-between items-center py-3">
                                            <span className="font-medium text-gray-700 text-sm">
                                                {index + 1}. {product.name}
                                            </span>
                                            <span className="bg-amber-50 text-amber-800 font-bold text-xs px-2.5 py-1 rounded-full">
                                                {product.total_sold} units
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Inventory Warning Alerts */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">⚠️ Inventory Alerts</h3>
                            {low_stock.length === 0 ? (
                                <div className="my-auto text-center py-6">
                                    <span className="text-emerald-600 bg-emerald-50 text-xs font-bold px-3 py-1.5 rounded-full">
                                        ✨ All ingredient stock thresholds healthy
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {low_stock.map((ingredient) => (
                                        <div key={ingredient.id} className="flex justify-between items-center bg-red-50 border border-red-100 p-3 rounded-lg">
                                            <div>
                                                <h4 className="font-semibold text-sm text-red-900">{ingredient.name}</h4>
                                                <p className="text-xs text-red-600 mt-0.5">Stock drops below safe buffer levels</p>
                                            </div>
                                            <span className="font-mono font-bold text-sm text-red-700 bg-white px-2 py-1 rounded shadow-sm border border-red-200">
                                                {Number(ingredient.stock).toLocaleString('id-ID')} {ingredient.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}