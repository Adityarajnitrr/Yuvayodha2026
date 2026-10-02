import { useEffect, useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceDot,
} from 'recharts';
import { useGridStore } from '../../store/gridStore';
import { useLang } from '../../context/AppContext';
import { AREA_DEFS } from '../../data/engine';

function toInputDate(d: Date) { return d.toISOString().slice(0, 10); }

export default function ForecastPage() {
  const { forecast, refreshForecast, snapshot, loading, scenario } = useGridStore();
  const { t } = useLang();
  const [scope, setScope]     = useState<'system' | 'area'>('system');
  const [areaId, setAreaId]   = useState('');
  const [horizon, setHorizon] = useState<6 | 24 | 48>(24);
  const [date, setDate]       = useState(toInputDate(new Date()));
  const [time, setTime]       = useState(`${String(new Date().getHours() + 1).padStart(2,'0')}:00`);
  const [fetched, setFetched] = useState(false);

  useEffect(() => { document.title = 'Expected Power Demand — Power Distribution Monitoring Portal'; }, []);

  const handleShow = () => {
    refreshForecast(horizon, scope === 'area' && areaId ? areaId as any : undefined);
    setFetched(true);
  };

  useEffect(() => { handleShow(); }, []);

  if (loading || !snapshot) return <p style={{ padding: '32px 0', color: 'var(--text-sec)' }}>{t('loading')}</p>;

  const pts     = forecast?.points ?? [];
  const nowHour = new Date().getHours();
  const chosenH = parseInt(time.split(':')[0], 10);
  const chosenPt = pts.find(p => p.hour === chosenH) ?? pts[0];
  const isNight = (chosenH >= 18 || chosenH < 6);

  const chartData = pts.map(p => ({
    label: `${String(p.hour).padStart(2,'0')}:00`,
    'Demand (MW)': +p.demandMW.toFixed(2),
    'P10': +p.p10.toFixed(2),
    'P90': +p.p90.toFixed(2),
    Solar: +p.solar.toFixed(2),
    Hydro: +p.hydro.toFixed(2),
    Thermal: +p.thermal.toFixed(2),
    Battery: +p.battery.toFixed(2),
    hour: p.hour,
  }));

  const totalSup = chosenPt ? chosenPt.solar + chosenPt.hydro + chosenPt.thermal + chosenPt.battery : 1;
  const srcPct = (v: number) => totalSup > 0 ? +((v / totalSup) * 100).toFixed(1) : 0;

  // Areas likely to need attention (use urgents + warns from current snapshot)
  const atRiskAreas = snapshot.areas.filter(a => a.status !== 'normal').slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--blue)' }}>
        <h1 style={{ margin: 0 }}>{t('forecastTitle')}</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-sec)' }}>Estimates are based on past data from the State Power Board and are not guaranteed.</p>
      </div>

      {/* Query form */}
      <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
        <div className="card-head">Forecast settings</div>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div className="field" style={{ marginBottom: 0, minWidth: '160px' }}>
              <label>Scope</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className={`btn btn-sm ${scope === 'system' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setScope('system')} aria-pressed={scope === 'system'}>Whole system</button>
                <button className={`btn btn-sm ${scope === 'area' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setScope('area')} aria-pressed={scope === 'area'}>Single area</button>
              </div>
            </div>
            {scope === 'area' && (
              <div className="field" style={{ marginBottom: 0, minWidth: '180px' }}>
                <label htmlFor="fc-area">Area</label>
                <select id="fc-area" className="select" value={areaId} onChange={e => setAreaId(e.target.value)} style={{ minHeight: '38px' }}>
                  <option value="">— Select area —</option>
                  {AREA_DEFS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Horizon</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {([6,24,48] as const).map(h => (
                  <button key={h} className={`btn btn-sm ${horizon === h ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setHorizon(h)}>{h === 6 ? 'Next 6 h' : h === 24 ? 'Next 24 h' : 'Next 48 h'}</button>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="fc-date">Date</label>
              <input id="fc-date" type="date" className="input" value={date} onChange={e => setDate(e.target.value)} style={{ minHeight: '38px', width: '160px' }} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="fc-time">Time</label>
              <select id="fc-time" className="select" value={time} onChange={e => setTime(e.target.value)} style={{ minHeight: '38px', width: '110px' }}>
                {Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleShow}>{t('showForecast')}</button>
          </div>
        </div>
      </div>

      {fetched && forecast && chosenPt && (
        <>
          {/* Result row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '14px', marginBottom: '20px' }}>
            <div className="card card-top-blue" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-sec)', marginBottom: '6px' }}>Expected demand at {time}</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--blue)', fontVariantNumeric: 'tabular-nums' }}>{chosenPt.demandMW.toFixed(1)} MW</div>
              <div style={{ fontSize: '13px', color: 'var(--text-sec)', marginTop: '4px' }}>Range: {chosenPt.p10.toFixed(1)} – {chosenPt.p90.toFixed(1)} MW</div>
              <p style={{ fontSize: '13px', color: 'var(--text-sec)', marginTop: '8px', marginBottom: 0 }}>This is an estimate made from past power board data.</p>
            </div>
            <div className="card card-top-blue" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-sec)', marginBottom: '8px' }}>Through the day</div>
              {[
                { label: 'Peak', val: `${forecast.peakMW.toFixed(1)} MW at ${String(forecast.peakHour).padStart(2,'0')}:00` },
                { label: 'Lowest', val: `${forecast.minMW.toFixed(1)} MW` },
                { label: 'Average', val: `${forecast.avgMW.toFixed(1)} MW` },
                { label: 'Renewable share', val: `${forecast.renewablePct.toFixed(1)}%` },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-sec)' }}>{r.label}</span>
                  <strong>{r.val}</strong>
                </div>
              ))}
            </div>
            <div className="card card-top-blue" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-sec)', marginBottom: '6px' }}>Peak hour</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--blue)' }}>{String(forecast.peakHour).padStart(2,'0')}:00</div>
              <div style={{ fontSize: '13px', color: 'var(--text-sec)', marginTop: '4px' }}>{forecast.peakMW.toFixed(1)} MW expected</div>
              <div style={{ fontSize: '13px', color: 'var(--text-sec)', marginTop: '6px' }}>Areas most likely to need attention at peak: {snapshot.areas.filter(a=>a.status!=='normal').slice(0,2).map(a=>a.name).join(', ') || 'None at this time'}</div>
            </div>
          </div>

          {/* How demand will be met */}
          <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
            <div className="card-head">{t('howMetTitle')}</div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', alignItems: 'start' }}>
                <div className="tbl-wrap">
                  <table className="tbl" style={{ minWidth: '320px' }}>
                    <thead><tr><th scope="col">Source</th><th scope="col" style={{textAlign:'right'}}>Expected (MW)</th><th scope="col" style={{textAlign:'right'}}>Share (%)</th><th scope="col">Bar</th></tr></thead>
                    <tbody>
                      {[
                        { label: t('solar'),   mw: chosenPt.solar,   color: 'var(--solar)' },
                        { label: t('hydro'),   mw: chosenPt.hydro,   color: 'var(--hydro)' },
                        { label: t('thermal'), mw: chosenPt.thermal, color: 'var(--thermal)' },
                        { label: t('battery'), mw: chosenPt.battery, color: 'var(--battery)' },
                      ].map(row => (
                        <tr key={row.label}>
                          <td style={{fontWeight:600}}>{row.label}</td>
                          <td style={{textAlign:'right',fontVariantNumeric:'tabular-nums'}}>{row.mw.toFixed(2)}</td>
                          <td style={{textAlign:'right'}}>{srcPct(row.mw)}%</td>
                          <td><div className="src-bar" style={{width:'80px'}}><div className="src-bar-fill" style={{width:`${srcPct(row.mw)}%`,background:row.color}} /></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-sec)', lineHeight: '1.7' }}>
                  {isNight
                    ? 'Solar output is zero at night. Hydro, battery and thermal supply most of the power.'
                    : chosenPt.solar > chosenPt.hydro
                    ? 'Solar is the largest source at this time. Hydro provides steady baseload. Thermal fills the gap.'
                    : 'Hydro and thermal are the main sources. Solar contributes during daylight hours.'}
                  <br />Renewable share: <strong>{srcPct(chosenPt.solar + chosenPt.hydro).toFixed(1)}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 24-hour chart */}
          <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
            <div className="card-head">Expected demand for the next {horizon} hours</div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF7" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={3} label={{ value: 'Time of day', position: 'insideBottom', offset: -12, fontSize: 12, fill: 'var(--text-sec)' }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft', fontSize: 12, fill: 'var(--text-sec)' }} />
                  <Tooltip contentStyle={{ fontSize: '13px', border: '1px solid var(--border)', fontFamily: 'var(--font)' }} formatter={(v: number, n: string) => [`${Number(v).toFixed(2)} MW`, n]} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <ReferenceLine x={`${String(nowHour).padStart(2,'0')}:00`} stroke="var(--blue)" strokeDasharray="4 2" label={{ value: 'Now', fill: 'var(--blue)', fontSize: 11 }} />
                  <Area type="monotone" dataKey="Solar"   stackId="s" stroke="var(--solar)"   fill="#FFF8DC" name="Solar" />
                  <Area type="monotone" dataKey="Hydro"   stackId="s" stroke="var(--hydro)"   fill="#DBEAFE" name="Hydro" />
                  <Area type="monotone" dataKey="Battery" stackId="s" stroke="var(--battery)" fill="#EDE9F8" name="Battery" />
                  <Area type="monotone" dataKey="Thermal" stackId="s" stroke="var(--thermal)" fill="#F3F4F6" name="Thermal" />
                  <Line type="monotone" dataKey="Demand (MW)" stroke="#1A1A1A" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="P10" stroke="#AAAAAA" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Low estimate" />
                  <Line type="monotone" dataKey="P90" stroke="#AAAAAA" strokeWidth={1} strokeDasharray="3 3" dot={false} name="High estimate" />
                </AreaChart>
              </ResponsiveContainer>
              <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--text-sec)' }}>
                <strong>How to read this chart:</strong> The black line is the expected total demand. Coloured areas show how each source will contribute. The dashed grey lines show the low and high estimate range (80% confidence). The blue dashed line marks the current hour. Solar is zero at night.
              </p>
            </div>
          </div>

          {/* Areas likely to need attention */}
          <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
            <div className="card-head">Areas likely to need attention</div>
            <div className="card-body" style={{ padding: 0 }}>
              {atRiskAreas.length === 0
                ? <p style={{ padding: '16px', margin: 0, color: 'var(--text-sec)' }}>No areas are expected to need attention at the selected time.</p>
                : (
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead><tr><th scope="col">Area</th><th scope="col">Expected peak share of limit</th><th scope="col">Time</th><th scope="col">Suggested action</th></tr></thead>
                      <tbody>
                        {atRiskAreas.map(a => (
                          <tr key={a.id}>
                            <td style={{fontWeight:600}}>{a.name}</td>
                            <td style={{fontWeight:'700',color:a.status==='urgent'?'var(--urgent)':'var(--warn)'}}>{(a.shareOfLimit*100).toFixed(0)}%</td>
                            <td>{String(forecast.peakHour).padStart(2,'0')}:00</td>
                            <td style={{fontSize:'13px',color:'var(--text-sec)'}}>Increase supply before {String(Math.max(0, forecast.peakHour - 1)).padStart(2,'0')}:00</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </div>

          {/* About forecast */}
          <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
            <div className="card-head">About this forecast</div>
            <div className="card-body">
              <div className="tbl-wrap">
                <table className="tbl" style={{ maxWidth: '500px' }}>
                  <tbody>
                    <tr><td style={{fontWeight:'700'}}>Model</td><td>GridOps Forecast v2.1</td></tr>
                    <tr><td style={{fontWeight:'700'}}>Data source</td><td>State Power Board data (placeholder)</td></tr>
                    <tr><td style={{fontWeight:'700'}}>Last trained</td><td>15 Sep 2026</td></tr>
                    <tr><td style={{fontWeight:'700'}}>Typical error</td><td>About {forecast.typicalErrorPct}%</td></tr>
                    <tr><td style={{fontWeight:'700'}}>Last refresh</td><td>{new Date(forecast.lastRefresh).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</td></tr>
                    <tr><td style={{fontWeight:'700'}}>Status</td><td style={{fontWeight:'700',color:'var(--normal)'}}>Working</td></tr>
                  </tbody>
                </table>
              </div>
              {scenario === 'forecast_error' && (
                <div className="notice-box notice-box-warn" style={{ marginTop: '12px' }}>
                  <div className="notice-title">Forecast error simulation active</div>
                  <p style={{ margin: 0 }}>The forecast is shifted 15% above actual values to simulate a model error. This is not a real error.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
