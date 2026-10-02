# Complete Setup Guide

## Quick Start (3 Steps)

### 1. Start the Website (Mock Mode)

```bash
npm run dev
```

Open http://localhost:5173 in your browser. The website will work with mock forecast data.

### 2. Export Your Models from Colab

1. Open `raipur_forecasting_xgboost_colab.ipynb` in Google Colab
2. Click **Runtime → Run all**
3. Wait ~5-15 minutes for training
4. Download the `raipur_forecasting_xgb_outputs.zip` file that Colab creates
5. Extract it

### 3. Integrate Your Model

#### A. Copy Model Files

Copy the `models/` folder from the extracted zip to `backend/models/`:

```
backend/
└── models/
    ├── demand_h1.joblib
    ├── demand_h2.joblib
    ├── demand_h3.joblib
    ├── demand_h4.joblib
    ├── solar_h1.joblib
    ├── solar_h2.joblib
    ├── solar_h3.joblib
    ├── solar_h4.joblib
    └── meta.json
```

#### B. Start the Backend API

**Option 1 - Easy (Windows):**
Double-click `start_backend.bat`

**Option 2 - Manual:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API will start on http://localhost:5000

#### C. Restart the Frontend

Stop the frontend (Ctrl+C) and restart:
```bash
npm run dev
```

✅ **Done!** Your website now uses your trained XGBoost model for forecasts!

---

## Detailed Setup

### Prerequisites

- **Node.js** 16+ (for frontend)
- **Python** 3.8+ (for backend)
- **pip** (Python package manager)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the API
python app.py
```

### Environment Configuration

The `.env` file connects the frontend to the backend:

```env
VITE_API_BASE=http://localhost:5000/api
```

**Important:** Restart the frontend after changing `.env` files!

---

## Project Structure

```
YuvaYodhaProjectSchneider/
├── src/                          # React frontend source
│   ├── pages/
│   │   └── forecast/            # Forecast page (uses your model)
│   ├── api/
│   │   └── gridApi.ts           # API client (calls backend)
│   └── ...
├── backend/                      # Python Flask API
│   ├── models/                  # Your trained XGBoost models go here
│   ├── app.py                   # Flask API server
│   ├── requirements.txt         # Python dependencies
│   └── README.md
├── .env                          # Environment config (API URL)
├── INTEGRATION_GUIDE.md          # Detailed integration docs
├── start_backend.bat             # Windows shortcut for backend
└── package.json                  # Frontend dependencies
```

---

## How It Works

### Without Backend (Mock Mode)
- Frontend generates fake forecast data
- Good for development and UI testing
- No ML predictions

### With Backend (Real ML Mode)
1. Frontend sends forecast request to Flask API
2. Flask loads your XGBoost models
3. Models generate predictions for demand & solar
4. API returns predictions to frontend
5. Frontend displays real ML forecasts

---

## Verification

### Check Backend Health

```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "ok",
  "models_loaded": true,
  "timestamp": "2024-01-15T10:30:00"
}
```

### Check Frontend Connection

1. Open http://localhost:5173
2. Navigate to "Demand Forecast" page
3. Click "Show Forecast"
4. Open browser DevTools (F12) → Console
5. Should see successful API requests
6. "About this forecast" section should show "XGBoost" as model

### Check Backend Logs

In the backend terminal, you should see:
```
127.0.0.1 - - [15/Jan/2024 10:30:00] "POST /api/forecast HTTP/1.1" 200 -
```

---

## Common Issues

### "Models not loaded" in backend

**Fix:** Copy model files to `backend/models/`

### CORS errors in browser

**Fix:** Restart Flask API (`python app.py`)

### Frontend still shows mock data

**Fix:** 
1. Verify `.env` has `VITE_API_BASE=http://localhost:5000/api`
2. Restart frontend (`npm run dev`)

### Port 5000 already in use

**Fix:** Change port in `backend/app.py`:
```python
port = int(os.environ.get('PORT', 5001))  # Use 5001 instead
```

And update `.env`:
```
VITE_API_BASE=http://localhost:5001/api
```

---

## Next Steps

1. ✅ Get basic integration working
2. 📊 Verify predictions match your Colab results
3. 🎨 Customize UI to show model confidence
4. 📈 Add historical accuracy tracking
5. 🚀 Deploy to production

See `INTEGRATION_GUIDE.md` for deployment instructions.

---

## Need Help?

1. Check `INTEGRATION_GUIDE.md` for detailed docs
2. Check `backend/README.md` for API docs
3. Review your Colab notebook output for model metrics
