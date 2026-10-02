"""
Flask API for XGBoost Demand & Solar Forecasting
Serves the trained models from Colab notebook
"""
import os
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load models
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
models = {}
meta = {}

def load_models():
    """Load all XGBoost models on startup"""
    global models, meta
    try:
        for h in [1, 2, 3, 4]:
            models[f'demand_h{h}'] = joblib.load(f'{MODEL_DIR}/demand_h{h}.joblib')
            models[f'solar_h{h}'] = joblib.load(f'{MODEL_DIR}/solar_h{h}.joblib')
        
        with open(f'{MODEL_DIR}/meta.json', 'r') as f:
            meta = json.load(f)
        
        print(f"✓ Loaded {len(models)} models successfully")
        return True
    except Exception as e:
        print(f"⚠ Warning: Could not load models: {e}")
        print("API will run in demo mode with mock data")
        return False

models_loaded = load_models()


def create_features(timestamp, zone_data=None):
    """
    Create feature vector for prediction
    Adapt this based on your actual features from the notebook
    """
    dt = pd.to_datetime(timestamp)
    
    # Time features
    features = {
        'Hour': dt.hour,
        'DayOfWeek': dt.dayofweek,
        'Month': dt.month,
        'DayOfMonth': dt.day,
        'IsWeekend': 1 if dt.dayofweek >= 5 else 0,
    }
    
    # If zone_data provided, add current readings
    if zone_data:
        features.update({
            'Demand_MW': zone_data.get('current_demand', 50.0),
            'Total_Local_Solar_MW': zone_data.get('current_solar', 10.0),
            'Temperature_C': zone_data.get('temperature', 30.0),
            'Cloud_Cover_Pct': zone_data.get('cloud_cover', 20.0),
            'GHI_Wm2': zone_data.get('ghi', 600.0),
        })
    else:
        # Default values if no data provided
        features.update({
            'Demand_MW': 50.0,
            'Total_Local_Solar_MW': 10.0,
            'Temperature_C': 30.0,
            'Cloud_Cover_Pct': 20.0,
            'GHI_Wm2': 600.0,
        })
    
    return pd.DataFrame([features])


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'models_loaded': models_loaded,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/forecast', methods=['POST'])
def forecast():
    """
    Main forecast endpoint
    Expected request format:
    {
        "scope": "system" | "area",
        "areaId": "A1" (optional),
        "from": "2024-01-15T10:00:00",
        "horizonH": 24
    }
    """
    try:
        data = request.json
        scope = data.get('scope', 'system')
        area_id = data.get('areaId')
        from_time = pd.to_datetime(data.get('from', datetime.now()))
        horizon_h = int(data.get('horizonH', 24))
        
        if not models_loaded:
            # Return mock data if models not loaded
            return jsonify(generate_mock_forecast(from_time, horizon_h))
        
        # Generate predictions
        predictions = generate_predictions(from_time, horizon_h, scope, area_id)
        
        return jsonify(predictions)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def generate_predictions(from_time, horizon_h, scope='system', area_id=None):
    """Generate real predictions using XGBoost models"""
    points = []
    
    for hour_offset in range(horizon_h):
        forecast_time = from_time + timedelta(hours=hour_offset)
        hour = forecast_time.hour
        
        # Create features for this timestep
        X = create_features(forecast_time)
        
        # Get predictions for 60 min ahead (h=4)
        # Demand: model predicts log(demand_future / demand_now)
        current_demand = X['Demand_MW'].values[0]
        demand_ratio = np.exp(models['demand_h4'].predict(X)[0])
        predicted_demand = current_demand * demand_ratio
        
        # Solar: model predicts as fraction of capacity
        capacity = 100.0  # MW, adjust based on your system
        solar_fraction = models['solar_h4'].predict(X)[0]
        predicted_solar = max(0, solar_fraction * capacity)
        
        # Set solar to 0 at night
        if hour < 6 or hour >= 18:
            predicted_solar = 0.0
        
        # Generate supply mix (simplified)
        remaining = predicted_demand - predicted_solar
        hydro = remaining * 0.4
        thermal = remaining * 0.5
        battery = remaining * 0.1
        
        # Uncertainty bands (±10% for demo)
        p10 = predicted_demand * 0.9
        p90 = predicted_demand * 1.1
        
        points.append({
            'hour': hour,
            'demandMW': float(predicted_demand),
            'p10': float(p10),
            'p90': float(p90),
            'solar': float(predicted_solar),
            'hydro': float(hydro),
            'thermal': float(thermal),
            'battery': float(battery),
        })
    
    # Calculate summary statistics
    demand_values = [p['demandMW'] for p in points]
    solar_values = [p['solar'] for p in points]
    renewable_values = [p['solar'] + p['hydro'] for p in points]
    total_supply = [p['solar'] + p['hydro'] + p['thermal'] + p['battery'] for p in points]
    
    peak_idx = np.argmax(demand_values)
    
    result = {
        'points': points,
        'peakMW': float(max(demand_values)),
        'peakHour': points[peak_idx]['hour'],
        'minMW': float(min(demand_values)),
        'avgMW': float(np.mean(demand_values)),
        'renewablePct': float((sum(renewable_values) / sum(total_supply)) * 100),
        'typicalErrorPct': 8.5,  # From your notebook results
        'lastRefresh': datetime.now().isoformat(),
        'model': 'XGBoost',
        'scope': scope,
        'areaId': area_id
    }
    
    return result


def generate_mock_forecast(from_time, horizon_h):
    """Generate mock forecast when models are not loaded"""
    points = []
    base_demand = 250.0
    
    for hour_offset in range(horizon_h):
        forecast_time = from_time + timedelta(hours=hour_offset)
        hour = forecast_time.hour
        
        # Simple sinusoidal pattern
        demand_factor = 0.7 + 0.3 * np.sin((hour - 6) * np.pi / 12)
        demand = base_demand * demand_factor
        
        # Solar generation (daylight only)
        solar = 0.0
        if 6 <= hour < 18:
            solar = 50 * np.sin((hour - 6) * np.pi / 12)
        
        remaining = demand - solar
        hydro = remaining * 0.4
        thermal = remaining * 0.5
        battery = remaining * 0.1
        
        points.append({
            'hour': hour,
            'demandMW': float(demand),
            'p10': float(demand * 0.9),
            'p90': float(demand * 1.1),
            'solar': float(solar),
            'hydro': float(hydro),
            'thermal': float(thermal),
            'battery': float(battery),
        })
    
    demand_values = [p['demandMW'] for p in points]
    peak_idx = np.argmax(demand_values)
    
    return {
        'points': points,
        'peakMW': float(max(demand_values)),
        'peakHour': points[peak_idx]['hour'],
        'minMW': float(min(demand_values)),
        'avgMW': float(np.mean(demand_values)),
        'renewablePct': 35.0,
        'typicalErrorPct': 8.5,
        'lastRefresh': datetime.now().isoformat(),
        'model': 'Mock (models not loaded)',
    }


@app.route('/api/snapshot', methods=['GET'])
def snapshot():
    """Current grid snapshot - placeholder"""
    return jsonify({
        'timestamp': datetime.now().isoformat(),
        'totalDemand': 245.5,
        'totalSolar': 42.3,
        'status': 'normal'
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n🚀 Starting XGBoost Forecast API on port {port}")
    print(f"📊 Models loaded: {models_loaded}")
    print(f"🌐 CORS enabled for frontend")
    app.run(host='0.0.0.0', port=port, debug=True)
