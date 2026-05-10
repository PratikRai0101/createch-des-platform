// Domain constants for the Site Execution Dashboard
// Extracted from across the codebase to eliminate magic numbers

export const SIMULATION = {
  TICK_INTERVAL_MS: 1500,
  DEVIATION_THRESHOLD_MM: 20,
  DEVIATION_CAP_MM: 50,
  DEVIATION_MAX_Y_AXIS: 60,
  SAFE_LIMIT_MM: 20,
  HISTORY_SIZE: 10,
  MAX_EVENTS: 30,
  MAX_PUSHED_EVENTS: 19,
  DETECTION_THRESHOLD_MM: 5,
  DEVIATION_INCREMENT_MAX: 5,
  POLLING_INTERVAL_MS: 5000,
  API_LIMIT: 12,
  RECENT_RECORDS_LIMIT: 10,
  COMMAND_DELAY_MS: 1000,
  MAX_RECONNECT_DELAY_MS: 30000,
  BASE_RECONNECT_DELAY_MS: 1000,
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
  CHART_Y_MULTIPLIER: 1.2,
  FORMAT_DIVISOR: 100000,
} as const;

export const CHART = {
  INITIAL_COST_DATA: [
    { day: "Mon", projected: 200000, actual: 200000 },
    { day: "Tue", projected: 300000, actual: 300000 },
    { day: "Wed", projected: 400000, actual: 400000 },
    { day: "Thu", projected: 500000, actual: 500000 },
    { day: "Fri", projected: 600000, actual: 600000 },
    { day: "Sat", projected: 1000000, actual: 1000000 },
  ] as const,
} as const;

export const WEIGHTS = {
  DEFAULT: { cost: 33, carbon: 33, time: 34 } as const,
  MIN: 0,
  MAX: 100,
  TARGET_SUM: 100,
} as const;

export const MACHINERY = {
  EXCAVATOR_INIT: { x: 0, y: 0, z: 5 },
  CRANE_INIT: { x: 10, y: 0, z: 10 },
  LERP_SPEED: 0.1,
} as const;

export const GRID = {
  BOUNDS: 20,
} as const;

export const PROJECT = {
  DEFAULT_ID: "00000000-0000-4000-8000-000000000001",
} as const;

export const DISASTER = {
  DEVIATION_MM: 48,
  SPIKE_INR: 500000,
  DAY_INDEX: 3,
} as const;

export const SCHEDULE = {
  IMPACT_DIVISOR: 10,
} as const;

export const WORKER = {
  SAFETY_DISTANCE: 5,
} as const;

export const UI = {
  GRID_COLS: 4,
  MAX_WIDTH_PX: 1600,
} as const;

export const GENERATIVE = {
  INITIAL_DEVIATION: 25,
  INITIAL_SOIL_CAPACITY: 380,
  SAFETY_FACTOR: 1.5,
  DEVIATION_SLIDER_MIN: 0,
  DEVIATION_SLIDER_MAX: 50,
  SOIL_CAPACITY_SLIDER_MIN: 250,
  SOIL_CAPACITY_SLIDER_MAX: 500,
} as const;

export const UNITS = {
  MM_PER_M: 1000,
} as const;
