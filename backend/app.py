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


def create_features(timestamp, zone_id='Z01'):
    """
    Create feature vector for prediction using all 33 features from meta.json
    Matches the trained XGBoost model from Colab notebook
    """
    dt = pd.to_datetime(timestamp)
    
    # Zone type mapping (from Raipur dataset)
    zone_types = {f'Z{str(i).zfill(2)}': i % 3 for i in range(1, 31)}  # 0=residential, 1=commercial, 2=industrial
    zone_type = zone_types.get(zone_id, 0)
    
    # Base weights (MW capacity) per zone type
    base_weights = {0: 8.5, 1: 12.3, 2: 18.7}
    base_weight = base_weights[zone_type]
    
    # Solar capacities (MW) per zone type
    rooftop_cap = {0: 1.2, 1: 2.1, 2: 0.8}[zone_type]
    community_cap = {0: 0.5, 1: 0.8, 2: 1.5}[zone_type]
    
    # Current hour for demand estimation
    hour = dt.hour + dt.minute / 60
    # Diurnal pattern: peak at 9am and 8pm
    demand_factor = 0.6 + 0.2 * np.sin((hour - 6) * np.pi / 12) + 0.3 * np.sin((hour - 14) * np.pi / 8)
    current_demand = base_weight * demand_factor
    
    # Solar pattern (only during day 6am-6pm)
    solar_factor = 0 if (hour < 6 or hour >= 18) else np.sin((hour - 6) * np.pi / 12)
    current_solar = (rooftop_cap + community_cap) * solar_factor * 0.7
    
    # Weather assumptions (Raipur spring conditions)
    temp = 30 + 5 * np.sin((hour - 14) * np.pi / 12)  # 25-35°C
    cloud = 20 if (6 <= hour < 18) else 0
    ghi = 800 * solar_factor if (6 <= hour < 18) else 0
    clearsky_ghi = 900 * solar_factor if (6 <= hour < 18) else 0
    
    # Create lag features (approximations - in real system these come from history)
    demand_lags = {
        'Demand_lag_1': current_demand * 0.98,
        'Demand_lag_2': current_demand * 0.96,
        'Demand_lag_4': current_demand * 0.92,
        'Demand_lag_92': current_demand * 1.05,  # yesterday same time
        'Demand_lag_96': current_demand * 1.03,  # yesterday
        'Demand_lag_668': current_demand * 0.95,  # week ago
        'Demand_lag_672': current_demand * 0.97,
    }
    
    solar_lags = {
        'Solar_lag_1': current_solar * 0.95,
        'Solar_lag_4': current_solar * 0.88,
        'Solar_lag_96': current_solar * 1.1,  # yesterday
    }
    
    # Rolling statistics
    demand_roll = {
        'Demand_roll_mean_4': current_demand,
        'Demand_roll_mean_96': current_demand * 1.02,
        'Demand_roll_std_96': current_demand * 0.12,
    }
    
    # Clearsky GHI for horizons h1-h4 (15, 30, 45, 60 min ahead)
    clearsky_future = {
        'Clearsky_GHI_h1': clearsky_ghi * 1.02,
        'Clearsky_GHI_h2': clearsky_ghi * 1.05,
        'Clearsky_GHI_h3': clearsky_ghi * 1.03,
        'Clearsky_GHI_h4': clearsky_ghi * 1.01,
    }
    
    # Time encoding
    hour_rad = hour * 2 * np.pi / 24
    time_features = {
        'hour_sin': np.sin(hour_rad),
        'hour_cos': np.cos(hour_rad),
        'dow': dt.dayofweek,
        'is_weekend': 1 if dt.dayofweek >= 5 else 0,
        'is_holiday': 0,  # simplified
    }
    
    # Solar clearness index
    solar_clearness = current_solar / (rooftop_cap + community_cap) if (rooftop_cap + community_cap) > 0 else 0
    
    # Combine all 33 features in exact order from meta.json
    features = {
        'Zone_Type_Code': zone_type,
        'Base_Weight': base_weight,
        'Rooftop_Solar_Capacity_MW': rooftop_cap,
        'Community_Solar_Capacity_MW': community_cap,
        'Demand_MW': current_demand,
        **demand_lags,
        **demand_roll,
        'Total_Local_Solar_MW': current_solar,
        **solar_lags,
        'Solar_clearness_idx': solar_clearness,
        'Temperature_C': temp,
        'Cloud_Cover_Pct': cloud,
        'GHI_Wm2': ghi,
        'Clearsky_GHI_Wm2': clearsky_ghi,
        **clearsky_future,
        **time_features,
    }
    
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
    Main forecast endpoint for Raipur 30-zone XGBoost models
    Expected request format:
    {
        "zoneId": "Z01" to "Z30",
        "horizonMinutes": 15 | 30 | 45 | 60
    }
    """
    try:
        data = request.json
        zone_id = data.get('zoneId', 'Z01')
        horizon_min = int(data.get('horizonMinutes', 60))
        
        # Validate inputs
        if not zone_id.startswith('Z') or len(zone_id) != 3:
            return jsonify({'error': 'Invalid zone ID. Must be Z01 to Z30'}), 400
        
        if horizon_min not in [15, 30, 45, 60]:
            return jsonify({'error': 'Invalid horizon. Must be 15, 30, 45, or 60 minutes'}), 400
        
        if not models_loaded:
            return jsonify(generate_mock_forecast(zone_id, horizon_min))
        
        # Generate predictions using XGBoost models
        predictions = generate_predictions_zone(zone_id, horizon_min)
        
        return jsonify(predictions)
    
    except Exception as e:
        print(f"Error in forecast: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


def generate_predictions_zone(zone_id: str, horizon_min: int):
    """Generate real predictions for a specific zone using XGBoost models"""
    now = datetime.now()
    
    # Map horizon minutes to model index (h1=15min, h2=30min, h3=45min, h4=60min)
    horizon_map = {15: 'h1', 30: 'h2', 45: 'h3', 60: 'h4'}
    h = horizon_map[horizon_min]
    
    # Create features for current timestamp
    X = create_features(now, zone_id)
    
    # Get current values for ratio calculation
    current_demand = X['Demand_MW'].values[0]
    rooftop_cap = X['Rooftop_Solar_Capacity_MW'].values[0]
    community_cap = X['Community_Solar_Capacity_MW'].values[0]
    total_solar_cap = rooftop_cap + community_cap
    
    # Predict demand (model outputs log(demand_future / demand_now))
    demand_log_ratio = models[f'demand_{h}'].predict(X)[0]
    predicted_demand = current_demand * np.exp(demand_log_ratio)
    
    # Predict solar (model outputs fraction of capacity)
    solar_fraction = models[f'solar_{h}'].predict(X)[0]
    predicted_solar = max(0, solar_fraction * total_solar_cap)
    
    # Zero solar at night
    forecast_time = now + timedelta(minutes=horizon_min)
    forecast_hour = forecast_time.hour
    if forecast_hour < 6 or forecast_hour >= 18:
        predicted_solar = 0.0
    
    # Generate 24-hour forecast for visualization (every hour)
    hourly_points = []
    for hour_offset in range(24):
        future_time = now + timedelta(hours=hour_offset)
        future_X = create_features(future_time, zone_id)
        
        # Use h4 (60 min) model for all hourly predictions
        future_demand_ratio = np.exp(models['demand_h4'].predict(future_X)[0])
        future_demand = future_X['Demand_MW'].values[0] * future_demand_ratio
        
        future_solar_frac = models['solar_h4'].predict(future_X)[0]
        future_solar = max(0, future_solar_frac * total_solar_cap)
        
        # Zero solar at night
        if future_time.hour < 6 or future_time.hour >= 18:
            future_solar = 0.0
        
        hourly_points.append({
            'hour': future_time.hour,
            'demandMW': float(future_demand),
            'solarMW': float(future_solar),
            'timestamp': future_time.isoformat()
        })
    
    # Calculate uncertainty (±10% based on typical MAPE)
    p10_demand = predicted_demand * 0.9
    p90_demand = predicted_demand * 1.1
    
    result = {
        'zoneId': zone_id,
        'currentTime': now.isoformat(),
        'forecastTime': forecast_time.isoformat(),
        'horizonMinutes': horizon_min,
        'prediction': {
            'demandMW': float(predicted_demand),
            'solarMW': float(predicted_solar),
            'p10_demand': float(p10_demand),
            'p90_demand': float(p90_demand),
        },
        'hourlyForecast': hourly_points,
        'model': f'XGBoost (trained on Raipur 30-zone dataset)',
        'modelIterations': {
            'demand': meta['best_iteration'][f'demand_{h}'],
            'solar': meta['best_iteration'][f'solar_{h}']
        },
        'lastRefresh': now.isoformat()
    }
    
    return result


def generate_mock_forecast(zone_id: str, horizon_min: int):
    """Generate mock forecast when models are not loaded"""
    now = datetime.now()
    forecast_time = now + timedelta(minutes=horizon_min)
    
    # Simple pattern based on zone and time
    zone_num = int(zone_id[1:])
    hour = forecast_time.hour
    
    # Base demand varies by zone
    base_demand = 8 + (zone_num % 10)
    
    # Diurnal pattern
    if 6 <= hour < 10:
        demand_mult = 0.8
    elif 17 <= hour < 22:
        demand_mult = 1.0
    else:
        demand_mult = 0.6
    
    predicted_demand = base_demand * demand_mult
    
    # Solar only during day
    predicted_solar = 0.0
    if 6 <= hour < 18:
        predicted_solar = 2.0 * np.sin((hour - 6) * np.pi / 12)
    
    # Generate hourly forecast
    hourly_points = []
    for h_offset in range(24):
        future_time = now + timedelta(hours=h_offset)
        fh = future_time.hour
        fd_mult = 0.8 if (6 <= fh < 10) else 1.0 if (17 <= fh < 22) else 0.6
        fd = base_demand * fd_mult
        fs = 2.0 * np.sin((fh - 6) * np.pi / 12) if (6 <= fh < 18) else 0.0
        
        hourly_points.append({
            'hour': fh,
            'demandMW': float(fd),
            'solarMW': float(max(0, fs)),
            'timestamp': future_time.isoformat()
        })
    
    return {
        'zoneId': zone_id,
        'currentTime': now.isoformat(),
        'forecastTime': forecast_time.isoformat(),
        'horizonMinutes': horizon_min,
        'prediction': {
            'demandMW': float(predicted_demand),
            'solarMW': float(predicted_solar),
            'p10_demand': float(predicted_demand * 0.9),
            'p90_demand': float(predicted_demand * 1.1),
        },
        'hourlyForecast': hourly_points,
        'model': 'Mock (models not loaded)',
        'modelIterations': {},
        'lastRefresh': now.isoformat()
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
