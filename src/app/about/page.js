import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: "About MasterKey Labs | Our AI Methodology & Business Protocols",
  description: "Learn about MasterKey Labs' global AI implementation strategy. From Indore to the world, we help businesses automate operations, build custom digital infrastructure, and identify profit leaks with professional diagnostic tools.",
};

export default function AboutPage() {
  return (
    <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden">
      {/* Minimal Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      <div className="fixed top-0 left-0 w-full h-screen spotlight pointer-events-none z-0"></div>

      <Header activeSection="about" />

      <main className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-6">
          
          {/* Hero Section */}
          <section className="max-w-4xl mx-auto text-center mb-24">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-8">
              Designing the <span className="text-ios-blue">Systems</span> of Tomorrow.
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed font-light">
              MasterKey Labs is a global AI implementation and business consulting agency, founded in Indore, India. 
              We help businesses worldwide — from growing SMBs to established enterprises — automate their operations, 
              build digital infrastructure, and stay competitive in an AI-driven economy.
            </p>
          </section>

          {/* Core Philosophy */}
          <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 mb-32">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-ios-blue/30 pb-4">Our Methodology</h2>
              <p className="text-white/50 leading-relaxed">
                We don&apos;t just build apps; we build the digital nervous system for your business. 
                Our approach combines deep technical expertise with strategic business intelligence. 
                Whether you&apos;re digitising a legacy business or building your first AI workflow, 
                MasterKey Labs designs the systems that make it happen.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-ios-blue/30 pb-4">Service Scope</h2>
              <ul className="grid grid-cols-2 gap-4 text-white/50 text-sm">
                <li>• AI Automation</li>
                <li>• Brand & Identity Design</li>
                <li>• Web & App Development</li>
                <li>• CRM Systems</li>
                <li>• Performance Marketing</li>
                <li>• Business Strategy</li>
              </ul>
            </div>
          </section>

          {/* Enterprise Protocols */}
          <section className="max-w-4xl mx-auto bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-16 mb-32 backdrop-blur-md">
            <h2 className="text-white/30 uppercase text-[10px] font-black tracking-[0.3em] mb-12 text-center">Enterprise Scaling Protocols</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white/50 leading-relaxed font-light">
              <div>
                <h3 className="text-ios-blue font-bold uppercase text-xs tracking-widest mb-4">Core Infrastructure</h3>
                <p>
                  From custom CRM deployments to automated ERP synchronization, MasterKey Labs 
                  ensures your data flows seamlessly across all departments, eliminating silos and waste.
                </p>
              </div>
              <div>
                <h3 className="text-ios-blue font-bold uppercase text-xs tracking-widest mb-4">AI Implementation</h3>
                <p>
                  Deploy autonomous agents and custom-trained LLMs directly into your workflow. 
                  Our AI solutions are designed to provide real-time business intelligence for faster decision-making.
                </p>
              </div>
            </div>
          </section>

          {/* Diagnostic Intelligence */}
          <section className="max-w-5xl mx-auto mb-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Diagnostic Intelligence</h2>
              <p className="text-white/40 max-w-2xl mx-auto">
                Our proprietary tools measure your business readiness for the AI economy with precise scores on profit leaks and visibility.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                <h4 className="text-white font-bold mb-3">Profit Leak Audit</h4>
                <p className="text-xs text-white/40 leading-relaxed">Scan your business for hidden operational inefficiencies draining your bottom line.</p>
              </div>
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                <h4 className="text-white font-bold mb-3">Night Loss Scanner</h4>
                <p className="text-xs text-white/40 leading-relaxed">Calculate revenue lost when leads go unanswered while your team is offline.</p>
              </div>
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                <h4 className="text-white font-bold mb-3">AI Extinction Timer</h4>
                <p className="text-xs text-white/40 leading-relaxed">Measure displacement risk scores for roles and industries based on automation saturation.</p>
              </div>
            </div>
          </section>

          {/* Final Statement */}
          <section className="max-w-2xl mx-auto text-center border-t border-white/5 pt-20">
            <p className="text-white/30 italic font-serif text-lg leading-relaxed mb-8">
              &quot;In the AI economy, speed is currency and systems are the vault.&quot;
            </p>
            <div className="text-ios-blue font-black uppercase text-[10px] tracking-widest">MasterKey Labs • Global Operations</div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
