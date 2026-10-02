# ML Model Integration Guide

This guide explains how to integrate your XGBoost forecasting model with the website.

## Overview

Your trained XGBoost model from Colab will replace the mock forecast data in the website. The integration involves:
1. Setting up a Python Flask API to serve predictions
2. Connecting the React frontend to the API
3. Exporting and loading your trained models

## Step-by-Step Integration

### Step 1: Export Models from Colab

1. Open your `raipur_forecasting_xgboost_colab.ipynb` in Google Colab
2. Run all cells (Runtime → Run all)
3. Wait for training to complete (~5-15 minutes)
4. At the end, Colab will automatically download `raipur_forecasting_xgb_outputs.zip`
5. Extract this zip file

You should see:
```
raipur_forecasting_xgb_outputs/
├── models/
│   ├── demand_h1.joblib
│   ├── demand_h2.joblib
│   ├── demand_h3.joblib
│   ├── demand_h4.joblib
│   ├── solar_h1.joblib
│   ├── solar_h2.joblib
│   ├── solar_h3.joblib
│   ├── solar_h4.joblib
│   ├── final_demand_h1.joblib (optional)
│   ├── final_solar_h1.joblib (optional)
│   └── meta.json
├── forecasts_test_xgb.csv
└── test_metrics_xgb.csv
```

### Step 2: Install Backend Dependencies

Open a terminal and run:

```bash
cd YuvaYodhaProjectSchneider/backend
pip install -r requirements.txt
```

Or if you prefer using a virtual environment (recommended):

```bash
cd YuvaYodhaProjectSchneider/backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### Step 3: Copy Model Files

Copy the `models/` folder from the extracted zip into the `backend/` directory:

```
YuvaYodhaProjectSchneider/
├── backend/
│   ├── models/          ← Copy the models folder here
│   │   ├── demand_h1.joblib
│   │   ├── demand_h2.joblib
│   │   ├── ...
│   │   └── meta.json
│   ├── app.py
│   └── requirements.txt
```

### Step 4: Start the Backend API

```bash
cd YuvaYodhaProjectSchneider/backend
python app.py
```

You should see:
```
🚀 Starting XGBoost Forecast API on port 5000
✓ Loaded 8 models successfully
📊 Models loaded: True
🌐 CORS enabled for frontend
```

The API is now running on `http://localhost:5000`

### Step 5: Test the API

In another terminal, test the API:

```bash
curl http://localhost:5000/api/health
```

You should get a JSON response showing the API is working.

### Step 6: Start the Frontend

The `.env` file is already configured to connect to your API. Just start the website:

```bash
cd YuvaYodhaProjectSchneider
npm run dev
```

### Step 7: View the Integrated Website

1. Open your browser to the URL shown (usually `http://localhost:5173`)
2. Navigate to the "Demand Forecast" page
3. Click "Show Forecast"
4. You should now see predictions from your XGBoost model!

## Verification

To verify the integration is working:

1. **Check the "About this forecast" section** - it should show "XGBoost" as the model
2. **Check the browser console** - should see successful API calls to `localhost:5000`
3. **Check the backend terminal** - should see incoming requests logged

## Troubleshooting

### Issue: Models not loading

**Symptom:** API says "models_loaded: false"

**Solution:** 
- Verify the `models/` folder exists in `backend/`
- Check that all 8 `.joblib` files and `meta.json` are present
- Make sure file names match exactly (e.g., `demand_h1.joblib`, not `demand_h1.pkl`)

### Issue: CORS errors in browser

**Symptom:** Browser console shows CORS errors

**Solution:**
- Restart the Flask API (Ctrl+C, then `python app.py` again)
- Make sure `flask-cors` is installed

### Issue: Frontend still shows mock data

**Symptom:** Forecast page works but doesn't use your model

**Solution:**
- Check that `.env` file exists in the project root with `VITE_API_BASE=http://localhost:5000/api`
- Restart the Vite dev server (Ctrl+C in frontend terminal, then `npm run dev` again)
- Vite must be restarted after changing `.env` files

### Issue: Feature mismatch errors

**Symptom:** API returns errors about missing features

**Solution:**
- Update the `create_features()` function in `backend/app.py` to match the features from your notebook
- Check the `meta.json` file for the exact feature list
- The current implementation uses simplified features - you may need to add more based on your actual training data

## Customization

### Using Production Models

If you ran Section 6 of the notebook (refitting on full data), use the `final_*.joblib` files instead:

In `backend/app.py`, change:
```python
models[f'demand_h{h}'] = joblib.load(f'{MODEL_DIR}/final_demand_h{h}.joblib')
models[f'solar_h{h}'] = joblib.load(f'{MODEL_DIR}/final_solar_h{h}.joblib')
```

### Adjusting Features

The `create_features()` function in `app.py` should match your training features. Update it based on your notebook's `FEATURES` list.

### Zone-Specific Predictions

To support per-zone forecasts, you'll need to:
1. Load zone-specific data
2. Pass zone_id through the API
3. Filter predictions by zone

## Deployment

For production deployment:

### Backend (Flask API)

Deploy to:
- **Heroku**: `git push heroku main`
- **AWS EC2**: Run on a server with `gunicorn`
- **Google Cloud Run**: Containerize with Docker
- **Railway**: Easy one-click deploy

### Frontend (React)

Update `.env` with production API URL:
```
VITE_API_BASE=https://your-api-domain.com/api
```

Then build:
```bash
npm run build
```

Deploy the `dist/` folder to:
- **GitHub Pages** (already configured)
- **Vercel**
- **Netlify**
- **AWS S3 + CloudFront**

## Model Performance

Based on your Colab notebook results:

| Horizon | Demand MAPE | Solar nMAE |
|---------|-------------|------------|
| 15 min  | ~2-3%       | ~5-8%      |
| 30 min  | ~3-4%       | ~6-10%     |
| 45 min  | ~4-5%       | ~7-12%     |
| 60 min  | ~5-6%       | ~8-14%     |

These are test set metrics on the synthetic Raipur dataset.

## Next Steps

1. **Real-time data**: Connect to actual feeder telemetry and weather APIs
2. **Weather forecasts**: Replace current weather observations with forecast data
3. **Alerts**: Add threshold-based alerts for high demand periods
4. **Historical comparison**: Show actual vs predicted after events occur
5. **Model retraining**: Set up automated retraining pipeline

## Questions?

Check the notebook documentation or the `backend/README.md` for more details.
