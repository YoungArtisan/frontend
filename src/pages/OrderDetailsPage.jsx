import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const statusColors = {
    pending: 'bg-orange-100 text-orange-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('Order not found');
                }
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Failed to load order details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !order) {
        return (
            <>
                <Header />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
                    <p className="text-gray-600 mb-8">{error || "The order you're looking for doesn't exist."}</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary">
                        Return Home
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-500 hover:text-brand-primary"
                        >
                            <i className="fa-solid fa-arrow-left mr-2"></i>
                            Back to Shop
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800 ml-auto">
                            Order #{order.id.slice(-8).toUpperCase()}
                        </h1>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Status Banner */}
                        <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${order.status === 'delivered' ? 'bg-green-50' : 'bg-white'}`}>
                            <div>
                                <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="p-6 md:p-8">
                            {/* Items */}
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Items Ordered</h3>
                            <div className="space-y-4 mb-8">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="flex gap-4 py-4 border-b border-gray-50 last:border-0">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <i className="fa-solid fa-image text-xl"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">{item.title}</h4>
                                            <p className="text-sm text-gray-500">Artist: {item.artistName}</p>
                                            <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity || 1}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                                {/* Shipping Info */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Shipping Details</h3>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p className="font-semibold text-gray-800">{order.customerName}</p>
                                        <p>{order.shippingAddress?.address}</p>
                                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.zipCode}</p>
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <p><span className="font-semibold">Email:</span> {order.email || 'N/A'}</p>
                                            <p><span className="font-semibold">Mobile:</span> {order.mobileNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>${order.subtotal?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tax</span>
                                            <span>${order.tax?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-200 mt-2">
                                            <span>Total</span>
                                            <span className="text-brand-primary">${order.total?.toFixed(2)}</span>
                                        </div>
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

export default OrderDetailsPage;
