'use client';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme();
    const isLight = theme === 'light';

    return (
        <button
            onClick={toggleTheme}
            title={isLight ? 'Switch to Night Mode' : 'Switch to Day Mode'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all duration-300 ${isLight
                    ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                } ${className}`}
        >
            <span className="material-symbols-outlined text-[16px] leading-none">
                {isLight ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">
                {isLight ? 'Night' : 'Day'}
            </span>
        </button>
    );
}
