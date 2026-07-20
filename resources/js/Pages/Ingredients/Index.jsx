import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';

export default function Index({ ingredients, filters }) {
    const { props } = usePage();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'restock' or 'edit'

    // Form mappings
    const createForm = useForm({ name: '', stock: '', unit: 'grams', cost_per_unit: '' });
    const restockForm = useForm({ quantity: '' });
    const editForm = useForm({ name: '', unit: '', cost_per_unit: '' });

    // Handle real-time filtering search query inputs
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('ingredients.index'), { search: searchTerm }, { preserveState: true, replace: true });
        }, 300); // 300ms debounce typing buffer delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('ingredients.store'), {
            onSuccess: () => createForm.reset(),
            onError: (err) => alert(Object.values(err)[0]),
        });
    };

    const handleRestockSubmit = (e) => {
        e.preventDefault();
        restockForm.post(route('ingredients.restock', selectedIngredient.id), {
            onSuccess: () => {
                restockForm.reset();
                setModalMode(null);
            },
            onError: (err) => alert(Object.values(err)[0]),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(route('ingredients.update', selectedIngredient.id), {
            onSuccess: () => setModalMode(null),
            onError: (err) => alert(Object.values(err)[0]),
        });
    };

    const handleDelete = (ingredient) => {
        if (confirm(`Are you absolutely sure you want to remove ${ingredient.name}? This cannot be undone.`)) {
            router.delete(route('ingredients.destroy', ingredient.id), {
                onError: (err) => alert(err.error || 'Failed to delete item.')
            });
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">📦 Inventory Control Desk</h2>}>
            <Head title="Ingredients Dashboard" />

            <div className="py-12 mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                {props.flash?.message && (
                    <div className="p-4 bg-emerald-100 text-emerald-800 rounded-xl font-medium text-sm">{props.flash.message}</div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Panel Left: Creation Workspace Form */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
                        <h3 className="text-md font-bold text-gray-900 border-b pb-3 mb-4">✨ New Entry Registration</h3>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Material Label</label>
                                <input type="text" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} placeholder="e.g., Cocoa Base Powder" className="w-full border-gray-200 rounded-lg text-sm" required />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Starting Stock</label>
                                    <input type="number" step="0.01" value={createForm.data.stock} onChange={(e) => createForm.setData('stock', e.target.value)} placeholder="0" className="w-full border-gray-200 rounded-lg text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Unit</label>
                                    <select value={createForm.data.unit} onChange={(e) => createForm.setData('unit', e.target.value)} className="w-full border-gray-200 rounded-lg text-sm">
                                        <option value="grams">grams</option>
                                        <option value="ml">ml</option>
                                        <option value="pcs">pcs</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Unit Valuation Cost (Rp)</label>
                                <input type="number" step="0.01" value={createForm.data.cost_per_unit} onChange={(e) => createForm.setData('cost_per_unit', e.target.value)} placeholder="300" className="w-full border-gray-200 rounded-lg text-sm" required />
                            </div>
                            <button type="submit" disabled={createForm.processing} className="w-full bg-amber-800 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-amber-900 transition">Save Entry</button>
                        </form>
                    </div>

                    {/* Panel Right: Search Table Grid View */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h3 className="text-lg font-bold text-gray-900">Registered Warehouse Assets</h3>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="🔍 Quick Search item..."
                                className="border-gray-200 rounded-xl text-xs w-full sm:w-64 shadow-inner"
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                        <th className="p-4">Asset Label</th>
                                        <th className="p-4">Stock Ledger</th>
                                        <th className="p-4">Cost Node</th>
                                        <th className="p-4 text-right">Operational Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {ingredients.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center p-8 text-gray-400 text-xs">No matching stock items matched parameters.</td></tr>
                                    ) : (
                                        ingredients.map((ing) => (
                                            <tr key={ing.id} className="hover:bg-gray-50/40 transition">
                                                <td className="p-4 font-semibold text-gray-900">{ing.name}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 font-mono font-bold text-xs rounded ${ing.stock < 1000 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-800'}`}>
                                                        {Number(ing.stock).toLocaleString('id-ID')} {ing.unit}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-xs">Rp {Number(ing.cost_per_unit).toLocaleString('id-ID')}</td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button onClick={() => { setSelectedIngredient(ing); editForm.setData({ name: ing.name, unit: ing.unit, cost_per_unit: ing.cost_per_unit }); setModalMode('edit'); }} className="text-gray-500 hover:text-amber-800 text-xs font-bold transition">Edit</button>
                                                    <button onClick={() => { setSelectedIngredient(ing); setModalMode('restock'); }} className="text-emerald-600 hover:text-emerald-700 text-xs font-bold transition bg-emerald-50 px-2 py-1 rounded">⚡ Restock</button>
                                                    <button onClick={() => handleDelete(ing)} className="text-red-500 hover:text-red-700 text-xs font-medium transition">Remove</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* Dynamic Modal Interface */}
            {modalMode && selectedIngredient && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h4 className="text-md font-bold text-gray-900">{modalMode === 'restock' ? `⚡ Inventory Restock: ${selectedIngredient.name}` : `✏️ Modify Details: ${selectedIngredient.name}`}</h4>
                        </div>

                        {modalMode === 'restock' ? (
                            <form onSubmit={handleRestockSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Incoming Volume ({selectedIngredient.unit})</label>
                                    <input type="number" step="0.01" value={restockForm.data.quantity} onChange={(e) => restockForm.setData('quantity', e.target.value)} className="w-full border-gray-200 rounded-lg text-sm" required autoFocus />
                                </div>
                                <div className="flex justify-end gap-2 text-xs pt-2">
                                    <button type="button" onClick={() => setModalMode(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                    <button type="submit" disabled={restockForm.processing} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg">Apply Restock</button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Name</label>
                                    <input type="text" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} className="w-full border-gray-200 rounded-lg text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Operational Measurement Unit</label>
                                    <select value={editForm.data.unit} onChange={(e) => editForm.setData('unit', e.target.value)} className="w-full border-gray-200 rounded-lg text-sm">
                                        <option value="grams">grams</option>
                                        <option value="ml">ml</option>
                                        <option value="pcs">pcs</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Cost Per Unit (Rp)</label>
                                    <input type="number" step="0.01" value={editForm.data.cost_per_unit} onChange={(e) => editForm.setData('cost_per_unit', e.target.value)} className="w-full border-gray-200 rounded-lg text-sm" required />
                                </div>
                                <div className="flex justify-end gap-2 text-xs pt-2">
                                    <button type="button" onClick={() => setModalMode(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                                    <button type="submit" disabled={editForm.processing} className="px-4 py-2 bg-amber-800 text-white font-bold rounded-lg">Save Adjustments</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}