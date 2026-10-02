# 🐍 Fix Python Installation and Run Your ML Model Locally

## Problem
Your Python installation is corrupted or not properly configured. The system is looking for `C:\Python313\python.exe` but can't find it.

## Solution: Reinstall Python

### Step 1: Uninstall Current Python (Optional but Recommended)
1. Press `Win + X` → Click "Apps and Features"
2. Search for "Python"
3. Uninstall all Python versions
4. Restart your computer

### Step 2: Download Python 3.11
1. Go to: https://www.python.org/downloads/
2. Download **Python 3.11.9** (recommended for compatibility)
3. Run the installer

**IMPORTANT during installation:**
- ✅ Check "Add Python to PATH"
- ✅ Check "Install pip"
- Click "Customize installation"
- ✅ Check all optional features
- ✅ Check "Add Python to environment variables"
- Choose install location: `C:\Python311\` (recommended)

### Step 3: Verify Installation
After installation, open a **NEW** Command Prompt or PowerShell and run:

```bash
python --version
# Should show: Python 3.11.9

pip --version
# Should show: pip 24.x.x from C:\Python311\...
```

---

## Quick Fix: Use Python Installer Repair

If you already installed Python but it's not working:

1. Go to "Add/Remove Programs"
2. Find "Python 3.13" or your Python version
3. Click "Modify"
4. Click "Repair"
5. Make sure "Add to PATH" is checked
6. Restart computer

---

## After Python is Fixed: Run Your ML Model

### Step 1: Install Required Packages

Open PowerShell in the project folder:

```bash
cd YuvaYodhaProjectSchneider\backend
```

Install dependencies:

```bash
pip install flask flask-cors numpy pandas scikit-learn xgboost joblib
```

**Wait for installation to complete** (takes 2-3 minutes)

### Step 2: Verify Models Are in Place

Check if model files exist:

```bash
dir models
```

You should see:
- demand_h1.joblib
- demand_h2.joblib
- demand_h3.joblib
- demand_h4.joblib
- solar_h1.joblib
- solar_h2.joblib
- solar_h3.joblib
- solar_h4.joblib
- meta.json

**If files are missing**, copy them:

```bash
copy C:\Users\Aditya\Downloads\raipur_forecasting_outputs\models\*.* models\
```

### Step 3: Start Backend Server

```bash
python app.py
```

You should see:
```
🚀 Starting XGBoost Forecast API on port 5000
📊 Models loaded: True
🌐 CORS enabled for frontend
 * Running on http://0.0.0.0:5000
```

**If you see "Models loaded: True" → SUCCESS! Your ML models are running!** ✅

**Keep this terminal open!** The backend needs to stay running.

### Step 4: Enable Frontend to Use Localhost

Open a **NEW** terminal/PowerShell window:

```bash
cd YuvaYodhaProjectSchneider
```

Edit `.env` file to uncomment the localhost line:

```bash
# Open in notepad
notepad .env
```

Change this:
```
# VITE_API_BASE=http://localhost:5000/api
```

To this (remove the #):
```
VITE_API_BASE=http://localhost:5000/api
```

Save and close.

### Step 5: Start Frontend

In the same terminal (not the backend one):

```bash
npm run dev
```

Wait for:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 6: Test Your ML Model

1. Open browser: http://localhost:5173/forecast
2. You should see:
   - Zone dropdown (Z01 to Z30) ✅
   - Time horizon buttons (15/30/45/60 min) ✅
3. Select Z01, click "Get Forecast"
4. Look for "Model Info" section:
   - Should show "Demand iterations: 880" (or similar)
   - Should show "Solar iterations: 207" (or similar)
5. Change zone to Z15, click "Get Forecast"
   - Predictions should change! ✅

---

## Troubleshooting

### Error: "pip is not recognized"

**Solution:**
```bash
# Use full path to pip
C:\Python311\Scripts\pip.exe install flask flask-cors numpy pandas scikit-learn xgboost joblib
```

### Error: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
```bash
pip install flask flask-cors
```

### Error: "models_loaded: False"

**Solution:** Model files are missing. Copy them:
```bash
cd backend
copy C:\Users\Aditya\Downloads\raipur_forecasting_outputs\models\*.* models\
```

### Error: "Address already in use" (Port 5000 busy)

**Solution:** Use different port:
```bash
# Stop the backend (Ctrl+C)
# Set environment variable
set PORT=5001

# Start again
python app.py
```

Then update frontend `.env`:
```
VITE_API_BASE=http://localhost:5001/api
```

### Backend starts but frontend can't connect

**Solution:** Check CORS and .env file:
1. Make sure `.env` has: `VITE_API_BASE=http://localhost:5000/api`
2. Restart frontend: `npm run dev`
3. Check browser console (F12) for errors

---

## Expected Output When Working

### Backend Terminal:
```
🚀 Starting XGBoost Forecast API on port 5000
✓ Loaded 8 models successfully
📊 Models loaded: True
🌐 CORS enabled for frontend
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
```

### Frontend Terminal:
```
VITE v5.4.2  ready in 543 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Browser Console (F12):
No errors, successful API calls to `http://localhost:5000/api/forecast`

---

## Alternative: Use Anaconda (Easier)

If you're having trouble with Python installation:

1. Download Anaconda: https://www.anaconda.com/download
2. Install Anaconda (it includes Python, pip, and common packages)
3. Open "Anaconda Prompt" from Start Menu
4. Navigate to project:
   ```bash
   cd C:\Users\Aditya\Downloads\websiteintegration\YuvaYodhaProjectSchneider\backend
   ```
5. Install missing packages:
   ```bash
   conda install flask flask-cors
   pip install xgboost
   ```
6. Run backend:
   ```bash
   python app.py
   ```

---

## Summary Checklist

- [ ] Python 3.11 installed and working (`python --version`)
- [ ] pip installed and working (`pip --version`)
- [ ] Backend packages installed (`pip install ...`)
- [ ] Model files in `backend/models/` folder (9 files total)
- [ ] `.env` file uncommented for localhost
- [ ] Backend running on port 5000 (shows "Models loaded: True")
- [ ] Frontend running on port 5173
- [ ] Browser can access http://localhost:5173/forecast
- [ ] Predictions change when you change zones
- [ ] Model iterations display (880, 207, etc.)

**If all checkboxes ✅ → Your ML model is running on localhost!** 🎉

---

## Quick Start Commands (After Python Fixed)

```bash
# Terminal 1: Backend
cd YuvaYodhaProjectSchneider\backend
pip install flask flask-cors numpy pandas scikit-learn xgboost joblib
python app.py

# Terminal 2: Frontend (NEW window)
cd YuvaYodhaProjectSchneider
npm run dev

# Browser
http://localhost:5173/forecast
```
