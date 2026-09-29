# TrafficMemory 🚦🧠
### An AI Agent That Remembers What Actually Works on the Road

> **"TrafficMemory doesn't just analyze today's traffic. It remembers what happened before, what was tried, what worked, and uses that experience when the next incident occurs."**

TrafficMemory is a persistent traffic intelligence platform designed for municipal traffic operations centers and emergency dispatchers in **Hyderabad**. By integrating **Hindsight episodic memory**, TrafficMemory breaks away from standard naive heuristics: instead of applying static rules, it continuously recalls empirical road-corridor interventions and retains real-world outcomes so the city learns over time.

---

## 🏛️ The Core Memory Loop

```text
TRAFFIC / EMERGENCY EVENT
          ↓
      AI AGENT
          ↓
  HINDSIGHT RECALL
     ↙        ↘
SIMILAR     PAST INTERVENTIONS
INCIDENTS    + OUTCOMES
     ↘        ↙
  LLM REASONING
          ↓
    RECOMMENDATION
          ↓
  OPERATOR ACTION
          ↓
    GROUND TRUTH
          ↓
  HINDSIGHT RETAIN
          ↓
FUTURE DECISIONS IMPROVE
```

---

## ⚡ Key Modes

### 1. Routine Traffic Operations
- **Input**: Corridors, peak hours, weather shocks (rain, fog), incidents (accident, waterlogging, signal failure).
- **Hindsight Recall**: Retrieves 6–8 closely matched historical episodes under identical environmental conditions.
- **Intervention Evaluation**: Compares success rates between *Signal Retiming*, *Traffic Diversion*, *Manual Control*, and *Corridor Metering*.
- **Recommendation**: Proposes the highest-efficacy action backed by quantitative historical proof.
- **Continuous Learning**: Operators record whether the intervention cleared the queue; the new memory is immediately retained in Hindsight.

### 2. Emergency Route Intelligence
- **Input**: Origin crash site, destination hospital (e.g. *Apollo Jubilee Hills*, *CARE Banjara*, *Yashoda Secunderabad*), urgency level, weather.
- **Hindsight Route Query**: Rather than naive shortest-distance routing, evaluates historical trip records under wet Friday peak conditions.
- **Route Proof**: Compares Route A (standard Begumpet arterial with frequent signal gridlocks) vs. Route B (Minister Road inner corridor with an 87.5% critical on-time rate).

### 3. Before vs. After Memory Comparison
| Without Memory | With TrafficMemory |
|---|---|
| **Generic Heuristic**: "Accident detected on main arterial — consider diverting traffic into side lanes." | **Hindsight Grounded**: Recalled 6 similar Friday-rain accidents. Diversion flooded narrow feeder lanes in 2/2 cases. |
| **Risk**: Secondary residential gridlock and delayed emergency clearance. | **Proven Action**: Apply Signal Retiming first (succeeded in 4/6 comparable cases, halving delay from 22m to 10m). |

---

## 🗺️ Real Hyderabad Geographic Context
- **Interactive Cartography**: Powered by **MapLibre GL JS** with dark cartographic styling.
- **5 Operational Zones**:
  - `SEC`: Secunderabad (Paradise Flyover, MG Road)
  - `BGP`: Begumpet (Airport Express corridor, Prakash Nagar)
  - `AMP`: Ameerpet (Maitrivanam, SR Nagar)
  - `BJH`: Banjara Hills / Jubilee Hills (Road No. 36, Check Post)
  - `HTC`: HITEC City / Gachibowli (Cyber Towers, ORR Junction)
- **Top Hospital Emergency Hubs**:
  - Apollo Hospitals Jubilee Hills
  - CARE Hospitals Banjara Hills
  - Yashoda Hospitals Secunderabad
  - KIMS Hospitals Begumpet
  - AIG Hospitals Gachibowli
  - CARE Hospitals HITEC City

---

## 🧪 Guided 60-Second Demo Scenarios

1. **Scenario 01: Rain + Evening Accident at Ameerpet (Friday 6:30 PM)**
   - Click `DEMO` → `Play Scenario 01`.
   - Automatically populates the parameters, executes Hindsight recall, reveals 6 past memories, and recommends Signal Retiming (67% success).
2. **Scenario 02: Critical Ambulance Corridor (Secunderabad → Apollo Jubilee Hills)**
   - Click `DEMO` → `Play Scenario 02`.
   - Recalls 17 past ambulance trips under wet evening traffic; highlights recommended Route B on the Hyderabad map.
3. **Scenario 03: Failed Intervention Learning (Gachibowli ORR Foggy Monday)**
   - Click `DEMO` → `Play Scenario 03`.
   - Shows that previous signal retiming attempts failed during dense fog, guiding the agent to pivot to Traffic Diversion via Nanakramguda.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, MapLibre GL JS, Lucide icons.
- **Backend API**: Node.js & Express with TypeScript (`server.ts`).
- **Memory Layer**: Clean `MemoryService` abstraction supporting Vectorize's **Hindsight REST API** and a resilient in-process memory engine with 68+ seed memories.
- **AI Reasoning**: Google GenAI SDK (`@google/genai`) for nuanced operational explanations.

---

## 🚀 API Endpoints

- `GET /api/health` — System uptime and Hindsight connection mode.
- `GET /api/stats` — Real-time telemetry (retained memories, success rates, recall counts).
- `GET /api/zones` — Operational zones and coordinates.
- `GET /api/hospitals` — Trauma centers and bed availability.
- `GET /api/incidents` — Current active incident markers.
- `GET /api/corridors` — GeoJSON arterial speed lines.
- `GET /api/memories` — Search and filter retained experiences.
- `POST /api/analyze` — Trigger Hindsight recall and recommendation generation.
- `POST /api/emergency` — Evaluate historical corridor travel times for ambulances.
- `POST /api/outcomes` — Retain ground-truth outcomes to improve future inferences.
- `POST /api/reset-memories` — Revert memory store to initial seed state.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:
```bash
# Optional: Gemini API Key for dynamic LLM reasoning
GEMINI_API_KEY="your-api-key"

# Optional: Vectorize Hindsight credentials
HINDSIGHT_URL="https://api.hindsight.vectorize.io"
HINDSIGHT_API_KEY="your-hindsight-key"

# Port
PORT=3000
```
*Note: If Hindsight or Gemini keys are not configured, TrafficMemory runs seamlessly in high-fidelity `DEMO / MOCK MEMORY` mode with zero broken features.*

---

## ⚠️ Synthetic Data Disclaimer
All traffic incident histories, emergency run times, and corridor metrics are synthetic datasets created for demonstration and research purposes in Hyderabad.
