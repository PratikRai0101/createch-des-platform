"use client";

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Radar,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useSiteSimulation } from "@/hooks/useSiteSimulation";
import { SCENARIO_STAGES, type EventSeverity, type ScenarioStage } from "@/types/scenario";

const stageMeta: Record<
  ScenarioStage,
  { label: string; icon: ReactNode; subtitle: string }
> = {
  SENSE: {
    label: "Sense",
    subtitle: "Edge telemetry",
    icon: <Radar className="w-3.5 h-3.5" />,
  },
  DETECT: {
    label: "Detect",
    subtitle: "Anomaly check",
    icon: <Activity className="w-3.5 h-3.5" />,
  },
  RECALIBRATE: {
    label: "Recalibrate",
    subtitle: "AI options",
    icon: <BrainCircuit className="w-3.5 h-3.5" />,
  },
  IMPACT: {
    label: "Impact",
    subtitle: "Cost/time recovery",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  AUDIT: {
    label: "Audit",
    subtitle: "Decision trace",
    icon: <ClipboardCheck className="w-3.5 h-3.5" />,
  },
};

const severityClasses: Record<EventSeverity, string> = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  success: "bg-green-50 text-green-700 border-green-200",
};

export default function TopScenarioBar() {
  const {
    scenarioStage,
    scenarioEvents,
    pipelineConnected,
    viewMode,
    setViewMode,
    isSimulating,
    setIsSimulating,
    injectDisaster,
    triggerGenerativeRedesign,
    resetSimulation,
    anomalyDetected,
    aiOptimized,
  } = useSiteSimulation();
  const [showTimeline, setShowTimeline] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayTimersRef = useRef<number[]>([]);

  const activeIndex = useMemo(() => SCENARIO_STAGES.indexOf(scenarioStage), [scenarioStage]);
  const latestEvent = scenarioEvents && scenarioEvents.length > 0 
  ? scenarioEvents[scenarioEvents.length - 1] 
  : null;

  useEffect(() => {
    return () => {
      replayTimersRef.current.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      replayTimersRef.current = [];
    };
  }, []);

  const runReplayScenario = () => {
    if (isReplaying) {
      return;
    }

    replayTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    replayTimersRef.current = [];

    setIsReplaying(true);
    resetSimulation();

    replayTimersRef.current.push(
      window.setTimeout(() => setIsSimulating(true), 500),
      window.setTimeout(() => injectDisaster(), 3500),
      window.setTimeout(() => triggerGenerativeRedesign(), 6500),
      window.setTimeout(() => {
        setIsSimulating(false);
        setIsReplaying(false);
      }, 9000)
    );
  };

  return (
    <section className="border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700">
            Finals Scenario Flow
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
            Pipeline: {pipelineConnected ? "API Synced" : "Simulation Fallback"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setViewMode("executive")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                viewMode === "executive"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Executive View
            </button>
            <button
              onClick={() => setViewMode("engineer")}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                viewMode === "engineer"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Engineer View
            </button>
          </div>
          <button
            onClick={() => setShowTimeline((prev) => !prev)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            {showTimeline ? "Hide Timeline" : "Show Timeline"}
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
        >
          {isSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isSimulating ? "Pause Feed" : "Start Feed"}
        </button>
        <button
          onClick={injectDisaster}
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Inject Anomaly
        </button>
        {anomalyDetected && !aiOptimized && (
          <button
            onClick={triggerGenerativeRedesign}
            className="inline-flex items-center gap-1.5 rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100"
          >
            <Zap className="h-3.5 w-3.5" />
            Apply Recalibration
          </button>
        )}
        <button
          onClick={resetSimulation}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <button
          onClick={runReplayScenario}
          disabled={isReplaying}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold ${
            isReplaying
              ? "border-blue-200 bg-blue-100 text-blue-500"
              : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
        >
          <Play className="h-3.5 w-3.5" />
          {isReplaying ? "Replay Running" : "Replay Scenario"}
        </button>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
          {SCENARIO_STAGES.map((stage, index) => {
            const isComplete = index < activeIndex;
            const isActive = index === activeIndex;

            return (
              <div
                key={stage}
                className={`rounded-xl border px-3 py-2 transition-colors ${
                  isActive
                    ? "border-blue-300 bg-blue-50"
                    : isComplete
                      ? "border-green-200 bg-green-50"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span
                    className={`rounded-md p-1 ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : isComplete
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {stageMeta[stage].icon}
                  </span>
                  {stageMeta[stage].label}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{stageMeta[stage].subtitle}</p>
              </div>
            );
          })}
        </div>

        {latestEvent && (
          <div
            className={`flex max-w-[420px] items-start gap-2 rounded-xl border px-3 py-2 text-xs ${severityClasses[latestEvent.severity]}`}
          >
            {latestEvent.severity === "critical" ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <Activity className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {latestEvent.ts} • {latestEvent.title}
              </p>
              <p className="mt-0.5 opacity-90">{latestEvent.detail}</p>
            </div>
          </div>
        )}
      </div>

      {showTimeline && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">Scenario Timeline (Latest)</h4>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {scenarioEvents
              .slice(-9)
              .reverse()
              .map((event) => (
                <div key={event.id} className={`rounded-lg border px-2.5 py-2 text-xs ${severityClasses[event.severity]}`}>
                  <p className="font-bold">{event.ts} • {event.stage}</p>
                  <p className="mt-0.5">{event.title}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
