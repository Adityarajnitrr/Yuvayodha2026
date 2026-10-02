# Python Installation Guide for Windows

## Current Status

✅ **Model files copied** - All 8 XGBoost models + meta.json are in `backend/models/`  
❌ **Python not installed** - Need to install Python to run the backend API  
✅ **Frontend ready** - Website works in mock mode (fake data)

## Install Python (5 minutes)

### Step 1: Download Python

Visit: **https://www.python.org/downloads/**

Download: **Python 3.11.x** or **Python 3.12.x** (recommended)

### Step 2: Install Python

**⚠️ CRITICAL: During installation**

✅ **CHECK** the box that says: **"Add Python to PATH"**

This is usually at the bottom of the first screen. If you miss this, you'll need to reinstall!

Then click "Install Now"

### Step 3: Verify Installation

Open a **NEW** terminal/command prompt and run:

```bash
python --version
```

You should see:
```
Python 3.11.x (or 3.12.x)
```

Also verify pip:
```bash
pip --version
```

### Step 4: Install Backend Dependencies

```bash
cd YuvaYodhaProjectSchneider\backend
pip install -r requirements.txt
```

This installs:
- Flask (web server)
- XGBoost (your ML models)
- pandas, numpy (data processing)
- flask-cors (allows frontend to call API)

### Step 5: Start the Backend

```bash
python app.py
```

You should see:
```
🚀 Starting XGBoost Forecast API on port 5000
✓ Loaded 8 models successfully
📊 Models loaded: True
🌐 CORS enabled for frontend
```

### Step 6: Enable Backend in Frontend

Edit `.env` file and uncomment the API line:

```env
# Backend API Configuration
VITE_API_BASE=http://localhost:5000/api
```

### Step 7: Restart Frontend

Stop the frontend (Ctrl+C) and restart:

```bash
npm run dev
```

## ✨ You're Done!

Your XGBoost model is now integrated with the website!

---

## Troubleshooting

### Python command not found after install

**Solution:** 
1. Close ALL terminal windows
2. Open a NEW terminal
3. Try `python --version` again

If still not working:
1. Search Windows for "Environment Variables"
2. Edit System Environment Variables
3. Find "Path" and click Edit
4. Add: `C:\Python311\` (or wherever Python installed)
5. Add: `C:\Python311\Scripts\`
6. Click OK and restart terminal

### pip install fails

**Solution:**
```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### Port 5000 already in use

**Solution:** 
Change port in `backend/app.py`:
```python
port = int(os.environ.get('PORT', 5001))
```

And update `.env`:
```
VITE_API_BASE=http://localhost:5001/api
```

---

## Alternative: Use Mock Data (No Python Needed)

If you just want to see the website working without ML predictions:

1. Keep `.env` commented out (as it is now)
2. Run: `npm run dev`
3. Website works with generated fake data
4. Good for UI testing and development

You can install Python and integrate the ML model later!

---

## Next Steps After Python Install

1. ✅ Install Python
2. ✅ Install backend dependencies
3. ✅ Start backend (`python app.py`)
4. ✅ Uncomment `.env` line
5. ✅ Restart frontend (`npm run dev`)
6. ✅ Test forecast page - should show XGBoost predictions!

---

## Quick Reference

```bash
# Install Python
# Download from python.org and check "Add to PATH"

# Install backend
cd YuvaYodhaProjectSchneider\backend
pip install -r requirements.txt

# Start backend (keep running)
python app.py

# In another terminal, start frontend
cd YuvaYodhaProjectSchneider
npm run dev

# Open browser
http://localhost:5173
```

---

See `ML_INTEGRATION_SUMMARY.md` for full integration details!
