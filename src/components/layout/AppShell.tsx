"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopScenarioBar from "@/components/layout/TopScenarioBar";
import { SiteSimulationProvider } from "@/context/SiteSimulationContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ToastBridge from "@/components/ToastBridge";
import ConnectionBanner from "@/components/ConnectionBanner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Default open on desktop (≥1024px), closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <ThemeProvider>
      <SiteSimulationProvider>
        <ToastProvider>
          <ConnectionBanner />
          <ToastBridge />
          <div className="flex h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
              <TopScenarioBar onToggleSidebar={toggleSidebar} />
              {children}
            </div>
          </div>
        </ToastProvider>
      </SiteSimulationProvider>
    </ThemeProvider>
  );
}
