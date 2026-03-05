import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata = {
  title: "Masterkey.OS | Command Center",
  description: "AI-Powered Diagnostic Terminal for Business Intelligence",
};

import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import { ThemeProvider } from '@/lib/ThemeContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
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
