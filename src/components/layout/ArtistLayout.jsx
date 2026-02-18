import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

const ArtistLayout = () => {
    const location = useLocation();
    const { currentUser } = useAuth();

    const navItems = [
        { path: '/artist', label: 'Dashboard', icon: 'fa-chart-line' },
        { path: '/artist/messages', label: 'Messages', icon: 'fa-comments' },
        { path: '/artist/products', label: 'My Products', icon: 'fa-box' },
        { path: '/artist/orders', label: 'Orders', icon: 'fa-shopping-bag' },
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
                        <Link to="/" className="text-sm text-gray-600 hover:text-brand-primary hidden md:block">
                            <i className="fa-solid fa-store mr-2"></i>
                            View Shop
                        </Link>

                        {/* Language Switcher */}
                        <div className="mr-2">
                            <LanguageSwitcher />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
                                {currentUser?.displayName?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <span className="font-semibold text-gray-800 hidden md:block">{currentUser?.displayName || 'Artist'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] hidden md:block">
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

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around p-2">
                    {navItems.filter(item => !item.disabled).map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-brand-primary' : 'text-gray-500'}`}
                            >
                                <i className={`fa-solid ${item.icon} text-lg`}></i>
                                <span className="text-[10px] mt-1">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Main Content */}
                <main className="flex-1 mb-16 md:mb-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ArtistLayout;
