"use client";

import { useState, useEffect } from "react";
import { Activity, Terminal, Server, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

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
            Edge IoT Mesh Network
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Real-time Sensor Telemetry & Node Diagnostics</p>
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
        {/* Node Grid */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800">Deployed Sensors (Zone 4)</h3>
              <div className="flex gap-2 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online (1,244)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Degraded (12)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Offline (3)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { id: "S-7A01", type: "Geotech", status: "online", battery: 94 },
                { id: "S-7A02", type: "Geotech", status: "online", battery: 91 },
                { id: "L-2B14", type: "Laser Scan", status: "degraded", battery: 45 },
                { id: "L-2B15", type: "Laser Scan", status: "online", battery: 88 },
                { id: "M-9C22", type: "Material", status: "offline", battery: 0 },
                { id: "M-9C23", type: "Material", status: "online", battery: 99 },
                { id: "V-1A05", type: "Vibration", status: "online", battery: 76 },
                { id: "V-1A06", type: "Vibration", status: "online", battery: 74 },
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
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${node.battery > 50 ? "bg-green-500" : node.battery > 20 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${node.battery}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Terminal */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#0f172a] rounded-2xl shadow-xl border border-slate-700 p-1 flex-1 min-h-[500px] flex flex-col overflow-hidden relative">
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
    </div>
  );
}
