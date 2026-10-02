# XGBoost Forecast API Backend

This Flask API serves the XGBoost demand and solar forecasting models trained in the Colab notebook.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Add Your Trained Models

Create a `models/` folder and add the files from your Colab notebook:

```
backend/
├── models/
│   ├── demand_h1.joblib
│   ├── demand_h2.joblib
│   ├── demand_h3.joblib
│   ├── demand_h4.joblib
│   ├── solar_h1.joblib
│   ├── solar_h2.joblib
│   ├── solar_h3.joblib
│   ├── solar_h4.joblib
│   └── meta.json
├── app.py
└── requirements.txt
```

**To get these files from Colab:**
- Run all cells in your notebook
- At the end, it will download `raipur_forecasting_xgb_outputs.zip`
- Extract it and copy the `models/` folder here

### 3. Run the API

```bash
python app.py
```

The API will start on `http://localhost:5000`

### 4. Test the API

```bash
curl http://localhost:5000/api/health
```

## API Endpoints

### GET `/api/health`
Health check

### POST `/api/forecast`
Get demand and solar forecast

Request body:
```json
{
  "scope": "system",
  "from": "2024-01-15T10:00:00",
  "horizonH": 24
}
```

### GET `/api/snapshot`
Get current grid snapshot

## Important Notes

- If models are not loaded, the API runs in **mock mode** with generated data
- Real predictions require the trained model files from your Colab notebook
- The feature engineering in `create_features()` should match your notebook's features
- Adjust capacity and zone-specific parameters as needed
