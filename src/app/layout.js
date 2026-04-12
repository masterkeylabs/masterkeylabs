import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata = {
  title: "MasterKey Labs.ai Command Center",
  description: "AI-Powered Diagnostic Terminal for Business Intelligence",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import { ThemeProvider } from '@/lib/ThemeContext';


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700;900&display=swap" rel="stylesheet" crossOrigin="anonymous" />
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{
          __html: `
          (function(){
            try {
              var t = localStorage.getItem('mkos_theme') || 'dark';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e){}
          })();
        `}} />
        {/* Structured Data (JSON-LD) for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["Organization", "ProfessionalService"],
                  "@id": "https://www.masterkeylabs.ai/#organization",
                  "name": "MasterKey Labs",
                  "alternateName": "MasterKey Labs AI",
                  "url": "https://www.masterkeylabs.ai",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.masterkeylabs.ai/logo-stacked.png"
                  },
                  "description": "MasterKey Labs is an AI implementation and business consulting agency based in Indore, India, that helps small and mid-sized businesses in real estate, logistics, manufacturing, and export-import automate operations, build digital infrastructure, and grow in an AI-driven economy.",
                  "foundingLocation": {
                    "@type": "Place",
                    "name": "Indore, Madhya Pradesh, India"
                  },
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Indore",
                    "addressRegion": "Madhya Pradesh",
                    "addressCountry": "IN"
                  },
                  "areaServed": [
                    {
                      "@type": "Country",
                      "name": "India"
                    },
                    {
                      "@type": "City",
                      "name": "Dubai"
                    }
                  ],
                  "knowsAbout": [
                    "AI Automation",
                    "Business Consulting",
                    "Brand Identity Design",
                    "Website Development",
                    "App Development",
                    "Performance Marketing",
                    "CRM Systems",
                    "SaaS Products",
                    "Business Digitalization"
                  ],
                  "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "MasterKey Labs Services",
                    "itemListElement": [
                      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AI Automation & Autonomous Agents" } },
                      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Business Digitalization" } },
                      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Brand & Identity Design" } },
                      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Website & App Development" } },
                      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Leads & Growth Marketing" } },
                      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Strategy & Market Intelligence" } }
                    ]
                  },
                  "sameAs": []
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.masterkeylabs.ai/#website",
                  "url": "https://www.masterkeylabs.ai",
                  "name": "MasterKey Labs",
                  "publisher": {
                    "@id": "https://www.masterkeylabs.ai/#organization"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} font-sans antialiased bg-background-dark text-white selection:bg-primary/30 min-h-screen overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
