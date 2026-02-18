import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className="relative h-auto min-h-[450px] md:h-[500px] bg-cover bg-center flex items-center justify-center p-5 md:p-0 
            bg-[url('../../assets/banner-mobile.png')] md:bg-[url('../../assets/banner.png')]">

            <div className="relative z-10 p-5 w-full md:w-auto">
                <div className="bg-bg-card p-8 md:p-10 rounded-soft max-w-full md:max-w-[600px] shadow-soft text-center relative
                    before:content-[''] before:absolute before:top-2.5 before:left-2.5 before:-right-2.5 before:-bottom-2.5 
                    before:bg-brand-accent before:rounded-soft before:-z-10 before:opacity-50">

                    <h1 className="text-3xl md:text-5xl font-bold mb-4 font-heading leading-tight">{t('hero.title')}</h1>
                    <p className="text-base md:text-lg text-text-dark mb-8">{t('hero.subtitle')}</p>

                    <div className="flex flex-col md:flex-row gap-5 justify-center">
                        <Link to="/search" className="btn btn-primary">{t('hero.shopBtn')}</Link>
                        <Link to="/signup" className="btn btn-secondary">{t('hero.sellBtn')}</Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
