import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { products } from '../data/products';

const SearchPage = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(query);

    useEffect(() => {
        setInputValue(query);
    }, [query]);

    const filteredProducts = query.trim()
        ? products.filter(p =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase()) ||
            p.artist?.name?.toLowerCase().includes(query.toLowerCase())
        )
        : products;

    const handleSearch = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setSearchParams({ q: inputValue.trim() });
        } else {
            setSearchParams({});
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 py-10">
                <div className="container mx-auto px-4">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder={t('search.placeholder')}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 text-base bg-white shadow-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary px-6 py-3 rounded-xl"
                            >
                                {t('nav.search')}
                            </button>
                        </div>
                    </form>

                    {/* Results Header */}
                    <div className="mb-6">
                        {query ? (
                            <h1 className="text-2xl font-bold text-gray-800">
                                {t('search.resultsFor')}: <span className="text-brand-primary">"{query}"</span>
                                <span className="ml-3 text-base font-normal text-gray-500">({filteredProducts.length} results)</span>
                            </h1>
                        ) : (
                            <h1 className="text-2xl font-bold text-gray-800">{t('search.allProducts')}</h1>
                        )}
                    </div>

                    {/* Results Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <i className="fa-solid fa-box-open text-6xl text-gray-200 mb-4 block"></i>
                            <p className="text-xl font-semibold text-gray-500">{t('search.noResults')} "{query}"</p>
                            <p className="text-gray-400 mt-2">{t('search.noResultsHint')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {filteredProducts.map(product => {
                                const price = parseFloat(product.price.replace('$', ''));
                                return (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
                                    >
                                        <div className="aspect-square overflow-hidden bg-gray-50">
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">{product.title}</h3>
                                            <p className="text-xs text-gray-500 mb-2">{product.artist?.name}</p>
                                            <p className="font-bold text-brand-primary">{product.price}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default SearchPage;
