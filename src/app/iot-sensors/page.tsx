"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Activity, Terminal, Wifi, WifiOff, AlertCircle, Camera, Focus, SkipForward, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteSimulation } from "@/hooks/useSiteSimulation";
import DigitalTwinCanvas from "@/components/DigitalTwinCanvas";
import ErrorBoundary from "@/components/ErrorBoundary";

const mockLogStream = [
  { ts: "14:02:33.401", level: "INFO", msg: "Node-7A connected. Handshake OK." },
  { ts: "14:02:34.112", level: "DATA", msg: 'Payload: { "sbc": 452.1, "dev": 2.3, "temp": 34.5 }' },
  { ts: "14:02:35.805", level: "WARN", msg: "Node-12B latency > 500ms (742ms)." },
  { ts: "14:02:36.002", level: "DATA", msg: 'Payload: { "sbc": 390.4, "dev": 5.1, "temp": 36.1 }' },
  { ts: "14:02:38.541", level: "ERROR", msg: "Node-4C heartbeat timeout. Connection dropped." },
  { ts: "14:02:40.120", level: "INFO", msg: "Generative Engine acknowledged frame 88412." },
];

interface TrackSnapshot {
  label: string;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
}

function generateIncidentFrames(tracks: TrackSnapshot[], duration: number, fps: number): TrackSnapshot[][] {
  const frames: TrackSnapshot[][] = [];
  const totalFrames = duration * fps;

  for (let i = 0; i < totalFrames; i++) {
    const t = i / totalFrames;
    const cycle = Math.sin(t * Math.PI);

    const frame: TrackSnapshot[] = tracks.map((track) => ({
      ...track,
      driftX: track.driftX * 2 * cycle,
      driftY: track.driftY * 2 * cycle,
    }));

    frames.push(frame);
  }

  return frames;
}

export default function IotSensorsPage() {
  const [logs, setLogs] = useState(mockLogStream);
  const { scenarioEvents, anomalyDetected, viewMode, updateMachineryPos, activeCommands, executedCommands, setActiveCommands, machineryState, executeGCodeQueue, status, deviation, baseDepth, newDepth, aiOptimized, controlMode, setControlMode, manualMove, pushEvent } = useSiteSimulation();
  const [replaying, setReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [replayPaused, setReplayPaused] = useState(false);
  const replayTimerRef = useRef<number | null>(null);
  const lastExcavatorPosRef = useRef<{ x: number; z: number } | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const joystickIntervalRef = useRef<number | null>(null);
  const [joystickVector, setJoystickVector] = useState({ x: 0, y: 0 });

  const API_BASE_URL = "http://127.0.0.1:8000";

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  // Coordinate mapper: CCTV 2D (0-100%) → 3D world coordinates
  const mapYOLOToWorld = useMemo(
    () => (percentX: number, percentY: number) => {
      // Map percentage (0-100) to 3D world space within grid bounds
      // X: -25 to 25 (left-right)
      // Z: -25 to 25 (depth)
      const worldX = clamp((percentX / 100) * 50 - 25, -25, 25);
      const worldZ = clamp((percentY / 100) * 50 - 25, -25, 25);
      return { x: worldX, z: worldZ };
    },
    []
  );

  // Throttle distance threshold: only update if moved > 0.5 unit
  const shouldUpdatePosition = useCallback(
    (newPos: { x: number; z: number }) => {
      if (!lastExcavatorPosRef.current) return true;
      const dx = newPos.x - lastExcavatorPosRef.current.x;
      const dz = newPos.z - lastExcavatorPosRef.current.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      return distance > 0.5;
    },
    []
  );

  const cvTracks = useMemo(
    () => [
      { label: "EXCAVATOR | ID-14 | 98%", x: 24, y: 55, w: 230, h: 60, color: "border-emerald-400 text-emerald-400", driftX: 4, driftY: -3, duration: 3.8 },
      { label: "TRENCH EDGE | 78%", x: 60, y: 32, w: 120, h: 180, color: "border-purple-400 text-purple-400", driftX: -3, driftY: 4, duration: 4.2 },
      { label: "WORKER CLUSTER | 84%", x: 48, y: 62, w: 110, h: 70, color: "border-cyan-300 text-cyan-300", driftX: 2, driftY: 3, duration: 4.6 },
    ],
    []
  );

  const incidentFrames = useMemo(
    () => generateIncidentFrames(cvTracks.map((t) => ({ label: t.label, x: t.x, y: t.y, driftX: t.driftX, driftY: t.driftY })), 6, 20),
    [cvTracks]
  );

  const latestEvents = useMemo(() => scenarioEvents.slice(-4).reverse(), [scenarioEvents]);

  // Update machinery position from YOLO tracking every 500ms
  useEffect(() => {
    if (controlMode !== 'AUTO') return;

    const trackingInterval = setInterval(() => {
      // Find excavator track in cvTracks
      const excavatorTrack = cvTracks.find((track) => track.label.includes("EXCAVATOR"));

      if (excavatorTrack) {
        // Calculate center point of excavator bounding box (in percentages)
        const centerX = excavatorTrack.x + excavatorTrack.w / 2 / 10; // Convert pixels to percentage
        const centerY = excavatorTrack.y + excavatorTrack.h / 2 / 10;

        // Map to 3D world coordinates
        const worldPos = mapYOLOToWorld(centerX, centerY);

        // Only update if position has moved significantly
        if (shouldUpdatePosition(worldPos)) {
          updateMachineryPos("excavator", {
            x: worldPos.x,
            z: worldPos.z,
            status: "MOVING",
          });
          lastExcavatorPosRef.current = worldPos;
        }
      } else {
        // Excavator not detected in frame - set to IDLE
        updateMachineryPos("excavator", {
          status: "IDLE",
        });
      }
    }, 500);

    return () => clearInterval(trackingInterval);
  }, [cvTracks, mapYOLOToWorld, shouldUpdatePosition, updateMachineryPos]);

  useEffect(() => {
    return () => {
      if (joystickIntervalRef.current) {
        clearInterval(joystickIntervalRef.current);
      }
    };
  }, []);

  // Trigger machinery path calculation on anomaly detection
  const excavatorRef = useRef(machineryState.excavator);
  useEffect(() => {
    excavatorRef.current = machineryState.excavator;
  }, [machineryState.excavator]);

  useEffect(() => {
    if (!anomalyDetected) {
      setActiveCommands([]);
      return;
    }

    if (controlMode === 'MANUAL') {
      pushEvent('IMPACT', 'warning', 'Manual Override Active', 'Autonomous Fix Paused - Switch to Auto mode to enable autonomous correction.');
      return;
    }

    if (activeCommands.length > 0) {
      return;
    }

    const current = excavatorRef.current;
    const target = {
      x: clamp(current.x + 15, -25, 25),
      y: 0,
      z: clamp(current.z - 20, -25, 25),
    };

    fetch(`${API_BASE_URL}/api/machinery/calculate-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        machine_id: 'excavator-14',
        current_pos: { x: current.x, y: 0, z: current.z },
        target_pos: target,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Path calculation failed (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data.gcode)) {
          executeGCodeQueue(data.gcode);
        }
      })
      .catch((error) => {
        console.error('Failed to calculate machinery path:', error);
      });
  }, [anomalyDetected, controlMode, activeCommands.length, setActiveCommands, executeGCodeQueue, pushEvent]);

  // Auto-scroll terminal to bottom when commands update
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activeCommands, executedCommands]);

  const startReplay = useCallback(() => {
    if (replaying) {
      return;
    }

    setReplaying(true);
    setReplayProgress(0);
    setReplayPaused(false);

    const duration = 6000;
    const start = Date.now();
    cancelAnimationFrame(replayTimerRef.current!);

    const tick = () => {
      const elapsed = Date.now() - start;
      const raw = elapsed / duration;

      setReplayProgress((prev) => {
        if (prev >= 1) {
          setReplaying(false);
          setReplayPaused(false);
          return 1;
        }
        return raw;
      });

      if (raw < 1) {
        replayTimerRef.current = requestAnimationFrame(tick);
      } else {
        setReplaying(false);
        setReplayPaused(false);
      }
    };

    replayTimerRef.current = requestAnimationFrame(tick);
  }, [replaying]);

  const toggleReplayPause = useCallback(() => {
    setReplayPaused((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      if (replayTimerRef.current) {
        cancelAnimationFrame(replayTimerRef.current);
      }
    };
  }, []);

  const replayPhase = replayProgress;
  const currentFrameIndex = Math.min(
    Math.floor(replayPhase * incidentFrames.length),
    incidentFrames.length - 1
  );
  const currentFrame = replaying && incidentFrames.length > 0 ? incidentFrames[currentFrameIndex] : null;

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
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            View: {viewMode === "executive" ? "Executive" : "Engineer"}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            1,244 Active Nodes
          </div>
          <button
            onClick={() => setControlMode(controlMode === 'AUTO' ? 'MANUAL' : 'AUTO')}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm flex items-center gap-2 transition-colors ${
              controlMode === 'AUTO' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {controlMode === 'AUTO' ? 'Autonomous' : 'Manual Teleop'}
          </button>
        </div>
      </header>

      <div className="p-8 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        <div className="col-span-12 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-600" />
                  Live CCTV (Drone Cam-4) • Autonomous Tracking
                </h3>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-mono font-bold text-red-500 flex items-center gap-2 bg-red-50 px-2 py-1 rounded border border-red-100">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    {replaying ? "REPLAY" : "REC"}
                  </div>
                  {anomalyDetected && !replaying && (
                    <button
                      onClick={startReplay}
                      className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                    >
                      Replay Incident
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`flex-1 bg-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center border ${
                  anomalyDetected && !replaying ? "border-red-500/80" : "border-slate-700"
                }`}
              >
                <div
                  className="absolute inset-0 opacity-80 bg-cover bg-center mix-blend-luminosity"
                  style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1563050912-ceb738fcc84e?auto=format&fit=crop&q=80&w=1600")' }}
                ></div>

                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                {replaying && currentFrame
                  ? currentFrame.map((track) => {
                      const original = cvTracks.find((t) => t.label === track.label);
                      return original ? (
                        <YoloBox key={track.label} {...original} driftX={track.driftX} driftY={track.driftY} replayPhase={replayPhase} replaying={true} />
                      ) : null;
                    })
                  : cvTracks.map((track) => <YoloBox key={track.label} {...track} />)}

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 text-white pointer-events-none">
                  <Focus className="w-24 h-24" />
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-[11px] text-slate-300 font-mono">
                <span className="text-slate-500">Inference Status:</span>{" "}
                {replaying
                  ? "Replaying incident. Drone feed is using recorded frames."
                  : anomalyDetected
                    ? "Anomaly linked to recalibration workflow. Awaiting AI structural response."
                    : "All tracked objects within operational safety envelope."}
              </div>

              {replaying && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-100 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleReplayPause}
                        className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 hover:bg-slate-50"
                      >
                        {replayPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-[11px] font-bold text-slate-600">
                        {replayPaused ? "Paused" : "Playing"} — {(replayPhase * 100).toFixed(0)}%
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setReplaying(false);
                        setReplayProgress(0);
                      }}
                      className="text-xs font-bold text-slate-600 border border-slate-300 px-2 py-1 rounded hover:bg-slate-200"
                    >
                      <SkipForward className="w-3 h-3 inline" /> End Replay
                    </button>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${replayPhase * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-slate-500 font-medium">
                    <span>Normal Operations</span>
                    <span>Anomaly Peak</span>
                    <span>Recovery</span>
                  </div>
                </div>
              )}
            </div>
          </div>

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

              <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 scrollbar-hide">
                {logs.map((log, i) => (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-3">
                    <span className="text-slate-500 shrink-0">[{log.ts}]</span>
                    <span
                      className={`shrink-0 font-bold ${
                        log.level === "INFO" ? "text-blue-400" : log.level === "DATA" ? "text-emerald-400" : log.level === "WARN" ? "text-amber-400" : "text-red-400"
                      }`}
                    >
                      {log.level.padEnd(5)}
                    </span>
                    <span className="text-slate-300 break-all">{log.msg}</span>
                  </motion.div>
                ))}

                {executedCommands.length > 0 && (
                  <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/95 p-3">
                    <div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      <span>Command History</span>
                      <span>{executedCommands.length} executed</span>
                    </div>
                    <div className="space-y-1 text-slate-200 text-[10px] leading-snug">
                      {executedCommands.slice(-10).map((command, idx) => (
                        <div key={`${command}-${idx}`} className="rounded px-2 py-1 bg-slate-900/90 border border-slate-800">
                          <span>{command}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeCommands.length > 0 ? (
                  <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/95 p-3">
                    <div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      <span>Active G-Code Queue</span>
                      <span>{activeCommands.length} lines</span>
                    </div>
                    <div className="space-y-1 text-green-400 text-[10px] leading-snug">
                      {activeCommands.slice(-10).map((command, idx) => (
                        <div key={`${command}-${idx}`} className="rounded px-2 py-1 bg-slate-900/90 border border-slate-800">
                          <span>{command}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-slate-400 text-[10px] leading-snug">
                    SYSTEM IDLE - AWAITING COMMANDS
                  </div>
                )}
              </div>

              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>
            </div>

            {controlMode === 'MANUAL' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Manual Joystick Control</h4>
                <div className="mb-4 h-[200px] w-full rounded-2xl overflow-hidden border border-slate-200">
                  <ErrorBoundary>
                    <DigitalTwinCanvas
                      deviation={0}
                      status={status}
                      baseDepth={0.5}
                      newDepth={0.5}
                      aiOptimized={false}
                      miniMap={true}
                    />
                  </ErrorBoundary>
                </div>
                <div className="flex justify-center">
                  <div
                    className="relative w-32 h-32 bg-gray-100 rounded-full border-2 border-gray-300 touch-none select-none"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const centerX = rect.left + rect.width / 2;
                      const centerY = rect.top + rect.height / 2;
                      const deltaX = (e.clientX - centerX) / (rect.width / 2);
                      const deltaY = (e.clientY - centerY) / (rect.height / 2);
                      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
                      const clampedDist = Math.min(distance, 1);
                      const angle = Math.atan2(deltaY, deltaX);
                      const x = Math.cos(angle) * clampedDist;
                      const y = Math.sin(angle) * clampedDist;
                      setJoystickVector({ x, y });
                      if (joystickIntervalRef.current) clearInterval(joystickIntervalRef.current);
                      joystickIntervalRef.current = window.setInterval(() => {
                        manualMove(x * 0.5, y * 0.5);
                      }, 50);
                    }}
                    onMouseMove={(e) => {
                      if (e.buttons === 1) { // Left mouse button down
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        const deltaX = (e.clientX - centerX) / (rect.width / 2);
                        const deltaY = (e.clientY - centerY) / (rect.height / 2);
                        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
                        const clampedDist = Math.min(distance, 1);
                        const angle = Math.atan2(deltaY, deltaX);
                        const x = Math.cos(angle) * clampedDist;
                        const y = Math.sin(angle) * clampedDist;
                        setJoystickVector({ x, y });
                      }
                    }}
                    onMouseUp={() => {
                      setJoystickVector({ x: 0, y: 0 });
                      if (joystickIntervalRef.current) {
                        clearInterval(joystickIntervalRef.current);
                        joystickIntervalRef.current = null;
                      }
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const centerX = rect.left + rect.width / 2;
                      const centerY = rect.top + rect.height / 2;
                      const touch = e.touches[0];
                      const deltaX = (touch.clientX - centerX) / (rect.width / 2);
                      const deltaY = (touch.clientY - centerY) / (rect.height / 2);
                      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
                      const clampedDist = Math.min(distance, 1);
                      const angle = Math.atan2(deltaY, deltaX);
                      const x = Math.cos(angle) * clampedDist;
                      const y = Math.sin(angle) * clampedDist;
                      setJoystickVector({ x, y });
                      if (joystickIntervalRef.current) clearInterval(joystickIntervalRef.current);
                      joystickIntervalRef.current = window.setInterval(() => {
                        manualMove(x * 0.5, y * 0.5);
                      }, 50);
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const centerX = rect.left + rect.width / 2;
                      const centerY = rect.top + rect.height / 2;
                      const touch = e.touches[0];
                      const deltaX = (touch.clientX - centerX) / (rect.width / 2);
                      const deltaY = (touch.clientY - centerY) / (rect.height / 2);
                      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
                      const clampedDist = Math.min(distance, 1);
                      const angle = Math.atan2(deltaY, deltaX);
                      const x = Math.cos(angle) * clampedDist;
                      const y = Math.sin(angle) * clampedDist;
                      setJoystickVector({ x, y });
                    }}
                    onTouchEnd={() => {
                      setJoystickVector({ x: 0, y: 0 });
                      if (joystickIntervalRef.current) {
                        clearInterval(joystickIntervalRef.current);
                        joystickIntervalRef.current = null;
                      }
                    }}
                  >
                    <div
                      className="absolute w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-pointer"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate(${joystickVector.x * 40}px, ${joystickVector.y * 40}px)`,
                      }}
                      onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                      }}
                      onPointerUp={(e) => {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Cross-System Event Timeline</h4>
              <div className="space-y-2">
                {latestEvents.map((event) => (
                  <div key={event.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <p className="text-[11px] font-bold text-gray-700">
                      {event.ts} • {event.stage}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{event.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-800">Deployed Sensors (Zone 4)</h3>
              <div className="flex gap-2 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Online (1,244)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Degraded (12)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Offline (3)
                </span>
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
                <div
                  key={node.id}
                  className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
                    node.status === "online"
                      ? "border-gray-100 hover:border-blue-200 hover:shadow-md"
                      : node.status === "degraded"
                        ? "border-amber-200 bg-amber-50"
                        : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-800">{node.id}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{node.type} Node</span>
                    </div>
                    {node.status === "online" ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : node.status === "degraded" ? (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">Batt: {node.battery}%</span>
                    <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${node.battery > 50 ? "bg-green-500" : node.battery > 20 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${node.battery}%` }}
                      ></div>
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

interface YoloBoxProps {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  driftX: number;
  driftY: number;
  duration: number;
  replayPhase?: number;
  replaying?: boolean;
}

function YoloBox({ label, x, y, w, h, color, driftX, driftY, duration, replayPhase, replaying }: YoloBoxProps) {
  if (replaying && replayPhase !== undefined) {
    const eased = replayPhase;
    const currentX = driftX * eased;
    const currentY = driftY * eased;

    return (
      <motion.div
        className={`absolute border-2 ${color} bg-black/20 pointer-events-none`}
        style={{ left: `${x}%`, top: `${y}%`, width: w, height: h, transform: `translate(${currentX}px, ${currentY}px)` }}
      >
        <div className={`absolute -top-5 left-[-2px] px-1 text-[9px] font-mono font-bold bg-slate-900 border ${color}`}>{label}</div>
        <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${color}`}></div>
        <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${color}`}></div>
        <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${color}`}></div>
        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${color}`}></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`absolute border-2 ${color} bg-black/20 pointer-events-none`}
      style={{ left: `${x}%`, top: `${y}%`, width: w, height: h }}
      animate={{ x: [0, driftX, 0], y: [0, driftY, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className={`absolute -top-5 left-[-2px] px-1 text-[9px] font-mono font-bold bg-slate-900 border ${color}`}>{label}</div>
      <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${color}`}></div>
      <div className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${color}`}></div>
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${color}`}></div>
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${color}`}></div>
    </motion.div>
  );
}
