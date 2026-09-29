# TrafficMemory 🚦🧠
### An AI Agent That Remembers What Actually Works on the Road

> "TrafficMemory doesn't just analyze today's traffic. It remembers what happened before, what was tried, what worked, and uses that experience when the next incident occurs."

TrafficMemory is a persistent traffic intelligence platform for municipal traffic operations centers and emergency dispatchers in Hyderabad. It uses a Hindsight-style memory layer to break away from static rules: instead of reacting only to the current incident, it recalls similar past situations, compares what actually worked, and retains every new outcome so future decisions improve.

---

## The Core Memory Loop

```text
TRAFFIC / EMERGENCY EVENT
          ↓
      AI AGENT
          ↓
      RECALL
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
     RETAIN
          ↓
FUTURE DECISIONS IMPROVE
```

---

## Key Modes

### 1. Routine Traffic Operations
- **Input:** location, day, time, weather, incident type, severity.
- **Recall:** scores every stored memory by location/zone match, incident type, weather, and day/time similarity, and pulls the top 6–8.
- **Intervention evaluation:** compares success rates across *Signal retiming*, *Traffic diversion*, *Manual traffic control*, and *Corridor metering*.
- **Recommendation:** the highest-success intervention among recalled memories, with the historical success ratio shown as evidence.
- **Continuous learning:** operators record whether the intervention worked; the outcome is retained immediately and counted in future recalls.

### 2. Emergency Route Intelligence
- **Input:** origin, destination hospital, urgency, weather.
- **Route comparison:** evaluates historical trip records per route rather than picking the shortest path.
- **Example:** Secunderabad → Apollo Jubilee Hills — Route A (9 historical trips, 44% success) vs. Route B (8 historical trips, 87.5% success, ~8 min faster). Route B is recommended on historical performance, not distance.

### 3. Before vs. After Memory Comparison
| Without Memory | With TrafficMemory |
|---|---|
| Generic heuristic: "Accident detected on main arterial — consider diverting traffic." | Recalled similar past accidents and compares actual outcomes for each intervention. |
| No evidence, same suggestion regardless of history. | Recommends the intervention with the strongest track record for this specific situation, with the numbers shown. |

---

## Geographic Context

- **5 operational zones:** Secunderabad, Begumpet, Ameerpet, Banjara Hills/Jubilee Hills, HITEC City/Gachibowli.
- **6 hospital destinations:** Apollo Jubilee Hills, CARE Banjara Hills, Yashoda Secunderabad, KIMS Secunderabad/Begumpet, Yashoda Somajiguda, AIG Gachibowli, CARE HITEC City.
- All zone names and hospital names are real Hyderabad locations used as labels; the incident histories, travel times, and success rates attached to them are **synthetic**, generated for this demo.

---

## Demo Scenarios

1. **Rain + evening accident, Ameerpet (Friday 6:30 PM)** — recall retrieves comparable past incidents and recommends signal retiming.
2. **Critical ambulance corridor, Secunderabad → Apollo Jubilee Hills** — recalls 17 historical trips across two routes and recommends the faster one.
3. **Failed intervention learning, Gachibowli/ORR (foggy Monday)** — shows signal retiming failing in past fog conditions, so the agent recommends diversion instead.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide icons.
- **Map:** Google Maps via `@vis.gl/react-google-maps` (`HyderabadGoogleMap.tsx`), wired into the app. Requires `VITE_GOOGLE_MAPS_API_KEY`. `maplibre-gl` is included as a dependency and an unused MapLibre-based map component (`HyderabadMap.tsx`) exists in the repo but is not currently rendered — remove or wire it up, don't claim it as the live map.
- **Backend:** Node.js + Express + TypeScript (`server.ts`).
- **Memory layer:** `MemoryService` abstraction. Runs a real in-process recall/retain engine by default; if `HINDSIGHT_URL` and `HINDSIGHT_API_KEY` are set, it also attempts to sync to a live Hindsight instance via `POST /v1/memories` and `GET /v1/health`. **These endpoint shapes are unverified against the live Hindsight API** — confirm against the current docs (https://hindsight.vectorize.io/) before demoing this as a live connection. If the call fails, it silently falls back to the in-process engine, so nothing breaks either way.
- **AI reasoning:** Google GenAI SDK (`@google/genai`). When `GEMINI_API_KEY` is set, real Gemini calls generate the explanation text, cached per situation; without a key (or on quota errors), a deterministic template explanation is used instead.

---

## API Endpoints

- `GET /api/health` — system status and current memory mode (`HINDSIGHT_LIVE` or `DEMO_MOCK`).
- `GET /api/stats` — retained memory count, success rate, recall/retain counters.
- `GET /api/zones` — operational zones and coordinates.
- `GET /api/hospitals` — hospital destinations.
- `GET /api/incidents` — active incident markers.
- `GET /api/corridors` — corridor geometry.
- `GET /api/memories` — filterable memory list (zone, location, incident, weather, outcome).
- `POST /api/analyze` — run recall + recommendation for a traffic incident.
- `POST /api/emergency` — run historical route comparison for an emergency trip.
- `POST /api/outcomes` — retain an operator-recorded outcome.
- `POST /api/reset-memories` — reset the store back to seed data.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
# Optional: enables real Gemini-generated explanations.
# Without it, a deterministic template explanation is used — nothing breaks.
GEMINI_API_KEY="your-api-key"

# Optional: syncs retained memories to a live Hindsight instance.
# Without it, the built-in in-process memory engine is used.
HINDSIGHT_URL="https://api.hindsight.vectorize.io"
HINDSIGHT_API_KEY="your-hindsight-key"

# Required for the map view to render.
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-key"

PORT=3000
```

## Setup

```bash
npm install    # or bun install
cp .env.example .env   # fill in the keys you have
npm run dev             # starts the Express + Vite server on :3000
```

---

## Current status (honest)

| Piece | Status |
|---|---|
| Frontend (all views: Overview, Traffic, Emergency, Memory Explorer, Intelligence, Demo) | ✅ Built and working |
| Backend API (all 11 endpoints) | ✅ Built and working |
| Recall/retain logic (similarity scoring, success-rate ranking) | ✅ Built and working, in-process by default |
| Gemini-generated explanations | ✅ Real, when `GEMINI_API_KEY` is set; deterministic fallback otherwise |
| Google Maps view | ✅ Wired and working, needs `VITE_GOOGLE_MAPS_API_KEY` |
| MapLibre map | ⚠️ Dependency and component present, not currently used |
| Live Hindsight sync | ⚠️ Code exists, endpoint shapes unverified against live docs, not confirmed working end to end |
| Traffic/route data | Synthetic — 24 seed memories, real place names |

---

## Limitations

- Seed dataset is small (24 memories) — success rates from 4–8 samples are illustrative, not statistically robust.
- Live Hindsight sync is unverified; treat `DEMO_MOCK` mode as the tested path for the hackathon demo.
- No live traffic feed, signal control, or dispatch integration — this is a decision-support prototype, not a control system.

## Future Scope

- Verify and finish the live Hindsight integration against current API docs.
- Expand seed data for stronger statistical confidence.
- Wire or remove the unused MapLibre component.
- Add live traffic/incident feeds.
