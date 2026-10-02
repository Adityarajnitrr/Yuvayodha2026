import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useGridStore } from '../../store/gridStore';
import { useLang } from '../../context/AppContext';
import { StatusTag, StatCard, Sparkline, SourceBar, DonutChart, ConfirmDialog } from '../../components/ui/index';

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number, d = 2) { return n.toFixed(d); }
function fmtKwh(n: number) { return n.toLocaleString('en-IN'); }

// Build 24-hour chart data from sparklines + forecast stub
function buildChartData(demandSparkline: number[], solarMW: number, hydroMW: number) {
  const now = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60;
  return Array.from({ length: 24 }, (_, i) => {
    const h = i;
    const isActual = h <= Math.floor(nowH);
    // Use sparkline for recent hours, else derive from diurnal shape
    const demand = isActual && demandSparkline[i] ? Number(demandSparkline[i].toFixed(2)) : Number((38 + Math.sin((h - 9) * 0.5) * 6 + Math.sin((h - 20) * 0.6) * 5).toFixed(2));
    const solarHr = (h < 6 || h > 18) ? 0 : Number((solarMW * Math.max(0, Math.sin((h - 5.5) / 13 * Math.PI))).toFixed(2));
    const hydroHr = Number((hydroMW * 0.92).toFixed(2));
    const battHr  = h >= 18 && h <= 22 ? Number((1.5).toFixed(2)) : 0;
    const thermalHr = Math.max(0, Number((demand - solarHr - hydroHr - battHr).toFixed(2)));
    const label = `${String(h).padStart(2, '0')}:00`;
    return { h: label, demand, solar: solarHr, hydro: hydroHr, thermal: thermalHr, battery: battHr, isActual };
  });
}

export default function HomePage() {
  const { snapshot, recommendations, changeLog, baseline, loading, lastUpdated, applyAllocation, addToast } = useGridStore();
  const { t } = useLang();
  const navigate = useNavigate();

  // Filter chips state
  const [areaFilter, setAreaFilter] = useState<'all' | 'urgent' | 'warn' | 'normal'>('all');
  const [sortCol, setSortCol]  = useState<'name' | 'load' | 'share'>('share');
  const [sortDir, setSortDir]  = useState<'asc' | 'desc'>('desc');

  // Confirm dialog for recommendations
  const [confirmRec, setConfirmRec] = useState<{ id: string; fromName: string; toName: string; shiftMW: number } | null>(null);

  useEffect(() => { document.title = 'Current Power Status — Power Distribution Monitoring Portal'; }, []);

  if (loading || !snapshot) {
    return <p style={{ padding: '32px 0', color: 'var(--text-sec)' }}>{t('loading')}</p>;
  }

  const { demandMW, supply, spareMW, battery, areas, renewablePct, co2AvoidedKg, avgCostRsPerUnit } = snapshot;
  const urgentCount   = areas.filter(a => a.status === 'urgent').length;
  const warnCount     = areas.filter(a => a.status === 'warn').length;
  const attentionCount = urgentCount + warnCount;

  const chartData = buildChartData(
    areas.reduce((acc, a) => { a.sparkline.forEach((v, i) => { acc[i] = (acc[i] ?? 0) + v; }); return acc; }, [] as number[]),
    supply.solar, supply.hydro
  );
  const nowHour = new Date().getHours();

  // Sorted + filtered areas
  const filtered = areas.filter(a => areaFilter === 'all' ? true : a.status === areaFilter);
  const sorted   = [...filtered].sort((a, b) => {
    const va = sortCol === 'name' ? a.name : sortCol === 'load' ? a.loadMW : a.shareOfLimit;
    const vb = sortCol === 'name' ? b.name : sortCol === 'load' ? b.loadMW : b.shareOfLimit;
    const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalSrc = supply.solar + supply.hydro + supply.thermal + supply.battery;
  const srcPct = (v: number) => totalSrc > 0 ? Number(((v / totalSrc) * 100).toFixed(1)) : 0;

  const handleApplyRec = (recId: string) => {
    const rec = recommendations.find(r => r.id === recId);
    if (!rec) return;
    setConfirmRec({ id: rec.id, fromName: rec.fromAreaName, toName: rec.toAreaName, shiftMW: rec.shiftMW });
  };

  const doApplyRec = () => {
    if (!confirmRec) return;
    const rec = recommendations.find(r => r.id === confirmRec.id);
    if (!rec) return;
    const refNo = applyAllocation({
      areaId: rec.toAreaId, newMW: snapshot.areas.find(a => a.id === rec.toAreaId)!.allocatedMW + rec.shiftMW,
      reason: 'Follows automatic forecast', duration: '4 hours', doneBy: 'R. Sharma', source: 'Recommendation',
    });
    addToast({ type: 'success', message: `Recommendation applied. Request No. ${refNo}` });
    setConfirmRec(null);
  };

  const th = (col: typeof sortCol, label: string) => (
    <th scope="col" onClick={() => { setSortCol(col); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
      {label} {sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </th>
  );

  return (
    <div>
      {/* ── Page title ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--blue)' }}>
        <h1 style={{ margin: 0 }}>Current Power Status</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-sec)', fontSize: '13px' }}>
          As on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })},&nbsp;
          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} IST
        </p>
      </div>

      {/* ── 1. Summary boxes ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <StatCard
          title={t('powerNeeded')}
          value={fmt(demandMW, 1)}
          unit="MW"
          desc="Total electricity being used across all areas right now."
        />
        <StatCard
          title={t('powerAvailable')}
          value={fmt(supply.total, 1)}
          unit="MW"
          desc={`Solar ${fmt(supply.solar,1)} | Hydro ${fmt(supply.hydro,1)} | Thermal ${fmt(supply.thermal,1)} | Battery ${fmt(supply.battery,1)} MW`}
        />
        <StatCard
          title={t('spareCap')}
          value={fmt(spareMW, 2)}
          unit="MW"
          desc={spareMW >= 0 ? 'Supply is sufficient overall.' : 'Supply is below demand — action needed.'}
          topColor={spareMW < 0 ? 'urgent' : 'normal'}
        />
        <StatCard
          title={t('battCharge')}
          value={fmt(battery.socPct, 0)}
          unit="%"
          desc={`${fmtKwh(Math.round(battery.usableKwh))} kWh usable · ${battery.isCharging ? 'Charging' : 'Discharging'}${battery.timeToEmptyH ? ` · ${fmt(battery.timeToEmptyH, 1)} h to empty` : ''}`}
        />
        <StatCard
          title={t('areasAttention')}
          value={attentionCount}
          unit={attentionCount === 1 ? 'area' : 'areas'}
          desc={`${urgentCount} Urgent · ${warnCount} Needs attention · 4.2 h without power avoided today`}
          topColor={urgentCount > 0 ? 'urgent' : warnCount > 0 ? 'warn' : 'normal'}
        />
      </div>

      {/* ── 2. Demand/supply 24h chart ────────────────────────────────────── */}
      <div className="card card-top-blue mb-24" style={{ marginBottom: '20px' }}>
        <div className="card-head">Power needed and supplied today</div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF7" />
              <XAxis dataKey="h" tick={{ fontSize: 11, fill: 'var(--text-sec)' }} interval={2}
                label={{ value: 'Time of day', position: 'insideBottom', offset: -12, fontSize: 12, fill: 'var(--text-sec)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-sec)' }}
                label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft', offset: 16, fontSize: 12, fill: 'var(--text-sec)' }} />
              <Tooltip contentStyle={{ fontSize: '13px', border: '1px solid var(--border)', fontFamily: 'var(--font)' }}
                formatter={(v: number, name: string) => [`${Number(v).toFixed(2)} MW`, name]} />
              <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} />
              <ReferenceLine x={`${String(nowHour).padStart(2,'0')}:00`} stroke="var(--blue)" strokeDasharray="4 2"
                label={{ value: 'Now', fill: 'var(--blue)', fontSize: 11 }} />
              <Area type="monotone" dataKey="solar"   stackId="s" stroke="var(--solar)"   fill="#FFF8DC" name="Solar" />
              <Area type="monotone" dataKey="hydro"   stackId="s" stroke="var(--hydro)"   fill="#DBEAFE" name="Hydro" />
              <Area type="monotone" dataKey="battery" stackId="s" stroke="var(--battery)" fill="#EDE9F8" name="Battery" />
              <Area type="monotone" dataKey="thermal" stackId="s" stroke="var(--thermal)" fill="#F3F4F6" name="Thermal" />
              <Line type="monotone" dataKey="demand" stroke="#1A1A1A" strokeWidth={2.5} dot={false} name="Demand" />
            </AreaChart>
          </ResponsiveContainer>
          <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--text-sec)' }}>
            <strong>How to read this chart:</strong> The black line is total demand. Coloured areas show how each source contributes. The dashed line marks the current hour. Solar is zero at night.
          </p>
        </div>
      </div>

      {/* ── 3. Power sources ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.8fr) minmax(0,1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="card card-top-blue">
          <div className="card-head">Where is our power coming from?</div>
          <div className="card-body">
            <div className="tbl-wrap">
              <table className="tbl" aria-label="Power sources">
                <thead><tr>
                  <th scope="col">Source</th>
                  <th scope="col" style={{ textAlign: 'right' }}>MW</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Share %</th>
                  <th scope="col">Bar</th>
                </tr></thead>
                <tbody>
                  {[
                    { label: t('solar'),   mw: supply.solar,   color: 'var(--solar)' },
                    { label: t('hydro'),   mw: supply.hydro,   color: 'var(--hydro)' },
                    { label: t('thermal'), mw: supply.thermal, color: 'var(--thermal)' },
                    { label: t('battery'), mw: supply.battery, color: 'var(--battery)' },
                  ].map(row => (
                    <tr key={row.label}>
                      <td style={{ fontWeight: 600 }}>{row.label}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(row.mw, 2)}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{srcPct(row.mw)}%</td>
                      <td><SourceBar pct={srcPct(row.mw)} color={row.color} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr>
                  <td>Total</td>
                  <td style={{ textAlign: 'right' }}>{fmt(totalSrc, 2)}</td>
                  <td style={{ textAlign: 'right' }}>100%</td>
                  <td />
                </tr></tfoot>
              </table>
            </div>
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-sec)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span>CO₂ avoided today: <strong style={{ color: 'var(--text)' }}>{fmtKwh(co2AvoidedKg)} kg</strong></span>
              <span>Average cost of supply: <strong style={{ color: 'var(--text)' }}>Rs {fmt(avgCostRsPerUnit, 2)} per unit</strong></span>
              {supply.solar === 0 && <span style={{ color: 'var(--warn)', fontWeight: 600 }}>Solar is currently zero — it is night or early morning.</span>}
            </div>
          </div>
        </div>
        <div className="card card-top-blue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <DonutChart pct={Math.round(renewablePct)} label="Renewable" color="var(--normal)" size={120} />
          <div style={{ marginTop: '10px', fontWeight: '700', color: 'var(--text)', textAlign: 'center' }}>Renewable share</div>
          <div style={{ fontSize: '13px', color: 'var(--text-sec)', textAlign: 'center', marginTop: '4px' }}>Solar + Hydro out of total supply</div>
        </div>
      </div>

      {/* ── 4. Areas at a glance ─────────────────────────────────────────── */}
      <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
        <div className="card-head" style={{ justifyContent: 'space-between' }}>
          <span>Areas at a glance</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {([
              ['all', 'All', areas.length],
              ['urgent', 'Urgent', urgentCount],
              ['warn', 'Needs attention', warnCount],
              ['normal', 'Normal', areas.length - urgentCount - warnCount],
            ] as const).map(([val, label, count]) => (
              <button key={val} className={`chip${areaFilter === val ? ' active' : ''}`}
                onClick={() => setAreaFilter(val)} aria-pressed={areaFilter === val}>
                {label} <span>({count})</span>
              </button>
            ))}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="tbl-wrap">
            <table className="tbl" aria-label="Area-wise status">
              <thead><tr>
                <th scope="col" style={{ width: '36px' }}>Sr.</th>
                {th('name', 'Area')}
                {th('load', 'Power used (MW)')}
                {th('share', 'Limit (MW)')}
                <th scope="col">Share of limit</th>
                <th scope="col">Trend</th>
                <th scope="col">Status</th>
                <th scope="col">View</th>
              </tr></thead>
              <tbody>
                {sorted.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-sec)' }}>No areas match this filter.</td></tr>}
                {sorted.map((area, i) => (
                  <tr key={area.id}>
                    <td style={{ color: 'var(--text-sec)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{area.name}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(area.loadMW)}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(area.limitMW)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '70px', height: '8px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, area.shareOfLimit * 100)}%`, height: '100%', background: area.status === 'urgent' ? 'var(--urgent)' : area.status === 'warn' ? 'var(--warn)' : 'var(--normal)', borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', fontVariantNumeric: 'tabular-nums', color: area.status === 'urgent' ? 'var(--urgent)' : area.status === 'warn' ? 'var(--warn)' : 'var(--normal)' }}>
                          {(area.shareOfLimit * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '16px', marginRight: '4px' }}>{area.trend === 'up' ? '↑' : area.trend === 'down' ? '↓' : '→'}</span>
                      <Sparkline data={area.sparkline.slice(-12)} color={area.status === 'urgent' ? 'var(--urgent)' : area.status === 'warn' ? 'var(--warn)' : 'var(--normal)'} width={48} height={20} />
                    </td>
                    <td><StatusTag status={area.status} /></td>
                    <td>
                      <button className="btn btn-secondary btn-xs"
                        onClick={() => navigate(`/areas/${area.id}`, { state: { areaName: area.name } })}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 5. Recommendations ───────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
          <div className="card-head">What should be done?</div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="tbl" aria-label="Recommendations">
              <thead><tr>
                <th scope="col">Situation</th>
                <th scope="col">Suggested action</th>
                <th scope="col" style={{ width: '200px' }}>Actions</th>
              </tr></thead>
              <tbody>
                {recommendations.map(rec => (
                  <tr key={rec.id}>
                    <td style={{ fontSize: '14px' }}>
                      <strong>{rec.toAreaName}</strong> is at {(snapshot.areas.find(a => a.id === rec.toAreaId)!.shareOfLimit * 100).toFixed(0)}% of its limit.{' '}
                      <strong>{rec.fromAreaName}</strong> has {fmt(rec.headroomMW, 2)} MW spare.
                    </td>
                    <td style={{ fontSize: '14px' }}>Move <strong>{fmt(rec.shiftMW, 2)} MW</strong> from {rec.fromAreaName} to {rec.toAreaName}.</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-primary btn-xs" onClick={() => handleApplyRec(rec.id)}>Apply</button>
                        <button className="btn btn-secondary btn-xs" onClick={() => navigate(`/adjust?area=${rec.toAreaId}`)}>Adjust manually</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. Recent changes + system status ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="card card-top-blue">
          <div className="card-head">Recent changes made by operators</div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="tbl-wrap">
              <table className="tbl" aria-label="Recent changes">
                <thead><tr>
                  <th scope="col">Time</th>
                  <th scope="col">Who</th>
                  <th scope="col">Area</th>
                  <th scope="col">Change</th>
                  <th scope="col">Reason</th>
                </tr></thead>
                <tbody>
                  {changeLog.slice(0, 6).map(r => (
                    <tr key={r.refNo}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--text-sec)' }}>{new Date(r.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ fontSize: '13px' }}>{r.doneBy}</td>
                      <td style={{ fontSize: '13px', fontWeight: 600 }}>{r.areaName}</td>
                      <td style={{ fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>{fmt(r.oldMW)} → {fmt(r.newMW)} MW</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-sec)' }}>{r.reason}</td>
                    </tr>
                  ))}
                  {changeLog.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-sec)' }}>No changes recorded yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="card card-top-blue">
          <div className="card-head">System status</div>
          <div className="card-body">
            {[
              { label: 'Forecast model', value: 'Working', ok: true },
              { label: 'Data feed', value: 'Updated 0 s ago', ok: true },
              { label: 'Response time', value: '~250 ms', ok: true },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-sec)' }}>{s.label}</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: s.ok ? 'var(--normal)' : 'var(--urgent)' }}>{s.value}</span>
              </div>
            ))}
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-sec)' }}>
              GridOps Forecast v2.1 · Typical error: 3.8% · Last trained: 15 Sep 2026
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. Improvement card ───────────────────────────────────────────── */}
      <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
        <div className="card-head">{t('improvTitle')}</div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {[
              { label: t('outageAvoided'),  value: '4.2',   unit: 'hours' },
              { label: t('energySaved'),    value: fmtKwh(baseline.unservedEnergyKwh), unit: 'kWh' },
              { label: t('thermalReduced'), value: '18.3',  unit: '%' },
              { label: t('co2Avoided'),     value: fmtKwh(baseline.co2AvoidedKg), unit: 'kg' },
            ].map(d => (
              <div key={d.label} style={{ flex: '1', minWidth: '140px', background: 'var(--blue-tint)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sec)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.04em' }}>{d.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--blue)', fontVariantNumeric: 'tabular-nums' }}>{d.value}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-sec)' }}>{d.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sec)', fontStyle: 'italic' }}>
            Compared with a baseline without storage, forecasting or demand response. Values are from simulation.
          </p>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmRec && (
        <ConfirmDialog
          title="Apply recommendation"
          onConfirm={doApplyRec}
          onCancel={() => setConfirmRec(null)}
          confirmLabel="Confirm and apply"
        >
          <p>This will move <strong>{fmt(confirmRec.shiftMW, 2)} MW</strong> from <strong>{confirmRec.fromName}</strong> to <strong>{confirmRec.toName}</strong>.</p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-sec)' }}>The change will be logged with your name (R. Sharma) and a reference number.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}
