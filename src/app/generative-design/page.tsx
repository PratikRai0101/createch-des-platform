"use client";

import { useState, useMemo } from "react";
import { Cpu, Settings, Save, RefreshCw, Layers, SlidersHorizontal, Share2, Play, Zap, CheckCircle2, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DigitalTwinCanvas from "@/components/DigitalTwinCanvas";

// --- TYPES & INTERFACES ---
interface GenerativeOption {
  id: string;
  name: string;
  depth_m: number;
  cost_inr: number;
  carbon_tco2e: number;
  construction_time_days: number;
  confidence_score: number;
  reason?: string;
  weightedScore: number;
}

interface Weights {
  cost: number;
  carbon: number;
  time: number;
}

interface OptimizationApiResponse {
  options: Omit<GenerativeOption, "weightedScore">[];
  recommended_option_id: string;
  decision_trace?: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_BASE_URL || "http://127.0.0.1:8000";

export default function GenerativeDesignPage() {
  const [activeModel, setActiveModel] = useState("structural");
  const [deviation, setDeviation] = useState(25);
  const [soilCapacity, setSoilCapacity] = useState(380);
  const [safetyFactor, setSafetyFactor] = useState(1.5);
  const [isComputing, setIsComputing] = useState(false);
  const [options, setOptions] = useState<Omit<GenerativeOption, "weightedScore">[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [decisionTrace, setDecisionTrace] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [weights, setWeights] = useState<Weights>({ cost: 33, carbon: 33, time: 34 });

  // --- LOGIC: WEIGHT BALANCING ---
  const updateWeight = (key: keyof Weights, value: number) => {
    setWeights((prev) => {
      const clampedValue = Math.max(0, Math.min(100, value));
      const diff = clampedValue - prev[key];
      const others = Object.keys(prev).filter((k) => k !== key) as (keyof Weights)[];
      const totalOther = others.reduce((sum, k) => sum + prev[k], 0);

      const newWeights = { ...prev, [key]: clampedValue };
      others.forEach((k) => {
        newWeights[k] = totalOther === 0 ? 33 : Math.max(0, Math.round(prev[k] - (prev[k] / totalOther) * diff));
      });

      const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
      if (sum !== 100) newWeights[others[0]] += (100 - sum);
      return newWeights;
    });
  };

  // --- LOGIC: REAL-TIME RANKING ---
  const rankedOptions = useMemo(() => {
    if (options.length === 0) return [];

    const getMinMax = (key: keyof Omit<GenerativeOption, "id" | "name" | "reason" | "weightedScore">) => {
      const vals = options.map(o => o[key] as number);
      return { min: Math.min(...vals), max: Math.max(...vals) };
    };

    const cost = getMinMax("cost_inr");
    const carbon = getMinMax("carbon_tco2e");
    const time = getMinMax("construction_time_days");

    const normalize = (val: number, min: number, max: number) => 
      max === min ? 0.5 : 1 - (val - min) / (max - min);

    return options.map(opt => ({
      ...opt,
      weightedScore: (
        (weights.cost * normalize(opt.cost_inr, cost.min, cost.max)) +
        (weights.carbon * normalize(opt.carbon_tco2e, carbon.min, carbon.max)) +
        (weights.time * normalize(opt.construction_time_days, time.min, time.max))
      ) / 100
    })).sort((a, b) => b.weightedScore - a.weightedScore);
  }, [options, weights]);

  const runGenerativeOptimization = async () => {
    setIsComputing(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/optimize-geometry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soil_bearing_capacity: soilCapacity,
          deviation_mm: deviation,
          safety_factor: safetyFactor,
        }),
      });
      if (!res.ok) throw new Error("API Failed");
      const data: OptimizationApiResponse = await res.json();
      
      setOptions(data.options);
      setSelectedOptionId(data.recommended_option_id);
      setDecisionTrace(data.decision_trace ?? []);
    } catch (err) {
      setApiError("AI Backend unreachable. Check if FastAPI is running.");
    } finally {
      setIsComputing(false);
    }
  };

  const selectedOption = rankedOptions.find((o) => o.id === selectedOptionId);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Cpu className="text-[#0077c8]" />
            Generative Design Studio
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Connected to Python AI Engine</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setWeights({ cost: 33, carbon: 33, time: 34 })} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          <button onClick={runGenerativeOptimization} disabled={isComputing} className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm flex items-center gap-2 ${isComputing ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"}`}>
            {isComputing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isComputing ? "Solving..." : "Run Optimization"}
          </button>
        </div>
      </header>

      <div className="p-8 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left Column: Controls */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Constraints</h3>
            <div className="space-y-6">
              <ParameterSlider label="Current Deviation (mm)" value={`${deviation}mm`} min="0" max="50" val={deviation} setVal={setDeviation} />
              <ParameterSlider label="Soil Capacity (kPa)" value={`${soilCapacity} kPa`} min="250" max="500" val={soilCapacity} setVal={setSoilCapacity} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Scale className="w-4 h-4" /> Tradeoff Weights</h3>
            <div className="space-y-4">
              <TradeWeightSlider label="Cost" value={weights.cost} color="bg-emerald-500" onChange={(v: number) => updateWeight("cost", v)} />
              <TradeWeightSlider label="Carbon" value={weights.carbon} color="bg-green-500" onChange={(v: number) => updateWeight("carbon", v)} />
              <TradeWeightSlider label="Time" value={weights.time} color="bg-blue-500" onChange={(v: number) => updateWeight("time", v)} />
            </div>
          </div>
        </div>

        {/* Right Column: Results & 3D */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> AI Generated Options</h3>
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {rankedOptions.map((opt, idx) => (
                  <div key={opt.id} onClick={() => setSelectedOptionId(opt.id)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedOptionId === opt.id ? "border-purple-500 bg-purple-50" : "border-gray-100 hover:bg-gray-50"}`}>
                    <div className="flex justify-between mb-2">
                      <h4 className="font-bold text-sm">{opt.name}</h4>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">#{idx+1}</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between"><span>Score</span><span className="font-bold">{Math.round(opt.weightedScore * 100)}%</span></div>
                      <div className="flex justify-between"><span>Cost</span><span>₹{opt.cost_inr.toLocaleString()}</span></div>
                    </div>
                  </div>
                ))}
             </div>
             {apiError && <p className="text-red-500 text-xs mt-4">{apiError}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 min-h-[400px] flex flex-col">
            <div className="flex-1 rounded-xl bg-slate-900 relative overflow-hidden flex items-center justify-center">
              {selectedOption ? (
                <DigitalTwinCanvas deviation={deviation} status="STABLE" baseDepth={0.5} newDepth={selectedOption.depth_m} aiOptimized={true} />
              ) : (
                <p className="text-gray-500 text-sm">Select an AI option to preview</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
interface TradeWeightSliderProps {
  label: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
}

function TradeWeightSlider({ label, value, color, onChange }: TradeWeightSliderProps) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span>{label}</span><span className="font-bold">{value}%</span></div>
      <input type="range" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-blue-600" />
    </div>
  );
}

interface ParameterSliderProps {
  label: string;
  value: string;
  min: string;
  max: string;
  val: number;
  setVal: (v: number) => void;
}

function ParameterSlider({ label, value, min, max, val, setVal }: ParameterSliderProps) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span>{label}</span><span className="text-blue-600 font-bold">{value}</span></div>
      <input type="range" min={min} max={max} value={val} onChange={(e) => setVal(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-blue-600" />
    </div>
  );
}