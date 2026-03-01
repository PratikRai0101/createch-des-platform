"use client";

import { useState } from "react";
import { Cpu, Settings, Save, RefreshCw, Layers, SlidersHorizontal, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export default function GenerativeDesignPage() {
  const [activeModel, setActiveModel] = useState("structural");

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Cpu className="text-[#0077c8]" />
            Generative Design Studio
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Parameter Tuning & Model Management</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Reset Defaults
          </button>
          <button className="px-4 py-2 text-sm font-semibold text-white bg-[#0077c8] hover:bg-[#0066ad] rounded-lg shadow-sm flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </header>

      <div className="p-8 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left Column - Model Selection & Parameters */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              Active Sub-Models
            </h3>
            <div className="space-y-3">
              {[
                { id: "structural", name: "Structural Foundation", status: "Active" },
                { id: "hvac", name: "HVAC Routing (MEP)", status: "Standby" },
                { id: "facade", name: "Facade Load Optimization", status: "Computing..." }
              ].map(model => (
                <div 
                  key={model.id}
                  onClick={() => setActiveModel(model.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activeModel === model.id 
                      ? "border-[#0077c8] bg-blue-50/50 shadow-sm" 
                      : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-gray-800">{model.name}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      model.status === "Active" ? "bg-green-100 text-green-700" :
                      model.status === "Computing..." ? "bg-amber-100 text-amber-700 animate-pulse" :
                      "bg-gray-100 text-gray-600"
                    }`}>{model.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">v2.4.1 • Last synced: 2m ago</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-500" />
              Constraint Parameters
            </h3>
            <div className="space-y-6">
              <ParameterSlider label="Max Deflection Tolerance" value="15mm" min="5" max="50" defaultValue={15} />
              <ParameterSlider label="Material Density (Concrete)" value="2400 kg/m³" min="2000" max="2800" defaultValue={2400} />
              <ParameterSlider label="Safety Factor Override" value="1.5x" min="1.1" max="2.5" defaultValue={1.5} step={0.1} />
              <ParameterSlider label="Generative Iterations" value="5,000" min="1000" max="20000" defaultValue={5000} step={1000} />
            </div>
          </div>
        </div>

        {/* Right Column - Generation Output / Empty State for Canvas */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col min-h-[600px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800">Generative Output Preview</h3>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-[#0077c8] bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-[#0077c8] bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-[#111] rounded-xl relative overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner group">
              {/* Fallback pattern since we don't load the full 3D canvas here to keep it light */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
              
              <div className="text-center relative z-10 max-w-sm">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-6"
                />
                <h4 className="text-white font-bold text-xl mb-2">Simulating Load Cases</h4>
                <p className="text-gray-400 text-sm">Running 5,000 Monte Carlo variations based on selected constraints. Estimated time remaining: 1m 24s</p>
              </div>

              {/* Mock Overlay Stats */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Calculated Mass</p>
                  <p className="text-white font-mono font-bold">12,450 kg</p>
                </div>
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Carbon Footprint</p>
                  <p className="text-white font-mono font-bold">14.2 tCO2e</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParameterSlider({ label, value, min, max, defaultValue, step = 1 }: any) {
  const [val, setVal] = useState(defaultValue);
  
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <label className="text-xs font-semibold text-gray-700">{label}</label>
        <span className="text-xs font-bold text-[#0077c8] bg-blue-50 px-2 py-0.5 rounded">{value.replace(defaultValue, val)}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0077c8]"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{min}</span>
        <span className="text-[10px] text-gray-400">{max}</span>
      </div>
    </div>
  );
}
