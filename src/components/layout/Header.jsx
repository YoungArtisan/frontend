import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

const Header = () => {
    const { t } = useTranslation();
    const { cartItems, cartCount, cartTotal, removeFromCart } = useCart();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [showCartDropdown, setShowCartDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setShowSearchBar(false);
        }
    };

    const closeMobileMenu = () => setShowMobileMenu(false);

    return (
        <header className="bg-bg-card h-20 shadow-sm sticky top-0 z-[100]">
            <nav className="max-w-[1200px] mx-auto h-full flex justify-between items-center px-5">
                {/* Logo */}
                <div className="logo flex-shrink-0">
                    <Link to="/">
                        <img src="https://placehold.co/150x40?text=YoungArtisan" alt="YoungArtisan Logo" />
                    </Link>
                </div>

                {/* Desktop Nav Links */}
                <ul className="hidden md:flex gap-10">
                    <li><Link to="/search" className="text-base font-semibold text-text-dark hover:text-brand-primary transition-colors">{t('nav.shop')}</Link></li>
                    <li>
                        {currentUser?.role === 'artist' ? (
                            <Link to="/artist" className="text-base font-bold text-brand-secondary hover:text-brand-primary transition-colors">{t('nav.dashboard')}</Link>
                        ) : (
                            <Link to="/signup" className="text-base font-semibold text-text-dark hover:text-brand-primary transition-colors">{t('nav.sell')}</Link>
                        )}
                    </li>
                    <li><Link to="/" className="text-base font-semibold text-text-dark hover:text-brand-primary transition-colors">{t('nav.about')}</Link></li>
                </ul>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    {showSearchBar ? (
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 animate-fade-in">
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={t('search.placeholder')}
                                className="w-48 md:w-64 px-4 py-1.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand-primary"
                            />
                            <button type="submit" className="text-brand-primary hover:text-brand-primary/80">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>
                            <button type="button" onClick={() => setShowSearchBar(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowSearchBar(true)}
                            className="bg-transparent border-none text-xl text-text-dark cursor-pointer relative transition-colors hover:text-brand-primary"
                            aria-label={t('nav.search')}
                        >
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    )}

                    {/* Language Switcher - desktop only */}
                    <div className="hidden md:block">
                        <LanguageSwitcher />
                    </div>

                    {/* Auth Status */}
                    <div className="relative">
                        {currentUser ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full hover:border-brand-primary transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
                                        {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden top-full">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-bold truncate">{currentUser.displayName}</p>
                                            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                                        </div>
                                        {currentUser.role === 'artist' && (
                                            <Link to="/artist" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                {t('nav.artistDashboard')}
                                            </Link>
                                        )}
                                        <Link to="/my-orders" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            {t('nav.myOrders')}
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            {t('nav.signOut')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="hidden md:inline-block border-2 border-brand-primary text-brand-primary rounded-std px-5 py-2 hover:bg-brand-primary hover:text-white transition-all duration-300">
                                {t('nav.signIn')}
                            </Link>
                        )}
                    </div>

                    {/* Cart Button */}
                    <div className="relative">
                        <button
                            className="bg-transparent border-none text-xl text-text-dark cursor-pointer relative transition-colors hover:text-brand-primary"
                            aria-label="Cart"
                            onClick={() => setShowCartDropdown(!showCartDropdown)}
                        >
                            <i className="fa-solid fa-cart-shopping"></i>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-secondary rounded-full text-white text-xs flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {showCartDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-3">{t('cart.title')}</h3>
                                    {cartItems.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">{t('cart.empty')}</p>
                                    ) : (
                                        <>
                                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                                {cartItems.map(item => (
                                                    <div key={item.id} className="flex gap-3 items-center border-b border-gray-100 pb-3">
                                                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-sm">{item.title}</h4>
                                                            <p className="text-xs text-gray-500">{item.artist.name}</p>
                                                            <p className="text-sm font-bold text-brand-primary">
                                                                {item.price} x {item.quantity}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-bold">{t('cart.total')}:</span>
                                                    <span className="font-bold text-brand-primary text-lg">
                                                        ${cartTotal.toFixed(2)}
                                                    </span>
                                                </div>
                                                <Link
                                                    to="/checkout"
                                                    onClick={() => setShowCartDropdown(false)}
                                                    className="w-full btn btn-primary block text-center"
                                                >
                                                    {t('cart.checkout')}
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hamburger - Mobile Only */}
                    <button
                        className="md:hidden text-2xl text-text-dark hover:text-brand-primary transition-colors ml-1"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        aria-label="Menu"
                    >
                        <i className={`fa-solid ${showMobileMenu ? 'fa-xmark' : 'fa-bars'}`}></i>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Drawer */}
            {showMobileMenu && (
                <div className="md:hidden fixed inset-0 top-20 z-[99] bg-black/40" onClick={closeMobileMenu}>
                    <div
                        className="bg-white w-72 h-full shadow-xl flex flex-col p-6 gap-4 animate-slide-in-left"
                        onClick={e => e.stopPropagation()}
                    >
                        <Link to="/search" onClick={closeMobileMenu} className="text-lg font-semibold text-text-dark hover:text-brand-primary py-2 border-b border-gray-100">
                            {t('nav.shop')}
                        </Link>
                        {currentUser?.role === 'artist' ? (
                            <Link to="/artist" onClick={closeMobileMenu} className="text-lg font-semibold text-brand-secondary hover:text-brand-primary py-2 border-b border-gray-100">
                                {t('nav.dashboard')}
                            </Link>
                        ) : (
                            <Link to="/signup" onClick={closeMobileMenu} className="text-lg font-semibold text-text-dark hover:text-brand-primary py-2 border-b border-gray-100">
                                {t('nav.sell')}
                            </Link>
                        )}
                        {currentUser && (
                            <Link to="/my-orders" onClick={closeMobileMenu} className="text-lg font-semibold text-text-dark hover:text-brand-primary py-2 border-b border-gray-100">
                                {t('nav.myOrders')}
                            </Link>
                        )}
                        <Link to="/" onClick={closeMobileMenu} className="text-lg font-semibold text-text-dark hover:text-brand-primary py-2 border-b border-gray-100">
                            {t('nav.about')}
                        </Link>

                        {!currentUser && (
                            <Link to="/login" onClick={closeMobileMenu} className="btn btn-primary text-center mt-2">
                                {t('nav.signIn')}
                            </Link>
                        )}

                        <div className="mt-auto">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
