import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="text-center p-10 text-text-light text-sm">
            <p className="mb-1 font-medium">{t('footer.tagline')}</p>
            <p>&copy; 2026 YoungArtisan. {t('footer.rights')}</p>
        </footer>
    );
};

export default Footer;
