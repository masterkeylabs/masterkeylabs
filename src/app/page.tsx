"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";
import AuditSuite from "@/components/audit/AuditSuite";
import EcosystemHub from "@/components/layout/EcosystemHub";
import IndustrySolutions from "@/components/layout/IndustrySolutions";
import UserDashboard from "@/components/audit/UserDashboard";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { isRegistered } = useAuth();

  return (
    <main className="bg-black min-h-screen">
      <Header />

      {!isRegistered ? (
        <>
          <Hero />
          <div className="relative py-20">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <AuditSuite />
          </div>
          <IndustrySolutions />
          <EcosystemHub />
        </>
      ) : (
        <>
          <UserDashboard />
          <div className="relative py-20 border-t border-white/5">
            <div className="text-center mb-16">
              <h3 className="text-2xl font-black uppercase tracking-widest silver-gradient-text">Explore the Tools</h3>
            </div>
            <AuditSuite />
          </div>
        </>
      )}

      <footer className="py-32 border-t border-white/5 bg-black text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--cyan-accent)]/[0.03] rounded-full blur-[120px] -z-10" />
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-7xl font-black mb-16 tracking-tighter uppercase text-white">
            Elite <span className="orange-signal-text drop-shadow-[0_0_20px_var(--orange-glow)]">1% League</span> Join Karein
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-32 max-w-5xl mx-auto">
            <div className="glass-card p-10 border-white/5 hover:border-[var(--cyan-accent)]/20 transition-all group flex flex-col items-center text-center">
              <div className="text-[9px] font-black uppercase text-silver/40 tracking-[0.5em] mb-6 group-hover:cyan-accent-text transition-colors">Transmission</div>
              <a href="mailto:support@masterkeylabs.in" className="text-[10px] font-bold hover:text-white transition-colors uppercase tracking-[0.1em] text-silver break-all">support@masterkeylabs.in</a>
            </div>
            <div className="glass-card p-10 border-white/5 hover:border-[var(--cyan-accent)]/20 transition-all group">
              <div className="text-[9px] font-black uppercase text-silver/40 tracking-[0.5em] mb-6 group-hover:cyan-accent-text transition-colors">Command Center</div>
              <div className="text-lg font-bold uppercase tracking-widest text-white">Indore, India</div>
            </div>
            <div className="glass-card p-10 border-white/5 hover:border-[var(--cyan-accent)]/20 transition-all group">
              <div className="text-[9px] font-black uppercase text-silver/40 tracking-[0.5em] mb-6 group-hover:cyan-accent-text transition-colors">Protocols</div>
              <div className="flex flex-col gap-3">
                <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-silver/60 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest text-silver/60 hover:text-white transition-colors">Force Terms</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-8">
            <img
              src="/branding-logo.png"
              alt="Masterkey Logo"
              className="w-16 h-16 object-contain grayscale hover:grayscale-0 transition-all duration-700"
            />
            <div className="space-y-4">
              <img
                src="/branding-name.png"
                alt="Masterkey Labs"
                className="h-8 md:h-10 object-contain mx-auto transition-opacity duration-700"
              />
              <div className="space-y-2">
                <p className="text-silver/30 text-[9px] font-black uppercase tracking-[0.6em]">© 2026 Masterkey Labs India. Neural Architects of Bharat.</p>
                <p className="text-white/5 text-[7px] font-black uppercase tracking-[1em]">Universal AI Transformation Protocol Engaged</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
