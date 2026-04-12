import HomeClient from '@/components/HomeClient';

export const metadata = {
  title: "MasterKey Labs | AI Implementation, Business Consulting & Digital Infrastructure",
  description: "MasterKey Labs is a global AI implementation agency founded in Indore, India. We help businesses worldwide automate operations, build digital infrastructure, and scale with AI. Explore our AI Extinction Timer, Business Profit Diagnostics, and bespoke automation services for SMBs and enterprises.",
  keywords: ["AI Automation", "Business Consulting", "Digital Infrastructure", "AI Extinction Timer", "Business Diagnostics", "CRM Implementation", "Brand Identity", "Indore AI Agency"],
};

export default function Home() {
  return (
    <>
      <HomeClient />
      
      {/* 
          SSR-Visible SEO Content Block 
          Hidden from visual UI (or subtly integrated) but available to AI Crawlers & SEO
      */}
      <div className="border-t border-white/5">
        
        {/* About Section */}
        <section id="about-seo" className="bg-black py-20 px-6 border-t border-white/5">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-white/30 uppercase text-[10px] font-black tracking-[0.3em] mb-8">Executive Summary</h2>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed font-light">
              MasterKey Labs is a global AI implementation and business consulting agency, founded in Indore, India. 
              We help businesses worldwide — from growing SMBs to established enterprises — automate their operations, 
              build digital infrastructure, and stay competitive in an AI-driven economy. Our services span AI automation, 
              brand and identity design, website and app development, performance marketing, CRM systems, and business strategy. 
              Whether you&apos;re digitising a legacy business or building your first AI workflow, MasterKey Labs designs 
              the systems that make it happen.
            </p>
          </div>
        </section>

        {/* Services SEO Section */}
        <section id="services-seo" className="bg-black py-20 px-6 border-t border-white/5">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-white/30 uppercase text-[10px] font-black tracking-[0.3em] mb-8">Enterprise Scaling Protocols</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white/50 text-left leading-relaxed font-light">
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

        {/* Diagnostics SEO Section */}
        <section id="diagnostics-seo" className="bg-black py-20 px-6 border-t border-white/5">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-white/30 uppercase text-[10px] font-black tracking-[0.3em] mb-8">Free Business Intelligence & Diagnostics</h2>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed font-light mb-12">
              Use our professional diagnostic tools to measure your business readiness for the AI economy. 
              Get precise scores on profit leaks, operational waste, and digital visibility.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <h3 className="text-white font-bold mb-2">Operational Waste Audit</h3>
                <p className="text-sm text-white/40">Scan your business for hidden operational inefficiencies and profit leaks draining your bottom line.</p>
              </div>
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <h3 className="text-white font-bold mb-2">Night Loss Scanner</h3>
                <p className="text-sm text-white/40">Calculate exactly how much revenue you are losing when your team is offline and leads go unanswered.</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Threat SEO Section */}
        <section id="ai-threat-seo" className="bg-black py-20 px-6 border-t border-white/5">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-white/30 uppercase text-[10px] font-black tracking-[0.3em] mb-8">AI Extinction Timer</h2>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed font-light">
              Find out how AI will impact your business or job in the next 2–3 years. MasterKey Labs&apos; AI Extinction Timer 
              gives you a personalised displacement risk score based on your industry and role. Our algorithm factors in 
              automation saturation, AI maturity, and role-specific vulnerability to provide an accurate &quot;extinction horizon.&quot;
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

