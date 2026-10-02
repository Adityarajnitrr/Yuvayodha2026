# Power Distribution Monitoring Portal

> **Smart Renewable Energy Supply Management for State DISCOMs**
>
> Built for the **Yuva Yodha Competition** · Powered by **Schneider Electric**

---

## What is this project?

This is a **real-time power distribution monitoring web portal** built as a competition project. It simulates how a state electricity distribution company (DISCOM) can monitor and manage electricity supply across multiple areas of a city — with live data, smart recommendations, demand forecasting, and a full audit trail.

The portal is designed for **control-room operators, shift engineers, and non-technical officers** — plain language, no jargon, fully accessible, and ready to connect to a real ML backend.

---

## The Problem We Are Solving

State power distribution companies manage electricity supply across many areas at the same time. Without a smart monitoring system:

- Operators cannot see which area is about to exceed its supply limit until a fault occurs
- There is no easy way to shift spare capacity from one area to another quickly
- Demand forecasts are manual and error-prone
- There is no audit trail of who changed what and when
- Renewable energy (solar, hydro) is not optimally used — thermal fills the gap unnecessarily

This portal solves all of these in one place.

---

## Key Features

### Live Monitoring (30-second refresh)
- 12 distribution areas tracked in real time
- Each area shows: power used (MW), supply limit (MW), share of limit (%), and status
- Status is always **icon + word + colour** — never colour alone (accessibility requirement)
  - ✓ **Normal** — under 70% of limit
  - ● **Needs attention** — 70–90% of limit
  - ⚠ **Urgent** — over 90% of limit

### Smart Recommendations
- Automatic suggestions when an area is overloaded
- Suggests moving spare MW from areas with headroom to areas in need
- One-click Apply with confirm dialog and 10-second Undo

### Adjust Supply (4-Step Form)
- Step 1 — Select area
- Step 2 — See current limits (power given, power needed, spare supply, battery, safe maximum)
- Step 3 — Enter new supply — **hard cap enforced, cannot exceed safe maximum**
- Step 4 — Review and confirm with reference number
- Emergency Supply Boost for critical situations
- Full audit log with CSV download

### Demand Forecast
- Hourly forecast for the next 6, 24, or 48 hours
- Demand line with confidence range, stacked supply plan (Solar / Hydro / Thermal / Battery)
- Solar is exactly 0 between 18:30 and 05:30 (physics-accurate)
- Scenario switching: Live, Cloudy afternoon, Heatwave evening, Reduced hydro, Forecast error

### Area Detail Pages
- 4 tabs: Overview, Houses, Trend chart, Change records
- House-level data (20–40 houses per area, kW usage, flexible load flag)

### Notices & Records
- Notices raised automatically when areas hit thresholds
- Full audit trail of every supply change ever made
- Filters, date range, source filter, CSV export

### Accessibility
- Text size controls (A− / A / A+)
- High-contrast mode
- English / Hindi language switch
- Keyboard navigation, skip link, ARIA live regions

---

## Pages

| Route | Page |
|-------|------|
| `/` | Home — Current Power Status |
| `/areas` | Area-wise Status (SVG map + table) |
| `/areas/:id` | Area Detail (Overview / Houses / Trend / Records) |
| `/adjust` | Adjust Supply (4-step form) |
| `/forecast` | Demand Forecast |
| `/notices` | Notices & Records |
| `/help` | Help, FAQs, User Guide |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| State management | Zustand |
| Charts | Recharts |
| Styling | Plain CSS with CSS variables |
| Font | Noto Sans + Noto Sans Devanagari |

---

## Project Structure

```
src/
├── api/
│   └── gridApi.ts          # Service layer — swap mock → real ML API here
├── data/
│   └── engine.ts           # Single data engine — ALL calculations live here
├── store/
│   └── gridStore.ts        # Zustand global store
├── context/
│   └── AppContext.tsx      # Language context (EN / HI)
├── lib/
│   └── translations.ts     # All UI strings in English and Hindi
├── components/
│   ├── shell/
│   │   ├── Frame.tsx       # Page frame (header, nav, footer, notice bar)
│   │   └── Layout.tsx      # Route layout wrapper
│   └── ui/
│       └── index.tsx       # Shared components (StatusTag, StatCard, etc.)
└── pages/
    ├── home/               # Current Power Status
    ├── areas/              # Area-wise Status + Area Detail
    ├── adjust/             # Adjust Supply form
    ├── forecast/           # Demand Forecast
    ├── notices/            # Notices & Records
    └── help/               # Help page
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/agityaupadhyay9450445597-cyber/YuvaYodhaProjectSchneider.git
cd YuvaYodhaProjectSchneider

# Install
npm install

# Run dev server
npm run dev
```

Open **http://localhost:5173** (Vite will pick the next available port if 5173 is busy).

```bash
# Production build
npm run build
npm run preview
```

---

## ML Model Integration — Roadmap

This is the core of our next phase. The portal is already architected to receive ML predictions — the current data is a physics-based simulation placeholder.

### How to connect the ML backend

The file `src/api/gridApi.ts` is the **single connection point**. Set one environment variable:

```bash
# .env file
VITE_API_BASE=https://your-ml-api-url.com/api
```

That's it — every function in `gridApi.ts` automatically switches from mock data to real `fetch()` calls. No other code changes needed.

### API endpoints the frontend expects

| Function | HTTP | Description |
|----------|------|-------------|
| `getGridSnapshot()` | `GET /snapshot` | Live grid state for all areas |
| `getForecast({ scope, areaId, from, horizonH })` | `POST /forecast` | Hourly demand forecast with confidence range |
| `postAllocation({ areaId, newMW, reason, duration })` | `POST /allocation` | Apply a supply change |
| `getNotices()` | `GET /notices` | Open notices |
| `getChangeLog()` | `GET /changelog` | Full audit log |
| `getBaselineComparison()` | `GET /baseline` | Improvement metrics vs baseline |

### What the ML model will power

| Feature | Current (simulation) | Planned (ML) |
|---------|---------------------|-------------|
| Demand forecast | Physics-based diurnal curve | LSTM / time-series model on historical load data |
| Solar output | Bell-curve formula (cloud factor) | Weather API + irradiance prediction model |
| Supply recommendations | Headroom heuristic | Optimization model (minimize cost + outage risk) |
| Anomaly detection | Fixed thresholds (70% / 90%) | ML-based per-area anomaly detection |
| Battery dispatch | Simple rule-based | Reinforcement learning dispatch agent |
| Baseline comparison | Fixed placeholder values | Real A/B simulation comparison |

### Target ML model specs

- **Model type:** LSTM sequence model (or Prophet for interpretability)
- **Inputs:** Historical hourly demand per area, temperature, day of week, public holiday flag, solar irradiance
- **Output:** Demand forecast (MW) for next 1–48 hours with 80% confidence interval (P10 / P90)
- **Target accuracy:** < 5% MAPE
- **Retrain frequency:** Weekly on updated load data
- **Serving:** FastAPI or Flask REST endpoint

### Expected JSON schema from ML backend

**`GET /snapshot`**
```json
{
  "ts": "2026-09-30T20:42:00Z",
  "demandMW": 38.4,
  "supply": { "solar": 0, "hydro": 11.2, "thermal": 25.8, "battery": 1.4, "total": 38.4 },
  "spareMW": 1.6,
  "battery": { "socPct": 68, "usableKwh": 163, "maxDischargeKW": 80, "isCharging": false, "timeToEmptyH": 4.2 },
  "areas": [
    {
      "id": "a01", "name": "Sector 14 – North",
      "limitMW": 4.2, "allocatedMW": 3.1, "loadMW": 3.8,
      "priority": false, "flexibleLoadMW": 0.3,
      "status": "warn", "shareOfLimit": 0.90,
      "trend": "up", "sparkline": [3.5, 3.6, 3.7, 3.8],
      "maxAllocatableMW": 4.0,
      "houses": [{ "id": "H-0101", "loadKW": 4.2, "flexible": true }]
    }
  ],
  "renewablePct": 29.2,
  "co2AvoidedKg": 9200,
  "avgCostRsPerUnit": 1.42
}
```

**`POST /forecast`**
```json
{
  "points": [
    {
      "ts": "2026-09-30T21:00:00Z", "hour": 21,
      "demandMW": 32.4, "p10": 30.1, "p90": 34.7,
      "solar": 0, "hydro": 11.2, "thermal": 19.8, "battery": 1.4,
      "isActual": false
    }
  ],
  "peakMW": 41.2, "peakHour": 20,
  "minMW": 22.1, "avgMW": 34.6,
  "renewablePct": 28.5,
  "modelStatus": "working",
  "lastRefresh": "2026-09-30T20:30:00Z",
  "typicalErrorPct": 3.8
}
```

---

## Design Principles

- **Plain language everywhere** — "Power needed right now" not "total system demand". "Battery charge left" not "SOC".
- **Status always has icon + word** — never colour alone (WCAG requirement)
- **No blank screens** — every loading state shows text, every error shows a plain message with what to do
- **Full audit trail** — every supply change gets a reference number (ADJ-2026-XXXXX), reason, duration, and operator name
- **Single data source** — `src/data/engine.ts` is the only place numbers are generated. All pages read from the same store.

---

## Competition Context

This project is our submission for the **Yuva Yodha Competition** in partnership with **Schneider Electric**.

The challenge: build a smart, accessible power distribution management system that can be connected to a real ML forecasting model — helping DISCOMs reduce outages, optimise renewable energy usage, and cut thermal power consumption.

---

## Contributing / ML Integration

If you are working on the ML backend:

1. Implement the REST endpoints listed above
2. Set `VITE_API_BASE` in a `.env` file pointing to your server
3. The frontend will automatically use your real data — no frontend changes needed
4. See `src/api/gridApi.ts` for the exact function signatures

---

*Built with React + TypeScript + Vite · Recharts for charts · Zustand for state management*
