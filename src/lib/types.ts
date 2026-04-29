export interface SiteSimulationState {
  isSimulating: boolean;
  deviation: number;
  status: "STABLE" | "CRITICAL";
  soilBearingCapacity: number;
  baseDepth: number;
  newDepth: number;
  anomalyDetected: boolean;
  aiOptimized: boolean;
  deviationHistory: Array<{ time: string; dev: number; safe: number }>;
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
