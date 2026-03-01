# CreaTech Dynamic Engineering System (DES)

## Problem Statement 3: AI-Driven Generative Design & Autonomous Construction Site Execution

### Overview
The **Dynamic Engineering System (DES)** is a proof-of-concept platform designed to bridge the gap between design assumptions and actual site conditions. By dynamically integrating real-time IoT sensor data with an AI-driven generative design engine, DES continuously optimizes construction execution, preventing delays and costly rework.

### Core Features Demo'd in this Prototype:
1. **Live Site Data Integration (IoT):** Real-time mocking of sensor feeds (e.g., Soil Bearing Capacity, Curing Temperature, Equipment Utilization).
2. **Generative Design Recalibration:** When an anomaly is detected (e.g., poor subsurface conditions), the AI triggers an automated redesign of the foundation piles (adjusting depth and layout).
3. **Predictive Cost Simulations:** A real-time trajectory chart comparing Baseline Costs vs. Rework Costs, demonstrating the exact financial impact of the AI intervention.

### How to Run Locally
1. Ensure you have Node.js installed.
2. Navigate to this directory: `cd des-platform`
3. Install dependencies: `npm install`
4. Start the application: `npm run dev`
5. Open your browser to `http://localhost:3000`

### Demo Script / Pitch
- **Step 1:** Click **"Start Live Simulation"** to begin data ingestion.
- **Step 2:** Watch the **Soil Bearing Capacity** drop over time. Once it hits a critical threshold, an anomaly alert is fired because site conditions don't match the initial CAD assumptions.
- **Step 3:** Notice the **Cost Overrun Trajectory** begin to spike as the simulation predicts major rework.
- **Step 4:** Click **"Apply AI Optimization"**. This triggers the Generative Design engine.
- **Step 5:** Watch the SVG visualization immediately recalculate pile depth and structure layout, stabilizing the cost chart and saving the project timeline.

### Tech Stack
- Framework: Next.js (App Router) + TypeScript
- Styling: Tailwind CSS v4
- Charts: Recharts
- Icons: Lucide React

Built for L&T CreaTech Hackathon.
