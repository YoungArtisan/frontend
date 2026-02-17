import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArtistDashboard = () => {
    const navigate = useNavigate();

    const stats = [
        { label: 'Total Products', value: '4', icon: 'fa-box', color: 'bg-blue-500' },
        { label: 'Total Sales', value: '$142', icon: 'fa-dollar-sign', color: 'bg-green-500' },
        { label: 'Active Orders', value: '3', icon: 'fa-shopping-cart', color: 'bg-orange-500' },
        { label: 'Messages', value: '2', icon: 'fa-comments', color: 'bg-purple-500' }
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, CraftyKid_Leo! 👋</h1>
                <p className="text-gray-600">Here's what's happening with your shop today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                                <i className={`fa-solid ${stat.icon} text-xl`}></i>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/artist/messages')}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left"
                    >
                        <i className="fa-solid fa-comments text-2xl text-brand-primary mb-2"></i>
                        <h3 className="font-semibold mb-1">View Messages</h3>
                        <p className="text-sm text-gray-600">Chat with customers</p>
                    </button>
                    <button className="p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed text-left">
                        <i className="fa-solid fa-plus-circle text-2xl text-gray-400 mb-2"></i>
                        <h3 className="font-semibold mb-1">Add Product</h3>
                        <p className="text-sm text-gray-600">Coming soon</p>
                    </button>
                    <button className="p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed text-left">
                        <i className="fa-solid fa-chart-bar text-2xl text-gray-400 mb-2"></i>
                        <h3 className="font-semibold mb-1">View Analytics</h3>
                        <p className="text-sm text-gray-600">Coming soon</p>
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-shopping-cart text-green-600"></i>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">New order received</p>
                            <p className="text-sm text-gray-600">Rainbow Bead Lizard - $5.00</p>
                        </div>
                        <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-message text-blue-600"></i>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">New message from customer</p>
                            <p className="text-sm text-gray-600">Question about customization</p>
                        </div>
                        <span className="text-sm text-gray-500">5 hours ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistDashboard;
