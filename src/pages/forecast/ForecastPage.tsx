import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useGridStore } from '../../store/gridStore';
import { useLang } from '../../context/AppContext';

// Raipur 30-zone IDs (Z01 to Z30)
const ZONES = Array.from({ length: 30 }, (_, i) => `Z${String(i + 1).padStart(2, '0')}`);
const TIME_HORIZONS = [15, 30, 45, 60]; // minutes

interface ForecastData {
  zoneId: string;
  currentTime: string;
  forecastTime: string;
  horizonMinutes: number;
  prediction: {
    demandMW: number;
    solarMW: number;
    p10_demand: number;
    p90_demand: number;
  };
  hourlyForecast: Array<{
    hour: number;
    demandMW: number;
    solarMW: number;
    timestamp: string;
  }>;
  model: string;
  modelIterations?: {
    demand: number;
    solar: number;
  };
  lastRefresh: string;
}

export default function ForecastPage() {
  const { t } = useLang();
  const [zoneId, setZoneId] = useState('Z01');
  const [horizonMin, setHorizonMin] = useState(60);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { 
    document.title = 'XGBoost Demand Forecast — Power Distribution Monitoring Portal';
  }, []);

  const handleForecast = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
      const response = await fetch(`${apiBase}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneId, horizonMinutes: horizonMin }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setForecast(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch forecast');
      console.error('Forecast error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    handleForecast();
  }, []);

  const pred = forecast?.prediction;
  const hourly = forecast?.hourlyForecast || [];

  // Chart data for 24-hour view
  const chartData = hourly.map(p => ({
    label: `${String(p.hour).padStart(2, '0')}:00`,
    'Demand (MW)': +p.demandMW.toFixed(2),
    'Solar (MW)': +p.solarMW.toFixed(2),
    hour: p.hour,
  }));

  return (
    <div>
      <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--blue)' }}>
        <h1 style={{ margin: 0 }}>XGBoost Demand & Solar Forecast</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-sec)' }}>
          Predictions from XGBoost models trained on Raipur 30-zone synthetic dataset
        </p>
      </div>

      {/* Input form - simplified to just Zone and Time */}
      <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
        <div className="card-head">Forecast Inputs</div>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div className="field" style={{ marginBottom: 0, minWidth: '200px' }}>
              <label htmlFor="zone-select">Zone</label>
              <select 
                id="zone-select" 
                className="select" 
                value={zoneId} 
                onChange={e => setZoneId(e.target.value)}
                style={{ minHeight: '38px' }}
              >
                {ZONES.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Time Horizon</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {TIME_HORIZONS.map(t => (
                  <button 
                    key={t}
                    className={`btn btn-sm ${horizonMin === t ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setHorizonMin(t)}
                  >
                    {t} min
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={handleForecast}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Get Forecast'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="card card-top-blue" style={{ marginBottom: '20px', borderLeft: '4px solid var(--urgent)' }}>
          <div className="card-body">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {forecast && pred && (
        <>
          {/* Main prediction card */}
          <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
            <div className="card-head">
              Prediction for {forecast.zoneId} at {horizonMin} minutes ahead
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-sec)', marginBottom: '6px' }}>
                    Demand Forecast
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--blue)', fontVariantNumeric: 'tabular-nums' }}>
                    {pred.demandMW.toFixed(2)} MW
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-sec)', marginTop: '4px' }}>
                    Range: {pred.p10_demand.toFixed(2)} – {pred.p90_demand.toFixed(2)} MW
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-sec)', marginBottom: '6px' }}>
                    Solar Forecast
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--solar)', fontVariantNumeric: 'tabular-nums' }}>
                    {pred.solarMW.toFixed(2)} MW
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-sec)', marginTop: '4px' }}>
                    {pred.solarMW > 0 ? 'Daylight hours' : 'Night time (no solar)'}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-sec)', marginBottom: '6px' }}>
                    Model Info
                  </div>
                  <div style={{ fontSize: '14px', marginTop: '8px' }}>
                    <div><strong>Model:</strong> {forecast.model}</div>
                    {forecast.modelIterations && (
                      <>
                        <div style={{ marginTop: '4px' }}>
                          <strong>Demand iterations:</strong> {forecast.modelIterations.demand}
                        </div>
                        <div>
                          <strong>Solar iterations:</strong> {forecast.modelIterations.solar}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 24-hour chart */}
          <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
            <div className="card-head">24-Hour Forecast for {forecast.zoneId}</div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF7" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 11 }} 
                    interval={2}
                    label={{ value: 'Time of day', position: 'insideBottom', offset: -12, fontSize: 12, fill: 'var(--text-sec)' }} 
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft', fontSize: 12, fill: 'var(--text-sec)' }} 
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: '13px', border: '1px solid var(--border)', fontFamily: 'var(--font)' }} 
                    formatter={(v: number) => `${Number(v).toFixed(2)} MW`} 
                  />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="Demand (MW)" 
                    stroke="var(--blue)" 
                    strokeWidth={2.5} 
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Solar (MW)" 
                    stroke="var(--solar)" 
                    strokeWidth={2} 
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--text-sec)' }}>
                <strong>How to read this chart:</strong> Blue line shows predicted demand. Orange line shows predicted solar generation (zero at night).
                Try changing the zone or time horizon above to see how predictions change.
              </p>
            </div>
          </div>

          {/* Technical details */}
          <div className="card card-top-blue">
            <div className="card-head">Model Technical Details</div>
            <div className="card-body">
              <div className="tbl-wrap">
                <table className="tbl" style={{ maxWidth: '600px' }}>
                  <tbody>
                    <tr>
                      <td style={{fontWeight:'700', width: '200px'}}>Dataset</td>
                      <td>Raipur 30-zone synthetic (Jan-Apr 2024)</td>
                    </tr>
                    <tr>
                      <td style={{fontWeight:'700'}}>Training features</td>
                      <td>33 features (zone type, demand/solar history, weather, time)</td>
                    </tr>
                    <tr>
                      <td style={{fontWeight:'700'}}>Demand target</td>
                      <td>log(demand_future / demand_now)</td>
                    </tr>
                    <tr>
                      <td style={{fontWeight:'700'}}>Solar target</td>
                      <td>Future output / installed capacity</td>
                    </tr>
                    <tr>
                      <td style={{fontWeight:'700'}}>Typical MAPE</td>
                      <td>~8-10% (from test set)</td>
                    </tr>
                    <tr>
                      <td style={{fontWeight:'700'}}>Last refresh</td>
                      <td>{new Date(forecast.lastRefresh).toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-sec)' }}>
                <strong>Note:</strong> This model was trained in Google Colab on synthetic data calibrated to Raipur regional load patterns.
                The 33 input features include zone characteristics, historical demand/solar, weather conditions, and time encodings.
                Each prediction uses the appropriate XGBoost model (h1/h2/h3/h4) based on your selected time horizon.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
