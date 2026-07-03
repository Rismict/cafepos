import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ categories }) {
    const [cart, setCart] = useState([]);
    const [activeCategory, setActiveCategory] = useState(categories[0]?.id || null);

    // Add item to checkout cart
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    // Calculate total price
    const totalAmount = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">☕ Cafe POS System</h2>}
        >
            <Head title="POS Cashier" />

            <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Left & Middle: Product Grid Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Category Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {categories && categories.length > 0 ? (
                                categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id)}
                                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${activeCategory === category.id
                                                ? 'bg-amber-800 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {category.name}
                                    </button>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm">No categories available.</p>
                            )}
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {(() => {
                                // Find the currently selected category object safely
                                const currentCategory = categories.find(cat => cat.id === activeCategory);

                                // If the category or its products array doesn't exist, display nothing
                                if (!currentCategory || !currentCategory.products) return null;

                                // Map over the products safely
                                return currentCategory.products.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition text-left flex flex-col justify-between border border-gray-100 h-36"
                                    >
                                        <span className="font-semibold text-gray-800 text-lg block">{product.name}</span>
                                        <div className="mt-2 flex justify-between items-center w-full">
                                            <span className="text-xs text-gray-400 font-mono">{product.sku}</span>
                                            <span className="font-bold text-amber-700">
                                                Rp {Number(product.selling_price).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </button>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* Right Side: Cashier Cart / Checkout Bill */}
                    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col justify-between min-h-[500px] border border-gray-100">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Current Order</h3>
                            {cart.length === 0 ? (
                                <p className="text-gray-400 text-center py-12">Cart is empty</p>
                            ) : (
                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-sm text-gray-800">{item.name}</h4>
                                                <span className="text-xs text-gray-500">
                                                    {item.quantity} x Rp {Number(item.selling_price).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <span className="font-bold text-sm text-gray-900">
                                                Rp {(item.selling_price * item.quantity).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Total Summary & Checkout Button */}
                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600 font-medium">Total Bill:</span>
                                <span className="text-2xl font-black text-gray-900">
                                    Rp {totalAmount.toLocaleString('id-ID')}
                                </span>
                            </div>
                            <button
                                disabled={cart.length === 0}
                                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold tracking-wide hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Process Checkout
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}