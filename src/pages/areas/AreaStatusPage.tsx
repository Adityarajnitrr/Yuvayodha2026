import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGridStore } from '../../store/gridStore';
import { useLang } from '../../context/AppContext';
import { StatusTag } from '../../components/ui/index';
import type { Area } from '../../data/engine';

// SVG layout positions for 12 areas around a central substation
const AREA_POS: Record<string, { x: number; y: number; w: number; h: number }> = {
  a01: { x: 20,  y: 20,  w: 140, h: 70 },
  a02: { x: 180, y: 20,  w: 140, h: 70 },
  a03: { x: 340, y: 20,  w: 145, h: 70 },
  a04: { x: 500, y: 20,  w: 135, h: 70 },
  a05: { x: 20,  y: 130, w: 140, h: 70 },
  a06: { x: 180, y: 140, w: 160, h: 80 },
  a07: { x: 360, y: 130, w: 130, h: 70 },
  a08: { x: 505, y: 130, w: 130, h: 70 },
  a09: { x: 20,  y: 250, w: 140, h: 70 },
  a10: { x: 180, y: 260, w: 130, h: 70 },
  a11: { x: 320, y: 250, w: 160, h: 70 },
  a12: { x: 495, y: 250, w: 140, h: 70 },
};
const SUB = { x: 265, y: 145, w: 85, h: 50 };

const STATUS_FILL: Record<string, string>   = { normal: 'var(--normal-bg)',  warn: 'var(--warn-bg)',  urgent: 'var(--urgent-bg)' };
const STATUS_STROKE: Record<string, string> = { normal: 'var(--normal)',     warn: 'var(--warn)',     urgent: 'var(--urgent)' };

function AreaBlock({ area, layer, onClick }: { area: Area; layer: 'load' | 'share' | 'forecast'; onClick: () => void }) {
  const pos = AREA_POS[area.id];
  if (!pos) return null;
  const [hov, setHov] = useState(false);
  const displayVal = layer === 'load'  ? `${area.loadMW.toFixed(1)} MW`
    : layer === 'share' ? `${(area.shareOfLimit * 100).toFixed(0)}%`
    : `~${(area.loadMW * 1.05).toFixed(1)} MW`;
  const name = area.name.length > 18 ? area.name.slice(0, 16) + '…' : area.name;

  return (
    <g role="button" tabIndex={0} aria-label={`${area.name}: ${displayVal}, status ${area.status}`}
      onClick={onClick} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ cursor: 'pointer' }}>
      <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx={4}
        fill={hov ? 'var(--blue-tint)' : STATUS_FILL[area.status]}
        stroke={STATUS_STROKE[area.status]} strokeWidth={hov ? 2.5 : 1.5} />
      <text x={pos.x + pos.w / 2} y={pos.y + 22} textAnchor="middle" fontSize={11} fontWeight="700" fill="#1A1A1A" fontFamily="'Noto Sans',Arial,sans-serif">{name}</text>
      <text x={pos.x + pos.w / 2} y={pos.y + 38} textAnchor="middle" fontSize={11} fill={STATUS_STROKE[area.status]} fontFamily="'Noto Sans',Arial,sans-serif" fontWeight="600">{displayVal}</text>
      <text x={pos.x + pos.w / 2} y={pos.y + 55} textAnchor="middle" fontSize={10} fill={STATUS_STROKE[area.status]} fontFamily="'Noto Sans',Arial,sans-serif">
        {area.status === 'urgent' ? '⚠ Urgent' : area.status === 'warn' ? '● Needs attention' : '✓ Normal'}
      </text>
    </g>
  );
}

export default function AreaStatusPage() {
  const { snapshot, loading } = useGridStore();
  const { t } = useLang();
  const navigate = useNavigate();
  const [view, setView]   = useState<'map' | 'table'>('map');
  const [layer, setLayer] = useState<'load' | 'share' | 'forecast'>('share');
  const [filter, setFilter] = useState<'all' | 'urgent' | 'warn' | 'normal'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => { document.title = 'Area-wise Power Status — Power Distribution Monitoring Portal'; }, []);

  if (loading || !snapshot) return <p style={{ padding: '32px 0', color: 'var(--text-sec)' }}>{t('loading')}</p>;

  const areas = snapshot.areas;
  const filtered = areas
    .filter(a => filter === 'all' ? true : a.status === filter)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    const o = { urgent: 0, warn: 1, normal: 2 };
    return o[a.status] - o[b.status];
  });
  const urgentCount = areas.filter(a => a.status === 'urgent').length;
  const warnCount   = areas.filter(a => a.status === 'warn').length;

  return (
    <div>
      <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--blue)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ margin: 0 }}>{t('navAreas')}</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-sec)' }}>
            {urgentCount} Urgent · {warnCount} Needs attention · {areas.length - urgentCount - warnCount} Normal
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn btn-sm ${view === 'map' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('map')} aria-pressed={view === 'map'}>Map view</button>
          <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')} aria-pressed={view === 'table'}>Table view</button>
        </div>
      </div>

      {/* MAP VIEW */}
      {view === 'map' && (
        <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
          <div className="card-head" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span>Area Schematic Map</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['load', 'share', 'forecast'] as const).map(l => (
                <button key={l} className={`chip${layer === l ? ' active' : ''}`} onClick={() => setLayer(l)} style={{ fontSize: '12px', padding: '2px 10px' }}>
                  {l === 'load' ? 'Power used' : l === 'share' ? 'Share of limit' : 'Expected in 1 hour'}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '14px', height: '14px', background: 'var(--normal-bg)', border: '2px solid var(--normal)', borderRadius: '2px', display: 'inline-block' }} /> <strong>Normal</strong> &lt;70%</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '14px', height: '14px', background: 'var(--warn-bg)', border: '2px solid var(--warn)', borderRadius: '2px', display: 'inline-block' }} /> <strong>Needs attention</strong> 70–90%</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '14px', height: '14px', background: 'var(--urgent-bg)', border: '2px solid var(--urgent)', borderRadius: '2px', display: 'inline-block' }} /> <strong>Urgent</strong> &gt;90%</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-sec)', margin: '0 0 10px' }}>Click an area block to view details. Use Tab to navigate with keyboard.</p>
            <div style={{ overflowX: 'auto' }}>
              <svg viewBox="0 0 680 360" style={{ width: '100%', maxWidth: '680px', display: 'block' }} role="img" aria-label="Area schematic map">
                {/* Substation */}
                <rect x={SUB.x} y={SUB.y} width={SUB.w} height={SUB.h} rx={4} fill="var(--blue-tint)" stroke="var(--blue)" strokeWidth={2} />
                <text x={SUB.x + SUB.w / 2} y={SUB.y + 22} textAnchor="middle" fontSize={11} fontWeight="700" fill="var(--blue)" fontFamily="'Noto Sans',Arial,sans-serif">Substation</text>
                {/* Connector lines */}
                {snapshot.areas.map(area => {
                  const pos = AREA_POS[area.id];
                  if (!pos) return null;
                  return <line key={area.id}
                    x1={pos.x + pos.w / 2} y1={pos.y + pos.h / 2}
                    x2={SUB.x + SUB.w / 2} y2={SUB.y + SUB.h / 2}
                    stroke="var(--border)" strokeWidth={1} />;
                })}
                {/* Source boxes */}
                {[
                  { label: 'Solar', x: 20,  y: 355, color: 'var(--solar)' },
                  { label: 'Hydro', x: 145, y: 355, color: 'var(--hydro)' },
                  { label: 'Thermal', x: 270, y: 355, color: 'var(--thermal)' },
                  { label: 'Battery', x: 400, y: 355, color: 'var(--battery)' },
                ].map(src => (
                  <g key={src.label}>
                    <rect x={src.x} y={326} width={110} height={28} rx={3} fill={src.color + '22'} stroke={src.color} strokeWidth={1.2} />
                    <text x={src.x + 55} y={326 + 17} textAnchor="middle" fontSize={10} fill="#1A1A1A" fontFamily="'Noto Sans',Arial,sans-serif" fontWeight="600">{src.label}</text>
                    <line x1={src.x + 55} y1={326} x2={SUB.x + SUB.w / 2} y2={SUB.y + SUB.h} stroke={src.color} strokeWidth={1} strokeDasharray="4 2" />
                  </g>
                ))}
                {/* Area blocks */}
                {snapshot.areas.map(area => (
                  <AreaBlock key={area.id} area={area} layer={layer}
                    onClick={() => navigate(`/areas/${area.id}`, { state: { areaName: area.name } })} />
                ))}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {view === 'table' && (
        <div className="card card-top-blue" style={{ marginBottom: '20px' }}>
          <div className="card-head" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span>{t('navAreas')}</span>
            <input type="search" className="input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search area…" style={{ minHeight: '34px', fontSize: '13px', width: '200px' }} aria-label="Search areas" />
          </div>
          <div style={{ padding: '10px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
            {([['all','All',areas.length],['urgent','Urgent',urgentCount],['warn','Needs attention',warnCount],['normal','Normal',areas.length - urgentCount - warnCount]] as const).map(([v, l, c]) => (
              <button key={v} className={`chip${filter === v ? ' active' : ''}`} onClick={() => setFilter(v)} style={{ fontSize: '12px' }}>{l} ({c})</button>
            ))}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="tbl-wrap">
              <table className="tbl" aria-label="Area-wise power status">
                <thead><tr>
                  <th scope="col">Sr.</th>
                  <th scope="col">Area</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Power used (MW)</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Limit (MW)</th>
                  <th scope="col">Share of limit</th>
                  <th scope="col">Status</th>
                  <th scope="col">View</th>
                </tr></thead>
                <tbody>
                  {sorted.map((area, i) => (
                    <tr key={area.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/areas/${area.id}`, { state: { areaName: area.name } })}>
                      <td style={{ color: 'var(--text-sec)' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{area.name}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{area.loadMW.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{area.limitMW.toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '60px', height: '8px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, area.shareOfLimit * 100)}%`, height: '100%', background: STATUS_STROKE[area.status], borderRadius: '2px' }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: STATUS_STROKE[area.status] }}>{(area.shareOfLimit * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td><StatusTag status={area.status} /></td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn btn-secondary btn-xs" onClick={() => navigate(`/areas/${area.id}`, { state: { areaName: area.name } })}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
