import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useGridStore } from '../../store/gridStore';
import { useLang } from '../../context/AppContext';
import { StatusTag, Tabs, ConfirmDialog } from '../../components/ui/index';

export default function AreaDetailPage() {
  const { areaId } = useParams<{ areaId: string }>();
  const { snapshot, loading, addToast, applyAllocation } = useGridStore();
  const { t } = useLang();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [showAll, setShowAll] = useState(false);
  const [houseSearch, setHouseSearch] = useState('');
  const [demandDialog, setDemandDialog] = useState(false);

  const area = snapshot?.areas.find(a => a.id === areaId);

  useEffect(() => {
    if (area) document.title = `${area.name} — Power Distribution Monitoring Portal`;
  }, [area]);

  if (loading || !snapshot) return <p style={{ padding: '32px 0', color: 'var(--text-sec)' }}>{t('loading')}</p>;
  if (!area) return (
    <div className="notice-box">
      <div className="notice-title">Area not found</div>
      <p>The area ID "{areaId}" does not exist. <Link to="/areas">Go back to Area-wise Status.</Link></p>
    </div>
  );

  const utilizePct = (area.shareOfLimit * 100).toFixed(0);
  const statusSentence = area.status === 'urgent'
    ? `${area.name} is using ${utilizePct}% of its supply limit. This is above the safe level. Immediate action may be needed.`
    : area.status === 'warn'
    ? `${area.name} is using ${utilizePct}% of its supply limit. This is above 70% and should be monitored closely.`
    : `${area.name} is using ${utilizePct}% of its supply limit. This is within the normal range.`;

  // Chart data from sparkline
  const now = Date.now();
  const chartData = area.sparkline.map((v, i) => {
    const tMs = now - (area.sparkline.length - 1 - i) * 30_000;
    const label = new Date(tMs).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return { time: label, 'Power used (MW)': +v.toFixed(2), 'Power given (MW)': +area.allocatedMW.toFixed(2), 'Limit (MW)': area.limitMW };
  });

  // Houses
  const housesFiltered = houseSearch
    ? area.houses.filter(h => h.id.toLowerCase().includes(houseSearch.toLowerCase()))
    : area.houses;
  const housesSorted = [...housesFiltered].sort((a, b) => b.loadKW - a.loadKW);
  const housesVisible = showAll ? housesSorted : housesSorted.slice(0, 10);
  const totalLoadKW = area.houses.reduce((s, h) => s + h.loadKW, 0) || 1;
  const changeLog = useGridStore.getState().changeLog.filter(r => r.areaId === area.id);

  const tabItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'houses',   label: `Houses (${area.houses.length})` },
    { id: 'trend',    label: 'Trend' },
    { id: 'records',  label: `Records (${changeLog.length})` },
  ];

  const handleDemandReduction = () => {
    const refNo = applyAllocation({
      areaId: area.id,
      newMW: +(area.allocatedMW - area.flexibleLoadMW * 0.5).toFixed(2),
      reason: 'Demand reduction – flexible loads', duration: '1 hour', doneBy: 'R. Sharma', source: 'Operator',
    });
    addToast({ type: 'success', message: `Demand reduction requested. Ref: ${refNo}` });
    setDemandDialog(false);
  };

  return (
    <div>
      {/* Heading */}
      <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--blue)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>{area.name}</h1>
          <StatusTag status={area.status} />
          {area.priority && <span style={{ marginLeft: '8px', fontSize: '12px', background: 'var(--blue-tint)', color: 'var(--blue)', fontWeight: '700', padding: '2px 8px', borderRadius: '3px' }}>Protected area</span>}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/adjust?area=${area.id}`)}>Adjust supply for this area</button>
          {area.flexibleLoadMW > 0 && <button className="btn btn-secondary btn-sm" onClick={() => setDemandDialog(true)}>Request demand reduction</button>}
        </div>
      </div>

      <Tabs tabs={tabItems} active={tab} onChange={setTab} />

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div>
          <p style={{ fontSize: '15px', color: 'var(--text-sec)', marginBottom: '16px' }}>{statusSentence}</p>
          {/* Three facts */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {[
              { label: t('powerGiven'),      val: area.allocatedMW.toFixed(2), unit: 'MW', color: 'var(--blue)' },
              { label: t('powerNeededArea'), val: area.loadMW.toFixed(2),      unit: 'MW', color: area.status === 'urgent' ? 'var(--urgent)' : area.status === 'warn' ? 'var(--warn)' : 'var(--normal)' },
              { label: t('safeMax'),         val: area.maxAllocatableMW.toFixed(2), unit: 'MW', color: 'var(--normal)' },
            ].map(f => (
              <div key={f.label} className="card card-top-blue" style={{ flex: '1', minWidth: '160px', padding: '14px 16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sec)', textTransform: 'uppercase', marginBottom: '5px' }}>{f.label}</div>
                <div><span style={{ fontSize: '24px', fontWeight: '800', color: f.color }}>{f.val}</span> <span style={{ fontSize: '13px', color: 'var(--text-sec)' }}>{f.unit}</span></div>
              </div>
            ))}
          </div>
          {/* Bar: given vs needs vs safe max */}
          <div className="card card-top-blue" style={{ marginBottom: '16px' }}>
            <div className="card-head">Supply vs demand bar</div>
            <div className="card-body">
              <div style={{ position: 'relative', height: '24px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(100, (area.loadMW / area.maxAllocatableMW) * 100)}%`, background: area.status === 'urgent' ? 'var(--urgent)' : area.status === 'warn' ? 'var(--warn)' : 'var(--normal)', borderRadius: '3px', transition: 'width .4s' }} />
                <div style={{ position: 'absolute', left: `${Math.min(98, (area.limitMW / area.maxAllocatableMW) * 100)}%`, top: 0, height: '100%', width: '2px', background: 'var(--blue)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-sec)' }}>
                <span>0 MW</span>
                <span style={{ color: 'var(--blue)', fontWeight: '700' }}>Limit: {area.limitMW.toFixed(2)} MW</span>
                <span>Safe max: {area.maxAllocatableMW.toFixed(2)} MW</span>
              </div>
            </div>
          </div>
          {area.status === 'urgent' && snapshot.spareMW > 0 && (
            <div className="notice-box" style={{ marginBottom: '16px' }}>
              <div className="notice-title">Total power is sufficient.</div>
              <p>The problem is only in {area.name}'s supply limit. Total system spare capacity is {snapshot.spareMW.toFixed(2)} MW.</p>
            </div>
          )}
        </div>
      )}

      {/* HOUSES */}
      {tab === 'houses' && (
        <div>
          <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="search" className="input" value={houseSearch} onChange={e => setHouseSearch(e.target.value)}
              placeholder="Search house / unit ID…" style={{ minHeight: '36px', fontSize: '13px', width: '220px' }} aria-label="Search houses" />
            <span style={{ fontSize: '13px', color: 'var(--text-sec)' }}>Total houses: {area.houses.length} · Total load: {area.loadMW.toFixed(2)} MW</span>
          </div>
          <div className="card">
            <div className="tbl-wrap">
              <table className="tbl" aria-label={`Houses in ${area.name}`}>
                <thead><tr>
                  <th scope="col">Sr.</th>
                  <th scope="col">House / Unit No.</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Power used (kW)</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Share of area (%)</th>
                  <th scope="col">Flexible load</th>
                  <th scope="col">Status</th>
                </tr></thead>
                <tbody>
                  {housesVisible.map((h, i) => {
                    const share = ((h.loadKW / totalLoadKW) * 100).toFixed(1);
                    const isTop = i < 3;
                    return (
                      <tr key={h.id}>
                        <td style={{ color: 'var(--text-sec)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>
                          {h.id}
                          {isTop && <span style={{ marginLeft: '6px', fontSize: '11px', background: 'var(--urgent-bg)', color: 'var(--urgent)', borderRadius: '2px', padding: '1px 5px', fontWeight: '700' }}>Top consumer</span>}
                        </td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{h.loadKW.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{share}%</td>
                        <td>{h.flexible ? <span style={{ color: 'var(--normal)', fontWeight: '700' }}>Yes</span> : <span style={{ color: 'var(--text-sec)' }}>No</span>}</td>
                        <td><span className={`tag ${h.loadKW > (totalLoadKW / area.houses.length) * 1.4 ? 'tag-warn' : 'tag-normal'}`}>{h.loadKW > (totalLoadKW / area.houses.length) * 1.4 ? '● High' : '✓ Normal'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {housesSorted.length > 10 && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAll(v => !v)}>
                  {showAll ? 'Show top 10' : `Show all ${housesSorted.length} houses`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TREND */}
      {tab === 'trend' && (
        <div className="card card-top-blue">
          <div className="card-head">Today's power usage vs limit</div>
          <div className="card-body">
            <p style={{ fontSize: '13px', color: 'var(--text-sec)', marginBottom: '12px' }}>Blue line = power used · Orange dashed = limit · Green dashed = power given. Last 12 minutes of readings.</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF7" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} label={{ value: 'Time of day', position: 'insideBottom', offset: -12, fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, area.maxAllocatableMW * 1.1]} label={{ value: 'Power (MW)', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: '13px', border: '1px solid var(--border)' }} formatter={(v: number, n: string) => [`${v.toFixed(2)} MW`, n]} />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <ReferenceLine y={area.limitMW} stroke="var(--urgent)" strokeDasharray="5 3" label={{ value: 'Limit', fill: 'var(--urgent)', fontSize: 11 }} />
                <Line type="monotone" dataKey="Power used (MW)" stroke="var(--blue)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Power given (MW)" stroke="var(--normal)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* RECORDS */}
      {tab === 'records' && (
        <div className="card">
          <div className="card-head">Change records for {area.name}</div>
          <div className="tbl-wrap">
            <table className="tbl" aria-label={`Records for ${area.name}`}>
              <thead><tr>
                <th scope="col">Ref. No.</th>
                <th scope="col">Date & Time</th>
                <th scope="col" style={{ textAlign: 'right' }}>Old (MW)</th>
                <th scope="col" style={{ textAlign: 'right' }}>New (MW)</th>
                <th scope="col">Reason</th>
                <th scope="col">Duration</th>
                <th scope="col">Done by</th>
              </tr></thead>
              <tbody>
                {changeLog.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-sec)' }}>No records for this area yet.</td></tr>}
                {changeLog.map(r => (
                  <tr key={r.refNo}>
                    <td style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '13px' }}>{r.refNo}</td>
                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{new Date(r.ts).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td style={{ textAlign: 'right' }}>{r.oldMW.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: r.newMW > r.oldMW ? 'var(--normal)' : 'var(--urgent)' }}>{r.newMW.toFixed(2)}</td>
                    <td style={{ fontSize: '13px' }}>{r.reason}</td>
                    <td style={{ fontSize: '13px' }}>{r.duration}</td>
                    <td style={{ fontSize: '13px' }}>{r.doneBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {demandDialog && (
        <ConfirmDialog title="Request demand reduction" onConfirm={handleDemandReduction} onCancel={() => setDemandDialog(false)} confirmLabel="Send request">
          <p>This will request a reduction of flexible loads (pumps, AC, EV) in <strong>{area.name}</strong>.</p>
          <p style={{ margin: 0 }}>Estimated reduction: <strong>{(area.flexibleLoadMW * 0.5).toFixed(2)} MW</strong>. This will be logged as a change record.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}
