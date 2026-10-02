# Power Distribution Monitoring Portal

> **Renewable Energy Supply Management — Rajasthan Power Distribution Company Ltd.**
>
> Built for the **Yuva Yodha Competition** · Team Schneider Electric

---

## What is this project?

This is a **real-time power distribution monitoring web portal** for a state electricity distribution company (DISCOM). It is designed to help **control-room operators, shift engineers, and non-technical officers** monitor and manage the electricity supply across 12 distribution areas of a city in real time.

The portal looks and works like an official Indian government utility website — clean, plain, trustworthy, and fully accessible. It is **not** a SCADA screen or a tech-startup dashboard.

---

## The Problem It Solves

State power distribution companies manage electricity supply across many areas simultaneously. Without a monitoring system:

- Operators cannot see which area is about to exceed its supply limit until a fault occurs.
- There is no easy way to shift spare capacity from one area to another.
- Demand forecasts are manual and error-prone.
- There is no audit trail of who changed what and when.

This portal solves all of these by giving operators **one screen** where they can see everything, act immediately, and keep a record of every decision.

---

## Key Features

### Live Monitoring
- 12 distribution areas updated every 30 seconds
- Each area shows: power used (MW), supply limit (MW), share of limit (%), and status
- Status is always **icon + word + colour** — never colour alone
  - ✓ **Normal** — under 70% of limit (green)
  - ● **Needs attention** — 70–90% of limit (amber)
  - ⚠ **Urgent** — over 90% of limit (red)

### Automatic Notices
- A notice is raised automatically when any area goes into Urgent or Needs attention
- Operators can acknowledge or resolve notices
- A notice badge in the menu shows the count of open notices

### Adjust Supply (4-Step Government Form)
- Step 1: Select area
- Step 2: See the current limits (power given, power needed, spare supply, battery, safe maximum)
- Step 3: Enter new supply — **hard cap enforced** (cannot exceed safe maximum)
- Step 4: Review and confirm — with 10-second undo
- Emergency Supply Boost for critical situations
- Full audit log with CSV download

### Demand Forecast
- Hourly forecast for the next 6, 24, or 48 hours
- Shows demand line, low/high estimate range, and stacked supply plan (Solar / Hydro / Thermal / Battery)
- Solar is exactly 0 from 18:30 to 05:30 and follows a physics-based bell curve
- Scenario switching: Live, Cloudy afternoon, Heatwave evening, Reduced hydro, Forecast error

### Area Detail Pages
- 4 tabs per area: Overview, Houses, Trend chart, Records
- House-level data (20–40 houses per area, kW usage, flexible load flag)
- Trend chart of power used vs limit vs power given

### Notices & Records
- Full audit trail of every change ever made
- Filters by type, status, area, source, date range
- CSV download

### Accessibility (GIGW / WCAG 2.1 AA)
- Text size controls (A− / A / A+)
- High-contrast mode
- English / Hindi language switch
- Keyboard navigation, visible focus outlines, skip link
- Screen-reader friendly (aria-live, aria-labels, table scope)

---

## Pages / Routes

| Route | Page |
|-------|------|
| `/` | Home — Current Power Status |
| `/areas` | Area-wise Status (map view + table view) |
| `/areas/:id` | Area Detail (Overview / Houses / Trend / Records) |
| `/adjust` | Adjust Supply (4-step form) |
| `/forecast` | Demand Forecast |
| `/notices` | Notices & Records |
| `/help` | Help, FAQs, User Guide, Accessibility Statement |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| State management | Zustand |
| Charts | Recharts |
| Styling | Plain CSS with CSS variables (no UI kit) |
| Font | Noto Sans + Noto Sans Devanagari |

---

## Project Structure

```
grid-mgmt/
├── src/
│   ├── api/
│   │   └── gridApi.ts          # Service layer — swap mock → real ML API here
│   ├── data/
│   │   └── engine.ts           # Single data engine — ALL calculations live here
│   ├── store/
│   │   └── gridStore.ts        # Zustand global store — tick, notices, changelog
│   ├── context/
│   │   └── AppContext.tsx      # Language context (EN / HI)
│   ├── lib/
│   │   └── translations.ts     # All UI strings in English and Hindi
│   ├── components/
│   │   ├── shell/
│   │   │   ├── Frame.tsx       # All frame components (header, nav, footer, etc.)
│   │   │   └── Layout.tsx      # Route layout wrapper
│   │   └── ui/
│   │       ├── index.tsx       # Shared components (StatusTag, StatCard, etc.)
│   │       └── ErrorBoundary.tsx
│   └── pages/
│       ├── home/               # Current Power Status
│       ├── areas/              # Area-wise Status + Area Detail
│       ├── adjust/             # Adjust Supply form
│       ├── forecast/           # Demand Forecast
│       ├── notices/            # Notices & Records
│       └── help/               # Help page
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Install and run

```bash
# Clone the repository
git clone https://github.com/agityaupadhyay9450445597-cyber/YuvaYodhaProjectSchneider.git
cd YuvaYodhaProjectSchneider

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** (or whichever port Vite assigns).

### Build for production

```bash
npm run build
npm run preview
```

---

## ML Model Integration (Planned / In Progress)

This is the core of the next phase. The portal is already architected to receive ML predictions — the mock data layer is just a placeholder.

### How the integration works

The file `src/api/gridApi.ts` is the **single point of connection** between the frontend and the backend. Every function in it currently returns mock data from the simulation engine. To connect the real ML model:

1. Set the environment variable in a `.env` file:
   ```
   VITE_API_BASE=https://your-ml-api-url.com/api
   ```
2. The `gridApi.ts` functions automatically switch to real `fetch()` calls.

### ML endpoints the portal expects

| Function | HTTP call | What it returns |
|----------|-----------|-----------------|
| `getGridSnapshot()` | `GET /snapshot` | Live grid state for all 12 areas |
| `getForecast({ scope, areaId, from, horizonH })` | `POST /forecast` | Hourly demand forecast with low/high range |
| `postAllocation({ areaId, newMW, reason, duration })` | `POST /allocation` | Confirmation of supply change |
| `getNotices()` | `GET /notices` | Current open notices |
| `getChangeLog()` | `GET /changelog` | Full audit log |
| `getBaselineComparison()` | `GET /baseline` | Improvement metrics vs baseline |

### What the ML model will power

| Feature | Current (mock) | Planned (ML) |
|---------|---------------|-------------|
| Demand forecast | Physics-based diurnal curve | LSTM / time-series model trained on State Power Board data |
| Solar output | Bell-curve formula | Weather API + irradiance model |
| Supply recommendations | Headroom heuristic | Optimization model (minimize cost + outage risk) |
| Anomaly detection | Threshold rules (70% / 90%) | ML-based anomaly detection per area |
| Battery dispatch | Simple rule-based | Reinforcement learning dispatch agent |
| Baseline comparison | Fixed placeholder values | Real simulation comparison |

### Forecast model details (target)

- **Model type:** LSTM sequence model (or Facebook Prophet for interpretability)
- **Inputs:** Historical hourly demand per area, temperature, day of week, holiday flag, solar irradiance
- **Output:** Demand forecast (MW) for next 1–48 hours, with 80% confidence interval
- **Typical error target:** < 5% MAPE
- **Retrain frequency:** Weekly on State Power Board data
- **Serving:** FastAPI or Flask endpoint behind `VITE_API_BASE`

### Data contract (JSON schema the frontend expects)

**`GET /snapshot` response:**
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

**`POST /forecast` response:**
```json
{
  "points": [
    { "ts": "2026-09-30T21:00:00Z", "hour": 21, "demandMW": 32.4, "p10": 30.1, "p90": 34.7, "solar": 0, "hydro": 11.2, "thermal": 19.8, "battery": 1.4, "isActual": false }
  ],
  "peakMW": 41.2, "peakHour": 20, "minMW": 22.1, "avgMW": 34.6,
  "renewablePct": 28.5,
  "modelStatus": "working",
  "lastRefresh": "2026-09-30T20:30:00Z",
  "typicalErrorPct": 3.8
}
```

---

## Design Principles

- **Government portal style** — white cards on light grey page, deep blue (`#1F3A6E`) primary, saffron (`#E07B00`) accent strip and active nav underline
- **Plain language** — no technical jargon. "Power needed right now" not "total system demand". "Battery charge left" not "SOC".
- **Status always has icon + word** — never colour alone (accessibility requirement)
- **No blank screens** — every loading state shows "Loading…", every error shows a plain message
- **Audit trail** — every supply change is recorded with a reference number, reason, duration, and operator name

---

## Competition Context

This project was built for the **Yuva Yodha Competition** in partnership with **Schneider Electric**. The challenge is to build a smart, accessible power distribution management system that can be connected to a real ML forecasting model, helping state DISCOMs reduce outages, optimise renewable energy use, and lower thermal power consumption.

---

## License

This project is submitted as a competition entry. All rights reserved by the team.

---

## Contact

For questions about this project or the ML integration, raise an issue on this repository or contact the team through the competition portal.
