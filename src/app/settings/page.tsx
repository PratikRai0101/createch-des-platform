"use client";

import { Settings, Shield, Bell, Database, Users, Building, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("project");

  const tabs = [
    { id: "project", label: "Project Details", icon: <Building className="w-4 h-4" /> },
    { id: "users", label: "Access & Roles", icon: <Users className="w-4 h-4" /> },
    { id: "integration", label: "IoT Integrations", icon: <Database className="w-4 h-4" /> },
    { id: "alerts", label: "Alert Thresholds", icon: <Bell className="w-4 h-4" /> },
    { id: "security", label: "Security & Audit", icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="text-[#0077c8]" />
            System Configuration
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage Platform Settings & API Connections</p>
        </div>
        <button className="px-5 py-2 text-sm font-semibold text-white bg-[#0077c8] hover:bg-[#0066ad] rounded-lg shadow-sm flex items-center gap-2 transition-colors">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </header>

      <div className="p-8 max-w-[1200px] mx-auto w-full flex gap-8">
        
        {/* Settings Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === tab.id 
                    ? "bg-[#0077c8] text-white shadow-md" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content area */}
        <div className="flex-1">
          {activeTab === "project" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Global Project Parameters</h3>
                <p className="text-xs text-gray-500 mb-6">Core metadata for the AI structural engine.</p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Project ID</label>
                    <input type="text" disabled defaultValue="PRJ-LT-2024-089" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Project Name</label>
                    <input type="text" defaultValue="L&T Infra Hub - Zone 4" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 focus:border-[#0077c8] focus:ring-1 focus:ring-[#0077c8] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Target Completion Date</label>
                    <input type="date" defaultValue="2025-11-30" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 focus:border-[#0077c8] focus:ring-1 focus:ring-[#0077c8] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Baseline Budget (INR)</label>
                    <input type="text" defaultValue="₹ 450,000,000" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 focus:border-[#0077c8] focus:ring-1 focus:ring-[#0077c8] outline-none transition-all" />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">AI Engine Configuration</h3>
                <p className="text-xs text-gray-500 mb-6">Determine how aggressively the generative model should optimize.</p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">Autonomous Recalibration</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Allow the AI to automatically commit minor tolerance adjustments without manual approval.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0077c8]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">Strict Cost Boundaries</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Prevent generative model from selecting geometries that exceed baseline material costs.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0077c8]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "project" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-300 min-h-[400px]">
              <Settings className="w-12 h-12 text-gray-300 mb-4 animate-[spin_4s_linear_infinite]" />
              <h3 className="text-lg font-bold text-gray-800">Module Under Construction</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                The {tabs.find(t => t.id === activeTab)?.label} configuration panel is scheduled for the next platform update.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
