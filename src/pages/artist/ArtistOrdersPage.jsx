import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOrdersByArtistId, subscribeToArtistOrders, updateOrderStatus } from '../../services/OrderService';

const statusColors = {
    pending: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    shipped: 'bg-blue-100 text-blue-700',
};

const ArtistOrdersPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        let unsubscribe;

        const init = async () => {
            setLoading(true);
            try {
                // Subscribe to realtime updates
                unsubscribe = subscribeToArtistOrders(currentUser.uid, (data) => {
                    setOrders(data);
                    setLoading(false);
                });
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };

        init();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentUser]);

    const handleStatusUpdate = async (e, orderId) => {
        e.stopPropagation();
        const newStatus = e.target.value;
        if (!window.confirm(`Update order status to ${newStatus}?`)) return;

        try {
            await updateOrderStatus(orderId, newStatus);
            // No need to manually update state, the listener will handle it!
        } catch (error) {
            alert('Failed to update status. Please make sure your permissions allow this.');
        }
    };

    // Filter only this artist's items from an order
    const getMyItems = (order) =>
        order.items?.filter(
            item => item.artistId === currentUser?.uid || item.artistName === currentUser?.displayName
        ) || [];

    const getMyTotal = (order) => {
        return getMyItems(order).reduce((sum, item) => {
            const price = parseFloat(String(item.price).replace('$', '')) || 0;
            return sum + price * (item.quantity || 1);
        }, 0);
    };

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

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/artist')}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-primary transition-colors"
                >
                    <i className="fa-solid fa-arrow-left text-xs"></i>
                    Back to Dashboard
                </button>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Received Orders</h1>
                    <p className="text-gray-500 mt-1">Orders placed by customers for your products</p>
                </div>
                <div className="bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full font-bold">
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
                    <i className="fa-solid fa-box-open text-6xl text-gray-200 mb-4 block"></i>
                    <h2 className="text-2xl font-bold text-gray-600 mb-2">No orders yet</h2>
                    <p className="text-gray-400">When customers buy your products, their orders will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {orders.map(order => {
                        const myItems = getMyItems(order);
                        const myTotal = getMyTotal(order);
                        const isSelected = selectedOrder?.id === order.id;

                        return (
                            <div
                                key={order.id}
                                className={`bg-white rounded-xl border transition-all cursor-pointer hover:shadow-md ${isSelected ? 'border-brand-primary shadow-md ring-2 ring-brand-primary/10' : 'border-gray-100 shadow-sm'
                                    }`}
                                onClick={() => setSelectedOrder(isSelected ? null : order)}
                            >
                                {/* Order Header */}
                                <div className="p-5 flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800">#{order.id.slice(-8).toUpperCase()}</span>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={order.status || 'pending'}
                                                    onChange={(e) => handleStatusUpdate(e, order.id)}
                                                    className={`text-xs px-2 py-1 rounded-full font-semibold capitalize border-none focus:ring-2 focus:ring-brand-primary cursor-pointer ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-brand-primary text-lg">${myTotal.toFixed(2)}</p>
                                        <p className="text-xs text-gray-400">your earnings</p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="px-5 pb-4 border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                                            {order.customerName?.[0]?.toUpperCase() || 'C'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-800">{order.customerName}</p>
                                            <p className="text-xs text-gray-500">{order.email || 'No email provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Preview */}
                                <div className="px-5 py-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Your Items ({myItems.length})</p>
                                    <div className="space-y-2">
                                        {myItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                {item.image && (
                                                    <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                                                    <p className="text-xs text-gray-500">{item.price} × {item.quantity || 1}</p>
                                                </div>
                                                <p className="text-sm font-bold text-gray-700 flex-shrink-0">
                                                    ${(parseFloat(String(item.price).replace('$', '')) * (item.quantity || 1)).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isSelected && (
                                    <div className="px-5 pb-5 border-t border-gray-50 pt-4 animate-fade-in">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Shipping Address</p>
                                        {order.shippingAddress ? (
                                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                                                <p>{order.shippingAddress.address}</p>
                                                <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">No shipping address provided</p>
                                        )}

                                        {order.mobileNumber && (
                                            <div className="mt-3">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Mobile</p>
                                                <p className="text-sm text-gray-700">{order.mobileNumber}</p>
                                            </div>
                                        )}

                                        <div className="mt-4 flex gap-2">
                                            <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                                                <p className="text-xs text-gray-400">Order Total</p>
                                                <p className="font-bold text-gray-800">${order.total?.toFixed(2)}</p>
                                            </div>
                                            <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                                                <p className="text-xs text-gray-400">Your Earnings</p>
                                                <p className="font-bold text-brand-primary">${myTotal.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Expand hint */}
                                <div className="px-5 pb-4 flex justify-center">
                                    <span className="text-xs text-gray-400">
                                        {isSelected ? '▲ Click to collapse' : '▼ Click to see details'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ArtistOrdersPage;
