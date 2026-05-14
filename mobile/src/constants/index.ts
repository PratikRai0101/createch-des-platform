export const API_BASE_URL = "http://127.0.0.1:8000";

export const SIMULATION = {
  TICK_INTERVAL_MS: 1500,
  DEVIATION_THRESHOLD_MM: 20,
  DEVIATION_CAP_MM: 50,
  SAFE_LIMIT_MM: 20,
  HISTORY_SIZE: 10,
  MAX_EVENTS: 30,
  DETECTION_THRESHOLD_MM: 5,
  DEVIATION_INCREMENT_MAX: 5,
  POLLING_INTERVAL_MS: 5000,
  API_LIMIT: 12,
  COMMAND_DELAY_MS: 1000,
} as const;

export const SOIL = {
  INITIAL_KPA: 450,
  MIN_KPA: 250,
  DROP_RANGE_MAX: 15,
  DISASTER_KPA: 120,
} as const;

export const DEPTH = {
  BASE_M: 0.5,
  INCREMENT_PER_MM: 0.005,
  MIN_M: 0.3,
  MAX_M: 1.5,
} as const;

export const COST = {
  PER_DEVIATION_MM: 1500,
  HIGH_RISK_THRESHOLD: 100000,
} as const;

export const WEIGHTS = {
  DEFAULT: { cost: 33, carbon: 33, time: 34 } as const,
  TARGET_SUM: 100,
} as const;

export const MACHINERY = {
  EXCAVATOR_INIT: { x: 0, y: 0, z: 5 },
  CRANE_INIT: { x: 10, y: 0, z: 10 },
} as const;

export const SCHEDULE = {
  IMPACT_DIVISOR: 10,
} as const;

export const COLORS = {
  background: "#FFFFFF",
  foreground: "#000000",
  muted: "#666666",
  border: "#000000",
  cardBorder: "#E5E5E5",
  critical: "#000000",
  active: "#000000",
  inactive: "#999999",
  success: "#000000",
  warning: "#000000",
} as const;
