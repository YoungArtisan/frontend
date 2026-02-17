import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProductDetails from '../components/sections/ProductDetails';

const ProductPage = () => {
    return (
        <>
            <Header />
            <main>
                <ProductDetails />
            </main>
            <Footer />
        </>
    );
};

export default ProductPage;
