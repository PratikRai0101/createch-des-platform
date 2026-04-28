"use client";

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Radar,
} from "lucide-react";
import { useMemo } from "react";
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
  const { scenarioStage, scenarioEvents, viewMode, setViewMode } = useSiteSimulation();

  const activeIndex = useMemo(() => SCENARIO_STAGES.indexOf(scenarioStage), [scenarioStage]);
  const latestEvent = scenarioEvents[scenarioEvents.length - 1];

  return (
    <section className="border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700">
            Finals Scenario Flow
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
            Telemetry: Simulated
          </span>
        </div>

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
    </section>
  );
}
