'use client';
import Link from 'next/link';
import VideoLogo from '@/components/VideoLogo';
import { useLanguage } from '@/lib/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="border-t border-white/5 pt-20 pb-24 bg-black/40 mt-0">
            <div className="container mx-auto px-6 flex flex-col items-center text-center">
                <div className="mb-10 opacity-80 mix-blend-screen">
                    <Link href="/">
                        <VideoLogo 
                            src="/video-logo.mp4" 
                            poster="/logo-new.png" 
                            className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity" 
                            style={{ height: '120px', width: 'auto' }} 
                        />
                    </Link>
                </div>
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-12">
                    <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">{t.footer.systems}</span>
                    <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">{t.footer.infrastructure}</span>
                    <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">{t.footer.intelligence}</span>
                    <span className="text-white/30 uppercase text-[10px] font-bold tracking-[0.2em]">{t.footer.directives}</span>
                </div>

                {/* Legal and Contact */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12 text-[10px] font-bold uppercase tracking-[0.1em]">
                    <Link href="/about" className="text-white/40 hover:text-ios-blue transition-colors">About</Link>
                    <Link href="/privacy" className="text-white/40 hover:text-ios-blue transition-colors">{t.footer.privacy}</Link>
                    <Link href="/terms" className="text-white/40 hover:text-ios-blue transition-colors">{t.footer.terms}</Link>
                </div>

                <div className="text-white/10 text-[9px] tracking-[0.3em] font-bold uppercase">{t.footer.rights}</div>
            </div>
        </footer>
    );
}
