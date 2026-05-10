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
import {
  SIMULATION,
  SOIL,
  DEPTH,
  COST,
  CHART,
  MACHINERY,
  GRID,
  PROJECT,
  DISASTER,
  SCHEDULE,
  WORKER,
} from "@/lib/constants";

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
  latestOption: { name: string; depth_m: number; cost_inr: number; carbon_tco2e: number; reason: string } | null;
  applyGenerativeOption: (option: { name: string; depth_m: number; cost_inr: number; carbon_tco2e: number; construction_time_days: number; reason: string }) => void;
  triggerGenerativeRedesign: () => void;
  resetSimulation: () => void;
  injectDisaster: () => void;
  controlMode: 'AUTO' | 'MANUAL';
  setControlMode: (mode: 'AUTO' | 'MANUAL') => void;
  manualMove: (deltaX: number, deltaZ: number) => void;
  manualMoveCrane: (deltaX: number, deltaZ: number) => void;
  pushEvent: (stage: ScenarioStage, severity: EventSeverity, title: string, detail: string) => void;
}

export const SiteSimulationContext = createContext<SiteSimulationContextValue | null>(null);

const createInitialHistory = () =>
  Array.from({ length: SIMULATION.HISTORY_SIZE }).map((_, i) => ({
    time: `T-${SIMULATION.HISTORY_SIZE - i}`,
    dev: 0,
    safe: SIMULATION.SAFE_LIMIT_MM,
  }));

const createInitialCostHistory = (): CostHistoryItem[] =>
  CHART.INITIAL_COST_DATA.map((item) => ({
    ...item,
    actual: item.projected,
  }));

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
  const [soilBearingCapacity, setSoilBearingCapacity] = useState<number>(SOIL.INITIAL_KPA);
  const [baseDepth, setBaseDepth] = useState<number>(DEPTH.BASE_M);
  const [newDepth, setNewDepth] = useState<number>(DEPTH.BASE_M);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [aiOptimized, setAiOptimized] = useState(false);
  const [latestOption, setLatestOption] = useState<{ name: string; depth_m: number; cost_inr: number; carbon_tco2e: number; reason: string } | null>(null);
  const [deviationHistory, setDeviationHistory] = useState<DeviationPoint[]>(createInitialHistory());
  const [recalibrationCount, setRecalibrationCount] = useState(0);
  const [totalReworkSaved, setTotalReworkSaved] = useState(0);
  const [totalScheduleImpact, setTotalScheduleImpact] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("executive");
  const [scenarioEvents, setScenarioEvents] = useState<ScenarioEvent[]>([]);
  const [costHistory, setCostHistory] = useState<CostHistoryItem[]>(createInitialCostHistory());
  const [machineryState, setMachineryState] = useState<MachineryState>({
    excavator: { x: MACHINERY.EXCAVATOR_INIT.x, y: MACHINERY.EXCAVATOR_INIT.y, z: MACHINERY.EXCAVATOR_INIT.z, status: "IDLE" },
    crane: { x: MACHINERY.CRANE_INIT.x, y: MACHINERY.CRANE_INIT.y, z: MACHINERY.CRANE_INIT.z, status: "IDLE" },
  });
  const [activeCommands, setActiveCommands] = useState<string[]>([]);
  const [executedCommands, setExecutedCommands] = useState<string[]>([]);
  const [machineryCommandTriggered, setMachineryCommandTriggered] = useState(false);
  const isFixLoggedRef = useRef(false);
  const [controlMode, setControlMode] = useState<'AUTO' | 'MANUAL'>('AUTO');

  // Worker cluster position in world coords (approximated from YOLO)
  const workerClusterPos = useMemo(() => ({ x: 0, z: 10 }), []);

  const currentEstimatedCost = useMemo(() => Math.abs(deviation) * COST.PER_DEVIATION_MM, [deviation]);
  const currentScheduleImpact = useMemo(() => Math.abs(deviation) / SCHEDULE.IMPACT_DIVISOR, [deviation]);

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
      setScenarioEvents((curr) => [...curr.slice(-SIMULATION.MAX_PUSHED_EVENTS), event]);
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

      return Array.from(merged.values()).slice(-SIMULATION.MAX_EVENTS);
    });
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isSimulating && !aiOptimized) {
      interval = setInterval(() => {
        setSoilBearingCapacity((prev) => {
          const drop = prev - Math.random() * SOIL.DROP_RANGE_MAX;
          return drop > SOIL.MIN_KPA ? drop : SOIL.MIN_KPA;
        });

        setDeviation((prev) => {
          const updatedDeviation = prev + Math.random() * SIMULATION.DEVIATION_INCREMENT_MAX;

          if (updatedDeviation > SIMULATION.DEVIATION_THRESHOLD_MM) {
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
            setNewDepth(baseDepth + Math.abs(updatedDeviation) * DEPTH.INCREMENT_PER_MM);
          }

          const cappedDeviation = updatedDeviation > SIMULATION.DEVIATION_CAP_MM ? SIMULATION.DEVIATION_CAP_MM : updatedDeviation;

          setDeviationHistory((curr) => [
            ...curr.slice(1),
            {
              time: stamp(),
              dev: Number(cappedDeviation.toFixed(1)),
              safe: SIMULATION.SAFE_LIMIT_MM,
            },
          ]);

          setCostHistory((curr) => {
            const costBased = Math.abs(cappedDeviation) * COST.PER_DEVIATION_MM;
            const dayIndex = Math.floor((Date.now() / SIMULATION.TICK_INTERVAL_MS) % CHART.INITIAL_COST_DATA.length);
            const updated = [...curr];
            updated[dayIndex] = {
              ...updated[dayIndex],
              actual: updated[dayIndex].projected + costBased,
            };
            return updated;
          });

          return cappedDeviation;
        });
      }, SIMULATION.TICK_INTERVAL_MS);
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
          const result = await db.design.getSummary(PROJECT.DEFAULT_ID);
          const rows = result ? (Array.isArray(result.data) ? result.data : []) : [];
          const totalSaved = rows.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum, row) => sum + (Number((row as any).rework_saved_inr) || 0),
            0
          );
          const totalImpact = rows.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    if (currentEstimatedCost > COST.HIGH_RISK_THRESHOLD && !scenarioEvents.some(e => e.title === "High Financial Risk Detected")) {
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
        const response = await fetch(`${API_BASE_URL}/api/events/latest?limit=${SIMULATION.API_LIMIT}`);

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
    const interval = window.setInterval(pullPipelineEvents, SIMULATION.POLLING_INTERVAL_MS);

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
            const delay = Math.min(SIMULATION.MAX_RECONNECT_DELAY_MS, SIMULATION.BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempts);
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

  const applyGenerativeOption = useCallback((option: { name: string; depth_m: number; cost_inr: number; carbon_tco2e: number; construction_time_days: number; reason: string }) => {
    setLatestOption(option);
    setNewDepth(option.depth_m);
    setAiOptimized(true);
    setRecalibrationCount((prev) => prev + 1);

    const savings = Math.abs(deviation) * 1500;
    setTotalReworkSaved((prev) => prev + savings);

    pushEvent("RECALIBRATE", "success", "Generative Design Applied", `${option.name}: depth ${option.depth_m}m, cost ₹${option.cost_inr.toLocaleString()}`);
  }, [deviation, pushEvent]);

  const triggerGenerativeRedesign = useCallback(async () => {
    setAiOptimized(true);
    setAnomalyDetected(false);
    setStatus("STABLE");
    setDeviationHistory((curr) => [
      ...curr.slice(1),
      {
        time: stamp(),
        dev: 0,
        safe: SIMULATION.SAFE_LIMIT_MM,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const archiveRun: any = {
      project_id: PROJECT.DEFAULT_ID,
      rework_saved_inr: currentEstimatedCost,
      schedule_impact: currentScheduleImpact,
    };

    try {
      const result = await db.design.archiveOptimization(archiveRun);
      console.log("Archive Result:", { data: result?.data, error: result?.error });
      if (result && !result.error) {
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
    setSoilBearingCapacity(SOIL.DISASTER_KPA);
    setDeviation(DISASTER.DEVIATION_MM);
    setAnomalyDetected(true);
    setStatus("CRITICAL");
    setNewDepth(baseDepth + DISASTER.DEVIATION_MM * DEPTH.INCREMENT_PER_MM);
    setDeviationHistory((curr) => [
      ...curr.slice(1),
      {
        time: stamp(),
        dev: DISASTER.DEVIATION_MM,
        safe: SIMULATION.SAFE_LIMIT_MM,
      },
    ]);
    setCostHistory((curr) =>
      curr.map((item, idx) => ({
        ...item,
        actual: item.projected + (idx === DISASTER.DAY_INDEX ? DISASTER.SPIKE_INR : 0),
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
    setSoilBearingCapacity(SOIL.INITIAL_KPA);
    setBaseDepth(DEPTH.BASE_M);
    setNewDepth(DEPTH.BASE_M);
    setAnomalyDetected(false);
    setAiOptimized(false);
    setDeviationHistory(createInitialHistory());
    setCostHistory(createInitialCostHistory());
    setMachineryState({
      excavator: { x: MACHINERY.EXCAVATOR_INIT.x, y: MACHINERY.EXCAVATOR_INIT.y, z: MACHINERY.EXCAVATOR_INIT.z, status: "IDLE" },
      crane: { x: MACHINERY.CRANE_INIT.x, y: MACHINERY.CRANE_INIT.y, z: MACHINERY.CRANE_INIT.z, status: "IDLE" },
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
          x: Math.max(-GRID.BOUNDS, Math.min(GRID.BOUNDS, coords.x ?? prev[type].x ?? 0)),
          y: coords.y ?? prev[type].y ?? 0,
          z: Math.max(-GRID.BOUNDS, Math.min(GRID.BOUNDS, coords.z ?? prev[type].z ?? MACHINERY.EXCAVATOR_INIT.z)),
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
        delay += SIMULATION.COMMAND_DELAY_MS;
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

        // Safety envelope: prevent movement within safety distance of worker cluster
        const distToWorker = Math.sqrt(
          (newX - workerClusterPos.x) ** 2 + (newZ - workerClusterPos.z) ** 2
        );
        if (distToWorker < WORKER.SAFETY_DISTANCE) {
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
            x: Math.max(-GRID.BOUNDS, Math.min(GRID.BOUNDS, newX)),
            z: Math.max(-GRID.BOUNDS, Math.min(GRID.BOUNDS, newZ)),
            status: 'MOVING',
          },
        };
      });
    },
    [workerClusterPos]
  );

  const manualMoveCrane = useCallback(
    (deltaX: number, deltaZ: number) => {
      setMachineryState((prev) => {
        const newX = prev.crane.x + deltaX;
        const newZ = prev.crane.z + deltaZ;
        return {
          ...prev,
          crane: {
            ...prev.crane,
            x: Math.max(-GRID.BOUNDS, Math.min(GRID.BOUNDS, newX)),
            z: Math.max(-GRID.BOUNDS, Math.min(GRID.BOUNDS, newZ)),
            status: 'MOVING',
          },
        };
      });
    },
    []
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
    if (isSimulating && deviation > SIMULATION.DETECTION_THRESHOLD_MM) {
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
      latestOption,
      applyGenerativeOption,
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
      manualMoveCrane,
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
      latestOption,
      applyGenerativeOption,
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
      manualMoveCrane,
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
