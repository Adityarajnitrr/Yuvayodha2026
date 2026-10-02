import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGridStore } from '../../store/gridStore';
import { useLang } from '../../context/AppContext';
import { Tabs } from '../../components/ui/index';

function downloadCSV(rows: object[], filename: string) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String((r as any)[k]).replace(/"/g,'""')}"`).join(','))].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename; a.click();
}

export default function NoticesPage() {
  const { notices, changeLog, acknowledgeNotice, acknowledgeAll } = useGridStore();
  const { t } = useLang();
  const navigate = useNavigate();
  const [tab, setTab]       = useState('notices');
  const [nFilter, setNFilter] = useState<'all' | 'urgent' | 'advisory'>('all');
  const [sFilter, setSFilter] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('all');
  const [aFilter, setAFilter] = useState('');
  const [clSearch, setClSearch] = useState('');
  const [clSource, setClSource] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]   = useState('');

  useEffect(() => { document.title = 'Notices & Records — Power Distribution Monitoring Portal'; }, []);

  const openCount = notices.filter(n => n.status === 'open').length;

  const filteredNotices = notices.filter(n => {
    if (nFilter !== 'all' && n.type !== nFilter) return false;
    if (sFilter !== 'all' && n.status !== sFilter) return false;
    if (aFilter && n.areaName !== aFilter) return false;
    return true;
  });

  const filteredLog = changeLog.filter(r => {
    if (clSearch && !r.areaName.toLowerCase().includes(clSearch.toLowerCase()) && !r.refNo.includes(clSearch)) return false;
    if (clSource && r.source !== clSource) return false;
    if (dateFrom && r.ts < new Date(dateFrom).toISOString()) return false;
    if (dateTo   && r.ts > new Date(dateTo + 'T23:59:59').toISOString()) return false;
    return true;
  });

  const uniqueAreas = [...new Set(notices.map(n => n.areaName))];

  return (
    <div>
      <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--blue)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0 }}>{t('navNotices')}</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-sec)' }}>{openCount} open notice{openCount !== 1 ? 's' : ''} · Every change is recorded and cannot be edited.</p>
        </div>
        {openCount > 0 && tab === 'notices' && (
          <button className="btn btn-secondary btn-sm" onClick={acknowledgeAll}>{t('acknowledgeAll')}</button>
        )}
      </div>

      <Tabs
        tabs={[
          { id: 'notices', label: `Notices (${openCount} open)` },
          { id: 'records', label: `Record of Changes (${changeLog.length})` },
        ]}
        active={tab} onChange={setTab}
      />

      {/* NOTICES TAB */}
      {tab === 'notices' && (
        <div>
          {/* Filters */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sec)', display: 'block', marginBottom: '4px' }}>Type</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {(['all','urgent','advisory'] as const).map(v => (
                    <button key={v} className={`chip${nFilter===v?' active':''}`} onClick={()=>setNFilter(v)} style={{fontSize:'12px'}}>{v==='all'?'All':v==='urgent'?'Urgent':'Advisory'}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sec)', display: 'block', marginBottom: '4px' }}>Status</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {(['all','open','acknowledged','resolved'] as const).map(v => (
                    <button key={v} className={`chip${sFilter===v?' active':''}`} onClick={()=>setSFilter(v)} style={{fontSize:'12px',textTransform:'capitalize'}}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="n-area" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sec)', display: 'block', marginBottom: '4px' }}>Area</label>
                <select id="n-area" className="select" value={aFilter} onChange={e=>setAFilter(e.target.value)} style={{minHeight:'34px',fontSize:'13px',width:'180px'}}>
                  <option value="">All areas</option>
                  {uniqueAreas.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="tbl-wrap">
              <table className="tbl" aria-label="Notices" aria-live="polite">
                <thead><tr>
                  <th scope="col">Sr.</th>
                  <th scope="col">Type</th>
                  <th scope="col">Area</th>
                  <th scope="col">Message</th>
                  <th scope="col">Raised at</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr></thead>
                <tbody>
                  {filteredNotices.length === 0 && (
                    <tr><td colSpan={7} style={{textAlign:'center',padding:'24px',color:'var(--text-sec)'}}>No notices match the selected filters.</td></tr>
                  )}
                  {filteredNotices.map((n, i) => (
                    <tr key={n.id}>
                      <td style={{color:'var(--text-sec)'}}>{i+1}</td>
                      <td>
                        <span className={`tag ${n.type==='urgent'?'tag-urgent':'tag-warn'}`}>
                          {n.type==='urgent'?'⚠ Urgent':'● Advisory'}
                        </span>
                      </td>
                      <td style={{fontWeight:600}}>{n.areaName}</td>
                      <td style={{fontSize:'13px',maxWidth:'320px'}}>{n.message}</td>
                      <td style={{fontSize:'12px',whiteSpace:'nowrap',color:'var(--text-sec)'}}>{new Date(n.ts).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'})}</td>
                      <td>
                        <span className={`tag ${n.status==='open'?'tag-urgent':n.status==='acknowledged'?'tag-warn':'tag-normal'}`} style={{textTransform:'capitalize'}}>
                          {n.status==='open'?'● Open':n.status==='acknowledged'?'✓ Acknowledged':'✓ Resolved'}
                        </span>
                      </td>
                      <td>
                        <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                          {n.status==='open' && <button className="btn btn-secondary btn-xs" onClick={()=>acknowledgeNotice(n.id)}>{t('acknowledge')}</button>}
                          <button className="btn btn-secondary btn-xs" onClick={()=>navigate(`/areas/${n.areaId}`)}>{t('goToArea')}</button>
                          <button className="btn btn-secondary btn-xs" onClick={()=>navigate(`/adjust?area=${n.areaId}`)}>{t('adjustSupply')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{padding:'10px 16px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'flex-end'}}>
              <button className="btn btn-secondary btn-xs" onClick={()=>downloadCSV(filteredNotices.map(n=>({Type:n.type,Area:n.areaName,Message:n.message,RaisedAt:n.ts,Status:n.status})),`notices-${new Date().toISOString().slice(0,10)}.csv`)}>
                ↓ {t('download')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORDS TAB */}
      {tab === 'records' && (
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label htmlFor="cl-search" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sec)', display: 'block', marginBottom: '4px' }}>Search</label>
                <input id="cl-search" type="search" className="input" value={clSearch} onChange={e=>setClSearch(e.target.value)} placeholder="Area name or Ref. No." style={{minHeight:'34px',fontSize:'13px',width:'200px'}} />
              </div>
              <div>
                <label htmlFor="cl-source" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sec)', display: 'block', marginBottom: '4px' }}>Source</label>
                <select id="cl-source" className="select" value={clSource} onChange={e=>setClSource(e.target.value)} style={{minHeight:'34px',fontSize:'13px',width:'180px'}}>
                  <option value="">All sources</option>
                  <option>Operator</option>
                  <option>Recommendation</option>
                  <option>Emergency Boost</option>
                  <option>Undo</option>
                </select>
              </div>
              <div>
                <label htmlFor="cl-from" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sec)', display: 'block', marginBottom: '4px' }}>From date</label>
                <input id="cl-from" type="date" className="input" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{minHeight:'34px',fontSize:'13px',width:'150px'}} />
              </div>
              <div>
                <label htmlFor="cl-to" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sec)', display: 'block', marginBottom: '4px' }}>To date</label>
                <input id="cl-to" type="date" className="input" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{minHeight:'34px',fontSize:'13px',width:'150px'}} />
              </div>
              <button className="btn btn-secondary btn-sm" onClick={()=>{setClSearch('');setClSource('');setDateFrom('');setDateTo('');}}>Clear filters</button>
            </div>
          </div>

          <div className="card">
            <div className="card-head" style={{justifyContent:'space-between'}}>
              <span>{t('recordsTitle')} ({filteredLog.length})</span>
              <button className="btn btn-secondary btn-xs" onClick={()=>downloadCSV(filteredLog.map(r=>({'Ref No':r.refNo,'Date Time':new Date(r.ts).toLocaleString('en-IN'),Area:r.areaName,'Old MW':r.oldMW,'New MW':r.newMW,Reason:r.reason,Duration:r.duration,'Done by':r.doneBy,Source:r.source})),`change-log-${new Date().toISOString().slice(0,10)}.csv`)}>
                ↓ {t('download')}
              </button>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  <th scope="col">Ref. No.</th>
                  <th scope="col">Date & Time</th>
                  <th scope="col">Area</th>
                  <th scope="col" style={{textAlign:'right'}}>Old (MW)</th>
                  <th scope="col" style={{textAlign:'right'}}>New (MW)</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Done by</th>
                  <th scope="col">Source</th>
                </tr></thead>
                <tbody>
                  {filteredLog.length === 0 && <tr><td colSpan={9} style={{textAlign:'center',padding:'24px',color:'var(--text-sec)'}}>No records match the selected filters.</td></tr>}
                  {filteredLog.map(r => (
                    <tr key={r.refNo}>
                      <td style={{fontWeight:'700',color:'var(--blue)',fontSize:'12px'}}>{r.refNo}</td>
                      <td style={{fontSize:'12px',whiteSpace:'nowrap'}}>{new Date(r.ts).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'})}</td>
                      <td style={{fontWeight:600}}>{r.areaName}</td>
                      <td style={{textAlign:'right',fontVariantNumeric:'tabular-nums'}}>{r.oldMW.toFixed(2)}</td>
                      <td style={{textAlign:'right',fontWeight:'700',fontVariantNumeric:'tabular-nums',color:r.newMW>r.oldMW?'var(--normal)':'var(--urgent)'}}>{r.newMW.toFixed(2)}</td>
                      <td style={{fontSize:'12px'}}>{r.reason}</td>
                      <td style={{fontSize:'12px'}}>{r.duration}</td>
                      <td style={{fontSize:'12px'}}>{r.doneBy}</td>
                      <td>
                        <span className={`tag ${r.source==='Emergency Boost'?'tag-urgent':r.source==='Undo'?'tag-warn':'tag-normal'}`} style={{fontSize:'11px'}}>
                          {r.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{padding:'10px 16px',borderTop:'1px solid var(--border)',fontSize:'12px',color:'var(--text-sec)',fontStyle:'italic'}}>
              Every change is recorded and cannot be edited.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
