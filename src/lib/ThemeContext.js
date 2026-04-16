'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => { } });

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const saved = localStorage.getItem('mkos_theme');
        if (saved && saved !== theme) {
            setTheme(saved);
        }
        document.documentElement.setAttribute('data-theme', saved || 'dark');
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('mkos_theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
