"use client";

import { useState, useEffect } from "react";
import DigitalTwinCanvas from "@/components/DigitalTwinCanvas";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Zap,
  Box,
  LayoutDashboard,
  Cpu,
  Settings,
  Construction,
  BarChart4
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Simulated Data
const initialCostData = [
  { day: "Mon", projected: 12000, actual: 12000 },
  { day: "Tue", projected: 24000, actual: 25000 },
  { day: "Wed", projected: 36000, actual: 39000 },
  { day: "Thu", projected: 48000, actual: 54000 }, // Rework spike
  { day: "Fri", projected: 60000, actual: null },
  { day: "Sat", projected: 72000, actual: null },
];

export default function Home() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [deviation, setDeviation] = useState(0); // mm
  const [status, setStatus] = useState<"STABLE" | "CRITICAL">("STABLE");
  const [soilBearingCapacity, setSoilBearingCapacity] = useState(450); // kPa
  const [baseDepth, setBaseDepth] = useState(0.5); // base beam depth
  const [newDepth, setNewDepth] = useState(0.5);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [aiOptimized, setAiOptimized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simulation loop for IoT sensors
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isSimulating && !aiOptimized) {
      interval = setInterval(() => {
        // Soil capacity drops
        setSoilBearingCapacity((prev) => {
          const drop = prev - Math.random() * 15;
          return drop > 250 ? drop : 250;
        });
        
        // Site Deviation increases (e.g. column shifted out of plumb)
        setDeviation((prev) => {
          const newDeviation = prev + (Math.random() * 5);
          if (newDeviation > 20) {
             setAnomalyDetected(true);
             setStatus("CRITICAL");
             // Calculate what the new depth *should* be
             setNewDepth(baseDepth + (Math.abs(newDeviation) * 0.005));
          }
          return newDeviation > 50 ? 50 : newDeviation;
        });
        
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isSimulating, aiOptimized, baseDepth]);

  const triggerGenerativeRedesign = () => {
    setAiOptimized(true);
    setAnomalyDetected(false);
    setStatus("STABLE");
    // Show AI Recalibration KPI update
  };

  if (!isMounted) return null;

  return (
    <main className="flex-1 flex flex-col h-full w-full relative">
      {/* Topbar */}
        <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Site Execution Dashboard</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Real-time Structural Recalibration via Edge Node</p>
          </div>
          <div className="flex gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              anomalyDetected ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${anomalyDetected ? "bg-red-500 animate-pulse" : "bg-green-500"}`}></span>
              {anomalyDetected ? "Critical Anomaly" : "Live Sync Active"}
            </div>
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                isSimulating ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50" : "bg-[#0077c8] text-white hover:bg-[#0066ad] hover:shadow-md"
              }`}
            >
              {isSimulating ? "Pause Data Feed" : "Start Live Simulation"}
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
          
          {/* Top KPIs */}
          <div className="col-span-12 grid grid-cols-4 gap-6">
            <KpiCard title="Active Edge Nodes" value="1,244" trend="+12 online" icon={<Activity />} />
            <KpiCard 
              title="AI Recalibrations" 
              value={aiOptimized ? "1" : "0"} 
              trend="Today" 
              icon={<RefreshCw />} 
              color={aiOptimized ? "text-purple-600" : "text-gray-400"} 
              bgColor={aiOptimized ? "bg-purple-100" : "bg-gray-100"}
            />
            <KpiCard 
              title="Estimated Rework Cost" 
              value={aiOptimized ? "₹0" : (anomalyDetected ? "₹45.2L" : "₹0")} 
              trend={aiOptimized ? "-100% mitigated" : (anomalyDetected ? "+12% variance" : "On budget")} 
              icon={<AlertTriangle />} 
              color={aiOptimized ? "text-green-600" : (anomalyDetected ? "text-red-600" : "text-green-600")} 
              bgColor={aiOptimized ? "bg-green-100" : (anomalyDetected ? "bg-red-100" : "bg-green-100")}
              pulse={anomalyDetected && !aiOptimized}
            />
            <KpiCard 
              title="Schedule Impact" 
              value={aiOptimized ? "-1 day" : (anomalyDetected ? "+4 days" : "0 days")} 
              trend="Critical Path" 
              icon={<Zap />} 
              color={aiOptimized ? "text-green-600" : (anomalyDetected ? "text-red-600" : "text-gray-600")} 
              bgColor={aiOptimized ? "bg-green-100" : (anomalyDetected ? "bg-red-100" : "bg-gray-100")}
            />
          </div>

          {/* Left Column: Generative Design View */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col flex-1 relative overflow-hidden">
              {/* Animated background gradient if critical */}
              <AnimatePresence>
                {anomalyDetected && !aiOptimized && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent pointer-events-none"
                  />
                )}
              </AnimatePresence>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#0077c8]" />
                    Generative Digital Twin
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Autonomous Recalibration • Sector 7 Structural Beam</p>
                </div>
                
                <AnimatePresence mode="wait">
                  {anomalyDetected && !aiOptimized ? (
                    <motion.button
                      key="optimize-btn"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onClick={triggerGenerativeRedesign}
                      className="bg-[#0077c8] hover:bg-[#0066ad] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      Execute AI Recalibration
                    </motion.button>
                  ) : aiOptimized ? (
                    <motion.div
                      key="optimized-badge"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-green-100 text-green-700 border border-green-200 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Geometry Optimized
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              
              <div className="flex-1 rounded-xl border border-gray-200 flex items-center justify-center relative overflow-hidden min-h-[450px] shadow-inner bg-[#111111]">
                <DigitalTwinCanvas 
                  deviation={deviation} 
                  status={status} 
                  baseDepth={baseDepth} 
                  newDepth={newDepth} 
                  aiOptimized={aiOptimized} 
                />
                
                {/* Critical Overlay Alert */}
                <AnimatePresence>
                  {anomalyDetected && !aiOptimized && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute top-6 right-6 z-10 bg-red-600/90 backdrop-blur-md text-white px-5 py-3 rounded-xl font-bold shadow-2xl border border-red-400 flex items-center gap-3"
                    >
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                      <div>
                        <div className="text-xs text-red-200 uppercase tracking-wide">Action Required</div>
                        <div className="text-sm">Tolerance Exceeded by {(deviation - 20).toFixed(1)}mm</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* AI Recalculation Stats Overlay */}
                <AnimatePresence>
                  {aiOptimized && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md text-gray-800 p-4 rounded-xl shadow-xl border border-gray-200"
                    >
                      <div className="text-[10px] uppercase font-bold tracking-wider text-purple-600 mb-2 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> AI Parameter Shifts
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between gap-8 text-sm border-b border-gray-100 pb-1">
                          <span className="text-gray-500">Original Depth</span>
                          <span className="font-mono line-through text-gray-400">{(baseDepth * 1000).toFixed(0)}mm</span>
                        </div>
                        <div className="flex justify-between gap-8 text-sm">
                          <span className="font-semibold">New Depth (Z-axis)</span>
                          <span className="font-mono font-bold text-green-600">{(newDepth * 1000).toFixed(0)}mm</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column: IoT Sensors & Charts */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* Live Sensor Feed */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Live Site Data (IoT)
              </h3>
              
              <div className="space-y-4">
                <SensorRow 
                  label="Soil Bearing Capacity" 
                  value={`${Math.round(soilBearingCapacity)} kPa`} 
                  status={anomalyDetected ? "critical" : "normal"} 
                />
                <SensorRow 
                  label="Column Out-of-Plumb Deviation" 
                  value={`${deviation.toFixed(1)} mm`} 
                  status={status === "CRITICAL" ? "critical" : "normal"} 
                />
                <SensorRow 
                  label="Generative Recalibration" 
                  value={aiOptimized ? "ACTIVE" : "STANDBY"} 
                  status={aiOptimized ? "normal" : "warning"} 
                />
              </div>

              {anomalyDetected && !aiOptimized && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
                  <strong>Alert:</strong> Subsurface conditions differ from design assumptions. Foundation rework risk high.
                </div>
              )}
            </div>

            {/* Cost Trajectory Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 min-h-[250px] flex flex-col">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart4 className="w-4 h-4 text-purple-500" />
                Cost Overrun Trajectory
              </h3>
              <div className="flex-1 w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={initialCostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="projected" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProjected)" name="Baseline Cost" />
                    {(!aiOptimized) && (
                      <Area type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Actual + Rework" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {aiOptimized ? "Trajectory corrected via automated redesign." : "Rework driving actual costs above baseline."}
              </p>
            </div>

          </div>
        </div>
      </main>
  );
}

function KpiCard({ title, value, trend, icon, color = "text-blue-600", bgColor = "bg-blue-50", pulse = false }: { title: string, value: string, trend: string, icon: React.ReactNode, color?: string, bgColor?: string, pulse?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${pulse ? 'border-red-300 shadow-red-100 shadow-lg' : 'border-gray-100'} p-5 transition-all duration-500 relative overflow-hidden`}>
      {pulse && (
        <div className="absolute inset-0 bg-red-50 opacity-50 animate-pulse pointer-events-none" />
      )}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        <div className={`p-2.5 rounded-xl ${bgColor} ${color}`}>
          {icon}
        </div>
      </div>
      <h4 className={`text-3xl font-black relative z-10 ${pulse ? 'text-red-600' : 'text-gray-900'}`}>{value}</h4>
      <p className="text-xs text-gray-500 mt-2 font-semibold bg-gray-50/80 inline-block px-2.5 py-1 rounded-md border border-gray-100 relative z-10">
        {trend}
      </p>
    </div>
  );
}

function SensorRow({ label, value, status }: { label: string, value: string, status: "normal" | "warning" | "critical" }) {
  const colors = {
    normal: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    critical: "bg-red-100 text-red-700 border-red-200 animate-pulse",
  };
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colors[status]}`}>
        {value}
      </span>
    </div>
  );
}
