import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: "Free Business Diagnostics | AI Readiness & Growth Audit Tools – MasterKey Labs",
  description: "Use MasterKey Labs' free diagnostic tools to find profit leaks, measure your AI displacement risk, check digital visibility, and identify where your business is losing money. Built for Indian and global SMBs.",
};

const DIAGNOSTIC_TOOLS = [
  {
    title: "Operational Waste & Profit Leak Audit",
    id: "waste",
    href: "/dashboard/loss-audit",
    desc: "Scan your business for hidden operational inefficiencies and profit leaks that are draining your bottom line.",
    icon: "account_balance_wallet",
    color: "ios-blue"
  },
  {
    title: "Night Loss & Lead Leak Scanner",
    id: "night",
    href: "/dashboard/night-loss",
    desc: "Calculate exactly how much revenue you are losing when your team is offline and leads go unanswered.",
    icon: "nights_stay",
    color: "purple-400"
  },
  {
    title: "Digital Ecosystem & Visibility Check",
    id: "visibility",
    href: "/dashboard/visibility",
    desc: "Measure your brand's presence across the digital ecosystem and identify gaps in your visibility.",
    icon: "visibility",
    color: "cyan-400"
  },
  {
    title: "AI Extinction Timer & Risk Audit",
    id: "ai-timer",
    href: "/dashboard/ai-threat",
    desc: "Calculate your displacement risk score and see how long before AI disrupts your specific role or industry.",
    icon: "history_toggle_off",
    color: "red-400"
  }
];

export default function DiagnosticsPage() {
  return (
    <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden">
      {/* Minimal Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      <div className="fixed top-0 left-0 w-full h-screen spotlight pointer-events-none z-0"></div>

      <Header activeSection="diagnostics" />

      <main className="relative z-10 pt-12 md:pt-24 pb-20">
        <section className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ios-blue/10 border border-ios-blue/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-ios-blue animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ios-blue">Diagnostic Suite 2.0</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
              Free Business <span className="text-ios-blue">Intelligence</span>.
            </h1>
            <p className="text-white/40 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
              Use our professional diagnostic tools to measure your business readiness for the AI economy. 
              Get precise scores on profit leaks, operational waste, and digital visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {DIAGNOSTIC_TOOLS.map((tool) => (
              <Link 
                key={tool.id} 
                href={tool.href}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-2xl bg-${tool.color}/10 flex items-center justify-center mb-6 border border-${tool.color}/20 group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined text-${tool.color}`}>{tool.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-ios-blue transition-colors">{tool.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-8">{tool.desc}</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ios-blue opacity-60 group-hover:opacity-100 transition-opacity">
                  <span>Start Diagnostics</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-24 text-center">
            <div className="inline-block p-1 rounded-2xl bg-gradient-to-br from-white/10 to-transparent">
              <div className="bg-background-dark px-10 py-8 rounded-[1.2rem] max-w-2xl">
                <h2 className="text-xl font-bold text-white mb-4">Need a Full Architectural Review?</h2>
                <p className="text-white/40 text-sm mb-8 leading-relaxed">
                  Our team of AI consultants can perform a deep-dive audit of your entire digital infrastructure, 
                  identifying bespoke growth opportunities and custom AI integrations.
                </p>
                <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-ios-blue text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 transition-all">
                  Book Professional Audit
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
