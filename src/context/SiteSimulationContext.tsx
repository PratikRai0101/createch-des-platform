"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  DeviationPoint,
  EventSeverity,
  ScenarioEvent,
  ScenarioStage,
  SimulationStatus,
  ViewMode,
} from "@/types/scenario";
import { db } from "@/lib/databaseService";

interface CostHistoryItem {
  day: string;
  projected: number;
  actual: number;
}

export type { CostHistoryItem };

type MachineryStatus = "IDLE" | "MOVING" | "WORKING" | "OFFLINE";
type MachineryType = "excavator" | "crane";

interface MachineryAsset {
  x: number;
  y: number;
  z: number;
  status: MachineryStatus;
}

interface MachineryState {
  excavator: MachineryAsset;
  crane: MachineryAsset;
}

interface SiteSimulationContextValue {
  isSimulating: boolean;
  setIsSimulating: (value: boolean) => void;
  deviation: number;
  status: SimulationStatus;
  soilBearingCapacity: number;
  baseDepth: number;
  setBaseDepth: (value: number) => void;
  newDepth: number;
  anomalyDetected: boolean;
  aiOptimized: boolean;
  deviationHistory: DeviationPoint[];
  recalibrationCount: number;
  totalReworkSaved: number;
  totalScheduleImpact: number;
  currentEstimatedCost: number;
  currentScheduleImpact: number;
  scenarioStage: ScenarioStage;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  scenarioEvents: ScenarioEvent[];
  pipelineConnected: boolean;
  costHistory: CostHistoryItem[];
  machineryState: MachineryState;
  activeCommands: string[];
  executedCommands: string[];
  updateMachineryPos: (type: MachineryType, coords: Partial<MachineryAsset>) => void;
  setActiveCommands: (commands: string[]) => void;
  executeGCodeQueue: (gcodeArray: string[]) => void;
  triggerGenerativeRedesign: () => void;
  resetSimulation: () => void;
  injectDisaster: () => void;
  controlMode: 'AUTO' | 'MANUAL';
  setControlMode: (mode: 'AUTO' | 'MANUAL') => void;
  manualMove: (deltaX: number, deltaZ: number) => void;
  pushEvent: (stage: ScenarioStage, severity: EventSeverity, title: string, detail: string) => void;
}

const SiteSimulationContext = createContext<SiteSimulationContextValue | null>(null);

const createInitialHistory = () =>
  Array.from({ length: 10 }).map((_, i) => ({ time: `T-${10 - i}`, dev: 0, safe: 20 }));

const createInitialCostHistory = (): CostHistoryItem[] => [
  { day: "Mon", projected: 200000, actual: 200000 },
  { day: "Tue", projected: 300000, actual: 300000 },
  { day: "Wed", projected: 400000, actual: 400000 },
  { day: "Thu", projected: 500000, actual: 500000 },
  { day: "Fri", projected: 600000, actual: 600000 },
  { day: "Sat", projected: 1000000, actual: 1000000 },
];

const stamp = () => new Date().toISOString().substring(11, 19);
const API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_BASE_URL ?? "http://127.0.0.1:8000";

interface PipelineEvent {
  id: string;
  ts: string;
  stage: ScenarioStage;
  severity: EventSeverity;
  title: string;
  detail: string;
}

export function SiteSimulationProvider({ children }: { children: React.ReactNode }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [deviation, setDeviation] = useState(0);
  const [status, setStatus] = useState<SimulationStatus>("STABLE");
  const [soilBearingCapacity, setSoilBearingCapacity] = useState(450);
  const [baseDepth, setBaseDepth] = useState(0.5);
  const [newDepth, setNewDepth] = useState(0.5);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [aiOptimized, setAiOptimized] = useState(false);
  const [deviationHistory, setDeviationHistory] = useState<DeviationPoint[]>(createInitialHistory());
  const [recalibrationCount, setRecalibrationCount] = useState(0);
  const [totalReworkSaved, setTotalReworkSaved] = useState(0);
  const [totalScheduleImpact, setTotalScheduleImpact] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("executive");
  const [scenarioEvents, setScenarioEvents] = useState<ScenarioEvent[]>([]);
  const [costHistory, setCostHistory] = useState<CostHistoryItem[]>(createInitialCostHistory());
  const [machineryState, setMachineryState] = useState<MachineryState>({
    excavator: { x: 0, y: 0, z: 5, status: "IDLE" },
    crane: { x: 10, y: 0, z: 10, status: "IDLE" },
  });
  const [activeCommands, setActiveCommands] = useState<string[]>([]);
  const [executedCommands, setExecutedCommands] = useState<string[]>([]);
  const [machineryCommandTriggered, setMachineryCommandTriggered] = useState(false);
  const isFixLoggedRef = useRef(false);
  const [controlMode, setControlMode] = useState<'AUTO' | 'MANUAL'>('AUTO');

  // Worker cluster position in world coords (approximated from YOLO)
  const workerClusterPos = useMemo(() => ({ x: 0, z: 10 }), []);

  const currentEstimatedCost = useMemo(() => Math.abs(deviation) * 1500, [deviation]);
  const currentScheduleImpact = useMemo(() => Math.abs(deviation) / 10, [deviation]);

  useEffect(() => {
    setScenarioEvents([
      {
        id: "evt-init",
        ts: "--:--:--",
        stage: "SENSE",
        severity: "info",
        title: "Scenario Engine Ready",
        detail: "Simulation stack initialized in presentation mode.",
      },
    ]);
  }, []);
  const [pipelineConnected, setPipelineConnected] = useState(false);

  const pushEvent = useCallback(
    (stage: ScenarioStage, severity: EventSeverity, title: string, detail: string) => {
      const event: ScenarioEvent = {
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ts: stamp(),
        stage,
        severity,
        title,
        detail,
      };
      setScenarioEvents((curr) => [...curr.slice(-19), event]);
    },
    []
  );

  const mergePipelineRecords = useCallback((records: PipelineEvent[]) => {
    setScenarioEvents((current) => {
      const merged = new Map(current.map((event) => [event.id, event]));
      records.forEach((record) => {
        merged.set(record.id, {
          id: record.id,
          ts: record.ts,
          stage: record.stage,
          severity: record.severity,
          title: record.title,
          detail: record.detail,
        });
      });

      return Array.from(merged.values()).slice(-30);
    });
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isSimulating && !aiOptimized) {
      interval = setInterval(() => {
        setSoilBearingCapacity((prev) => {
          const drop = prev - Math.random() * 15;
          return drop > 250 ? drop : 250;
        });

        setDeviation((prev) => {
          const updatedDeviation = prev + Math.random() * 5;

          if (updatedDeviation > 20) {
            isFixLoggedRef.current = false;
            setAnomalyDetected((alreadyDetected) => {
              if (!alreadyDetected) {
                pushEvent(
                  "RECALIBRATE",
                  "critical",
                  "Critical Site Deviation",
                  "Tolerance breached; recalibration decision required."
                );
              }
              return true;
            });
            setStatus("CRITICAL");
            setNewDepth(baseDepth + Math.abs(updatedDeviation) * 0.005);
          }

          const cappedDeviation = updatedDeviation > 50 ? 50 : updatedDeviation;

          setDeviationHistory((curr) => [
            ...curr.slice(1),
            {
              time: stamp(),
              dev: Number(cappedDeviation.toFixed(1)),
              safe: 20,
            },
          ]);

          setCostHistory((curr) => {
            const costBased = Math.abs(cappedDeviation) * 1500;
            const dayIndex = Math.floor((Date.now() / 1500) % 6);
            const updated = [...curr];
            updated[dayIndex] = {
              ...updated[dayIndex],
              actual: updated[dayIndex].projected + costBased,
            };
            return updated;
          });

          return cappedDeviation;
        });
      }, 1500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSimulating, aiOptimized, baseDepth, pushEvent]);

  useEffect(() => {
    const fetchRecalibrationSummary = async () => {
      try {
        if (db && db.design && db.design.getSummary) {
          const result = await db.design.getSummary("00000000-0000-4000-8000-000000000001");
          const rows = Array.isArray(result.data) ? result.data : [];
          const totalSaved = rows.reduce(
            (sum, row) => sum + (Number((row as any).rework_saved_inr) || 0),
            0
          );
          const totalImpact = rows.reduce(
            (sum, row) => sum + (Number((row as any).schedule_impact) || 0),
            0
          );

          setRecalibrationCount(rows.length);
          setTotalReworkSaved(totalSaved);
          setTotalScheduleImpact(totalImpact);
        } else {
          console.warn('Database service not available');
        }
      } catch (error) {
        console.error('Failed to fetch recalibration count:', error);
      }
    };

    fetchRecalibrationSummary();
  }, []);

  useEffect(() => {
    if (currentEstimatedCost > 100000 && !scenarioEvents.some(e => e.title === "High Financial Risk Detected")) {
      pushEvent(
        "DETECT",
        "warning",
        "High Financial Risk Detected",
        `Cost overrun exceeded ₹1,00,000 threshold: ₹${currentEstimatedCost.toLocaleString()}`
      );
    }
  }, [currentEstimatedCost, pushEvent, scenarioEvents]);

  useEffect(() => {
    let cancelled = false;

    const pullPipelineEvents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/events/latest?limit=12`);

        if (!response.ok) {
          throw new Error(`Pipeline endpoint status: ${response.status}`);
        }

        const records: PipelineEvent[] = await response.json();

        if (cancelled) {
          return;
        }

        setPipelineConnected(true);
        mergePipelineRecords(records);
      } catch {
        if (!cancelled) {
          setPipelineConnected(false);
        }
      }
    };

    pullPipelineEvents();
    const interval = window.setInterval(pullPipelineEvents, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [mergePipelineRecords]);

  useEffect(() => {
    let stream: EventSource | null = null;
    let reconnectTimer: number | null = null;
    let disposed = false;
    let reconnectAttempts = 0;

    const connectStream = () => {
      if (disposed) {
        return;
      }

      try {
        stream = new EventSource(`${API_BASE_URL}/api/events/stream`);

        stream.onopen = () => {
          reconnectAttempts = 0;
          setPipelineConnected(true);
        };

        stream.onmessage = (message) => {
          try {
            const parsed = JSON.parse(message.data) as Partial<PipelineEvent>;

            if (
              parsed.id &&
              parsed.ts &&
              parsed.stage &&
              parsed.severity &&
              parsed.title &&
              parsed.detail
            ) {
              mergePipelineRecords([parsed as PipelineEvent]);
              setPipelineConnected(true);
            }
          } catch {
            // Ignore malformed SSE messages and continue fallback polling.
          }
        };

        stream.onerror = () => {
          setPipelineConnected(false);
          stream?.close();

          if (!disposed) {
            const delay = Math.min(30000, 1000 * 2 ** reconnectAttempts);
            reconnectAttempts += 1;
            reconnectTimer = window.setTimeout(connectStream, delay);
          }
        };
      } catch {
        setPipelineConnected(false);
      }
    };

    connectStream();

    return () => {
      disposed = true;
      stream?.close();
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, [mergePipelineRecords]);

  const updateSimulationState = useCallback(
    (value: boolean) => {
      setIsSimulating(value);

      if (value) {
        pushEvent("SENSE", "info", "Live Ingestion Started", "Edge telemetry stream is now active.");
      }
    },
    [pushEvent]
  );

  const triggerGenerativeRedesign = useCallback(async () => {
    setAiOptimized(true);
    setAnomalyDetected(false);
    setStatus("STABLE");
    setDeviationHistory((curr) => [
      ...curr.slice(1),
      {
        time: stamp(),
        dev: 0,
        safe: 20,
      },
    ]);
    setCostHistory(createInitialCostHistory());
    pushEvent(
      "IMPACT",
      "success",
      "AI Recalibration Applied",
      "Structural geometry updated to recover schedule and cost risk."
    );

    // Archive the optimization run with calculated figures
    const archiveRun = {
      project_id: "00000000-0000-4000-8000-000000000001",
      rework_saved_inr: currentEstimatedCost,
      schedule_impact: currentScheduleImpact,
    } as any;

    try {
      const result = await db.design.archiveOptimization(archiveRun);
      console.log("Archive Result:", { data: result.data, error: result.error });
      if (!result.error) {
        setRecalibrationCount(prev => prev + 1);
        setTotalReworkSaved(prev => prev + currentEstimatedCost);
        setTotalScheduleImpact(prev => prev + currentScheduleImpact);
      }
    } catch (error) {
      console.error('Failed to archive optimization:', error);
    }
  }, [pushEvent, currentEstimatedCost, currentScheduleImpact]);

  const injectDisaster = useCallback(() => {
    isFixLoggedRef.current = false;
    setIsSimulating(false);
    setSoilBearingCapacity(120);
    setDeviation(48);
    setAnomalyDetected(true);
    setStatus("CRITICAL");
    setNewDepth(baseDepth + 48 * 0.005);
    setDeviationHistory((curr) => [
      ...curr.slice(1),
      {
        time: stamp(),
        dev: 48,
        safe: 20,
      },
    ]);
    setCostHistory((curr) =>
      curr.map((item, idx) => ({
        ...item,
        actual: item.projected + (idx === 3 ? 500000 : 0), // Disaster spike on Thu
      }))
    );
    pushEvent(
      "DETECT",
      "warning",
      "Disaster Scenario Injected",
      "Emergency stress test triggered for rapid decision walkthrough."
    );
  }, [baseDepth, pushEvent]);

  const resetSimulation = useCallback(() => {
    isFixLoggedRef.current = false;
    setIsSimulating(false);
    setDeviation(0);
    setStatus("STABLE");
    setSoilBearingCapacity(450);
    setBaseDepth(0.5);
    setNewDepth(0.5);
    setAnomalyDetected(false);
    setAiOptimized(false);
    setDeviationHistory(createInitialHistory());
    setCostHistory(createInitialCostHistory());
    setMachineryState({
      excavator: { x: 0, y: 0, z: 5, status: "IDLE" },
      crane: { x: 10, y: 0, z: 10, status: "IDLE" },
    });
    setActiveCommands([]);
    setMachineryCommandTriggered(false);
    setScenarioEvents([
      {
        id: `evt-${Date.now()}-reset`,
        ts: stamp(),
        stage: "AUDIT",
        severity: "info",
        title: "Scenario Reset",
        detail: "Dashboard reset to baseline conditions.",
      },
    ]);
  }, []);

  const updateMachineryPos = useCallback(
    (type: MachineryType, coords: Partial<MachineryAsset>) => {
      setMachineryState((prev) => ({
        ...prev,
        [type]: {
          x: Math.max(-20, Math.min(20, coords.x ?? prev[type].x ?? 0)),
          y: coords.y ?? prev[type].y ?? 0,
          z: Math.max(-20, Math.min(20, coords.z ?? prev[type].z ?? 5)),
          status: coords.status ?? prev[type].status,
        },
      }));
    },
    []
  );

    const executeGCodeQueue = useCallback(
    (gcodeArray: string[]) => {
      const formattedQueue = gcodeArray.map((command) => {
        if (command.startsWith('G01')) {
          return command.replace(/X([-\d.]+)|Y([-\d.]+)|Z([-\d.]+)(?=\s|$)/g, (segment) => {
            const axis = segment[0];
            const value = parseFloat(segment.slice(1));
            return `${axis}${value.toFixed(2)}`;
          });
        }
        return command;
      });

      setActiveCommands(formattedQueue);
      setExecutedCommands([]);

      let delay = 0;
      formattedQueue.forEach((command, index) => {
        setTimeout(() => {
          if (command.startsWith('G01')) {
            // Extract X, Y, Z from G01 Xxx.xx Yyy.yy Zzz.zz Ffff
            const match = command.match(/G01 X([-\d.]+) Y([-\d.]+) Z([-\d.]+) F(\d+)/);
            if (match) {
              const x = parseFloat(match[1]);
              const y = parseFloat(match[2]);
              const z = parseFloat(match[3]);
              updateMachineryPos('excavator', { x, y, z, status: 'MOVING' });
            }
            setExecutedCommands((prev) => [...prev, command]);
            setActiveCommands((prev) => prev.slice(1));
          } else if (command === 'M03') {
            updateMachineryPos('excavator', { status: 'WORKING' });
            setExecutedCommands((prev) => [...prev, command]);
            setActiveCommands((prev) => prev.slice(1));
          } else if (command === 'M05') {
            updateMachineryPos('excavator', { status: 'IDLE' });
            setExecutedCommands((prev) => [...prev, command]);
            setActiveCommands((prev) => prev.slice(1));
            // After last command, reset simulation and log fix completion only once
            if (index === formattedQueue.length - 1 && !isFixLoggedRef.current) {
              isFixLoggedRef.current = true;
              setDeviation(0);
              setStatus('STABLE');
              setAnomalyDetected(false);
              pushEvent('IMPACT', 'success', 'Autonomous Fix Completed by Excavator_14', 'G-Code execution finished; site deviation corrected.');
            }
          }
        }, delay);
        delay += 1000; // 1 second per command
      });
    },
    [pushEvent, updateMachineryPos]
  );

  const manualMove = useCallback(
    (deltaX: number, deltaZ: number) => {
      console.log("Manual Move Applied:", { deltaX, deltaZ });
      setMachineryState((prev) => {
        const newX = prev.excavator.x + deltaX;
        const newZ = prev.excavator.z + deltaZ;

        // Safety envelope: prevent movement within 5 units of worker cluster
        const distToWorker = Math.sqrt(
          (newX - workerClusterPos.x) ** 2 + (newZ - workerClusterPos.z) ** 2
        );
        if (distToWorker < 5) {
          // Prevent movement towards worker
          const dirX = newX - prev.excavator.x;
          const dirZ = newZ - prev.excavator.z;
          const workerDirX = workerClusterPos.x - prev.excavator.x;
          const workerDirZ = workerClusterPos.z - prev.excavator.z;
          const dot = dirX * workerDirX + dirZ * workerDirZ;
          if (dot > 0) {
            // Moving towards worker, block
            return prev;
          }
        }

        return {
          ...prev,
          excavator: {
            ...prev.excavator,
            x: Math.max(-20, Math.min(20, newX)), // Clamp to grid
            z: Math.max(-20, Math.min(20, newZ)),
            status: 'MOVING',
          },
        };
      });
    },
    [workerClusterPos]
  );

  useEffect(() => {
    if (activeCommands.length === 0 && machineryState.excavator.status !== 'IDLE') {
      setMachineryState((prev) => ({
        ...prev,
        excavator: {
          ...prev.excavator,
          status: 'IDLE',
        },
      }));
    }
  }, [activeCommands, machineryState.excavator.status]);

  const scenarioStage: ScenarioStage = useMemo(() => {
    const latestStage = scenarioEvents[scenarioEvents.length - 1]?.stage;

    if (
      latestStage === "AUDIT" &&
      !isSimulating &&
      !anomalyDetected &&
      !aiOptimized
    ) {
      return "AUDIT";
    }

    if (aiOptimized) {
      return "IMPACT";
    }
    if (anomalyDetected) {
      return "RECALIBRATE";
    }
    if (isSimulating && deviation > 5) {
      return "DETECT";
    }
    return "SENSE";
  }, [aiOptimized, anomalyDetected, isSimulating, deviation, scenarioEvents]);

  const value = useMemo(
    () => ({
      isSimulating,
      setIsSimulating: updateSimulationState,
      deviation,
      status,
      soilBearingCapacity,
      baseDepth,
      setBaseDepth,
      newDepth,
      anomalyDetected,
      aiOptimized,
      deviationHistory,
      recalibrationCount,
      totalReworkSaved,
      totalScheduleImpact,
      currentEstimatedCost,
      currentScheduleImpact,
      scenarioStage,
      viewMode,
      setViewMode,
      scenarioEvents,
      pipelineConnected,
      costHistory,
      machineryState,
      activeCommands,
      executedCommands,
      setActiveCommands,
      executeGCodeQueue,
      updateMachineryPos,
      triggerGenerativeRedesign,
      resetSimulation,
      injectDisaster,
      controlMode,
      setControlMode,
      manualMove,
      pushEvent,
    }),
    [
      isSimulating,
      updateSimulationState,
      deviation,
      status,
      soilBearingCapacity,
      baseDepth,
      setBaseDepth,
      newDepth,
      anomalyDetected,
      aiOptimized,
      deviationHistory,
      recalibrationCount,
      totalReworkSaved,
      totalScheduleImpact,
      currentEstimatedCost,
      currentScheduleImpact,
      scenarioStage,
      viewMode,
      setViewMode,
      scenarioEvents,
      pipelineConnected,
      costHistory,
      machineryState,
      activeCommands,
      executedCommands,
      setActiveCommands,
      executeGCodeQueue,
      updateMachineryPos,
      triggerGenerativeRedesign,
      resetSimulation,
      injectDisaster,
      controlMode,
      setControlMode,
      manualMove,
      pushEvent,
    ]
  );

  return <SiteSimulationContext.Provider value={value}>{children}</SiteSimulationContext.Provider>;
}

export function useSiteSimulationContext() {
  const context = useContext(SiteSimulationContext);

  if (!context) {
    throw new Error("useSiteSimulationContext must be used within SiteSimulationProvider");
  }

  return context;
}
