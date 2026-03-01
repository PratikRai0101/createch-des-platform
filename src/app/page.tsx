"use client";

import { useState, useEffect } from "react";
import DigitalTwinCanvas from "@/components/DigitalTwinCanvas";
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
  };

  if (!isMounted) return null; // Avoid hydration mismatch with Recharts

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <Box className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="font-bold text-lg leading-tight">CreaTech DES</h1>
            <p className="text-xs text-slate-400">Dynamic Engineering Sys</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard />} label="Command Center" active />
          <NavItem icon={<Cpu />} label="Generative Design" />
          <NavItem icon={<Activity />} label="IoT Sensors" />
          <NavItem icon={<Construction />} label="Site Execution" />
          <NavItem icon={<BarChart4 />} label="Analytics" />
          <NavItem icon={<Settings />} label="Settings" />
        </nav>
        <div className="p-4 bg-slate-800 m-4 rounded-xl">
          <p className="text-xs text-slate-300 mb-2">Project Name</p>
          <p className="font-semibold text-sm text-blue-300">L&T Infra Hub - Zone 4</p>
          <div className="mt-4 bg-slate-700 rounded-full h-1.5 w-full">
            <div className="bg-blue-500 h-1.5 rounded-full w-[45%]"></div>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">45% Complete</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">Site Execution Dashboard</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Sync
            </div>
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                isSimulating ? "bg-red-100 text-red-700" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSimulating ? "Pause Simulation" : "Start Live Simulation"}
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 grid grid-cols-12 gap-6">
          
          {/* Top KPIs */}
          <div className="col-span-12 grid grid-cols-4 gap-6">
            <KpiCard title="Active Sensors" value="1,244" trend="+12" icon={<Activity />} />
            <KpiCard title="AI Recalibrations" value={aiOptimized ? "1" : "0"} trend="Today" icon={<RefreshCw />} color="text-purple-600" />
            <KpiCard title="Estimated Rework Cost" value={aiOptimized ? "$0" : "$54k"} trend={aiOptimized ? "-100%" : "+12%"} icon={<AlertTriangle />} color={aiOptimized ? "text-green-600" : "text-amber-500"} />
            <KpiCard title="Schedule Variance" value={aiOptimized ? "-1 day" : "+4 days"} trend="Critical Path" icon={<Zap />} color={aiOptimized ? "text-green-600" : "text-red-500"} />
          </div>

          {/* Left Column: Generative Design View */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Generative Design Recalibration</h3>
                <p className="text-sm text-gray-500">Foundation Pile Layout & Depth</p>
              </div>
              {anomalyDetected && !aiOptimized && (
                <button
                  onClick={triggerGenerativeRedesign}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 animate-bounce"
                >
                  <Cpu className="w-4 h-4" />
                  Apply AI Optimization
                </button>
              )}
              {aiOptimized && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Design Optimized
                </div>
              )}
            </div>
            
            <div className="flex-1 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center p-2 relative overflow-hidden min-h-[400px]">
              <DigitalTwinCanvas 
                deviation={deviation} 
                status={status} 
                baseDepth={baseDepth} 
                newDepth={newDepth} 
                aiOptimized={aiOptimized} 
              />
              {anomalyDetected && !aiOptimized && (
                <div className="absolute top-4 right-4 z-10 bg-red-500/90 text-white px-4 py-2 rounded-lg font-bold shadow-xl border border-red-200 flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                  Site Deviation Critical!
                </div>
              )}
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
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
      {icon}
      {label}
    </a>
  );
}

function KpiCard({ title, value, trend, icon, color = "text-blue-600" }: { title: string, value: string, trend: string, icon: React.ReactNode, color?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`p-2 bg-gray-50 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
      <p className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 inline-block px-2 py-1 rounded">
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
