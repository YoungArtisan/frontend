import React from 'react';

const Header = () => {
    return (
        <header className="bg-bg-card h-20 shadow-sm sticky top-0 z-[100]">
            <nav className="max-w-[1200px] mx-auto h-full flex justify-between items-center px-5">
                <div className="logo">
                    <img src="https://placehold.co/150x40?text=YoungArtisan" alt="YoungArtisan Logo" />
                </div>

                <ul className="hidden md:flex gap-10">
                    <li><a href="/" className="text-base font-semibold text-text-dark hover:text-brand-primary transition-colors">Shop</a></li>
                    <li><a href="/" className="text-base font-semibold text-text-dark hover:text-brand-primary transition-colors">Sell</a></li>
                    <li><a href="/" className="text-base font-semibold text-text-dark hover:text-brand-primary transition-colors">About</a></li>
                </ul>

                <div className="flex items-center gap-5">
                    <button className="bg-transparent border-none text-xl text-text-dark cursor-pointer relative transition-colors hover:text-brand-primary" aria-label="Search">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </button>
                    <button className="bg-transparent border-none text-xl text-text-dark cursor-pointer relative transition-colors hover:text-brand-primary" aria-label="Cart">
                        <i className="fa-solid fa-cart-shopping"></i>
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-secondary rounded-full"></span>
                    </button>
                    <a href="/" className="hidden md:inline-block border-2 border-brand-primary text-brand-primary rounded-std px-5 py-2 hover:bg-brand-primary hover:text-white transition-all duration-300">Sign In</a>
                </div>
            </nav>
        </header>
    );
};

export default Header;
