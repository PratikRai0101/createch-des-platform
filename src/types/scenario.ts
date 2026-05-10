export type SimulationStatus = "STABLE" | "CRITICAL";

export type ViewMode = "executive" | "engineer";

export type ScenarioStage = "SENSE" | "DETECT" | "RECALIBRATE" | "IMPACT" | "AUDIT";

export const SCENARIO_STAGES: ScenarioStage[] = [
  "SENSE",
  "DETECT",
  "RECALIBRATE",
  "IMPACT",
  "AUDIT",
];

export type EventSeverity = "info" | "warning" | "critical" | "success";

export interface DeviationPoint {
  time: string;
  dev: number;
  safe: number;
}

export interface ScenarioEvent {
  id: string;
  ts: string;
  stage: ScenarioStage;
  severity: EventSeverity;
  title: string;
  detail: string;
}

export interface Option {
  id: string;
  name: string;
  depth_m: number;
  cost_inr: number;
  carbon_tco2e: number;
  construction_time_days: number;
  confidence_score: number;
}
