'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('en');

    useEffect(() => {
        // Load preference from localStorage
        const savedLang = localStorage.getItem('masterkey_lang');
        if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'hinglish')) {
            setLang(savedLang);
        }
    }, []);

    const handleSetLang = (newLang) => {
        setLang(newLang);
        localStorage.setItem('masterkey_lang', newLang);
    };

    const t = translations[lang] || translations['en'];

    return (
        <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
