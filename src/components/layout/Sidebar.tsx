"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Cpu,
  Activity,
  Construction,
  BarChart4,
  Settings,
  Box,
  X,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import React from "react";

const navItems = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: "Command Center", href: "/" },
  { icon: <Cpu className="w-5 h-5" />, label: "Generative Design", href: "/generative-design" },
  { icon: <Activity className="w-5 h-5" />, label: "IoT Sensors", href: "/iot-sensors" },
  { icon: <Construction className="w-5 h-5" />, label: "Site Execution", href: "/execution" },
  { icon: <BarChart4 className="w-5 h-5" />, label: "Analytics", href: "/analytics" },
  { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/settings" },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[#003366]">
        <div className="bg-white p-2 rounded-lg shadow-sm">
          <Box className="w-6 h-6 text-[#0077c8]" />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-lg leading-tight tracking-tight">CreaTech</h1>
          <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold mt-0.5">Dynamic Engineering</p>
        </div>
        {/* Close button for mobile */}
        <button onClick={onClose} className="lg:hidden text-blue-200 hover:text-white p-1" aria-label="Close sidebar">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden group ${
                isActive ? "text-white" : "text-blue-100 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-[#0077c8] rounded-xl z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, ease: "circOut" }}
                />
              )}
              {/* Hover effect for inactive items */}
              {!isActive && (
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl z-0" />
              )}

              <div className="relative z-10 flex items-center gap-3">
                {item.icon}
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-5 bg-gradient-to-br from-[#003366] to-[#002244] m-4 rounded-2xl border border-white/5 shadow-inner">
        <p className="text-[10px] text-blue-200/80 uppercase tracking-widest font-bold mb-1.5">Active Project</p>
        <p className="font-bold text-sm text-white mb-4">L&T Infra Hub - Zone 4</p>
        <div className="bg-[#001122] rounded-full h-2 w-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "45%" }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="bg-gradient-to-r from-[#0077c8] to-[#00aaff] h-full rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'skewX(-20deg)' }}></div>
          </motion.div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-[10px] font-medium text-blue-300">Phase 2 Execution</p>
          <p className="text-[11px] text-white font-black bg-white/10 px-2 py-0.5 rounded">45%</p>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="p-4 border-t border-[#003366]">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-blue-100 hover:text-white hover:bg-white/5 transition-all w-full"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar (overlay) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-[#00447c] text-white flex flex-col shadow-2xl lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (always visible) */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#00447c] text-white flex-shrink-0 h-screen sticky top-0 shadow-2xl">
        {sidebarContent}
      </aside>
    </>
  );
}
