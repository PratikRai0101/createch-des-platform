from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI(title="CreaTech Generative AI Backend")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class OptimizationResponse(BaseModel):
    original_depth_m: float
    recommended_option_id: str
    options: list[Option]

@app.post("/api/optimize-geometry", response_model=OptimizationResponse)
def optimize_geometry(req: OptimizationRequest):
    """
    Simulates a Generative AI / ML model predicting the optimal structural geometry 
    based on real-time IoT constraints.
    """
    base_depth = 0.5
    
    # Simple algorithmic penalty based on constraints
    deviation_penalty = (req.deviation_mm / 1000) * 1.5 
    safety_multiplier = req.safety_factor / 1.5
    
    # Calculate base required depth
    required_depth = base_depth + deviation_penalty * safety_multiplier
    
    # Option A: Lowest Cost (Minimal viable depth)
    opt_a_depth = round(required_depth * 0.95, 3)
    
    # Option B: Lowest Carbon (Alternative material composite - slightly thicker but lower carbon)
    opt_b_depth = round(required_depth * 1.1, 3)
    
    # Option C: Fastest Execution (Pre-cast standard size, might be over-engineered but fast)
    standard_sizes = [0.5, 0.6, 0.75, 0.9, 1.0, 1.2]
    opt_c_depth = next((s for s in standard_sizes if s >= required_depth), 1.2)

    options = [
        Option(
            id="opt_a",
            name="Lowest Cost",
            depth_m=opt_a_depth,
            cost_inr=round(45000 + (opt_a_depth * 10000) * random.uniform(0.9, 1.1), 2),
            carbon_tco2e=round(12.5 + (opt_a_depth * 5), 2),
            construction_time_days=14,
            confidence_score=0.88
        ),
        Option(
            id="opt_b",
            name="Lowest Carbon",
            depth_m=opt_b_depth,
            cost_inr=round(52000 + (opt_b_depth * 11000) * random.uniform(0.9, 1.1), 2),
            carbon_tco2e=round(8.2 + (opt_b_depth * 2), 2), # Significantly lower carbon
            construction_time_days=16,
            confidence_score=0.92
        ),
        Option(
            id="opt_c",
            name="Fastest Execution",
            depth_m=opt_c_depth,
            cost_inr=round(60000 + (opt_c_depth * 9000) * random.uniform(0.9, 1.1), 2),
            carbon_tco2e=round(15.0 + (opt_c_depth * 4.5), 2),
            construction_time_days=8, # Pre-cast, much faster
            confidence_score=0.98
        )
    ]
    
    return OptimizationResponse(
        original_depth_m=base_depth,
        recommended_option_id="opt_b",  # Defaulting to ESG-friendly recommendation
        options=options
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "model": "loaded"}
