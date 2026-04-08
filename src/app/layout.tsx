import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { MoonmoodGradientOverlay } from "@/components/moonmood/MoonmoodGradientOverlay";
import { GradientIntensityProvider } from "@/context/GradientIntensityContext";
import { BottomNav } from "@/components/layout/BottomNav";
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
      <body
        className="min-h-screen font-body"
        style={{ backgroundColor: "var(--bg-0)", color: "var(--text-primary)" }}
      >
        <GradientIntensityProvider>
          <MoonmoodGradientOverlay />
          {/* Page content — centered, max-width container with nav padding */}
          <div
            className="relative mx-auto w-full max-w-lg min-h-screen"
            style={{ paddingBottom: "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))" }}
          >
            {children}
          </div>
          <BottomNav />
        </GradientIntensityProvider>
      </body>
    </html>
  );
}
