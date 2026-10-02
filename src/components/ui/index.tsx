import React, { useState } from 'react';
import type { StatusLevel } from '../../data/engine';
import { useGridStore } from '../../store/gridStore';

// ─── Status Tag ───────────────────────────────────────────────────────────────
export function StatusTag({ status }: { status: StatusLevel }) {
  const icon  = status === 'urgent' ? '⚠' : status === 'warn' ? '●' : '✓';
  const word  = status === 'urgent' ? 'Urgent' : status === 'warn' ? 'Needs attention' : 'Normal';
  const cls   = status === 'urgent' ? 'tag tag-urgent' : status === 'warn' ? 'tag tag-warn' : 'tag tag-normal';
  return <span className={cls} aria-label={word}><span aria-hidden="true">{icon}</span> {word}</span>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ title, value, unit, desc, topColor }: {
  title: string; value: React.ReactNode; unit?: string; desc?: string;
  topColor?: 'blue' | 'normal' | 'warn' | 'urgent';
}) {
  const tc = topColor ? `card-top-${topColor}` : 'card-top-blue';
  return (
    <div className={`card ${tc}`} style={{ padding: '16px', flex: '1', minWidth: '160px' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '6px' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '26px', fontWeight: '800', color: topColor === 'urgent' ? 'var(--urgent)' : topColor === 'warn' ? 'var(--warn)' : 'var(--blue)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        {unit && <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-sec)' }}>{unit}</span>}
      </div>
      {desc && <div style={{ fontSize: '12px', color: 'var(--text-sec)', marginTop: '5px', lineHeight: '1.5' }}>{desc}</div>}
    </div>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
export function Breadcrumb({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" style={{ padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
      <ol className="bc" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li><Link to="/">Home</Link></li>
        {items.map((it, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <span className="bc-sep" aria-hidden="true">&gt;</span>
            {it.to && i < items.length - 1
              ? <Link to={it.to}>{it.label}</Link>
              : <span aria-current="page">{it.label}</span>
            }
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="tab-bar" role="tablist">
      {tabs.map(tab => (
        <button key={tab.id} role="tab" aria-selected={active === tab.id}
          className={`tab-btn${active === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Accordion ────────────────────────────────────────────────────────────────
export function Accordion({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((it, i) => (
        <div key={i}>
          <button className="acc-btn" onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i} aria-controls={`acc-body-${i}`} id={`acc-btn-${i}`}>
            {it.q}
            <span aria-hidden="true">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <div id={`acc-body-${i}`} className="acc-body" role="region" aria-labelledby={`acc-btn-${i}`}>
              {it.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Toast container ──────────────────────────────────────────────────────────
export function ToastContainer() {
  const { toasts, removeToast } = useGridStore();
  if (!toasts.length) return null;
  return (
    <div className="toast-stack" role="log" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: t.detail ? '3px' : 0 }}>{t.message}</div>
            {t.detail && <div style={{ fontSize: '13px', color: 'var(--text-sec)' }}>{t.detail}</div>}
          </div>
          <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-sec)', padding: '0 4px' }} aria-label="Close">×</button>
        </div>
      ))}
    </div>
  );
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
export function Sparkline({ data, color = 'var(--blue)', width = 64, height = 24 }: {
  data: number[]; color?: string; width?: number; height?: number;
}) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Source bar ───────────────────────────────────────────────────────────────
export function SourceBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="src-bar" style={{ width: '80px' }}>
      <div className="src-bar-fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }} />
    </div>
  );
}

// ─── Confirm dialog (simple modal) ────────────────────────────────────────────
export function ConfirmDialog({ title, children, onConfirm, onCancel, confirmLabel = 'Confirm', dangerous = false }: {
  title: string; children: React.ReactNode;
  onConfirm: () => void; onCancel: () => void;
  confirmLabel?: string; dangerous?: boolean;
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 8000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }} role="dialog" aria-modal="true" aria-labelledby="cdlg-title">
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', maxWidth: '480px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '17px' }} id="cdlg-title">{title}</div>
        <div style={{ padding: '16px 20px' }}>{children}</div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
          <button className={`btn ${dangerous ? 'btn-danger' : 'btn-primary'} btn-sm`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Simple donut chart (SVG, no lib) ─────────────────────────────────────────
export function DonutChart({ pct, label, color = 'var(--blue)', size = 80 }: {
  pct: number; label: string; color?: string; size?: number;
}) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`${label}: ${pct}%`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)">{pct}%</text>
    </svg>
  );
}
