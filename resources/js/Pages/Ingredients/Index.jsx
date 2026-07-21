import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';

export default function Index({ ingredients, filters }) {
    const { props } = usePage();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'restock', 'edit', 'waste', 'history'

    // Form mappings
    const createForm = useForm({ name: '', stock: '', unit: 'grams', cost_per_unit: '' });
    const restockForm = useForm({ quantity: '', notes: '' });
    const editForm = useForm({ name: '', unit: '', cost_per_unit: '' });
    const wasteForm = useForm({ quantity: '', reason: '' });

    // Handle real-time filtering search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('ingredients.index'), { search: searchTerm }, { preserveState: true, replace: true });
        }, 300);
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
            onSuccess: () => { restockForm.reset(); setModalMode(null); },
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

    const handleWasteSubmit = (e) => {
        e.preventDefault();
        wasteForm.post(route('ingredients.waste', selectedIngredient.id), {
            onSuccess: () => { wasteForm.reset(); setModalMode(null); },
            onError: (err) => alert(err.error || Object.values(err)[0]),
        });
    };

    const handleDelete = (ingredient) => {
        if (confirm(`Are you sure you want to remove ${ingredient.name}?`)) {
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
                {props.errors?.error && (
                    <div className="p-4 bg-red-100 text-red-800 rounded-xl font-medium text-sm">{props.errors.error}</div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Left Panel: Creation Form */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit xl:col-span-1">
                        <h3 className="text-md font-bold text-gray-900 border-b pb-3 mb-4">✨ New Material</h3>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Material Label</label>
                                <input type="text" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} className="w-full border-gray-200 rounded-lg text-sm" required />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Initial Stock</label>
                                    <input type="number" step="0.01" value={createForm.data.stock} onChange={(e) => createForm.setData('stock', e.target.value)} className="w-full border-gray-200 rounded-lg text-sm" required />
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
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Cost Per Unit (Rp)</label>
                                <input type="number" step="0.01" value={createForm.data.cost_per_unit} onChange={(e) => createForm.setData('cost_per_unit', e.target.value)} className="w-full border-gray-200 rounded-lg text-sm" required />
                            </div>
                            <button type="submit" disabled={createForm.processing} className="w-full bg-amber-800 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-amber-900 transition">Save Entry</button>
                        </form>
                    </div>

                    {/* Right Panel: Data Grid */}
                    <div className="xl:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                            <h3 className="text-lg font-bold text-gray-900">Registered Assets</h3>
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="🔍 Quick Search..." className="border-gray-200 rounded-xl text-xs w-full sm:w-64" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-bold uppercase text-gray-400 border-b border-gray-100">
                                        <th className="p-4">Asset</th>
                                        <th className="p-4">Stock</th>
                                        <th className="p-4">Cost/Unit</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {ingredients.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center p-8 text-gray-400">No items found.</td></tr>
                                    ) : (
                                        ingredients.map((ing) => (
                                            <tr key={ing.id} className="hover:bg-gray-50/40">
                                                <td className="p-4 font-semibold text-gray-900">{ing.name}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 font-mono font-bold text-xs rounded ${ing.stock < 1000 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-800'}`}>
                                                        {Number(ing.stock).toLocaleString('id-ID')} {ing.unit}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-xs">Rp {Number(ing.cost_per_unit).toLocaleString('id-ID')}</td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button onClick={() => { setSelectedIngredient(ing); setModalMode('history'); }} className="text-blue-600 hover:text-blue-800 text-xs font-bold">📖 History</button>
                                                    <button onClick={() => { setSelectedIngredient(ing); editForm.setData({ name: ing.name, unit: ing.unit, cost_per_unit: ing.cost_per_unit }); setModalMode('edit'); }} className="text-gray-500 hover:text-gray-800 text-xs font-bold">Edit</button>
                                                    <button onClick={() => { setSelectedIngredient(ing); setModalMode('waste'); }} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-2 py-1 rounded">⚠️ Log Waste</button>
                                                    <button onClick={() => { setSelectedIngredient(ing); setModalMode('restock'); }} className="text-emerald-600 hover:text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">⚡ Restock</button>
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

            {/* Modals Container */}
            {modalMode && selectedIngredient && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h4 className="text-lg font-bold text-gray-900">
                                {modalMode === 'restock' && `⚡ Restock: ${selectedIngredient.name}`}
                                {modalMode === 'edit' && `✏️ Edit: ${selectedIngredient.name}`}
                                {modalMode === 'waste' && `⚠️ Log Waste: ${selectedIngredient.name}`}
                                {modalMode === 'history' && `📖 Audit Trail: ${selectedIngredient.name}`}
                            </h4>
                            <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-800 font-bold text-xl">&times;</button>
                        </div>

                        {modalMode === 'restock' && (
                            <form onSubmit={handleRestockSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Quantity ({selectedIngredient.unit})</label>
                                    <input type="number" step="0.01" value={restockForm.data.quantity} onChange={(e) => restockForm.setData('quantity', e.target.value)} className="w-full border-gray-200 rounded-lg text-sm" required autoFocus />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={restockForm.processing} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg">Apply Restock</button>
                                </div>
                            </form>
                        )}

                        {modalMode === 'waste' && (
                            <form onSubmit={handleWasteSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Lost Quantity ({selectedIngredient.unit})</label>
                                    <input type="number" step="0.01" value={wasteForm.data.quantity} onChange={(e) => wasteForm.setData('quantity', e.target.value)} className="w-full border-gray-200 rounded-lg text-sm" required autoFocus />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Reason for Spillage / Loss</label>
                                    <input type="text" value={wasteForm.data.reason} onChange={(e) => wasteForm.setData('reason', e.target.value)} placeholder="e.g., Expired, spilled on floor, ruined in prep" className="w-full border-gray-200 rounded-lg text-sm" required />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={wasteForm.processing} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition">Log Wastage Deduction</button>
                                </div>
                            </form>
                        )}

                        {modalMode === 'edit' && (
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                {/* Edit form inputs remain the same... */}
                                <div><label className="block text-xs font-bold text-gray-500">Name</label><input type="text" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} className="w-full border-gray-200 rounded-lg" required /></div>
                                <div><label className="block text-xs font-bold text-gray-500">Cost/Unit</label><input type="number" step="0.01" value={editForm.data.cost_per_unit} onChange={(e) => editForm.setData('cost_per_unit', e.target.value)} className="w-full border-gray-200 rounded-lg" required /></div>
                                <div className="flex justify-end pt-2"><button type="submit" disabled={editForm.processing} className="px-4 py-2 bg-amber-800 text-white font-bold rounded-lg">Save</button></div>
                            </form>
                        )}

                        {modalMode === 'history' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                                            <th className="p-3 rounded-tl-lg">Date</th>
                                            <th className="p-3">User</th>
                                            <th className="p-3">Action</th>
                                            <th className="p-3 text-right">Qty Chg</th>
                                            <th className="p-3 text-right">Balance</th>
                                            <th className="p-3 rounded-tr-lg">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedIngredient.movements && selectedIngredient.movements.length > 0 ? (
                                            selectedIngredient.movements.map((mov) => (
                                                <tr key={mov.id}>
                                                    <td className="p-3 font-mono text-xs text-gray-500">{new Date(mov.created_at).toLocaleString()}</td>
                                                    <td className="p-3 font-medium">{mov.user?.name || 'System'}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 text-xs font-bold rounded ${mov.type === 'restock' ? 'bg-emerald-50 text-emerald-700' : mov.type === 'waste' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {mov.type.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className={`p-3 text-right font-mono font-bold ${mov.quantity_changed > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {mov.quantity_changed > 0 ? '+' : ''}{Number(mov.quantity_changed)}
                                                    </td>
                                                    <td className="p-3 text-right font-mono text-gray-700">{Number(mov.balance_after)}</td>
                                                    <td className="p-3 text-xs text-gray-500 truncate max-w-[150px]" title={mov.notes}>{mov.notes}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="6" className="p-4 text-center text-gray-400">No movement history yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}