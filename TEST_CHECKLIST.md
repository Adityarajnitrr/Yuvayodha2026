# ✅ Testing Checklist: Verify XGBoost Integration

## Quick Visual Tests (Do These First!)

### Test 1: Check Zone Names ✅
**What to look for:** Zone dropdown should show Z01 to Z30, NOT "Area A1, A2, A3"

1. Go to forecast page
2. Look at the "Zone" dropdown
3. **PASS** if you see: Z01, Z02, Z03... Z30
4. **FAIL** if you see: Area A1, Area A2, Area A3

---

### Test 2: Check Input Simplicity ✅
**What to look for:** Only 2 input controls

1. Count the input controls on the page
2. **PASS** if you see ONLY:
   - Zone dropdown (Z01-Z30)
   - Time horizon buttons (15/30/45/60 min)
3. **FAIL** if you see:
   - Scope buttons (System/Area)
   - Date picker
   - Hour dropdown
   - Horizon (6h/24h/48h)

---

### Test 3: Predictions Change with Zone ✅
**What to look for:** Different zones → different demand predictions

1. Select Zone Z01, click "Get Forecast"
2. Note the demand value (e.g., "9.47 MW")
3. Select Zone Z15, click "Get Forecast"
4. **PASS** if demand changed (e.g., now "12.31 MW")
5. **FAIL** if demand stays exactly the same

---

### Test 4: Predictions Change with Time ✅
**What to look for:** Different time horizons → different predictions

1. Select Zone Z01, Time 60 min, click "Get Forecast"
2. Note the demand value
3. Change to 15 min, click "Get Forecast"
4. **PASS** if demand changed slightly
5. **FAIL** if demand is exactly the same

---

### Test 5: Model Iteration Numbers ✅
**What to look for:** Shows specific iteration counts from YOUR training

1. After getting a forecast, scroll to "Model Info" section
2. Look for "Demand iterations" and "Solar iterations"
3. **PASS** if you see numbers like:
   - Demand: 880, 786, 565, or 680
   - Solar: 207, 209, 168, or 198
4. **FAIL** if:
   - Numbers are missing
   - Shows "Mock (models not loaded)"

---

### Test 6: 24-Hour Chart Shows Patterns ✅
**What to look for:** Realistic daily demand/solar curves

1. Look at the 24-hour forecast chart
2. **PASS** if you see:
   - Demand has 2 peaks (morning ~9am, evening ~8pm)
   - Solar is zero at night (before 6am, after 6pm)
   - Solar has bell curve during day
3. **FAIL** if:
   - Flat horizontal lines
   - Solar at night
   - No visible pattern

---

## Detailed Tests (If Quick Tests Pass)

### Test 7: Different Zones Have Different Patterns
```
Zone Z01 (residential):   Demand ~8-12 MW
Zone Z02 (commercial):    Demand ~10-14 MW  
Zone Z03 (industrial):    Demand ~15-20 MW
Zone Z04 (residential):   Demand ~8-12 MW (pattern repeats)
```

**Test:**
1. Check Z01, Z02, Z03, Z04 in sequence
2. Verify demand increases then resets (pattern every 3 zones)

---

### Test 8: Time of Day Affects Predictions
```
Time: 3am  → Low demand, no solar
Time: 9am  → Morning peak demand, rising solar
Time: 12pm → High demand, peak solar
Time: 6pm  → Evening demand starts, solar dropping
Time: 9pm  → Peak demand, no solar
```

**Test:**
1. Keep same zone (e.g., Z01)
2. Run forecast at different hours throughout the day
3. Verify demand and solar patterns match above

---

### Test 9: Model Metadata Is Correct
**Look for this text in "Technical Details" section:**
```
Dataset: Raipur 30-zone synthetic (Jan-Apr 2024)
Training features: 33 features
Demand target: log(demand_future / demand_now)
Solar target: Future output / installed capacity
Typical MAPE: ~8-10%
```

**PASS** if all text matches ✅

---

### Test 10: API Response Format
**For developers: Check network tab**

1. Open browser DevTools (F12)
2. Go to Network tab
3. Make a forecast request
4. Check the response JSON

**PASS** if response contains:
```json
{
  "zoneId": "Z01",
  "horizonMinutes": 60,
  "prediction": {
    "demandMW": <number>,
    "solarMW": <number>
  },
  "modelIterations": {
    "demand": <number>,
    "solar": <number>
  }
}
```

---

## Backend Health Check

### Test 11: Models Loaded Successfully
**Check backend health endpoint:**

Visit: `https://yuvayodha2026-1.onrender.com/api/health`

**PASS** if you see:
```json
{
  "status": "ok",
  "models_loaded": true,
  "timestamp": "..."
}
```

**FAIL** if:
- `models_loaded: false` → Models didn't load
- Error 404 → Backend not deployed
- Connection timeout → Backend is sleeping (refresh once)

---

## Common Issues and Solutions

### ❌ Issue: Still seeing "Area A1, A2, A3"
**Solution:** Frontend not deployed yet
```bash
git push origin main  # Push frontend changes
# Wait 2 minutes for Vercel to deploy
```

---

### ❌ Issue: "models_loaded: false"
**Solution:** Model files missing or not deployed
```bash
# Check if files exist locally
dir backend\models  # Should show 8 .joblib + meta.json

# If missing, re-copy and commit
copy C:\Users\Aditya\Downloads\raipur_forecasting_outputs\models\* backend\models\
git add backend/models/
git commit -m "Re-add model files"
git push origin main
```

---

### ❌ Issue: Predictions don't change
**Solution:** Check if backend is using mock data
1. Check `/api/health` → `models_loaded` should be `true`
2. Check browser console for API errors
3. Verify `.env.production` has correct Render URL

---

### ❌ Issue: API connection error
**Solution:** Backend might be sleeping (free tier)
1. Visit backend URL directly to wake it up
2. Wait 30 seconds
3. Try forecast again

---

## Success Criteria Summary

**ALL of these must be TRUE:**

- ✅ Zone dropdown shows Z01-Z30
- ✅ Only 2 inputs (zone + time horizon)
- ✅ Predictions change when zone changes
- ✅ Predictions change when time horizon changes
- ✅ Model iterations displayed (880, 786, etc.)
- ✅ 24-hour chart shows realistic patterns
- ✅ Solar is zero at night
- ✅ Technical details mention "33 features" and "Raipur dataset"
- ✅ Backend health shows `models_loaded: true`

**If all ✅ are TRUE: Integration is working perfectly!** 🎉

---

## Screenshot Checklist

Take these screenshots as proof:

1. 📸 Zone dropdown showing Z01-Z30
2. 📸 Simplified input form (2 inputs only)
3. 📸 Prediction result showing demand/solar forecasts
4. 📸 Model iterations section (showing numbers like 880, 207)
5. 📸 24-hour forecast chart
6. 📸 Technical details table (33 features, Raipur dataset)
7. 📸 Backend health endpoint showing `models_loaded: true`

---

**Questions to ask yourself:**
1. Can I see my zone names (Z01-Z30)? ✅
2. Do predictions change when I change inputs? ✅
3. Can I see proof it's my model (iteration counts)? ✅
4. Does the chart show realistic patterns? ✅

If YES to all 4 → **Integration successful!** 🎉
