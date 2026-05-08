import asyncio
import json
import math
from collections import deque
from datetime import datetime, timezone
from hashlib import sha256
from typing import Any, Deque, Dict, List, Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

app = FastAPI(title="CreaTech Generative AI Backend")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def utc_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%H:%M:%S")


def deterministic_jitter(seed_payload: str, low: float = 0.9, high: float = 1.1) -> float:
    digest = sha256(seed_payload.encode("utf-8")).hexdigest()
    normalized = int(digest[:8], 16) / 0xFFFFFFFF
    return low + (high - low) * normalized


class OptimizationRequest(BaseModel):
    soil_bearing_capacity: float
    deviation_mm: float
    max_deflection_tolerance: float
    material_density: float
    safety_factor: float


class Option(BaseModel):
    id: str
    name: str
    depth_m: float
    cost_inr: float
    carbon_tco2e: float
    construction_time_days: int
    confidence_score: float
    reason: str


class OptimizationResponse(BaseModel):
    original_depth_m: float
    recommended_option_id: str
    options: List[Option]
    decision_trace: List[str]


EventSource = Literal["iot", "cv", "anomaly", "optimization", "approval", "system"]
ScenarioStage = Literal["SENSE", "DETECT", "RECALIBRATE", "IMPACT", "AUDIT"]
EventSeverity = Literal["info", "warning", "critical", "success"]


class EventIngestRequest(BaseModel):
    source: EventSource
    stage: ScenarioStage
    severity: EventSeverity = "info"
    title: str
    detail: str
    context: Dict[str, Any] = Field(default_factory=dict)


class EventRecord(BaseModel):
    id: str
    ts: str
    source: EventSource
    stage: ScenarioStage
    severity: EventSeverity
    title: str
    detail: str
    context: Dict[str, Any]


class Position(BaseModel):
    x: float
    y: float
    z: float


class MachineryCommand(BaseModel):
    machine_id: str
    current_pos: Position
    target_pos: Position


class MachineryCommandResponse(BaseModel):
    machine_id: str
    gcode: List[str]
    estimated_time_seconds: float


event_log: Deque[EventRecord] = deque(maxlen=300)
event_version = 0


def append_event(event: EventRecord) -> None:
    global event_version
    event_log.append(event)
    event_version += 1


@app.post("/api/optimize-geometry", response_model=OptimizationResponse)
def optimize_geometry(req: OptimizationRequest):
    """
    Simulates a deterministic AI/ML decision engine predicting structural options
    based on live constraints.
    """
    base_depth = 0.5

    deviation_penalty = (req.deviation_mm / 1000) * 1.5
    safety_multiplier = req.safety_factor / 1.5
    required_depth = base_depth + deviation_penalty * safety_multiplier

    opt_a_depth = round(required_depth * 0.95, 3)
    opt_b_depth = round(required_depth * 1.1, 3)
    standard_sizes = [0.5, 0.6, 0.75, 0.9, 1.0, 1.2]
    opt_c_depth = next((s for s in standard_sizes if s >= required_depth), 1.2)

    base_seed = (
        f"{req.soil_bearing_capacity:.2f}|{req.deviation_mm:.2f}|"
        f"{req.max_deflection_tolerance:.2f}|{req.material_density:.2f}|{req.safety_factor:.2f}"
    )

    jitter_a = deterministic_jitter(f"{base_seed}|opt_a")
    jitter_b = deterministic_jitter(f"{base_seed}|opt_b")
    jitter_c = deterministic_jitter(f"{base_seed}|opt_c")

    options = [
        Option(
            id="opt_a",
            name="Lowest Cost",
            depth_m=opt_a_depth,
            cost_inr=round(45000 + (opt_a_depth * 10000) * jitter_a, 2),
            carbon_tco2e=round(12.5 + (opt_a_depth * 5), 2),
            construction_time_days=14,
            confidence_score=0.88,
            reason="Minimizes immediate material spend while staying above computed depth threshold.",
        ),
        Option(
            id="opt_b",
            name="Lowest Carbon",
            depth_m=opt_b_depth,
            cost_inr=round(52000 + (opt_b_depth * 11000) * jitter_b, 2),
            carbon_tco2e=round(8.2 + (opt_b_depth * 2), 2),
            construction_time_days=16,
            confidence_score=0.92,
            reason="Selects lower-emission structural composition with better safety envelope margin.",
        ),
        Option(
            id="opt_c",
            name="Fastest Execution",
            depth_m=opt_c_depth,
            cost_inr=round(60000 + (opt_c_depth * 9000) * jitter_c, 2),
            carbon_tco2e=round(15.0 + (opt_c_depth * 4.5), 2),
            construction_time_days=8,
            confidence_score=0.98,
            reason="Uses nearest precast standard depth for shortest site execution turnaround.",
        ),
    ]

    decision_trace = [
        f"Input deviation observed: {req.deviation_mm:.1f} mm",
        f"Required baseline depth computed: {required_depth:.3f} m",
        "Multi-objective options generated for cost, carbon, and time.",
        "Recommended option prioritizes carbon + safety balance for finals demo profile.",
    ]

    optimization_event = EventRecord(
        id=f"evt-opt-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        ts=utc_stamp(),
        source="optimization",
        stage="RECALIBRATE",
        severity="info",
        title="Optimization Run Completed",
        detail="Generated deterministic design options from current live constraints.",
        context={
            "deviation_mm": round(req.deviation_mm, 2),
            "soil_bearing_capacity": round(req.soil_bearing_capacity, 2),
            "recommended_option": "opt_b",
        },
    )
    append_event(optimization_event)

    return OptimizationResponse(
        original_depth_m=base_depth,
        recommended_option_id="opt_b",
        options=options,
        decision_trace=decision_trace,
    )


@app.post("/api/machinery/calculate-path", response_model=MachineryCommandResponse)
def calculate_path(command: MachineryCommand):
    dx = command.target_pos.x - command.current_pos.x
    dy = command.target_pos.y - command.current_pos.y
    dz = command.target_pos.z - command.current_pos.z
    distance = math.sqrt(dx * dx + dy * dy + dz * dz)
    feed_rate = 500
    estimated_time = max(1.0, distance * 0.12)

    gcode = [
        f"G01 X{command.target_pos.x:.2f} Y{command.target_pos.y:.2f} Z{command.target_pos.z:.2f} F{feed_rate}",
        "M03",
        "G04 P1",
        "M05",
    ]

    return MachineryCommandResponse(
        machine_id=command.machine_id,
        gcode=gcode,
        estimated_time_seconds=round(estimated_time, 2),
    )


@app.post("/api/events/ingest", response_model=EventRecord)
def ingest_event(payload: EventIngestRequest):
    event = EventRecord(
        id=f"evt-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        ts=utc_stamp(),
        source=payload.source,
        stage=payload.stage,
        severity=payload.severity,
        title=payload.title,
        detail=payload.detail,
        context=payload.context,
    )
    append_event(event)
    return event


@app.get("/api/events/latest", response_model=List[EventRecord])
def latest_events(limit: int = 20):
    safe_limit = max(1, min(limit, 100))
    return list(event_log)[-safe_limit:]


@app.get("/api/events/stream")
async def stream_events():
    async def event_generator():
        last_seen_version = event_version

        while True:
            await asyncio.sleep(1.5)

            if event_version != last_seen_version and len(event_log) > 0:
                payload = event_log[-1].dict()
                yield f"data: {json.dumps(payload)}\n\n"
                last_seen_version = event_version
            else:
                yield "event: heartbeat\ndata: ping\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/health")
def health_check():
    return {"status": "ok", "model": "loaded", "events_cached": len(event_log)}
