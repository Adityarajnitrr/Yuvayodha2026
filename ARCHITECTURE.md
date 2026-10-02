# System Architecture

## Overview

Your XGBoost forecasting model is integrated into a full-stack web application:

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │          React Frontend (Vite + TypeScript)               │ │
│  │                                                           │ │
│  │  • Forecast Page (ForecastPage.tsx)                      │ │
│  │  • API Client (gridApi.ts)                               │ │
│  │  • Charts & Visualization (Recharts)                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ▲                                      │
│                          │ HTTP Requests                        │
│                          │ (fetch API calls)                    │
└──────────────────────────┼─────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER (Flask)                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                 Flask API (app.py)                        │ │
│  │                                                           │ │
│  │  Endpoints:                                               │ │
│  │  • POST /api/forecast  → Generate predictions            │ │
│  │  • GET  /api/health    → Check status                    │ │
│  │  • GET  /api/snapshot  → Current state                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ▲                                      │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │            XGBoost Models (*.joblib)                      │ │
│  │                                                           │ │
│  │  • demand_h1.joblib  → 15 min demand forecast            │ │
│  │  • demand_h2.joblib  → 30 min demand forecast            │ │
│  │  • demand_h3.joblib  → 45 min demand forecast            │ │
│  │  • demand_h4.joblib  → 60 min demand forecast            │ │
│  │  • solar_h1.joblib   → 15 min solar forecast             │ │
│  │  • solar_h2.joblib   → 30 min solar forecast             │ │
│  │  • solar_h3.joblib   → 45 min solar forecast             │ │
│  │  • solar_h4.joblib   → 60 min solar forecast             │ │
│  │  • meta.json         → Model metadata                    │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Requests Forecast

```
User clicks "Show Forecast" button
    ↓
Frontend (ForecastPage.tsx)
    ↓
Creates request object:
{
  scope: "system",
  horizonH: 24,
  from: "2024-01-15T10:00:00"
}
    ↓
Sends to Backend API (POST /api/forecast)
```

### 2. Backend Processes Request

```
Flask receives request
    ↓
Extracts parameters (horizon, scope, timestamp)
    ↓
Loads appropriate XGBoost models
    ↓
For each hour in horizon:
    ├─ Create feature vector (time, weather, current demand)
    ├─ Call demand_h4 model → predict demand ratio
    ├─ Call solar_h4 model → predict solar fraction
    ├─ Calculate actual MW values
    └─ Generate supply mix (hydro, thermal, battery)
    ↓
Aggregates results:
    ├─ Peak demand & time
    ├─ Average demand
    ├─ Renewable percentage
    └─ Uncertainty bands (P10, P90)
    ↓
Returns JSON response
```

### 3. Frontend Displays Results

```
Frontend receives predictions
    ↓
Updates UI:
    ├─ Summary cards (peak, average, renewable %)
    ├─ 24-hour demand chart (Recharts)
    ├─ Supply mix breakdown
    ├─ Areas needing attention
    └─ Model info (XGBoost, accuracy, last refresh)
```

## Component Details

### Frontend (React + TypeScript)

**Key Files:**
- `src/pages/forecast/ForecastPage.tsx` - Main forecast UI
- `src/api/gridApi.ts` - API client (handles fetch calls)
- `src/store/gridStore.ts` - State management (Zustand)

**Technologies:**
- **Vite**: Fast build tool
- **React**: UI framework
- **TypeScript**: Type safety
- **Recharts**: Charts and graphs
- **Tailwind CSS**: Styling

### Backend (Python + Flask)

**Key Files:**
- `backend/app.py` - Flask API server
- `backend/models/*.joblib` - Trained XGBoost models

**Technologies:**
- **Flask**: Web framework
- **XGBoost**: ML library
- **Pandas**: Data manipulation
- **NumPy**: Numerical computations
- **Joblib**: Model serialization

## Model Details

### Training (Colab Notebook)

Your models were trained on:
- **Dataset**: Synthetic 30-zone Raipur grid data
- **Training period**: Jan-Mar 2024
- **Validation period**: Apr 1-12, 2024
- **Test period**: Apr 13-30, 2024

**Features used:**
- Time features (hour, day of week, month)
- Current demand (MW)
- Weather (temperature, cloud cover, GHI)
- Historical patterns

**Targets:**
- **Demand**: `log(future_demand / current_demand)`
- **Solar**: `future_solar / installed_capacity`

### Prediction Process

**Demand Forecasting:**
```python
# Model predicts ratio
ratio = exp(model.predict(features))

# Apply to current demand
future_demand = current_demand * ratio
```

**Solar Forecasting:**
```python
# Model predicts capacity fraction
fraction = model.predict(features)

# Scale to actual capacity
future_solar = fraction * installed_capacity

# Zero at night
if hour < 6 or hour >= 18:
    future_solar = 0
```

## API Contract

### Request Format

```json
{
  "scope": "system" | "area",
  "areaId": "A1" (optional),
  "from": "2024-01-15T10:00:00",
  "horizonH": 24
}
```

### Response Format

```json
{
  "points": [
    {
      "hour": 10,
      "demandMW": 245.5,
      "p10": 220.9,
      "p90": 270.0,
      "solar": 42.3,
      "hydro": 81.3,
      "thermal": 102.1,
      "battery": 19.8
    },
    ...
  ],
  "peakMW": 312.5,
  "peakHour": 14,
  "minMW": 198.3,
  "avgMW": 245.7,
  "renewablePct": 38.5,
  "typicalErrorPct": 8.5,
  "lastRefresh": "2024-01-15T10:30:00",
  "model": "XGBoost"
}
```

## Performance

### Model Accuracy (from your Colab)

| Horizon | Demand MAPE | Solar nMAE |
|---------|-------------|------------|
| 15 min  | ~2.5%       | ~6.2%      |
| 30 min  | ~3.8%       | ~8.1%      |
| 45 min  | ~4.9%       | ~9.7%      |
| 60 min  | ~5.8%       | ~11.3%     |

*MAPE = Mean Absolute Percentage Error*  
*nMAE = Normalized Mean Absolute Error (% of capacity)*

### System Performance

- **API Response Time**: < 200ms per request
- **Model Loading**: ~2-3 seconds on startup
- **Memory Usage**: ~500MB with models loaded
- **Concurrent Requests**: Supports multiple users

## Deployment Options

### Development (Current)
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend: `http://localhost:5000` (Flask debug mode)

### Production Options

**Frontend:**
- GitHub Pages (already configured)
- Vercel / Netlify
- AWS S3 + CloudFront

**Backend:**
- Heroku (easy Python deployment)
- AWS EC2 / Lambda
- Google Cloud Run
- Railway / Render

**Recommended Stack:**
```
Frontend: Vercel (free tier)
Backend: Railway (free tier)
Total Cost: $0/month for MVP
```

## Security Considerations

### Current (Development)
- ✅ CORS enabled for local development
- ⚠️ No authentication
- ⚠️ No rate limiting
- ⚠️ Debug mode enabled

### Production Requirements
- 🔒 Add API authentication (JWT tokens)
- 🔒 Implement rate limiting
- 🔒 HTTPS only
- 🔒 Environment variables for secrets
- 🔒 Input validation and sanitization

## Scalability

### Current Capacity
- Single-threaded Flask (dev server)
- ~10 requests/second
- In-memory model storage

### To Scale Up
1. **Use Gunicorn**: Multi-worker WSGI server
   ```bash
   gunicorn -w 4 app:app
   ```
2. **Add Redis**: Cache predictions
3. **Load Balancer**: Distribute traffic
4. **Model Serving**: TensorFlow Serving or TorchServe
5. **Horizontal Scaling**: Multiple backend instances

## Future Enhancements

1. **Real-time Data Integration**
   - Connect to actual grid telemetry
   - Weather API integration (OpenWeather, etc.)

2. **Improved Predictions**
   - Ensemble models (XGBoost + LSTM)
   - Weather forecast integration
   - Real-time model updates

3. **Advanced Features**
   - Historical accuracy tracking
   - Automated alerts
   - Multi-zone optimization
   - Battery scheduling recommendations

4. **Model Monitoring**
   - Prediction vs actual tracking
   - Model drift detection
   - Automated retraining triggers

---

See `INTEGRATION_GUIDE.md` for implementation details.
