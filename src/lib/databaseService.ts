import { createClient } from "@supabase/supabase-js";
import type { SiteSimulationState, Option } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type SensorDataRecord = {
  project_id: string;
  deviation_mm: SiteSimulationState["deviation"];
  soil_bearing_kpa: SiteSimulationState["soilBearingCapacity"];
  status: SiteSimulationState["status"];
};

export type OptimizationRunRecord = {
  project_id: string;
  input_constraints: {
    soil_bearing_capacity: number;
    deviation_mm: number;
    max_deflection_tolerance: number;
    material_density: number;
    safety_factor: number;
  };
  options_offered: Option[];
  selected_option_id: string | null;
  rework_saved_inr: number;
};

export type AuditEntryRecord = {
  project_id: string;
  event_type: string;
  details: string;
  actor_id?: string;
  metadata?: Record<string, unknown>;
};

async function generateHashProof(details: string): Promise<string> {
  const data = new TextEncoder().encode(details);

  if (typeof globalThis.crypto?.subtle !== "undefined") {
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  const { createHash } = await import("crypto");
  return createHash("sha256").update(data).digest("hex");
}

class TelemetryService {
  logSensorData(data: SensorDataRecord) {
    return supabaseClient.schema('telemetry_service').from('sensor_data').insert([data]);
  }

  getRecent(project_id: string) {
    return supabaseClient
      .schema('telemetry_service')
      .from('sensor_data')
      .select("deviation_mm, created_at")
      .eq("project_id", project_id)
      .order("created_at", { ascending: true })
      .limit(10);
  }
}

class DesignService {
  async archiveOptimization(run: OptimizationRunRecord) {
    const payload = {
      project_id: "00000000-0000-4000-8000-000000000001",
      rework_saved_inr: Number(run.rework_saved_inr),
      schedule_impact: 0,
    };
    console.log("SENDING DATA:", payload);
    const result = await supabaseClient.schema('ai_design_service').from('optimization_runs').insert([payload]);
    console.log("Archive Result:", { data: result.data, error: result.error });
    return result;
  }

  getSummary(project_id: string) {
    return supabaseClient
      .schema('ai_design_service')
      .from('optimization_runs')
      .select("id, rework_saved_inr")
      .eq("project_id", project_id);
  }
}

class AuditService {
  async createAuditEntry(entry: AuditEntryRecord) {
    const hash_proof = await generateHashProof(entry.details);
    return supabaseClient.schema('audit_compliance').from('immutable_logs').insert([
      {
        ...entry,
        hash_proof,
      },
    ]);
  }
}

class DatabaseService {
  readonly telemetry = new TelemetryService();
  readonly design = new DesignService();
  readonly audit = new AuditService();
}

export const db = new DatabaseService();
export default db;
