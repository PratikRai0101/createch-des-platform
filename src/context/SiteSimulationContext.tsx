"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

interface SiteSimulationContextValue {
  isSimulating: boolean;
  setIsSimulating: (value: boolean) => void;
  deviation: number;
  status: SimulationStatus;
  soilBearingCapacity: number;
  baseDepth: number;
  newDepth: number;
  anomalyDetected: boolean;
  aiOptimized: boolean;
  deviationHistory: DeviationPoint[];
  scenarioStage: ScenarioStage;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  scenarioEvents: ScenarioEvent[];
  pipelineConnected: boolean;
  triggerGenerativeRedesign: () => void;
  resetSimulation: () => void;
  injectDisaster: () => void;
}

const SiteSimulationContext = createContext<SiteSimulationContextValue | null>(null);

const createInitialHistory = () =>
  Array.from({ length: 10 }).map((_, i) => ({ time: `T-${10 - i}`, dev: 0, safe: 20 }));

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
  const [viewMode, setViewMode] = useState<ViewMode>("executive");
  const [scenarioEvents, setScenarioEvents] = useState<ScenarioEvent[]>([
    {
      id: "evt-init",
      ts: stamp(),
      stage: "SENSE",
      severity: "info",
      title: "Scenario Engine Ready",
      detail: "Simulation stack initialized in presentation mode.",
    },
  ]);
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

  const triggerGenerativeRedesign = useCallback(() => {
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
    pushEvent(
      "IMPACT",
      "success",
      "AI Recalibration Applied",
      "Structural geometry updated to recover schedule and cost risk."
    );
  }, [pushEvent]);

  const injectDisaster = useCallback(() => {
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
    pushEvent(
      "DETECT",
      "warning",
      "Disaster Scenario Injected",
      "Emergency stress test triggered for rapid decision walkthrough."
    );
  }, [baseDepth, pushEvent]);

  const resetSimulation = useCallback(() => {
    setIsSimulating(false);
    setDeviation(0);
    setStatus("STABLE");
    setSoilBearingCapacity(450);
    setBaseDepth(0.5);
    setNewDepth(0.5);
    setAnomalyDetected(false);
    setAiOptimized(false);
    setDeviationHistory(createInitialHistory());
    pushEvent("AUDIT", "info", "Scenario Reset", "Dashboard reset to baseline conditions.");
  }, [pushEvent]);

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
      newDepth,
      anomalyDetected,
      aiOptimized,
      deviationHistory,
      scenarioStage,
      viewMode,
      setViewMode,
      scenarioEvents,
      pipelineConnected,
      triggerGenerativeRedesign,
      resetSimulation,
      injectDisaster,
    }),
    [
      isSimulating,
      updateSimulationState,
      deviation,
      status,
      soilBearingCapacity,
      baseDepth,
      newDepth,
      anomalyDetected,
      aiOptimized,
      deviationHistory,
      scenarioStage,
      viewMode,
      setViewMode,
      scenarioEvents,
      pipelineConnected,
      triggerGenerativeRedesign,
      resetSimulation,
      injectDisaster,
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
