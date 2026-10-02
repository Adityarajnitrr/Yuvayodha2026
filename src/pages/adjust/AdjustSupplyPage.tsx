import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGridStore } from '../../store/gridStore';
import { useLang } from '../../context/AppContext';
import { StatusTag, ConfirmDialog } from '../../components/ui/index';
import { AREA_DEFS } from '../../data/engine';

const REASONS = ['Peak demand management','Emergency reallocation','Scheduled maintenance','Follows automatic forecast','Manual change'] as const;
const DURATIONS = ['1 hour','4 hours','Until cancelled','Permanent'] as const;

function downloadCSV(rows: object[], filename: string) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String((r as any)[k]).replace(/"/g,'""')}"`).join(','))].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename; a.click();
}

export default function AdjustSupplyPage() {
  const { snapshot, loading, changeLog, applyAllocation, undoAllocation, addToast } = useGridStore();
  const { t } = useLang();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep]       = useState<1|2|3|4>(1);
  const [areaId, setAreaId]   = useState(params.get('area') ?? '');
  const [newMW, setNewMW]     = useState('');
  const [reason, setReason]   = useState<typeof REASONS[number]>('Peak demand management');
  const [duration, setDuration] = useState<typeof DURATIONS[number]>('4 hours');
  const [remarks, setRemarks] = useState('');
  const [confirmTick, setConfirmTick] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refNo, setRefNo]     = useState('');
  const [undoTimer, setUndoTimer] = useState(0);
  const [emergOpen, setEmergOpen] = useState(false);
  const [emergTick, setEmergTick] = useState(false);
  const [emergReason, setEmergReason] = useState('');
  const undoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { document.title = 'Adjust Supply — Power Distribution Monitoring Portal'; }, []);

  useEffect(() => {
    if (params.get('area') && snapshot?.areas.find(a => a.id === params.get('area'))) {
      setAreaId(params.get('area')!);
      setStep(2);
    }
  }, [snapshot]);

  if (loading || !snapshot) return <p style={{ padding: '32px 0', color: 'var(--text-sec)' }}>{t('loading')}</p>;

  const area       = snapshot.areas.find(a => a.id === areaId);
  const newMWFloat = parseFloat(newMW) || 0;
  const hardLimit  = area?.maxAllocatableMW ?? 0;
  const isOver     = newMWFloat > hardLimit && newMW !== '';
  const isLarge    = area && newMW !== '' && (Math.abs(newMWFloat - area.allocatedMW) > 0.5 || Math.abs((newMWFloat - area.allocatedMW) / area.allocatedMW) > 0.1);
  const sysSpare   = snapshot.spareMW;

  const handleSubmit = () => {
    if (!area || isOver) return;
    setSubmitting(true);
    const ref = applyAllocation({ areaId: area.id, newMW: newMWFloat, reason, duration, doneBy: 'R. Sharma', remarks, source: 'Operator' });
    setRefNo(ref);
    setSubmitting(false);
    setUndoTimer(10);
    undoRef.current = setInterval(() => setUndoTimer(v => { if (v <= 1) { clearInterval(undoRef.current!); return 0; } return v - 1; }), 1000);
    addToast({ type: 'success', message: `Change applied. Request No. ${ref}` });
    setStep(1); setAreaId(''); setNewMW(''); setRemarks(''); setConfirmTick(false);
  };

  const handleUndo = () => {
    if (undoRef.current) clearInterval(undoRef.current);
    undoAllocation(refNo);
    setUndoTimer(0);
    addToast({ type: 'info', message: `Undo applied for ${refNo}.` });
    setRefNo('');
  };

  const handleEmergency = () => {
    if (!area) return;
    const boostMW = Math.min(area.maxAllocatableMW, area.loadMW + sysSpare * 0.7);
    const ref = applyAllocation({ areaId: area.id, newMW: +boostMW.toFixed(2), reason: emergReason || 'Emergency boost', duration: 'Until cancelled', doneBy: 'R. Sharma', source: 'Emergency Boost' });
    addToast({ type: 'success', message: `Emergency boost applied. Ref: ${ref}` });
    setEmergOpen(false); setEmergTick(false); setEmergReason('');
  };

  const steps = ['1. Select area','2. Check limits','3. Enter new supply','4. Review & confirm'];

  return (
    <div>
      <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--blue)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0 }}>{t('navAdjust')}</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-sec)' }}>All changes are recorded and cannot be edited.</p>
        </div>
        {area && <button className="btn btn-danger btn-sm" onClick={() => setEmergOpen(true)}>{t('emergencyBoost')}</button>}
      </div>

      {/* Stepper */}
      <div className="stepper" style={{ marginBottom: '24px' }}>
        {steps.map((s, i) => (
          <div key={i} className={`step-item${step === i+1 ? ' active' : step > i+1 ? ' done' : ''}`}>{s}{step > i+1 ? ' ✓' : ''}</div>
        ))}
      </div>

      {/* Confirmation / refNo banner */}
      {refNo && undoTimer > 0 && (
        <div className="confirm-box" style={{ marginBottom: '20px' }}>
          <div className="confirm-box-title">✓ Change applied successfully</div>
          <p style={{ margin: 0 }}>Request No. <strong>{refNo}</strong> · <button onClick={handleUndo} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--urgent)', fontWeight: '700', fontFamily: 'var(--font)', fontSize: '14px', textDecoration: 'underline', padding: 0 }}>{t('undo')} ({undoTimer}s)</button></p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: '20px', alignItems: 'start' }}>
        {/* FORM */}
        <div>
          {/* Step 1 */}
          {step === 1 && (
            <div className="card">
              <div className="card-head">Step 1 — Select area</div>
              <div className="card-body">
                <div className="field">
                  <label htmlFor="area-sel">Select area</label>
                  <select id="area-sel" className="select" value={areaId} onChange={e => setAreaId(e.target.value)}>
                    <option value="">— Choose an area —</option>
                    {AREA_DEFS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                {area && <div style={{ marginBottom: '16px' }}><StatusTag status={area.status} /></div>}
                <button className="btn btn-primary" disabled={!areaId} onClick={() => setStep(2)}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && area && (
            <div className="card">
              <div className="card-head">Step 2 — Check the limits for {area.name}</div>
              <div className="card-body">
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead><tr><th scope="col">Item</th><th scope="col" style={{textAlign:'right'}}>Value</th><th scope="col">Explanation</th></tr></thead>
                    <tbody>
                      <tr><td>{t('powerGiven')}</td><td style={{textAlign:'right',fontWeight:'700'}}>{area.allocatedMW.toFixed(2)} MW</td><td style={{fontSize:'12px',color:'var(--text-sec)'}}>Power currently allocated to this area.</td></tr>
                      <tr><td>{t('powerNeededArea')}</td><td style={{textAlign:'right',fontWeight:'700',color:area.status==='urgent'?'var(--urgent)':area.status==='warn'?'var(--warn)':'var(--normal)'}}>{area.loadMW.toFixed(2)} MW</td><td style={{fontSize:'12px',color:'var(--text-sec)'}}>Actual consumption right now.</td></tr>
                      <tr><td>{t('spareSupply')}</td><td style={{textAlign:'right',fontWeight:'700',color:sysSpare>=0?'var(--normal)':'var(--urgent)'}}>{sysSpare.toFixed(2)} MW</td><td style={{fontSize:'12px',color:'var(--text-sec)'}}>Unallocated power available in the system.</td></tr>
                      <tr><td>{t('battCharge')}</td><td style={{textAlign:'right',fontWeight:'700'}}>{snapshot.battery.socPct.toFixed(0)}% / {snapshot.battery.usableKwh.toFixed(0)} kWh</td><td style={{fontSize:'12px',color:'var(--text-sec)'}}>Battery backup available for emergency use.</td></tr>
                      <tr style={{background:'var(--blue-tint)'}}><td style={{fontWeight:'800',color:'var(--blue)'}}>{t('safeMax')}</td><td style={{textAlign:'right',fontWeight:'800',fontSize:'16px',color:'var(--blue)'}}>{area.maxAllocatableMW.toFixed(2)} MW</td><td style={{fontSize:'12px',color:'var(--text-sec)'}}>Hard limit. You cannot exceed this.</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>← Go back</button>
                  <button className="btn btn-primary" onClick={() => { setNewMW(area.allocatedMW.toFixed(2)); setStep(3); }}>Continue →</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && area && (
            <div className="card">
              <div className="card-head">Step 3 — Enter new supply for {area.name}</div>
              <div className="card-body">
                <div className="field">
                  <label htmlFor="new-mw">New supply amount (MW)</label>
                  <p className="field-hint">Safe maximum: <strong>{hardLimit.toFixed(2)} MW</strong>. You cannot enter more than this.</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <button className="btn btn-secondary" style={{ minWidth: '44px', fontSize: '20px', padding: '0', fontWeight: '800' }}
                      onClick={() => { const v = Math.max(0, newMWFloat - 0.05); setNewMW(v.toFixed(2)); }}>−</button>
                    <input id="new-mw" type="number" className="input" value={newMW} min={0} max={hardLimit} step={0.05}
                      onChange={e => setNewMW(e.target.value)} style={{ maxWidth: '140px', textAlign: 'right' }}
                      aria-invalid={isOver} aria-describedby={isOver ? 'hard-limit-err' : undefined} />
                    <button className="btn btn-secondary" style={{ minWidth: '44px', fontSize: '20px', padding: '0', fontWeight: '800' }}
                      onClick={() => { const v = Math.min(hardLimit, newMWFloat + 0.05); setNewMW(v.toFixed(2)); }}>+</button>
                    <span style={{ fontSize: '14px', color: 'var(--text-sec)', fontWeight: '600' }}>MW</span>
                  </div>
                  {/* Quick buttons */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    {[+0.25, +0.5, +1].map(d => (
                      <button key={d} className="btn btn-secondary btn-xs" onClick={() => setNewMW(Math.min(hardLimit, newMWFloat + d).toFixed(2))}>+{d} MW</button>
                    ))}
                    <button className="btn btn-secondary btn-xs" onClick={() => setNewMW(area.allocatedMW.toFixed(2))}>Reset</button>
                  </div>
                  <input type="range" min={0} max={hardLimit} step={0.05} value={Math.min(newMWFloat, hardLimit)}
                    onChange={e => setNewMW(e.target.value)} aria-label="New supply slider" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-sec)' }}>
                    <span>0 MW</span><span>{hardLimit.toFixed(2)} MW (max)</span>
                  </div>
                  {isOver && <p id="hard-limit-err" className="field-error" role="alert">You cannot give more than {hardLimit.toFixed(2)} MW. This is the most the available supply and battery can safely provide.</p>}
                </div>

                {/* Live preview */}
                {newMW && !isOver && (
                  <div className="notice-box notice-box-info" style={{ marginBottom: '16px' }}>
                    <div className="notice-title">What will change</div>
                    <ul style={{ margin: '4px 0 0', padding: '0 0 0 16px', fontSize: '14px', lineHeight: '1.8' }}>
                      <li>New share of limit: <strong>{((newMWFloat / area.limitMW) * 100).toFixed(0)}%</strong></li>
                      <li>Spare capacity after change: <strong>{(sysSpare - (newMWFloat - area.allocatedMW)).toFixed(2)} MW</strong></li>
                      {newMWFloat > area.allocatedMW && <li>Thermal output may increase to cover the extra demand.</li>}
                    </ul>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="reason-sel">Reason for change</label>
                  <select id="reason-sel" className="select" value={reason} onChange={e => setReason(e.target.value as any)}>
                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Duration</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {DURATIONS.map(d => (
                      <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: `1.5px solid ${duration === d ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '14px', background: duration === d ? 'var(--blue-tint)' : '#fff' }}>
                        <input type="radio" name="duration" value={d} checked={duration === d} onChange={() => setDuration(d)} style={{ accentColor: 'var(--blue)' }} /> {d}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="remarks">Remarks (optional)</label>
                  <textarea id="remarks" className="textarea" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add any notes for the record…" />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(2)}>← Go back</button>
                  <button className="btn btn-primary" disabled={!newMW || isOver || newMWFloat <= 0} onClick={() => setStep(4)}>Continue →</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && area && (
            <div className="card">
              <div className="card-head">Step 4 — Review and confirm</div>
              <div className="card-body">
                <div className="tbl-wrap" style={{ marginBottom: '16px' }}>
                  <table className="tbl">
                    <tbody>
                      <tr><td style={{fontWeight:'700'}}>Area</td><td>{area.name}</td></tr>
                      <tr><td style={{fontWeight:'700'}}>Old supply</td><td>{area.allocatedMW.toFixed(2)} MW</td></tr>
                      <tr style={{background:'var(--blue-tint)'}}><td style={{fontWeight:'800',color:'var(--blue)'}}>New supply</td><td style={{fontWeight:'800',color:'var(--blue)'}}>{newMWFloat.toFixed(2)} MW</td></tr>
                      <tr><td style={{fontWeight:'700'}}>Change</td><td>{(newMWFloat - area.allocatedMW > 0 ? '+' : '')}{(newMWFloat - area.allocatedMW).toFixed(2)} MW</td></tr>
                      <tr><td style={{fontWeight:'700'}}>Reason</td><td>{reason}</td></tr>
                      <tr><td style={{fontWeight:'700'}}>Duration</td><td>{duration}</td></tr>
                      {remarks && <tr><td style={{fontWeight:'700'}}>Remarks</td><td>{remarks}</td></tr>}
                      <tr><td style={{fontWeight:'700'}}>Effect on others</td><td style={{fontSize:'13px',color:'var(--text-sec)'}}>{newMWFloat > area.allocatedMW ? `System spare will decrease by ${(newMWFloat - area.allocatedMW).toFixed(2)} MW.` : `${(area.allocatedMW - newMWFloat).toFixed(2)} MW released back to system.`}</td></tr>
                      <tr><td style={{fontWeight:'700'}}>Battery</td><td style={{fontSize:'13px',color:'var(--text-sec)'}}>Currently at {snapshot.battery.socPct.toFixed(0)}% ({snapshot.battery.usableKwh.toFixed(0)} kWh). No immediate change expected.</td></tr>
                    </tbody>
                  </table>
                </div>
                {isLarge && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px', fontSize: '14px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={confirmTick} onChange={e => setConfirmTick(e.target.checked)} style={{ marginTop: '3px', accentColor: 'var(--blue)', width: '18px', height: '18px', flexShrink: 0 }} />
                    I confirm this change (the difference exceeds 0.5 MW or 10% of the current allocation).
                  </label>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(3)}>← Go back</button>
                  <button className="btn btn-primary" disabled={submitting || (isLarge && !confirmTick)} onClick={handleSubmit}>
                    {submitting ? 'Submitting…' : 'Confirm and submit'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky sidebar */}
        <div style={{ position: 'sticky', top: '16px' }}>
          {area ? (
            <div className="card card-top-blue">
              <div className="card-head">Current situation — {area.name}</div>
              <div className="card-body">
                <div style={{ marginBottom: '10px' }}><StatusTag status={area.status} /></div>
                {[
                  { label: t('powerGiven'),      val: area.allocatedMW.toFixed(2) + ' MW' },
                  { label: t('powerNeededArea'), val: area.loadMW.toFixed(2) + ' MW' },
                  { label: t('spareSupply'),     val: sysSpare.toFixed(2) + ' MW' },
                  { label: t('battCharge'),      val: snapshot.battery.socPct.toFixed(0) + '% / ' + snapshot.battery.usableKwh.toFixed(0) + ' kWh' },
                  { label: t('safeMax'),         val: area.maxAllocatableMW.toFixed(2) + ' MW' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-sec)' }}>{row.label}</span>
                    <span style={{ fontWeight: '700' }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '16px', color: 'var(--text-sec)', fontSize: '14px' }}>Select an area to see its current situation.</div>
          )}
        </div>
      </div>

      {/* Recent changes */}
      <div className="card" style={{ marginTop: '28px' }}>
        <div className="card-head" style={{ justifyContent: 'space-between' }}>
          <span>Recent changes</span>
          <button className="btn btn-secondary btn-xs" onClick={() => downloadCSV(changeLog.map(r => ({ 'Ref No': r.refNo, 'Date Time': new Date(r.ts).toLocaleString('en-IN'), Area: r.areaName, 'Old MW': r.oldMW, 'New MW': r.newMW, Reason: r.reason, Duration: r.duration, 'Done by': r.doneBy, Source: r.source })), `change-log-${new Date().toISOString().slice(0,10)}.csv`)}>
            ↓ {t('download')}
          </button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th scope="col">Ref. No.</th><th scope="col">Date & Time</th><th scope="col">Area</th>
              <th scope="col" style={{textAlign:'right'}}>Old (MW)</th><th scope="col" style={{textAlign:'right'}}>New (MW)</th>
              <th scope="col">Reason</th><th scope="col">Duration</th><th scope="col">Done by</th>
            </tr></thead>
            <tbody>
              {changeLog.slice(0,15).map(r => (
                <tr key={r.refNo}>
                  <td style={{fontWeight:'700',color:'var(--blue)',fontSize:'12px'}}>{r.refNo}</td>
                  <td style={{fontSize:'12px',whiteSpace:'nowrap'}}>{new Date(r.ts).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'})}</td>
                  <td style={{fontWeight:600}}>{r.areaName}</td>
                  <td style={{textAlign:'right'}}>{r.oldMW.toFixed(2)}</td>
                  <td style={{textAlign:'right',fontWeight:'700',color:r.newMW>r.oldMW?'var(--normal)':'var(--urgent)'}}>{r.newMW.toFixed(2)}</td>
                  <td style={{fontSize:'12px'}}>{r.reason}</td>
                  <td style={{fontSize:'12px'}}>{r.duration}</td>
                  <td style={{fontSize:'12px'}}>{r.doneBy}</td>
                </tr>
              ))}
              {changeLog.length === 0 && <tr><td colSpan={8} style={{textAlign:'center',padding:'20px',color:'var(--text-sec)'}}>No changes recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency boost dialog */}
      {emergOpen && area && (
        <ConfirmDialog title="Emergency Supply Boost" onConfirm={handleEmergency} onCancel={() => { setEmergOpen(false); setEmergTick(false); }} confirmLabel="Execute emergency boost" dangerous>
          <p>This will move all available flexible load and spare supply to <strong>{area.name}</strong>, up to the safe maximum of <strong>{area.maxAllocatableMW.toFixed(2)} MW</strong>.</p>
          <p>Protected areas will not be touched. The change will be logged as an Emergency Boost.</p>
          <div className="field" style={{ marginTop: '12px' }}>
            <label htmlFor="emerg-reason">Reason (required)</label>
            <input id="emerg-reason" type="text" className="input" value={emergReason} onChange={e => setEmergReason(e.target.value)} placeholder="State the emergency reason…" />
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '12px', fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={emergTick} onChange={e => setEmergTick(e.target.checked)} style={{ marginTop: '3px', width: '18px', height: '18px', flexShrink: 0 }} />
            I confirm this is an emergency and this action is required.
          </label>
          {!emergTick && <p style={{ fontSize: '12px', color: 'var(--urgent)', marginTop: '4px' }}>Please tick the confirmation box to proceed.</p>}
        </ConfirmDialog>
      )}
    </div>
  );
}
