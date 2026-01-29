import React from 'react';
import Header from '../components/layout/Header';
import Hero from '../components/sections/Hero';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import TrustBanner from '../components/sections/TrustBanner';
import Footer from '../components/layout/Footer';

const HomePage = () => {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <FeaturedProducts />
                <TrustBanner />
            </main>
            <Footer />
        </>
    );
};

export default HomePage;
