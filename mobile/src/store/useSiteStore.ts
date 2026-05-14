import { create } from "zustand";
import type {
  ScenarioEvent,
  ScenarioStage,
  SimulationStatus,
  Option,
  MachineryState,
  DeviationPoint,
  PipelineEvent,
} from "@/types";
import { SIMULATION, SOIL, DEPTH, COST, SCHEDULE, MACHINERY } from "@/constants";
import { api } from "@/api/client";

interface SiteState {
  // Core simulation
  deviation: number;
  status: SimulationStatus;
  soilBearingCapacity: number;
  baseDepth: number;
  newDepth: number;
  anomalyDetected: boolean;
  aiOptimized: boolean;
  isSimulating: boolean;

  // History & metrics
  deviationHistory: DeviationPoint[];
  recalibrationCount: number;
  totalReworkSaved: number;
  totalScheduleImpact: number;
  currentEstimatedCost: number;
  currentScheduleImpact: number;

  // Events & options
  scenarioEvents: ScenarioEvent[];
  latestOption: Option | null;
  pipelineConnected: boolean;

  // Machinery
  machineryState: MachineryState;
  activeCommands: string[];
  executedCommands: string[];

  // UI
  scenarioStage: ScenarioStage;
  notifications: ScenarioEvent[];
  controlMode: 'AUTO' | 'MANUAL';

  // Actions
  setIsSimulating: (value: boolean) => void;
  triggerGenerativeRedesign: () => void;
  injectDisaster: () => void;
  resetSimulation: () => void;
  pushEvent: (stage: ScenarioStage, severity: "info" | "warning" | "critical" | "success", title: string, detail: string) => void;
  tick: () => void;
  fetchLatestEvents: () => Promise<void>;
  connectEventStream: () => () => void;
  setControlMode: (mode: 'AUTO' | 'MANUAL') => void;
  dismissNotification: (id: string) => void;
  updateMachineryPos: (type: "excavator" | "crane", coords: Partial<{ x: number; y: number; z: number; status: "IDLE" | "MOVING" | "WORKING" | "OFFLINE" }>) => void;
  executeGCodeQueue: (gcodeArray: string[]) => void;
  manualMove: (deltaX: number, deltaZ: number) => void;
  manualMoveCrane: (deltaX: number, deltaZ: number) => void;
}

const stamp = () => new Date().toISOString().substring(11, 19);

const createInitialHistory = () =>
  Array.from({ length: SIMULATION.HISTORY_SIZE }).map((_, i) => ({
    time: `T-${SIMULATION.HISTORY_SIZE - i}`,
    dev: 0,
    safe: SIMULATION.SAFE_LIMIT_MM,
  }));

export const useSiteStore = create<SiteState>((set, get) => ({
  deviation: 0,
  status: "STABLE",
  soilBearingCapacity: SOIL.INITIAL_KPA,
  baseDepth: DEPTH.BASE_M,
  newDepth: DEPTH.BASE_M,
  anomalyDetected: false,
  aiOptimized: false,
  isSimulating: false,

  deviationHistory: createInitialHistory(),
  recalibrationCount: 0,
  totalReworkSaved: 0,
  totalScheduleImpact: 0,
  currentEstimatedCost: 0,
  currentScheduleImpact: 0,

  scenarioEvents: [
    {
      id: "evt-init",
      ts: "--:--:--",
      stage: "SENSE",
      severity: "info",
      title: "Scenario Engine Ready",
      detail: "Simulation stack initialized.",
    },
  ],
  latestOption: null,
  pipelineConnected: false,

  machineryState: {
    excavator: { x: MACHINERY.EXCAVATOR_INIT.x, y: MACHINERY.EXCAVATOR_INIT.y, z: MACHINERY.EXCAVATOR_INIT.z, status: "IDLE" },
    crane: { x: MACHINERY.CRANE_INIT.x, y: MACHINERY.CRANE_INIT.y, z: MACHINERY.CRANE_INIT.z, status: "IDLE" },
  },
  activeCommands: [],
  executedCommands: [],

  scenarioStage: "SENSE",
  notifications: [],
  controlMode: 'AUTO',

  setIsSimulating: (value) => {
    set({ isSimulating: value });
    if (value) {
      get().pushEvent("SENSE", "info", "Live Ingestion Started", "Edge telemetry stream active.");
    }
  },

  tick: () => {
    const state = get();
    if (!state.isSimulating || state.aiOptimized) return;

    const newSoil = Math.max(SOIL.MIN_KPA, state.soilBearingCapacity - Math.random() * SOIL.DROP_RANGE_MAX);
    const newDeviation = Math.min(
      SIMULATION.DEVIATION_CAP_MM,
      state.deviation + Math.random() * SIMULATION.DEVIATION_INCREMENT_MAX
    );

    const isCritical = newDeviation > SIMULATION.DEVIATION_THRESHOLD_MM;
    const newDepth = isCritical ? state.baseDepth + newDeviation * DEPTH.INCREMENT_PER_MM : state.baseDepth;
    const cost = Math.abs(newDeviation) * COST.PER_DEVIATION_MM;
    const schedule = Math.abs(newDeviation) / SCHEDULE.IMPACT_DIVISOR;

    set({
      soilBearingCapacity: newSoil,
      deviation: newDeviation,
      status: isCritical ? "CRITICAL" : "STABLE",
      anomalyDetected: isCritical,
      newDepth,
      currentEstimatedCost: cost,
      currentScheduleImpact: schedule,
      deviationHistory: [
        ...state.deviationHistory.slice(1),
        { time: stamp(), dev: Number(newDeviation.toFixed(1)), safe: SIMULATION.SAFE_LIMIT_MM },
      ],
    });

    if (isCritical && !state.anomalyDetected) {
      get().pushEvent("RECALIBRATE", "critical", "Critical Site Deviation", "Tolerance breached; recalibration required.");
    }
  },

  triggerGenerativeRedesign: () => {
    set({
      aiOptimized: true,
      anomalyDetected: false,
      status: "STABLE",
      deviation: 0,
      deviationHistory: [
        ...get().deviationHistory.slice(1),
        { time: stamp(), dev: 0, safe: SIMULATION.SAFE_LIMIT_MM },
      ],
    });
    get().pushEvent("IMPACT", "success", "AI Recalibration Applied", "Geometry updated; schedule and cost risk recovered.");
  },

  injectDisaster: () => {
    const dev = 48;
    set({
      isSimulating: false,
      soilBearingCapacity: SOIL.DISASTER_KPA,
      deviation: dev,
      anomalyDetected: true,
      status: "CRITICAL",
      aiOptimized: false,
      newDepth: DEPTH.BASE_M + dev * DEPTH.INCREMENT_PER_MM,
      currentEstimatedCost: dev * COST.PER_DEVIATION_MM,
      currentScheduleImpact: dev / SCHEDULE.IMPACT_DIVISOR,
      deviationHistory: [
        ...get().deviationHistory.slice(1),
        { time: stamp(), dev, safe: SIMULATION.SAFE_LIMIT_MM },
      ],
    });
    get().pushEvent("DETECT", "warning", "Disaster Scenario Injected", "Emergency stress test triggered.");
  },

  resetSimulation: () =>
    set({
      isSimulating: false,
      deviation: 0,
      status: "STABLE",
      soilBearingCapacity: SOIL.INITIAL_KPA,
      baseDepth: DEPTH.BASE_M,
      newDepth: DEPTH.BASE_M,
      anomalyDetected: false,
      aiOptimized: false,
      deviationHistory: createInitialHistory(),
      recalibrationCount: 0,
      totalReworkSaved: 0,
      totalScheduleImpact: 0,
      currentEstimatedCost: 0,
      currentScheduleImpact: 0,
      latestOption: null,
      scenarioEvents: [
        {
          id: `evt-${Date.now()}-reset`,
          ts: stamp(),
          stage: "AUDIT",
          severity: "info",
          title: "Scenario Reset",
          detail: "Dashboard reset to baseline conditions.",
        },
      ],
      notifications: [],
    }),

  pushEvent: (stage, severity, title, detail) => {
    const event: ScenarioEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ts: stamp(),
      stage,
      severity,
      title,
      detail,
    };
    set((state) => ({
      scenarioEvents: [...state.scenarioEvents.slice(-SIMULATION.MAX_EVENTS), event],
      notifications:
        severity === "critical" || severity === "warning"
          ? [...state.notifications.slice(-9), event]
          : state.notifications,
    }));
  },

  fetchLatestEvents: async () => {
    try {
      const records = await api.latestEvents(SIMULATION.API_LIMIT);
      set((state) => {
        const merged = new Map(state.scenarioEvents.map((e) => [e.id, e]));
        records.forEach((r) =>
          merged.set(r.id, {
            id: r.id,
            ts: r.ts,
            stage: r.stage,
            severity: r.severity,
            title: r.title,
            detail: r.detail,
          })
        );
        return { scenarioEvents: Array.from(merged.values()).slice(-SIMULATION.MAX_EVENTS), pipelineConnected: true };
      });
    } catch {
      set({ pipelineConnected: false });
    }
  },

  connectEventStream: () => {
    const dispose = api.streamEvents(
      (event) => {
        set((state) => {
          const merged = new Map(state.scenarioEvents.map((e) => [e.id, e]));
          merged.set(event.id, {
            id: event.id,
            ts: event.ts,
            stage: event.stage,
            severity: event.severity,
            title: event.title,
            detail: event.detail,
          });
          return {
            scenarioEvents: Array.from(merged.values()).slice(-SIMULATION.MAX_EVENTS),
            pipelineConnected: true,
          };
        });
      },
      () => set({ pipelineConnected: false })
    );
    return dispose;
  },

  setControlMode: (mode) => set({ controlMode: mode }),

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  updateMachineryPos: (type, coords) =>
    set((state) => ({
      machineryState: {
        ...state.machineryState,
        [type]: {
          ...state.machineryState[type],
          x: coords.x ?? state.machineryState[type].x,
          y: coords.y ?? state.machineryState[type].y,
          z: coords.z ?? state.machineryState[type].z,
          status: coords.status ?? state.machineryState[type].status,
        },
      },
    })),

  executeGCodeQueue: (gcodeArray) => {
    const formattedQueue = gcodeArray.map((command) => {
      if (command.startsWith("G01")) {
        return command.replace(/X([-\d.]+)|Y([-\d.]+)|Z([-\d.]+)(?=\s|$)/g, (segment) => {
          const axis = segment[0];
          const value = parseFloat(segment.slice(1));
          return `${axis}${value.toFixed(2)}`;
        });
      }
      return command;
    });

    set({ activeCommands: formattedQueue, executedCommands: [] });

    let delay = 0;
    formattedQueue.forEach((command, index) => {
      setTimeout(() => {
        if (command.startsWith("G01")) {
          const match = command.match(/G01 X([-\d.]+) Y([-\d.]+) Z([-\d.]+) F(\d+)/);
          if (match) {
            const x = parseFloat(match[1]);
            const y = parseFloat(match[2]);
            const z = parseFloat(match[3]);
            set((state) => ({
              machineryState: {
                ...state.machineryState,
                excavator: { ...state.machineryState.excavator, x, y, z, status: "MOVING" },
              },
              executedCommands: [...state.executedCommands, command],
              activeCommands: state.activeCommands.slice(1),
            }));
          }
        } else if (command === "M03") {
          set((state) => ({
            machineryState: {
              ...state.machineryState,
              excavator: { ...state.machineryState.excavator, status: "WORKING" },
            },
            executedCommands: [...state.executedCommands, command],
            activeCommands: state.activeCommands.slice(1),
          }));
        } else if (command === "M05") {
          set((state) => ({
            machineryState: {
              ...state.machineryState,
              excavator: { ...state.machineryState.excavator, status: "IDLE" },
            },
            executedCommands: [...state.executedCommands, command],
            activeCommands: state.activeCommands.slice(1),
          }));
          if (index === formattedQueue.length - 1) {
            set((state) => ({
              deviation: 0,
              status: "STABLE",
              anomalyDetected: false,
              scenarioEvents: [
                ...state.scenarioEvents.slice(-SIMULATION.MAX_EVENTS),
                {
                  id: `evt-${Date.now()}`,
                  ts: stamp(),
                  stage: "IMPACT",
                  severity: "success",
                  title: "Autonomous Fix Completed by Excavator_14",
                  detail: "G-Code execution finished; site deviation corrected.",
                },
              ],
            }));
          }
        }
      }, delay);
      delay += SIMULATION.COMMAND_DELAY_MS;
    });
  },

  manualMove: (deltaX, deltaZ) =>
    set((state) => ({
      machineryState: {
        ...state.machineryState,
        excavator: {
          ...state.machineryState.excavator,
          x: Math.max(-25, Math.min(25, state.machineryState.excavator.x + deltaX)),
          z: Math.max(-25, Math.min(25, state.machineryState.excavator.z + deltaZ)),
          status: "MOVING",
        },
      },
    })),

  manualMoveCrane: (deltaX, deltaZ) =>
    set((state) => ({
      machineryState: {
        ...state.machineryState,
        crane: {
          ...state.machineryState.crane,
          x: Math.max(-25, Math.min(25, state.machineryState.crane.x + deltaX)),
          z: Math.max(-25, Math.min(25, state.machineryState.crane.z + deltaZ)),
          status: "MOVING",
        },
      },
    })),
}));
