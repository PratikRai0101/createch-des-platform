"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import TopScenarioBar from "@/components/layout/TopScenarioBar";
import { SiteSimulationProvider } from "@/context/SiteSimulationContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ToastBridge from "@/components/ToastBridge";
import ConnectionBanner from "@/components/ConnectionBanner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <SiteSimulationProvider>
        <ToastProvider>
          <ConnectionBanner />
          <ToastBridge />
          <div className="flex h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
              <button
                onClick={() => setSidebarOpen(true)}
                className="fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-gray-700"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <TopScenarioBar />
              {children}
            </div>
          </div>
        </ToastProvider>
      </SiteSimulationProvider>
    </ThemeProvider>
  );
}
