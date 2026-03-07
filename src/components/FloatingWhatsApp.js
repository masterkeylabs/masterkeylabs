'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function FloatingWhatsApp() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Hide on audit pages and dashboard to avoid clutter
        if (pathname === '/audit' || pathname.startsWith('/dashboard') || pathname === '/login' || pathname === '/signup') {
            setIsVisible(false);
            return;
        }

        const isDismissed = sessionStorage.getItem('whatsapp_dismissed');
        if (!isDismissed) {
            setIsVisible(true);
        }
    }, [pathname]);

    const handleDismiss = (e) => {
        e.preventDefault();
        e.stopPropagation();
        sessionStorage.setItem('whatsapp_dismissed', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    // Placeholder phone number as per implementation plan
    const whatsappUrl = "https://wa.me/91XXXXXXXXXX?text=Hi! I am on the MasterKey Labs website and would like to discuss my business growth.";

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-up md:left-auto md:right-8 md:translate-x-0">
            <div className="relative group">
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-full shadow-[0_12px_40px_rgba(37,211,102,0.4)] hover:shadow-[0_20px_50px_rgba(37,211,102,0.6)] transition-all duration-300 hover:-translate-y-1 active:scale-95 border border-white/20 whitespace-nowrap"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.342 2.518.938 3.565l-.994 3.634 3.717-.974c1.011.552 2.169.869 3.407.87 3.181 0 5.767-2.586 5.768-5.766 0-3.181-2.587-5.766-5.768-5.766zM12.031 3c4.935 0 8.938 4.003 8.938 8.938s-4.003 8.938-8.938 8.938c-1.572 0-3.045-.407-4.326-1.118l-5.705 1.494 1.521-5.558c-.808-1.353-1.278-2.937-1.278-4.631 0-4.935 4.003-8.938 8.938-8.938z" />
                    </svg>
                    <span className="font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                        {/* Hidden on very small screens to keep it compact, but guide says "Icon only" for mobile */}
                        <span className="hidden sm:inline">Chat on WhatsApp</span>
                        <span className="sm:hidden">WhatsApp</span>
                    </span>
                </a>

                {/* Dismiss Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute -top-2 -right-2 bg-black/80 text-white w-6 h-6 rounded-full flex items-center justify-center border border-white/10 hover:bg-black transition-colors shadow-lg"
                    title="Dismiss"
                >
                    <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                </button>
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                @media (min-width: 768px) {
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
            `}</style>
        </div>
    );
}
