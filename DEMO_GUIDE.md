# DES — Demo Guide for Finals

## How to Run

```bash
# Frontend (terminal 1)
cd createch-des-platform
npm install
npm run dev
# → http://localhost:3000

# Backend — optional, all features work without it (terminal 2)
cd createch-des-platform/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

---

## Page-by-Page Tour

### 1. Command Center (Home — `/`)
**What it shows:** Main live execution dashboard with 3D digital twin, IoT sensor feed, and cost/schedule KPIs.

| Control / Area | What It Does | Demo Tip |
|---|---|---|
| **Start Live Simulation** | Begins gradually degrading soil bearing capacity and structural deviation | Click this first to show "live data" |
| **Pause Data Feed** | Freezes the simulation | Shows you control the timeline |
| **Reset Demo** | Returns all values to baseline | Use between demo runs |
| **3D Canvas** | Interactive Three.js structural model. Changes colour and geometry based on live state | Audience can see (blue → red → purple) |
| **Execute AI Recalibration** | Appears when anomaly detected. Triggers re-optimization | **Key moment** — click after anomaly appears |
| **View Recalibration** | Camera flythrough zooms into the beam to show depth change | Click to explain the engineering impact visually |
| **Executive / Engineer View** (in top ribbon) | Toggles between business language and technical diagnostics | Use **Executive** for judges, **Engineer** for technical Q&A |
| **Replay Scenario** | Automatically runs the full demo loop (start → anomaly → recalibrate) | **One-click finals demo** — just press this |

**Narrative flow:** _Click Start Simulation → Soil drops → Critical alert fires → Click Execute AI Recalibration → Costs stabilise → 3D turns purple → Click View Recalibration for flythrough_

---

### 2. Generative Design Studio (`/generative-design`)
**What it shows:** Parameter sliders, AI optimization engine, and tradeoff controls.

| Control / Area | What It Does | Demo Tip |
|---|---|---|
| **Live Site Constraints** (sliders) | Adjust deviation, soil bearing capacity | Change a slider to show inputs change |
| **Run Generative Optimization** | Calls the Python backend (or simulates) to generate 3 structural options | **Key moment** — shows "Cost / Carbon / Time" cards |
| **Tradeoff Weights** | Drag Cost/Carbon/Time sliders — options re-rank in real time with a Score % badge | **Finals differentiator** — move Carbon to 80% and watch the green option jump to #1 |
| **Option Cards** | Click to select an option. 3D preview updates to show the chosen depth | Each card shows depth, cost, carbon, confidence |
| **Decision Trace** | Bottom panel shows the reasoning steps | Adds transparency — judges love this |
| **3D Preview** | Shows selected option's beam geometry with ghost baseline overlay | Compare before/after |
| **AI Chat button** | Toggles the Qwen 3.5 chatbot panel on the right | **Finals differentiator** — talk to the AI |
| **Qwen 3.5 Chat Panel** | Ask the AI to generate or refine structural designs. Type "generate 3 beam options" or "optimize for lower cost" | Every AI response can generate option cards on the left. Iterative refinement tracked in Recalibration History |
| **Recalibration History** | Shows all past AI design iterations | Demonstrates multi-step refinement |

**Narrative flow:** _Click AI Chat → Type "Generate 3 beam options for these constraints" → Options appear → Adjust feedback → Ask "Optimize for lower carbon" → New options appear → History tracks each iteration_

---

### 3. IoT Sensors & Computer Vision (`/iot-sensors`)
**What it shows:** Simulated drone CCTV feed with YOLO bounding boxes, edge terminal logs, and cross-system events.

| Control / Area | What It Does | Demo Tip |
|---|---|---|
| **CCTV Feed** | Stylized drone view with bounding boxes tracking equipment and workers | Feels like a real operations centre |
| **Inject CV Anomaly** | Triggers an emergency site deviation | Use to show the detection pipeline |
| **REC / REPLAY badge** | `REC` during live feed, `REPLAY` during incident replay | Shows operational vs training mode |
| **Replay Incident** | Appears after anomaly. Plays a 6-second time-lapse with amplified object movement | **Finals differentiator** — show the incident replay with timeline |
| **Replay Timeline** | Progress bar with Normal → Anomaly Peak → Recovery markers | Each marker corresponds to system events |
| **Edge Gateway Terminal** | Scrolling telemetry log with real-looking payloads | Makes the simulation feel real |
| **Cross-System Event Timeline** | Lists latest events from all pages (anomaly, optimization, etc.) | Shows the closed-loop in action |
| **Sensor Grid** | Shows deployed sensor nodes with battery/status | Enterprise credibility |

**Narrative flow:** _Inject Anomaly → Feed border turns red → Replay Incident button appears → Click it → Timeline plays → Objects move → Timeline markers progress → "REC" becomes "REPLAY"_

---

### 4. Site Execution & Logistics (`/execution`)
**What it shows:** Gantt chart, machinery telemetry, labour allocation.

| Control / Area | What It Does | Demo Tip |
|---|---|---|
| **Execution Sync Status** | Coloured bar showing current sync state | Highlights how anomaly/optimization affects the schedule |
| **Schedule Variance** | Shows days ahead/behind | Updates based on scenario state |
| **Gantt Chart** | Dynamic 4-week schedule with AI-recalibrated tasks | The "Level 1 Columns" row changes based on AI state |
| **Heavy Machinery Telemetry** | Crane, pump, excavator with load and status | Shows maintenance alerts |
| **Labour Allocation** | Count of steel fixers, carpenters, welders, engineers | Highlights shortage |

**Narrative flow:** _Anomaly → Sync Status goes yellow/red → Schedule shows +4 days → Apply Recalibration → Sync goes green → Schedule shows -1 day → Gantt row updates to "AI Recalibrated"_

---

### 5. Analytics & ESG (`/analytics`)
**What it shows:** Executive KPIs, cost trajectory, carbon savings, and audit export.

| Control / Area | What It Does | Demo Tip |
|---|---|---|
| **Cost Savings (AI Driven)** | Updates between ₹1.10Cr / ₹0.86Cr / ₹1.42Cr based on state | Shows financial impact |
| **Carbon Mitigation** | Static 190 Tons | ESG talking point |
| **Rework Reduction** | Updates between 81% / 62% / 94% based on state | Shows risk mitigation |
| **Cost Trajectory Chart** | Composed chart with baseline vs AI-optimized costs | The gap widens as AI optimization improves |
| **Carbon Savings Chart** | Bar chart of monthly tCO2e mitigated | ESG credibility |
| **Live Decision Trace** | Shows recent events from all pages (same timeline as IoT page) | Cross-system consistency |
| **AI Strategic Insight** | Dynamic text that changes based on live state | Show executives how the system "thinks" |
| **Export Event Ledger (.json)** | Downloads full event history as JSON | **Finals differentiator** — "one-click compliance" |
| **Export Report (.pdf)** | Triggers browser print (PDF) | Enterprise ready |

**Narrative flow:** _Before recalibration → Cost savings at ₹0.86Cr, Rework at 62% → Apply recalibration → Switch to this page → Cost jumps to ₹1.42Cr, Rework to 94% → Insight text updates → Click Export Event Ledger → JSON downloads_

---

### 6. Settings (`/settings`)
**What it shows:** Project details and AI engine configuration. Most tabs show "Under Construction" — only Project Details is functional.

---

## Top Scenario Ribbon (Global — All Pages)

This bar appears at the top of every page and provides global controls:

| Area | What It Does |
|---|---|
| **Finals Scenario Flow badge** | Indicates we're in guided demo mode |
| **Pipeline badge** | Shows `API Synced` (backend running) or `Simulation Fallback` (no backend) |
| **Stage cards** (SENSE → DETECT → RECALIBRATE → IMPACT → AUDIT) | 5-step visual progress. Completed steps turn green, current step is blue. Updates automatically |
| **Executive View / Engineer View** | Toggles persona across all pages |
| **Show Timeline / Hide Timeline** | Toggles an expandable event log panel |
| **Start Feed / Pause Feed** | Start or stop sensor simulation |
| **Inject Anomaly** | Triggers emergency deviation |
| **Apply Recalibration** | Appears only when anomaly is active. Triggers AI optimization |
| **Reset** | Returns everything to baseline |
| **Replay Scenario** | **One-click finals demo.** Runs: Start → Anomaly → Recalibrate → Stop automatically over 9 seconds |
| **Latest Event Card** | Shows the most recent cross-system event with severity colouring |

**Demo tip:** Use **Replay Scenario** for a hands-free walkthrough, then use individual buttons for specific callouts.

---

## Finals Presentation Script (60 seconds)

1. **Landing on Command Center** — _Click Replay Scenario_
2. _"Watch. The site degrades — anomaly fires — AI recalculates — costs recover."_
3. During replay, option: **Click View Recalibration** in the 3D overlay
4. _"The digital twin zooms into the affected beam to show the exact engineering change."_
5. When replay ends: **Navigate to Analytics page**
6. _"Now the business impact: 94% rework reduction, ₹1.42 Cr saved, full audit trail."_
7. **Click Export Event Ledger** → JSON downloads
8. _"One-click compliance. We can trace every decision back to the sensor reading that triggered it."_

## Keyboard Shortcuts
- **Ctrl+Shift+D** → Inject disaster/anomaly at any time
- **Print (Ctrl+P)** on Analytics page → PDF report
