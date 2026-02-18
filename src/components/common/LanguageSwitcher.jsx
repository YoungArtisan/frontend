import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language?.startsWith('fi') ? 'fi' : 'en';

    const toggle = () => {
        const next = currentLang === 'fi' ? 'en' : 'fi';
        i18n.changeLanguage(next);
    };

    return (
        <button
            onClick={toggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-primary text-sm font-semibold text-gray-600 hover:text-brand-primary transition-all"
            title="Switch language"
        >
            <i className="fa-solid fa-globe text-xs"></i>
            <span>{currentLang === 'fi' ? 'FI' : 'EN'}</span>
        </button>
    );
};

export default LanguageSwitcher;
