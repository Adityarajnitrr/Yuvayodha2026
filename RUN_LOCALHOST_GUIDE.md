# 🚀 Run Your XGBoost Model on Localhost - Simple Guide

Good news! Python 3.14.7 is installed and working. The packages are being installed in the background.

## Quick Start (2 Steps)

### Step 1: Start Backend (Your XGBoost Models)

**Double-click this file:**
```
START_BACKEND.bat
```

**Or run from PowerShell:**
```bash
cd YuvaYodhaProjectSchneider
.\START_BACKEND.bat
```

This will:
1. Install all required Python packages (flask, numpy, pandas, xgboost, etc.)
2. Start the backend server on port 5000
3. Load your 8 XGBoost models

**Wait for this message:**
```
🚀 Starting XGBoost Forecast API on port 5000
✓ Loaded 8 models successfully
📊 Models loaded: True
🌐 CORS enabled for frontend
 * Running on http://127.0.0.1:5000
```

**Keep this window open!** Don't close it while using the website.

---

### Step 2: Start Frontend (Website)

Open a **NEW** PowerShell window:

```bash
cd YuvaYodhaProjectSchneider
npm run dev
```

Wait for:
```
➜  Local:   http://localhost:5173/
```

Then open browser: **http://localhost:5173/forecast**

---

## What You'll See

### Backend Window:
```
Installing required packages...
...downloading packages...
Successfully installed flask-3.1.3 flask-cors-6.0.5 numpy-2.5.3 ...

Starting XGBoost backend...
🚀 Starting XGBoost Forecast API on port 5000
✓ Loaded 8 models successfully
📊 Models loaded: True
```

### Frontend Window:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

### Browser:
- Zone dropdown showing **Z01 to Z30** ✅
- Time horizon buttons: **15 / 30 / 45 / 60 min** ✅
- Click "Get Forecast" → See predictions ✅
- Model iterations displayed (880, 207, etc.) ✅
- 24-hour chart with demand and solar curves ✅

---

## Test Your Models

### Test 1: Zone Changes
1. Select Z01, click "Get Forecast"
2. Note demand value (e.g., 9.47 MW)
3. Select Z15, click "Get Forecast"
4. Demand should change! ✅

### Test 2: Time Changes
1. Keep Z01 selected
2. Click 60 min, note demand
3. Click 15 min, note demand
4. Values should be slightly different ✅

### Test 3: Model Proof
Look for "Model Info" section:
- **Demand iterations:** 880 (or 786, 565, 680)
- **Solar iterations:** 207 (or 209, 168, 198)

These numbers prove it's YOUR trained models! ✅

---

## Troubleshooting

### Problem: "Module Not Found: flask"
**Solution:** Packages still installing. Wait 2 more minutes, then try again.

### Problem: Backend window closes immediately
**Solution:** Read the error message. Usually means:
- Port 5000 already in use → Close other programs using port 5000
- Model files missing → Check `backend/models/` has 9 files

### Problem: Frontend can't connect to backend
**Solution:**
1. Make sure backend window shows "Running on http://127.0.0.1:5000"
2. Check `.env` file has been created (should happen automatically)
3. Restart frontend: `Ctrl+C` then `npm run dev` again

### Problem: "Port 5173 already in use"
**Solution:**
```bash
# Find and kill the process
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Then try again
npm run dev
```

---

## Stop Everything

### Stop Backend:
- Press `Ctrl+C` in backend window
- Or close the window

### Stop Frontend:
- Press `Ctrl+C` in frontend window

---

## Alternative: Manual Commands

If `START_BACKEND.bat` doesn't work:

### Install Packages Manually:
```bash
C:\Windows\py.exe -m pip install flask flask-cors numpy pandas scikit-learn xgboost joblib
```

### Start Backend Manually:
```bash
cd YuvaYodhaProjectSchneider\backend
C:\Windows\py.exe app.py
```

---

## File Locations

```
YuvaYodhaProjectSchneider/
├── START_BACKEND.bat          ← Double-click this to start!
├── backend/
│   ├── app.py                 ← Your Flask API
│   └── models/
│       ├── demand_h1.joblib   ← Your 8 XGBoost models
│       ├── demand_h2.joblib
│       ├── demand_h3.joblib
│       ├── demand_h4.joblib
│       ├── solar_h1.joblib
│       ├── solar_h2.joblib
│       ├── solar_h3.joblib
│       ├── solar_h4.joblib
│       └── meta.json          ← Model metadata
└── src/
    └── pages/forecast/
        └── ForecastPage.tsx   ← Frontend page
```

---

## Expected Timeline

1. **Package Installation:** 2-3 minutes (one-time only)
2. **Backend Startup:** 5-10 seconds
3. **Frontend Startup:** 10-20 seconds
4. **First Forecast Request:** 1-2 seconds

**Total: About 3-4 minutes** first time, then instant on subsequent runs!

---

## Success Checklist

- [ ] Backend window shows "Models loaded: True"
- [ ] Frontend window shows "Local: http://localhost:5173/"
- [ ] Browser shows zones Z01-Z30 (not Area A1/A2/A3)
- [ ] Clicking "Get Forecast" returns predictions
- [ ] Changing zones changes predictions
- [ ] Model iterations display (880, 207, etc.)
- [ ] 24-hour chart visible

**If all ✅ → Your XGBoost models are running locally!** 🎉

---

## Next Steps

Once working locally, you can:
1. Test different zones (Z01 to Z30)
2. Test different time horizons (15/30/45/60 min)
3. See predictions change in real-time
4. Verify model iteration counts match your Colab training
5. View 24-hour forecast charts

Your ML models are now running on your machine! 🚀
