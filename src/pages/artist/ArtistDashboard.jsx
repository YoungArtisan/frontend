import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { getArtistStats } from '../../services/OrderService';
import { getProductsByArtist } from '../../services/ProductService';

const StatCard = ({ label, value, icon, color, loading }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
            <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                <i className={`fa-solid ${icon} text-xl`}></i>
            </div>
        </div>
        <p className="text-gray-600 text-sm mb-1">{label}</p>
        {loading ? (
            <div className="h-9 w-16 bg-gray-200 animate-pulse rounded"></div>
        ) : (
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        )}
    </div>
);

const ArtistDashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const { conversations } = useChat();

    const [stats, setStats] = useState(null);
    const [realProductCount, setRealProductCount] = useState(0);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async () => {
            setLoadingStats(true);
            try {
                // Fetch stats (sales, orders)
                const statsData = await getArtistStats(currentUser.uid, currentUser.displayName);
                setStats(statsData);

                // Fetch real product count
                const productsData = await getProductsByArtist(currentUser.uid);
                setRealProductCount(productsData.length);
            } catch (e) {
                console.error('Error fetching dashboard data:', e);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchData();
    }, [currentUser]);

    // Count unread/total messages for this artist
    const messageCount = conversations.length;

    const statCards = [
        {
            label: t('artist.totalProducts'),
            value: String(realProductCount),
            icon: 'fa-box',
            color: 'bg-blue-500'
        },
        {
            label: t('artist.totalSales'),
            value: `$${stats?.totalSales || '0.00'}`,
            icon: 'fa-dollar-sign',
            color: 'bg-green-500'
        },
        {
            label: t('artist.activeOrders'),
            value: String(stats?.activeOrders ?? 0),
            icon: 'fa-shopping-cart',
            color: 'bg-orange-500'
        },
        {
            label: t('artist.messages'),
            value: String(messageCount),
            icon: 'fa-comments',
            color: 'bg-purple-500'
        }
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {t('artist.welcome')}, {currentUser?.displayName || 'Artist'}! 👋
                </h1>
                <p className="text-gray-600">{t('artist.shopToday')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <StatCard
                        key={index}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        loading={loadingStats}
                    />
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <h2 className="text-xl font-bold mb-4">{t('artist.quickActions')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate('/artist/messages')}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left"
                    >
                        <i className="fa-solid fa-comments text-2xl text-brand-primary mb-2"></i>
                        <h3 className="font-semibold mb-1">{t('artist.viewMessages')}</h3>
                        <p className="text-sm text-gray-600">{t('artist.chatWithCustomers')}</p>
                    </button>
                    <button
                        onClick={() => navigate('/artist/orders')}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left"
                    >
                        <i className="fa-solid fa-shopping-bag text-2xl text-brand-primary mb-2"></i>
                        <h3 className="font-semibold mb-1">View Orders</h3>
                        <p className="text-sm text-gray-600">See received orders</p>
                    </button>
                    <button
                        onClick={() => navigate('/artist/products')}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left"
                    >
                        <i className="fa-solid fa-plus-circle text-2xl text-brand-primary mb-2"></i>
                        <h3 className="font-semibold mb-1">Manage Products</h3>
                        <p className="text-sm text-gray-600">{t('artist.addProduct')}</p>
                    </button>
                    <button className="p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed text-left">
                        <i className="fa-solid fa-chart-bar text-2xl text-gray-400 mb-2"></i>
                        <h3 className="font-semibold mb-1">{t('artist.viewAnalytics')}</h3>
                        <p className="text-sm text-gray-600">{t('artist.comingSoon')}</p>
                    </button>
                </div>
            </div>

            {/* Recent Orders Preview */}
            {stats?.orders?.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Recent Orders</h2>
                        <button
                            onClick={() => navigate('/artist/orders')}
                            className="text-sm text-brand-primary hover:underline"
                        >
                            View all →
                        </button>
                    </div>
                    <div className="space-y-3">
                        {stats.orders.slice(0, 3).map(order => (
                            <div key={order.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <i className="fa-solid fa-shopping-cart text-green-600"></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{order.customerName}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {order.items?.map(i => i.title).join(', ')}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-brand-primary text-sm">${order.total?.toFixed(2)}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4">{t('artist.recentActivity')}</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-message text-blue-600"></i>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">You have {messageCount} conversation{messageCount !== 1 ? 's' : ''}</p>
                            <p className="text-sm text-gray-600">Click "View Messages" to respond</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistDashboard;
