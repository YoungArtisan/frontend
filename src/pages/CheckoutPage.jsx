import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        zipCode: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.fullName || !formData.email || !formData.address || !formData.city || !formData.zipCode) {
            alert('Please fill in all shipping details');
            return;
        }

        // Simulate order placement
        clearCart();
        navigate('/order-confirmation');
    };

    if (cartItems.length === 0) {
        return (
            <>
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary">
                        Continue Shopping
                    </button>
                </main>
                <Footer />
            </>
        );
    }

    const subtotal = cartTotal;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return (
        <>
            <Header />
            <main className="py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold mb-8">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Shipping Information */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold mb-2">Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold mb-2">Address *</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">City *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">Zip Code *</label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold mb-4">Payment Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">Card Number</label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={formData.cardNumber}
                                                onChange={handleInputChange}
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                                                <input
                                                    type="text"
                                                    name="expiryDate"
                                                    value={formData.expiryDate}
                                                    onChange={handleInputChange}
                                                    placeholder="MM/YY"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">CVV</label>
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    value={formData.cvv}
                                                    onChange={handleInputChange}
                                                    placeholder="123"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full btn btn-primary text-lg py-4">
                                    Place Order - ${total.toFixed(2)}
                                </button>
                            </form>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
                                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                    {cartItems.map(item => {
                                        const itemPrice = parseFloat(item.price.replace('$', ''));
                                        const itemTotal = itemPrice * item.quantity;

                                        return (
                                            <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100">
                                                <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                                                    <p className="text-xs text-gray-500 mb-2">{item.artist.name}</p>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="flex items-center border border-gray-300 rounded">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="px-3 py-1 text-sm font-semibold">{item.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                            title="Remove item"
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>

                                                    <p className="text-sm">
                                                        <span className="text-gray-600">{item.price} × {item.quantity} = </span>
                                                        <span className="font-bold text-brand-primary">${itemTotal.toFixed(2)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="space-y-2 border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Tax (10%):</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                        <span>Total:</span>
                                        <span className="text-brand-primary">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default CheckoutPage;
