import React from 'react';

const TrustBanner = () => {
    return (
        <section className="bg-[#FFFBE6] py-8 px-5 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 flex-wrap">
            <div className="flex items-center gap-3">
                <div className="text-2xl text-brand-primary">
                    <i className="fa-solid fa-shield-halved"></i>
                </div>
                <span className="font-semibold text-text-dark">Parent-Approved Safety</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-2xl text-success-green">
                    <i className="fa-solid fa-check"></i>
                </div>
                <span className="font-semibold text-text-dark">Verified Young Artists</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-2xl text-brand-secondary">
                    <i className="fa-solid fa-heart"></i>
                </div>
                <span className="font-semibold text-text-dark">Chat & Customize Orders</span>
            </div>
        </section>
    );
};

export default TrustBanner;
