import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { MoonmoodGradientOverlay } from "@/components/moonmood/MoonmoodGradientOverlay";
import { GradientIntensityProvider } from "@/context/GradientIntensityContext";
import "@/services/db";

import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Moonmood",
  description: "Il tuo tracker spirituale dell'umore"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${outfit.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen bg-black text-white font-body">
        <GradientIntensityProvider>
          <MoonmoodGradientOverlay />
          {children}
        </GradientIntensityProvider>
      </body>
    </html>
  );
}
