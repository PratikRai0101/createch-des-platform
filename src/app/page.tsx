"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
const DigitalTwinCanvas = dynamic(() => import("@/components/DigitalTwinCanvas"), { 
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-100 rounded-2xl h-full min-h-[200px] flex items-center justify-center">
      <div className="text-gray-400 text-sm font-medium">Loading 3D Scene...</div>
    </div>
  )
});
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Zap,
  Cpu,
} from "lucide-react";
import { useSiteSimulation } from "@/hooks/useSiteSimulation";
import { SIMULATION, UI, UNITS } from "@/lib/constants";
import KpiCard from "@/components/dashboard/KpiCard";
import SensorRow from "@/components/dashboard/SensorRow";
import CostChart from "@/components/dashboard/CostChart";
import DeviationChart from "@/components/dashboard/DeviationChart";

export default function Home() {
  const {
    deviation,
    status,
    soilBearingCapacity,
    baseDepth,
    newDepth,
    anomalyDetected,
    aiOptimized,
    recalibrationCount,
    totalReworkSaved,
    totalScheduleImpact,
    currentEstimatedCost,
    currentScheduleImpact,
    deviationHistory,
    viewMode,
    costHistory,
    triggerGenerativeRedesign,
    resetSimulation,
    injectDisaster
  } = useSiteSimulation();

  useEffect(() => {
    // Hidden Keyboard shortcut for Disaster Injection (Ctrl+Shift+D)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        injectDisaster();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [injectDisaster]);

  return (
    <main className="flex-1 flex flex-col h-full w-full relative bg-[#f8fafc]">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Site Execution Dashboard</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {viewMode === "executive"
              ? "Executive summary of anomaly response and savings impact"
              : "Engineering telemetry and structural recalibration diagnostics"}
          </p>
        </div>
        <div className="flex gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border mr-2 ${
            anomalyDetected ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${anomalyDetected ? "bg-red-500 animate-pulse" : "bg-green-500"}`}></span>
            {anomalyDetected ? "Critical Anomaly" : "Live Sync Active"}
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-8 grid grid-cols-12 gap-6 mx-auto w-full" style={{ maxWidth: UI.MAX_WIDTH_PX }}>
        
        {/* Top KPIs */}
        <div className="col-span-12 grid gap-6" style={{ gridTemplateColumns: `repeat(${UI.GRID_COLS}, minmax(0, 1fr))` }}>
          <KpiCard title="Active Edge Nodes" value="1,244" trend="+12 online" icon={<Activity />} />
          <KpiCard 
            title="AI Recalibrations" 
            value={recalibrationCount?.toString() || "0"}
            trend="Total" 
            icon={<RefreshCw />} 
            color={recalibrationCount > 0 ? "text-purple-600" : "text-gray-400"} 
            bgColor={recalibrationCount > 0 ? "bg-purple-100" : "bg-gray-100"}
          />
          <KpiCard 
            title="Estimated Rework Cost" 
            value={aiOptimized ? "₹0" : `₹${currentEstimatedCost.toLocaleString()}`} 
            trend={totalReworkSaved > 0 ? `Saved ₹${totalReworkSaved.toLocaleString()}` : "On budget"} 
            icon={<AlertTriangle />} 
            color={aiOptimized ? "text-green-600" : (anomalyDetected ? "text-red-600" : "text-[#0077c8]")} 
            bgColor={aiOptimized ? "bg-green-100" : (anomalyDetected ? "bg-red-100" : "bg-blue-50")}
            pulse={anomalyDetected && !aiOptimized}
          />
          <KpiCard 
            title="Schedule Impact" 
            value={aiOptimized ? "-1 day" : `${currentScheduleImpact.toFixed(1)} days`} 
            trend={totalScheduleImpact > 0 ? `Total ${totalScheduleImpact.toFixed(1)}d` : "Critical Path"} 
            icon={<Zap />} 
            color={aiOptimized ? "text-green-600" : (anomalyDetected ? "text-red-600" : "text-gray-600")} 
            bgColor={aiOptimized ? "bg-green-100" : (anomalyDetected ? "bg-red-100" : "bg-gray-100")}
          />
        </div>

        {/* Left Column: Generative Design View */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col flex-1 relative overflow-hidden">
            {/* Animated background gradient if critical */}
            <AnimatePresence>
              {anomalyDetected && !aiOptimized && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-transparent pointer-events-none"
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
                    className="bg-green-100 text-green-700 border border-green-200 px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-sm"
                  >
                    <Zap className="w-4 h-4" />
                    Geometry Optimized
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            
            <div className="flex-1 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden min-h-[500px] shadow-inner bg-slate-900">
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
                    className="absolute top-6 right-6 z-10 bg-red-600/90 backdrop-blur-xl text-white px-6 py-4 rounded-xl font-bold shadow-2xl border border-red-400 flex items-center gap-4"
                  >
                    <AlertTriangle className="w-8 h-8 animate-pulse text-red-200" />
                    <div>
                      <div className="text-xs text-red-200 uppercase tracking-widest mb-0.5">Action Required</div>
                      <div className="text-sm">Tolerance Exceeded by {(deviation - SIMULATION.DEVIATION_THRESHOLD_MM).toFixed(1)}mm</div>
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
                    className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur-xl text-gray-800 p-5 rounded-2xl shadow-2xl border border-purple-200"
                  >
                    <div className="text-[10px] uppercase font-bold tracking-widest text-purple-600 mb-3 flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded w-max">
                      <Cpu className="w-3 h-3" /> AI Parameter Shifts
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between gap-12 text-sm border-b border-gray-100 pb-2">
                        <span className="text-gray-500 font-medium">Original Depth</span>
                        <span className="font-mono line-through text-gray-400">{(baseDepth * UNITS.MM_PER_M).toFixed(0)}mm</span>
                      </div>
                      <div className="flex justify-between gap-12 text-sm">
                        <span className="font-bold text-gray-800">New Depth (Z-axis)</span>
                        <span className="font-mono font-black text-green-600 bg-green-50 px-1.5 rounded">{(newDepth * UNITS.MM_PER_M).toFixed(0)}mm</span>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0077c8]" />
              Live Site Data (IoT)
            </h3>
            
            <div className="space-y-1">
              <SensorRow 
                label="Soil Bearing Capacity" 
                value={`${Math.round(soilBearingCapacity)} kPa`} 
                status={anomalyDetected ? "critical" : "normal"} 
                tooltip="Safe threshold is > 350 kPa. Drops below this trigger foundation recalibration."
              />
              <SensorRow 
                label="Out-of-Plumb Deviation" 
                value={`${deviation.toFixed(1)} mm`} 
                status={status === "CRITICAL" ? "critical" : "normal"} 
                tooltip="Column tilt detected via Laser Scan Node. Deviation > 20mm requires rework or AI generative redesign."
              />
              <SensorRow 
                label="Generative Recalibration" 
                value={aiOptimized ? "ACTIVE" : "STANDBY"} 
                status={aiOptimized ? "normal" : "warning"} 
                tooltip="Status of the Monte Carlo structural generation engine."
              />
            </div>

            {anomalyDetected && !aiOptimized && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="mt-4 p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 font-medium leading-relaxed shadow-inner"
              >
                <strong className="text-red-900">System Alert:</strong> Subsurface conditions differ from design assumptions. Foundation rework risk high. Awaiting engineering approval or generative override.
              </motion.div>
            )}
          </div>

          {/* Deviation Timeline Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            {viewMode === "executive" ? (
              <>
                <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2">Executive Interpretation</p>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                  {aiOptimized
                    ? "AI redesign accepted. Cost overrun and schedule impact are now under control."
                    : anomalyDetected
                      ? "Risk is rising. Trigger AI recalibration to prevent rework escalation."
                      : "Project is stable. No intervention required at this stage."}
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-2">Engineering Interpretation</p>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {aiOptimized
                    ? `Depth adjusted from ${(baseDepth * 1000).toFixed(0)}mm to ${(newDepth * 1000).toFixed(0)}mm. Deviation normalized to baseline envelope.`
                    : `Current deviation at ${deviation.toFixed(1)}mm with soil bearing ${Math.round(soilBearingCapacity)}kPa. Critical threshold: 20mm.`}
                </p>
              </>
            )}
          </div>

          {/* Deviation Timeline Chart */}
          <DeviationChart data={deviationHistory} />

          {/* Cost Trajectory Chart */}
          <CostChart aiOptimized={aiOptimized} costHistory={costHistory} />

        </div>
      </div>
    </main>
  );
}
