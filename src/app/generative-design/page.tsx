"use client";

import { useState, useMemo } from "react";
import { Cpu, RefreshCw, Layers, SlidersHorizontal, Play, Zap, CheckCircle2, Scale } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
const DigitalTwinCanvas = dynamic(() => import("@/components/DigitalTwinCanvas"), { ssr: false });

interface GenerativeOption {
  id: string;
  name: string;
  depth_m: number;
  cost_inr: number;
  carbon_tco2e: number;
  construction_time_days: number;
  confidence_score: number;
  reason: string;
}

interface OptimizationApiResponse {
  options: GenerativeOption[];
  recommended_option_id: string;
  decision_trace: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_BASE_URL ?? "http://127.0.0.1:8000";

interface Weights {
  cost: number;
  carbon: number;
  time: number;
}

export default function GenerativeDesignPage() {
  const [activeModel, setActiveModel] = useState("structural");

  const [deviation, setDeviation] = useState(25);
  const [soilCapacity, setSoilCapacity] = useState(380);
  const [safetyFactor, setSafetyFactor] = useState(1.5);

  const [isComputing, setIsComputing] = useState(false);
  const [options, setOptions] = useState<GenerativeOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [decisionTrace, setDecisionTrace] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const [weights, setWeights] = useState<Weights>({ cost: 33, carbon: 33, time: 34 });

  const updateWeight = (key: keyof Weights, value: number) => {
    setWeights((prev) => {
      const clampedValue = Math.max(0, Math.min(100, value));
      const diff = clampedValue - prev[key];
      const others = Object.keys(prev).filter((k) => k !== key) as (keyof Weights)[];
      const totalOther = others.reduce((sum, k) => sum + prev[k], 0);

      if (totalOther === 0) {
        const evenShare = 100 / others.length;
        return { ...prev, [key]: clampedValue, ...Object.fromEntries(others.map((k) => [k, Math.round(evenShare)])) } as Weights;
      }

      const newWeights = { ...prev, [key]: clampedValue };
      others.forEach((k) => {
        newWeights[k] = Math.max(0, Math.round(prev[k] - (prev[k] / totalOther) * diff));
      });

      const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
      const lastKey = others[others.length - 1];
      if (sum !== 100 && lastKey) {
        newWeights[lastKey] += 100 - sum;
      }

      return newWeights;
    });
  };

  const rankedOptions = useMemo(() => {
    if (options.length === 0) {
      return [];
    }

    const minCost = Math.min(...options.map((o) => o.cost_inr));
    const maxCost = Math.max(...options.map((o) => o.cost_inr));
    const minCarbon = Math.min(...options.map((o) => o.carbon_tco2e));
    const maxCarbon = Math.max(...options.map((o) => o.carbon_tco2e));
    const minTime = Math.min(...options.map((o) => o.construction_time_days));
    const maxTime = Math.max(...options.map((o) => o.construction_time_days));

    const normalized = (val: number, min: number, max: number) => {
      if (max === min) {
        return 0.5;
      }
      return 1 - (val - min) / (max - min);
    };

    return options
      .map((opt) => {
        const nCost = normalized(opt.cost_inr, minCost, maxCost);
        const nCarbon = normalized(opt.carbon_tco2e, minCarbon, maxCarbon);
        const nTime = normalized(opt.construction_time_days, minTime, maxTime);

        return {
          ...opt,
          weightedScore: (weights.cost * nCost + weights.carbon * nCarbon + weights.time * nTime) / 100,
        };
      })
      .sort((a, b) => b.weightedScore - a.weightedScore);
  }, [options, weights]);

  const runGenerativeOptimization = async () => {
    setIsComputing(true);
    setOptions([]);
    setSelectedOptionId(null);
    setDecisionTrace([]);
    setApiError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/optimize-geometry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soil_bearing_capacity: soilCapacity,
          deviation_mm: deviation,
          max_deflection_tolerance: 15,
          material_density: 2400,
          safety_factor: safetyFactor,
        }),
      });

      if (!res.ok) {
        throw new Error(`Optimization API failed with status ${res.status}`);
      }

      const data: OptimizationApiResponse = await res.json();

      setTimeout(() => {
        setOptions(data.options);
        setSelectedOptionId(data.recommended_option_id);
        setDecisionTrace(data.decision_trace ?? []);
        setIsComputing(false);
      }, 2500);

      void fetch(`${API_BASE_URL}/api/events/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "optimization",
          stage: "RECALIBRATE",
          severity: "info",
          title: "Generative optimization requested from UI",
          detail: "Frontend requested deterministic option set for active constraints.",
          context: {
            deviation_mm: deviation,
            soil_bearing_capacity: soilCapacity,
            safety_factor: safetyFactor,
          },
        }),
      }).catch(() => undefined);
    } catch (err) {
      console.error("Failed to fetch from AI API:", err);
      setApiError("Unable to reach the AI backend. Start FastAPI or check NEXT_PUBLIC_AI_API_BASE_URL.");
      setIsComputing(false);
    }
  };

  const selectedOption = options.find((o) => o.id === selectedOptionId);

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
          <button
            onClick={() => {
              setWeights({ cost: 33, carbon: 33, time: 34 });
            }}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Defaults
          </button>
          <button
            onClick={runGenerativeOptimization}
            disabled={isComputing}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm flex items-center gap-2 transition-colors ${
              isComputing ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isComputing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isComputing ? "Running ML Model..." : "Run Generative Optimization"}
          </button>
        </div>
      </header>

      <div className="p-8 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
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
                { id: "facade", name: "Facade Load Optimization", status: "Computing..." },
              ].map((model) => (
                <div
                  key={model.id}
                  onClick={() => setActiveModel(model.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activeModel === model.id ? "border-[#0077c8] bg-blue-50/50 shadow-sm" : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-gray-800">{model.name}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        model.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : model.status === "Computing..."
                            ? "bg-amber-100 text-amber-700 animate-pulse"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {model.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">v2.4.1 • Last synced: 2m ago</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500" />
              Tradeoff Weights
            </h3>
            <p className="text-xs text-gray-500 mb-4">Slide to change priority. Options re-rank in real time.</p>
            <div className="space-y-4">
              <TradeWeightSlider
                label="Cost"
                value={weights.cost}
                color="bg-emerald-500"
                onChange={(v) => updateWeight("cost", v)}
              />
              <TradeWeightSlider
                label="Carbon"
                value={weights.carbon}
                color="bg-green-500"
                onChange={(v) => updateWeight("carbon", v)}
              />
              <TradeWeightSlider
                label="Time"
                value={weights.time}
                color="bg-blue-500"
                onChange={(v) => updateWeight("time", v)}
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              AI Generated Structural Options
            </h3>

            {options.length === 0 && !isComputing ? (
              <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-500 flex flex-col items-center justify-center min-h-[150px]">
                <Cpu className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium">Awaiting parameters.</p>
                <p className="text-xs mt-1">Click Run Generative Optimization to invoke the Python ML backend.</p>
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
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {rankedOptions.map((opt, index) => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                      selectedOptionId === opt.id ? "border-purple-500 bg-purple-50 shadow-md scale-[1.02]" : "border-gray-100 hover:border-purple-200 hover:bg-gray-50"
                    }`}
                  >
                    {selectedOptionId === opt.id && (
                      <div className="absolute -top-3 -right-3 bg-purple-500 text-white rounded-full p-1 shadow-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-800 text-sm">{opt.name}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-100 text-slate-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="rounded-lg bg-gradient-to-r from-transparent to-black/5 p-2 mb-2 border border-black/5">
                      <div className="flex items-center gap-1.5">
                        <Scale className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Score</span>
                        <span className="text-xs font-black text-amber-800">
                          {Math.round(opt.weightedScore * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">{opt.reason}</p>
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

            {apiError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {apiError}
              </div>
            )}

            {decisionTrace.length > 0 && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">Decision Trace</h4>
                <ul className="space-y-1.5 text-xs text-blue-900 font-medium">
                  {decisionTrace.map((step) => (
                    <li key={step}>• {step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
              )}

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

interface TradeWeightSliderProps {
  label: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
}

function TradeWeightSlider({ label, value, color, onChange }: TradeWeightSliderProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className="text-xs font-black text-gray-800">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0077c8]"
      />
      <div className={`mt-1 h-1 rounded-full ${color}`} style={{ width: `${value}%` }}></div>
    </div>
  );
}

interface ParameterSliderProps {
  label: string;
  value: string;
  min: string;
  max: string;
  step?: string;
  val: number;
  setVal: (value: number) => void;
}

function ParameterSlider({ label, value, min, max, step = "1", val, setVal }: ParameterSliderProps) {
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
