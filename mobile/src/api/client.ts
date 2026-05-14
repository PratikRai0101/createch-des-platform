import EventSource from "react-native-sse";
import { API_BASE_URL } from "@/constants";
import type {
  OptimizationRequest,
  OptimizationResponse,
  ChatRequest,
  ChatResponse,
  PipelineEvent,
  EventIngestRequest,
  EventRecord,
  MachineryCommand,
  MachineryCommandResponse,
} from "@/types";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  health() {
    return fetchJson<{ status: string; model: string; events_cached: number }>("/health");
  },

  latestEvents(limit = 20) {
    return fetchJson<PipelineEvent[]>(`/api/events/latest?limit=${limit}`);
  },

  ingestEvent(payload: EventIngestRequest) {
    return fetchJson<EventRecord>("/api/events/ingest", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  optimizeGeometry(payload: OptimizationRequest) {
    return fetchJson<OptimizationResponse>("/api/optimize-geometry", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  chat(payload: ChatRequest) {
    return fetchJson<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  calculatePath(payload: MachineryCommand) {
    return fetchJson<MachineryCommandResponse>("/api/machinery/calculate-path", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  streamEvents(onMessage: (event: PipelineEvent) => void, onError?: () => void) {
    const es = new EventSource(`${API_BASE_URL}/api/events/stream`);
    es.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.id) onMessage(data as PipelineEvent);
      } catch {
        // heartbeat or malformed
      }
    };
    es.onerror = () => {
      onError?.();
      es.close();
    };
    return () => es.close();
  },
};
