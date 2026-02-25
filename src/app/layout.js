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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans antialiased bg-background-dark text-white selection:bg-primary/30 min-h-screen overflow-x-hidden`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
