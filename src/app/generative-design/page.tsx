"use client";

import { useState, useMemo } from "react";
import { Cpu, RefreshCw, SlidersHorizontal, Scale, MessageSquare, X, Zap } from "lucide-react";
import DigitalTwinCanvas from "@/components/DigitalTwinCanvas";
import AiChatPanel from "@/components/AiChatPanel";

interface GenerativeOption {
  id: string;
  name: string;
  depth_m: number;
  cost_inr: number;
  carbon_tco2e: number;
  construction_time_days: number;
  confidence_score: number;
  reason: string;
  weightedScore?: number;
}

interface Weights {
  cost: number;
  carbon: number;
  time: number;
}

export default function GenerativeDesignPage() {
  const [deviation, setDeviation] = useState(25);
  const [soilCapacity, setSoilCapacity] = useState(380);
  const [safetyFactor, setSafetyFactor] = useState(1.5);

  const [options, setOptions] = useState<GenerativeOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [recalibrationHistory, setRecalibrationHistory] = useState<string[]>([]);

  const [weights, setWeights] = useState<Weights>({ cost: 33, carbon: 33, time: 34 });

  const updateWeight = (key: keyof Weights, value: number) => {
    setWeights((prev) => {
      const clamped = Math.max(0, Math.min(100, value));
      const diff = clamped - prev[key];
      const others = Object.keys(prev).filter((k) => k !== key) as (keyof Weights)[];
      const totalOther = others.reduce((sum, k) => sum + prev[k], 0);
      if (totalOther === 0) {
        const even = Math.round(100 / others.length);
        return { ...prev, [key]: clamped, ...Object.fromEntries(others.map((k) => [k, even])) } as Weights;
      }
      const newW = { ...prev, [key]: clamped } as Weights;
      others.forEach((k) => {
        newW[k] = Math.max(0, Math.round(prev[k] - (prev[k] / totalOther) * diff));
      });
      const sum = Object.values(newW).reduce((a, b) => a + b, 0);
      if (sum !== 100) newW[others[others.length - 1]] += 100 - sum;
      return newW;
    });
  };

  const rankedOptions = useMemo(() => {
    if (options.length === 0) return [];
    const minCost = Math.min(...options.map((o) => o.cost_inr));
    const maxCost = Math.max(...options.map((o) => o.cost_inr));
    const minCarbon = Math.min(...options.map((o) => o.carbon_tco2e));
    const maxCarbon = Math.max(...options.map((o) => o.carbon_tco2e));
    const minDays = Math.min(...options.map((o) => o.construction_time_days));
    const maxDays = Math.max(...options.map((o) => o.construction_time_days));
    const n = (v: number, lo: number, hi: number) => (hi === lo ? 0.5 : 1 - (v - lo) / (hi - lo));
    return options
      .map((o) => ({
        ...o,
        weightedScore: (weights.cost * n(o.cost_inr, minCost, maxCost) +
          weights.carbon * n(o.carbon_tco2e, minCarbon, maxCarbon) +
          weights.time * n(o.construction_time_days, minDays, maxDays)) / 100,
      }))
      .sort((a, b) => b.weightedScore - a.weightedScore);
  }, [options, weights]);

  const handleAiOptions = (newOptions: GenerativeOption[]) => {
    setOptions(newOptions);
    setSelectedOptionId(null);
    setApiError(null);
  };

  const handleIteration = (explanation: string) => {
    setRecalibrationHistory((prev) => [...prev, explanation]);
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
          <p className="text-xs text-gray-500 font-medium mt-0.5">AI-powered structural optimization with Qwen 3.5</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              showChat ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {showChat ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            {showChat ? "Close AI Chat" : "AI Chat"}
          </button>
        </div>
      </header>

      <div className="p-8 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full flex-1">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Constraints</h3>
            <div className="space-y-6">
              <ParameterSlider label="Deviation (mm)" value={`${deviation}mm`} min="0" max="50" val={deviation} setVal={setDeviation} />
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

          {recalibrationHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Recalibration History</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {recalibrationHistory.map((note, i) => (
                  <div key={i} className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    <span className="font-bold text-purple-700">Iteration {i + 1}:</span> {note.slice(0, 120)}…
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: Options + 3D */}
        <div className={`col-span-12 ${showChat ? "lg:col-span-6" : "lg:col-span-9"} flex flex-col gap-6`}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> AI Options</h3>
            {rankedOptions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Ask the AI Chat to generate design options
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {rankedOptions.map((opt, idx) => (
                  <div key={opt.id} onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedOptionId === opt.id ? "border-purple-500 bg-purple-50 scale-[1.02]" : "border-gray-100 hover:border-purple-200"}`}>
                    <div className="flex justify-between mb-2">
                      <h4 className="font-bold text-sm">{opt.name}</h4>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">#{idx + 1}</span>
                    </div>
                    {opt.reason && <p className="text-[11px] text-gray-500 mb-2">{opt.reason}</p>}
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between"><span className="text-gray-500">Score</span><span className="font-bold text-purple-700">{Math.round((opt.weightedScore ?? 0) * 100)}%</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Depth</span><span className="font-mono font-bold">{opt.depth_m * 1000} mm</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Cost</span><span className="font-mono font-bold text-emerald-600">₹{opt.cost_inr.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Carbon</span><span className="font-mono font-bold">{opt.carbon_tco2e} tCO₂e</span></div>
                      <div className="flex justify-between border-t pt-1 mt-1"><span className="text-gray-500">Duration</span><span className="font-mono font-bold">{opt.construction_time_days} days</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {apiError && <p className="text-red-500 text-xs mt-4">{apiError}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 min-h-[350px] flex flex-col">
            <div className="flex-1 rounded-xl bg-slate-900 relative overflow-hidden flex items-center justify-center">
              {selectedOption ? (
                <DigitalTwinCanvas deviation={deviation} status="STABLE" baseDepth={0.5} newDepth={selectedOption.depth_m} aiOptimized={true} />
              ) : (
                <p className="text-gray-500 text-sm">Select an AI option to preview</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI Chat Panel */}
        {showChat && (
          <div className="col-span-12 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 12rem)" }}>
            <div className="px-4 py-3 border-b border-gray-100 bg-purple-50/50">
              <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Qwen 3.5 Engineer
              </h3>
              <p className="text-[10px] text-purple-500">Powered by local LLM</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <AiChatPanel
                deviation={deviation}
                soilBearingCapacity={soilCapacity}
                safetyFactor={safetyFactor}
                onOptionsGenerated={handleAiOptions}
                onIterationComplete={handleIteration}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TradeWeightSlider({ label, value, color, onChange }: { label: string; value: number; color: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span>{label}</span><span className="font-bold">{value}%</span></div>
      <input type="range" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-blue-600" />
    </div>
  );
}

function ParameterSlider({ label, value, min, max, val, setVal }: { label: string; value: string; min: string; max: string; val: number; setVal: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span>{label}</span><span className="text-blue-600 font-bold">{value}</span></div>
      <input type="range" min={min} max={max} value={val} onChange={(e) => setVal(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-blue-600" />
    </div>
  );
}
