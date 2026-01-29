import React from 'react';
import ProductCard from '../ui/ProductCard';
import { products } from '../../data/products';

const FeaturedProducts = () => {
    return (
        <section className="py-16 px-5 max-w-[1200px] mx-auto">
            <h2 className="text-3xl md:text-[32px] text-center font-bold mb-10 font-heading">Featured Creations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default FeaturedProducts;
