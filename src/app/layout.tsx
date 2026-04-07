import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { OlisticazziGradientOverlay } from "@/components/olisticazzi/OlisticazziGradientOverlay";
import "@/services/db";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Olisticazzi",
  description: "Il tuo tracker spirituale dell'umore"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        <OlisticazziGradientOverlay />
        {children}
      </body>
    </html>
  );
}
