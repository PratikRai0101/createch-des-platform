"use client";

import { useState } from "react";
import { Cpu, Settings, Save, RefreshCw, Layers, SlidersHorizontal, Share2, Play, Zap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DigitalTwinCanvas from "@/components/DigitalTwinCanvas";

// Type matching our Python API
interface GenerativeOption {
  id: string;
  name: string;
  depth_m: number;
  cost_inr: number;
  carbon_tco2e: number;
  construction_time_days: number;
  confidence_score: number;
}

export default function GenerativeDesignPage() {
  const [activeModel, setActiveModel] = useState("structural");
  
  // State for parameters
  const [deviation, setDeviation] = useState(25); // default out of plumb
  const [soilCapacity, setSoilCapacity] = useState(380);
  const [safetyFactor, setSafetyFactor] = useState(1.5);
  
  // State for AI generation
  const [isComputing, setIsComputing] = useState(false);
  const [options, setOptions] = useState<GenerativeOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const runGenerativeOptimization = async () => {
    setIsComputing(true);
    setOptions([]);
    setSelectedOptionId(null);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/optimize-geometry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soil_bearing_capacity: soilCapacity,
          deviation_mm: deviation,
          max_deflection_tolerance: 15,
          material_density: 2400,
          safety_factor: safetyFactor
        })
      });
      
      const data = await res.json();
      
      // Simulate computation time for dramatic effect
      setTimeout(() => {
        setOptions(data.options);
        setSelectedOptionId(data.recommended_option_id);
        setIsComputing(false);
      }, 2500);
      
    } catch (err) {
      console.error("Failed to fetch from AI API:", err);
      setIsComputing(false);
    }
  };

  const selectedOption = options.find(o => o.id === selectedOptionId);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Cpu className="text-[#0077c8]" />
            Generative Design Studio
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Parameter Tuning & Model Management (Connected to Python AI Engine)</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Reset Defaults
          </button>
          <button 
            onClick={runGenerativeOptimization}
            disabled={isComputing}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm flex items-center gap-2 transition-colors ${
              isComputing ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isComputing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isComputing ? 'Running ML Model...' : 'Run Generative Optimization'}
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
              Live Site Constraints (Inputs)
            </h3>
            <div className="space-y-6">
              <ParameterSlider label="Current Deviation (mm)" value={`${deviation}mm`} min="0" max="50" val={deviation} setVal={setDeviation} />
              <ParameterSlider label="Soil Bearing Capacity (kPa)" value={`${soilCapacity} kPa`} min="250" max="500" val={soilCapacity} setVal={setSoilCapacity} />
              <ParameterSlider label="Safety Factor Override" value={`${safetyFactor}x`} min="1.1" max="2.5" step="0.1" val={safetyFactor} setVal={setSafetyFactor} />
            </div>
          </div>
        </div>

        {/* Right Column - Generation Output */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* Options Gallery */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              AI Generated Structural Options
            </h3>
            
            {options.length === 0 && !isComputing ? (
              <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-500 flex flex-col items-center justify-center min-h-[150px]">
                <Cpu className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium">Awaiting parameters.</p>
                <p className="text-xs mt-1">Click "Run Generative Optimization" to invoke the Python ML backend.</p>
              </div>
            ) : isComputing ? (
              <div className="p-8 border border-purple-100 bg-purple-50/50 rounded-xl text-center flex flex-col items-center justify-center min-h-[150px]">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <RefreshCw className="w-8 h-8 text-purple-500 mb-3" />
                </motion.div>
                <p className="text-sm font-bold text-purple-800">Solving Constraint Matrix...</p>
                <p className="text-xs text-purple-600 mt-1">Running 10,000 Monte Carlo simulations via Python Backend.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {options.map((opt) => (
                  <div 
                    key={opt.id}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                      selectedOptionId === opt.id 
                        ? "border-purple-500 bg-purple-50 shadow-md scale-[1.02]" 
                        : "border-gray-100 hover:border-purple-200 hover:bg-gray-50"
                    }`}
                  >
                    {selectedOptionId === opt.id && (
                      <div className="absolute -top-3 -right-3 bg-purple-500 text-white rounded-full p-1 shadow-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    <h4 className="font-bold text-gray-800 text-sm mb-3">{opt.name}</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Z-Depth</span>
                        <span className="font-mono font-bold text-blue-600">{opt.depth_m * 1000}mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Est. Cost</span>
                        <span className="font-mono font-bold text-emerald-600">₹{opt.cost_inr.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Carbon</span>
                        <span className="font-mono font-bold text-gray-700">{opt.carbon_tco2e} tCO2e</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                        <span className="text-gray-500">AI Confidence</span>
                        <span className="font-mono font-bold text-purple-600">{Math.round(opt.confidence_score * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3D Preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800">3D Generative Output Preview</h3>
            </div>
            
            <div className="flex-1 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-700 shadow-inner bg-slate-900">
              
              {selectedOption ? (
                <DigitalTwinCanvas 
                  deviation={deviation} 
                  status="STABLE" 
                  baseDepth={0.5} 
                  newDepth={selectedOption.depth_m} 
                  aiOptimized={true} 
                />
              ) : (
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
              )}

              {/* Mock Overlay Stats */}
              {selectedOption && (
                <div className="absolute bottom-6 left-6 right-6 flex justify-between pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Active Material</p>
                    <p className="text-white font-mono font-bold">M40 Concrete</p>
                  </div>
                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Schedule Impact</p>
                    <p className="text-white font-mono font-bold">{selectedOption.construction_time_days} Days</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParameterSlider({ label, value, min, max, step = "1", val, setVal }: any) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <label className="text-xs font-semibold text-gray-700">{label}</label>
        <span className="text-xs font-bold text-[#0077c8] bg-blue-50 px-2 py-0.5 rounded">{value}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0077c8]"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{min}</span>
        <span className="text-[10px] text-gray-400">{max}</span>
      </div>
    </div>
  );
}
