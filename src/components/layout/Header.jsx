import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { cartItems, cartCount, cartTotal, removeFromCart } = useCart();
    const { currentUser, logout } = useAuth();
    const [showCartDropdown, setShowCartDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="bg-bg-card h-20 shadow-sm sticky top-0 z-[100]">
            <nav className="max-w-[1200px] mx-auto h-full flex justify-between items-center px-5">
                <div className="logo">
                    <Link to="/">
                        <img src="https://placehold.co/150x40?text=YoungArtisan" alt="YoungArtisan Logo" />
                    </Link>
                </div>

                <ul className="hidden md:flex gap-10">
                    <li><Link to="/" className="text-base font-semibold text-text-dark hover:text-brand-primary transition-colors">Shop</Link></li>
                    <li>
                        {currentUser?.role === 'artist' ? (
                            <Link to="/artist" className="text-base font-bold text-brand-secondary hover:text-brand-primary transition-colors">Dashboard</Link>
                        ) : (
                            <Link to="/artist" className="text-base font-semibold text-text-dark hover:text-brand-primary transition-colors">Sell</Link>
                        )}
                    </li>
                    <li><Link to="/" className="text-base font-semibold text-text-dark hover:text-brand-primary transition-colors">About</Link></li>
                </ul>

                <div className="flex items-center gap-5">
                    <button className="bg-transparent border-none text-xl text-text-dark cursor-pointer relative transition-colors hover:text-brand-primary" aria-label="Search">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </button>

                    {/* Auth Status / Sign In */}
                    <div className="relative">
                        {currentUser ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full hover:border-brand-primary transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
                                        {currentUser.displayName?.[0] || 'U'}
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
                                            <Link to="/artist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                Artist Dashboard
                                            </Link>
                                        )}
                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="hidden md:inline-block border-2 border-brand-primary text-brand-primary rounded-std px-5 py-2 hover:bg-brand-primary hover:text-white transition-all duration-300">
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Cart Button with Dropdown */}
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

                        {/* Cart Dropdown */}
                        {showCartDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-3">Shopping Cart</h3>

                                    {cartItems.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
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
                                                    <span className="font-bold">Total:</span>
                                                    <span className="font-bold text-brand-primary text-lg">
                                                        ${cartTotal.toFixed(2)}
                                                    </span>
                                                </div>
                                                <Link to="/checkout" className="w-full btn btn-primary block text-center">
                                                    Checkout
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
