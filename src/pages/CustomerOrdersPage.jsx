import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrdersByUserId } from '../services/OrderService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const statusColors = {
    pending: 'bg-orange-100 text-orange-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const CustomerOrdersPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const data = await getOrdersByUserId(currentUser.uid);
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser, navigate]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <>
            <Header />
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse h-32"></div>
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-xl p-16 text-center border border-gray-100">
                            <i className="fa-solid fa-shopping-bag text-5xl text-gray-200 mb-4 block"></i>
                            <h2 className="text-xl font-bold text-gray-600 mb-2">No orders yet</h2>
                            <p className="text-gray-400 mb-6">Start exploring unique handmade items!</p>
                            <button onClick={() => navigate('/')} className="btn btn-primary">
                                Browse Shop
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    onClick={() => navigate(`/order/${order.id}`)}
                                    className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-bold text-gray-800 text-lg">
                                                    #{order.id.slice(-8).toUpperCase()}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Placed on {formatDate(order.createdAt)} • {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-6">
                                            <p className="font-bold text-brand-primary text-xl">
                                                ${order.total?.toFixed(2)}
                                            </p>
                                            <i className="fa-solid fa-chevron-right text-gray-300 group-hover:text-brand-primary transition-colors"></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default CustomerOrdersPage;
