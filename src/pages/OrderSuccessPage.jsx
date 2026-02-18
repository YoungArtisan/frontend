import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const OrderSuccessPage = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const orderId = queryParams.get('orderId');

    return (
        <>
            <Header />
            <main className="py-16 md:py-24">
                <div className="container mx-auto px-4 text-center max-w-2xl">
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-dark mb-4">
                            Order Placed Successfully! 🎉
                        </h1>

                        <p className="text-gray-600 mb-2">
                            Thank you for supporting young artisans!
                        </p>
                        <p className="text-gray-600 mb-8">
                            You will receive a confirmation email shortly with your order details.
                        </p>

                        <div className="bg-bg-neutral p-6 rounded-lg mb-8">
                            <p className="text-sm text-gray-500 mb-2">Order Number</p>
                            <p className="text-2xl font-bold text-brand-primary">
                                #{orderId ? orderId.slice(-8).toUpperCase() : 'UNKNOWN'}
                            </p>
                            {orderId && (
                                <p className="text-xs text-gray-400 mt-2">
                                    Save this ID to track your order
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/')}
                                className="w-full btn btn-primary"
                            >
                                Continue Shopping
                            </button>
                            {orderId && (
                                <button
                                    onClick={() => navigate(`/order/${orderId}`)}
                                    className="w-full btn btn-outline"
                                >
                                    View Order Status
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 text-sm text-gray-500">
                        <p>Questions about your order? Contact us at support@youngartisan.com</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default OrderSuccessPage;
