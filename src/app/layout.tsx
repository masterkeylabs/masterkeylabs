import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import SpaceBackground from "@/components/layout/SpaceBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Masterkey Labs | AI Transition Hub",
  description: "Elite AI transformation agency for next-gen automation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SpaceBackground />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
