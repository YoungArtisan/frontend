import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const ArtistLayout = () => {
    const location = useLocation();

    const navItems = [
        { path: '/artist', label: 'Dashboard', icon: 'fa-chart-line' },
        { path: '/artist/messages', label: 'Messages', icon: 'fa-comments' },
        { path: '/artist/products', label: 'My Products', icon: 'fa-box' },
        { path: '/artist/settings', label: 'Settings', icon: 'fa-gear', disabled: true }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-2xl font-bold text-brand-primary">
                            YoungArtisan
                        </Link>
                        <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                            Artist Dashboard
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm text-gray-600 hover:text-brand-primary">
                            <i className="fa-solid fa-store mr-2"></i>
                            View Shop
                        </Link>
                        <div className="flex items-center gap-2">
                            <img
                                src="https://placehold.co/40x40?text=A"
                                alt="Artist"
                                className="w-10 h-10 rounded-full"
                            />
                            <span className="font-semibold">CraftyKid_Leo</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
                    <nav className="p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.disabled ? '#' : item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-brand-primary text-white'
                                        : item.disabled
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    onClick={(e) => item.disabled && e.preventDefault()}
                                >
                                    <i className={`fa-solid ${item.icon}`}></i>
                                    <span className="font-medium">{item.label}</span>
                                    {item.disabled && (
                                        <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">Soon</span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ArtistLayout;
