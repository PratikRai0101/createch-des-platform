export type SimulationStatus = "STABLE" | "CRITICAL";

export type ScenarioStage = "SENSE" | "DETECT" | "RECALIBRATE" | "IMPACT" | "AUDIT";

export const SCENARIO_STAGES: ScenarioStage[] = [
  "SENSE",
  "DETECT",
  "RECALIBRATE",
  "IMPACT",
  "AUDIT",
];

export type EventSeverity = "info" | "warning" | "critical" | "success";

export type EventSource = "iot" | "cv" | "anomaly" | "optimization" | "approval" | "system";

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

export interface PipelineEvent {
  id: string;
  ts: string;
  source: EventSource;
  stage: ScenarioStage;
  severity: EventSeverity;
  title: string;
  detail: string;
  context: Record<string, unknown>;
}

export interface Option {
  id: string;
  name: string;
  depth_m: number;
  cost_inr: number;
  carbon_tco2e: number;
  construction_time_days: number;
  confidence_score: number;
  reason: string;
}

export interface OptimizationRequest {
  soil_bearing_capacity: number;
  deviation_mm: number;
  max_deflection_tolerance?: number;
  material_density?: number;
  safety_factor: number;
  weights?: { cost: number; carbon: number; time: number };
}

export interface OptimizationResponse {
  original_depth_m: number;
  recommended_option_id: string;
  options: Option[];
  decision_trace: string[];
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  deviation_mm: number;
  soil_bearing_capacity: number;
  safety_factor: number;
  weights: { cost: number; carbon: number; time: number };
}

export interface ChatResponse {
  reply: string;
  parsed_options: Option[] | null;
}

export interface MachineryAsset {
  x: number;
  y: number;
  z: number;
  status: "IDLE" | "MOVING" | "WORKING" | "OFFLINE";
}

export interface MachineryState {
  excavator: MachineryAsset;
  crane: MachineryAsset;
}

export interface SensorNode {
  id: string;
  type: string;
  status: "online" | "degraded" | "offline";
  battery: number;
}

export type NavTab = "dashboard" | "map" | "redesign" | "audit" | "settings";

export interface EventIngestRequest {
  source: EventSource;
  stage: ScenarioStage;
  severity?: EventSeverity;
  title: string;
  detail: string;
  context?: Record<string, unknown>;
}

export interface EventRecord {
  id: string;
  ts: string;
  source: EventSource;
  stage: ScenarioStage;
  severity: EventSeverity;
  title: string;
  detail: string;
  context: Record<string, unknown>;
}

export interface MachineryCommand {
  machine_id: string;
  current_pos: { x: number; y: number; z: number };
  target_pos: { x: number; y: number; z: number };
}

export interface MachineryCommandResponse {
  machine_id: string;
  gcode: string[];
  estimated_time_seconds: number;
}
