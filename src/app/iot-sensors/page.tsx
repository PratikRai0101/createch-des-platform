"use client";

import { useState, useEffect } from "react";
import { Activity, Terminal, Server, Wifi, WifiOff, AlertCircle, Camera, Focus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mockLogStream = [
  { ts: "14:02:33.401", level: "INFO", msg: "Node-7A connected. Handshake OK." },
  { ts: "14:02:34.112", level: "DATA", msg: "Payload: { \"sbc\": 452.1, \"dev\": 2.3, \"temp\": 34.5 }" },
  { ts: "14:02:35.805", level: "WARN", msg: "Node-12B latency > 500ms (742ms)." },
  { ts: "14:02:36.002", level: "DATA", msg: "Payload: { \"sbc\": 390.4, \"dev\": 5.1, \"temp\": 36.1 }" },
  { ts: "14:02:38.541", level: "ERROR", msg: "Node-4C heartbeat timeout. Connection dropped." },
  { ts: "14:02:40.120", level: "INFO", msg: "Generative Engine acknowledged frame 88412." }
];

export default function IotSensorsPage() {
  const [logs, setLogs] = useState(mockLogStream);

  // Simulate scrolling logs
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = {
          ts: new Date().toISOString().substring(11, 23),
          level: Math.random() > 0.9 ? "WARN" : "DATA",
          msg: `Payload: { "sbc": ${(400 + Math.random() * 50).toFixed(1)}, "dev": ${(Math.random() * 10).toFixed(1)}, "temp": ${(30 + Math.random() * 10).toFixed(1)} }`
        };
        return [...prev.slice(-15), newLog];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-[#0077c8]" />
            Edge IoT & Computer Vision
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Real-time Sensor Telemetry & Site YOLO Tracking</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            1,244 Active Nodes
          </div>
          <button className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm flex items-center gap-2 transition-colors">
            <Server className="w-4 h-4" />
            Provision New Node
          </button>
        </div>
      </header>

      <div className="p-8 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Top Half: CV Feed & Terminal */}
        <div className="col-span-12 grid grid-cols-12 gap-6">
          
          {/* Computer Vision / YOLO Simulation Feed */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-600" />
                  Live CCTV (Drone Cam-4) • Autonomous Tracking
                </h3>
                <div className="text-xs font-mono font-bold text-red-500 flex items-center gap-2 bg-red-50 px-2 py-1 rounded border border-red-100">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  REC
                </div>
              </div>
              
              {/* Fake Video Player Container */}
              <div className="flex-1 bg-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-700">
                {/* Background image mockup for the site */}
                <div 
                  className="absolute inset-0 opacity-80 bg-cover bg-center mix-blend-luminosity"
                  style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1563050912-ceb738fcc84e?auto=format&fit=crop&q=80&w=1600")' }}
                ></div>
                
                {/* Overlay Grid */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                {/* YOLO Bounding Boxes (Animated) */}
                <YoloBox label="EXCAVATOR 98%" x={20} y={40} w={150} h={120} color="border-emerald-400 text-emerald-400" />
                <YoloBox label="WORKER (PPE: OK) 92%" x={45} y={65} w={40} h={80} color="border-blue-400 text-blue-400" />
                <YoloBox label="WORKER (PPE: OK) 89%" x={55} y={70} w={35} h={75} color="border-blue-400 text-blue-400" />
                <YoloBox label="CONCRETE POUR 78%" x={70} y={30} w={100} h={140} color="border-purple-400 text-purple-400" />

                {/* Tracking Reticle Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 text-white pointer-events-none">
                  <Focus className="w-24 h-24" />
                </div>
              </div>
            </div>
          </div>

          {/* Live Terminal */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#0f172a] rounded-2xl shadow-xl border border-slate-700 p-1 flex-1 min-h-[400px] flex flex-col overflow-hidden relative">
              <div className="bg-slate-800 rounded-t-xl px-4 py-2 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-300">Edge Gateway Terminal</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 scrollbar-hide">
                {logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="flex gap-3"
                  >
                    <span className="text-slate-500 shrink-0">[{log.ts}]</span>
                    <span className={`shrink-0 font-bold ${
                      log.level === "INFO" ? "text-blue-400" :
                      log.level === "DATA" ? "text-emerald-400" :
                      log.level === "WARN" ? "text-amber-400" :
                      "text-red-400"
                    }`}>{log.level.padEnd(5)}</span>
                    <span className="text-slate-300 break-all">{log.msg}</span>
                  </motion.div>
                ))}
              </div>
              
              {/* Terminal Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>
            </div>
          </div>

        </div>

        {/* Bottom Half: Node Grid */}
        <div className="col-span-12 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800">Deployed Sensors (Zone 4)</h3>
              <div className="flex gap-2 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online (1,244)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Degraded (12)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Offline (3)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { id: "S-7A01", type: "Geotech", status: "online", battery: 94 },
                { id: "S-7A02", type: "Geotech", status: "online", battery: 91 },
                { id: "L-2B14", type: "Laser Scan", status: "degraded", battery: 45 },
                { id: "L-2B15", type: "Laser Scan", status: "online", battery: 88 },
                { id: "M-9C22", type: "Material", status: "offline", battery: 0 },
                { id: "M-9C23", type: "Material", status: "online", battery: 99 },
                { id: "V-1A05", type: "Vibration", status: "online", battery: 76 },
                { id: "V-1A06", type: "Vibration", status: "online", battery: 74 },
                { id: "C-4D12", type: "CCTV", status: "online", battery: 100 },
                { id: "C-4D13", type: "CCTV", status: "online", battery: 100 },
              ].map((node) => (
                <div key={node.id} className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
                  node.status === "online" ? "border-gray-100 hover:border-blue-200 hover:shadow-md" : 
                  node.status === "degraded" ? "border-amber-200 bg-amber-50" : 
                  "border-red-200 bg-red-50"
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-800">{node.id}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{node.type} Node</span>
                    </div>
                    {node.status === "online" ? <Wifi className="w-4 h-4 text-green-500" /> : 
                     node.status === "degraded" ? <AlertCircle className="w-4 h-4 text-amber-500" /> : 
                     <WifiOff className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">Batt: {node.battery}%</span>
                    <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${node.battery > 50 ? "bg-green-500" : node.battery > 20 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${node.battery}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Micro-component for the YOLO CV bounding boxes
function YoloBox({ label, x, y, w, h, color }: any) {
  return (
    <motion.div 
      className={`absolute border-2 ${color} bg-black/20 pointer-events-none`}
      style={{ left: `${x}%`, top: `${y}%`, width: w, height: h }}
      animate={{ 
        x: [0, Math.random() * 10 - 5, 0], 
        y: [0, Math.random() * 10 - 5, 0] 
      }}
      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className={`absolute -top-5 left-[-2px] px-1 text-[9px] font-mono font-bold bg-slate-900 border ${color}`}>
        {label}
      </div>
      {/* Corner crosshairs */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${color}`}></div>
      <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${color}`}></div>
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${color}`}></div>
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${color}`}></div>
    </motion.div>
  );
}
