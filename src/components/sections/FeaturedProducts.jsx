import React, { useEffect, useState } from 'react';
import ProductCard from '../ui/ProductCard';
import { getProducts } from '../../services/ProductService';

const FeaturedProducts = () => {
    const [productsList, setProductsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProductsList(data);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <section className="py-16 px-5 max-w-[1200px] mx-auto text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-64 bg-gray-200 rounded mb-10"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-80 bg-gray-100 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-5 max-w-[1200px] mx-auto">
            <h2 className="text-3xl md:text-[32px] text-center font-bold mb-10 font-heading">Featured Creations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {productsList.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {productsList.length === 0 && (
                <p className="text-center text-gray-500">No products found. Please check back later!</p>
            )}
        </section>
    );
};

export default FeaturedProducts;
