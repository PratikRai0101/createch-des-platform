import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import TopScenarioBar from "@/components/layout/TopScenarioBar";
import { SiteSimulationProvider } from "@/context/SiteSimulationContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "L&T CreaTech | Dynamic Engineering System",
  description: "AI-Driven Generative Design & Autonomous Construction Site Execution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f8fafc] text-gray-900 font-sans overflow-hidden flex h-screen`}>
        <SiteSimulationProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
            <TopScenarioBar />
            {children}
          </div>
        </SiteSimulationProvider>
      </body>
    </html>
  );
}
