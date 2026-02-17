import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { useChat } from '../../context/ChatContext';
import ChatWidget from '../features/ChatWidget';

const ProductDetails = () => {
    const { id } = useParams();
    const product = products.find(p => p.id === parseInt(id));
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const { addToCart } = useCart();
    const { startConversation } = useChat();
    const [showAddedFeedback, setShowAddedFeedback] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                <Link to="/" className="btn btn-primary">Return to Shop</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart(product, 1);
        setShowAddedFeedback(true);

        // Hide feedback after 2 seconds
        setTimeout(() => {
            setShowAddedFeedback(false);
        }, 2000);
    };

    const handleChatWithArtist = () => {
        startConversation(product.artist, product);
        setIsChatOpen(true);
    };

    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                    {/* Image Column */}
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 aspect-square flex items-center justify-center overflow-hidden">
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        {/* Thumbnails - Using the same image for demo since we only have one per product */}
                        <div className="grid grid-cols-3 gap-4">
                            {[0, 1, 2].map((index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`bg-white p-2 rounded-xl border-2 transition-colors ${activeImageIndex === index ? 'border-brand-primary' : 'border-transparent hover:border-gray-200'}`}
                                >
                                    <img src={product.image} alt={`View ${index + 1}`} className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-dark mb-2">{product.title}</h1>
                            <p className="text-2xl font-bold text-brand-primary">{product.price}</p>
                        </div>

                        <div className="flex items-center space-x-3 py-4 border-y border-gray-100">
                            <img src={product.artist.avatar} alt={product.artist.name} className="w-10 h-10 rounded-full bg-gray-200" />
                            <div>
                                <p className="text-sm text-gray-500">By Artist:</p>
                                <p className="font-bold text-text-dark">{product.artist.name}</p>
                            </div>
                        </div>

                        <div className="prose text-gray-600">
                            <p className="whitespace-pre-line">{product.description}</p>
                        </div>

                        <div className="space-y-3 pt-4">
                            <button
                                onClick={handleAddToCart}
                                className="w-full btn btn-primary flex items-center justify-center gap-2 group relative"
                            >
                                {showAddedFeedback ? (
                                    <>
                                        <span className="text-xl">✓</span> Added to Cart!
                                    </>
                                ) : (
                                    <>
                                        Add to Cart ({product.price})
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleChatWithArtist}
                                className="w-full btn bg-[#3B8FAB] text-white hover:bg-[#2d7a94] flex items-center justify-center gap-2"
                            >
                                <span className="text-xl">💬</span> Chat with Artist
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-2">(Ask about customization)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Widget */}
            <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </section>
    );
};

export default ProductDetails;
