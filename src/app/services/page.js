import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceList from '@/components/ServiceList';

export const metadata = {
  title: "Our Services | AI Automation, Brand Design & Digital Infrastructure – MasterKey Labs",
  description: "Explore MasterKey Labs' full service range: AI automation and autonomous agents, business digitalization, brand and identity design, website and app development, CRM systems, performance marketing, and business strategy consulting.",
};

export default function ServicesPage() {
  return (
    <div className="bg-background-dark font-sans text-slate-100 min-h-screen selection:bg-ios-blue/30 selection:text-ios-blue overflow-x-hidden">
      {/* Minimal Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      <div className="fixed top-0 left-0 w-full h-screen spotlight pointer-events-none z-0"></div>

      <Header activeSection="services" />

      <main className="relative z-10 pt-12 md:pt-20">
        <ServiceList />
        
        {/* Additional SSR-friendly content for SEO */}
        <section className="container mx-auto px-6 py-20 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 tracking-tight">Enterprise Scaling Protocols</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white/50 leading-relaxed font-light">
              <div>
                <h3 className="text-ios-blue font-bold uppercase text-xs tracking-widest mb-4">Core Infrastructure</h3>
                <p>
                  We don&apos;t just build apps; we build the digital nervous system for your business. 
                  From custom CRM deployments to automated ERP synchronization, MasterKey Labs 
                  ensures your data flows seamlessly across all departments.
                </p>
              </div>
              <div>
                <h3 className="text-ios-blue font-bold uppercase text-xs tracking-widest mb-4">AI Implementation</h3>
                <p>
                  Deploy autonomous agents and custom-trained LLMs directly into your workflow. 
                  Our AI solutions are designed to eliminate operational waste and provide 
                  real-time business intelligence for faster decision-making.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
