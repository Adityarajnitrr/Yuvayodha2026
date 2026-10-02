/**
 * Frame.tsx — Complete page frame.
 * Exports: SaffronStrip, UtilityBar, SiteHeader, MenuBar, ControlStrip, NoticeBanner,
 *          SiteFooter, HelplineBar, FloatingHelp
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../context/AppContext';
import { useGridStore } from '../../store/gridStore';
import type { Scenario } from '../../data/engine';
import { AREA_DEFS } from '../../data/engine';

const ORG = 'Rajasthan Power Distribution Company Ltd. (placeholder)';

// ─── 4 px saffron strip ───────────────────────────────────────────────────────
export function SaffronStrip() {
  return <div style={{ height: '4px', background: 'var(--saffron)', flexShrink: 0 }} aria-hidden="true" />;
}

// ─── Utility bar ──────────────────────────────────────────────────────────────
export function UtilityBar({ onFontChange, fontSize }: { onFontChange: (d: number) => void; fontSize: number }) {
  const { t, toggleLang, lang } = useLang();
  const [hc, setHC] = useState(false);
  useEffect(() => { document.body.classList.toggle('hc', hc); }, [hc]);

  return (
    <div style={{ background: '#F0F1F3', borderBottom: '1px solid var(--border)', padding: '4px 0', fontSize: '12px', color: 'var(--text-sec)' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
        <a href="#main-content" style={{ color: 'var(--blue)', fontWeight: '600', fontSize: '12px', textDecoration: 'none' }}>{t('skipToMain')}</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span>{t('textSize')}:</span>
          {[{ l: 'A−', d: -1 }, { l: 'A', d: 0 }, { l: 'A+', d: 1 }].map(({ l, d }) => (
            <button key={l} onClick={() => onFontChange(d)} style={{
              background: fontSize === 16 + d * 2 ? 'var(--blue)' : 'transparent',
              color: fontSize === 16 + d * 2 ? '#fff' : 'var(--text-sec)',
              border: '1px solid var(--border)', borderRadius: '2px',
              padding: '1px 7px', cursor: 'pointer', fontSize: '12px',
              fontFamily: 'var(--font)', minWidth: '26px', minHeight: '24px',
            }} aria-label={l === 'A' ? 'Reset text size' : l === 'A−' ? 'Decrease text size' : 'Increase text size'}>
              {l}
            </button>
          ))}
          <span style={{ color: 'var(--border)', margin: '0 2px' }}>|</span>
          <button onClick={() => setHC(h => !h)} aria-pressed={hc} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font)', color: hc ? 'var(--blue)' : 'var(--text-sec)', minHeight: '24px' }}>
            {t('highContrast')}
          </button>
          <span style={{ color: 'var(--border)', margin: '0 2px' }}>|</span>
          <button onClick={toggleLang} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font)', color: 'var(--blue)', fontWeight: '600', minHeight: '24px' }}>
            {t('langSwitch')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Site header ──────────────────────────────────────────────────────────────
export function SiteHeader() {
  const { t } = useLang();
  const lastUpdated = useGridStore(s => s.lastUpdated);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const updStr  = lastUpdated?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) ?? '—';

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '10px 0' }} role="banner">
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--blue-tint)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: 'var(--blue)', flexShrink: 0, textAlign: 'center', lineHeight: '1.3' }}>
            LOGO
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--blue)', lineHeight: '1.2' }}>{t('portalName')}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-sec)', marginTop: '2px' }}>{t('subLine')} | {ORG}</div>
          </div>
        </Link>
        <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-sec)' }}>
          <div><strong>{t('today')}:</strong> {dateStr}, {timeStr} IST</div>
          <div style={{ marginTop: '2px' }}>{t('lastUpdated')}: <strong style={{ color: 'var(--blue)' }}>{updStr}</strong></div>
          <div style={{ marginTop: '4px', fontWeight: '600', color: 'var(--text)' }}>
            R. Sharma, Senior Operator &nbsp;|&nbsp;
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', fontFamily: 'var(--font)', fontSize: '12px', fontWeight: '600', padding: 0, textDecoration: 'underline' }}>{t('logout')}</button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Menu bar ─────────────────────────────────────────────────────────────────
export function MenuBar() {
  const { t } = useLang();
  const openNotices = useGridStore(s => s.openNotices);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/',        label: t('navHome'),     exact: true },
    { to: '/areas',   label: t('navAreas'),    exact: false },
    { to: '/adjust',  label: t('navAdjust'),   exact: false },
    { to: '/forecast',label: t('navForecast'), exact: false },
    { to: '/notices', label: t('navNotices'),  exact: false, badge: openNotices > 0 ? openNotices : null },
    { to: '/help',    label: t('navHelp'),     exact: false },
  ];

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '14px 16px',
    color: active ? '#fff' : 'rgba(255,255,255,.82)',
    textDecoration: 'none', fontWeight: active ? '700' : '500', fontSize: '14px',
    borderBottom: active ? '3px solid var(--saffron)' : '3px solid transparent',
    whiteSpace: 'nowrap',
  });

  return (
    <nav style={{ background: 'var(--blue)' }} role="navigation" aria-label="Main navigation">
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 16px' }}>
        {/* Desktop */}
        <ul className="hide-mobile" style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: 0 }} role="menubar">
          {navItems.map(item => (
            <li key={item.to} role="none">
              <NavLink to={item.to} end={item.exact} role="menuitem"
                style={({ isActive }) => linkStyle(isActive)}
                aria-current={undefined}>
                {item.label}
                {item.badge && (
                  <span style={{ background: '#C62828', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '11px', fontWeight: '700', lineHeight: '1' }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile */}
        <div className="show-mobile" style={{ padding: '8px 0' }}>
          <button onClick={() => setMobileOpen(v => !v)} aria-expanded={mobileOpen} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.4)', borderRadius: '3px', color: '#fff', padding: '8px 14px', cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--font)', fontWeight: '600' }}>
            ☰ {t('menu')}
          </button>
          {mobileOpen && (
            <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, background: 'var(--blue-dark)' }} role="menu">
              {navItems.map(item => (
                <li key={item.to} role="none">
                  <NavLink to={item.to} end={item.exact} role="menuitem"
                    onClick={() => setMobileOpen(false)}
                    style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px', color: '#fff', textDecoration: 'none', fontWeight: isActive ? '700' : '500', fontSize: '14px', borderLeft: isActive ? '4px solid var(--saffron)' : '4px solid transparent' })}>
                    {item.label}
                    {item.badge && <span style={{ background: '#C62828', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' }}>{item.badge}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Control strip ────────────────────────────────────────────────────────────
export function ControlStrip() {
  const { t } = useLang();
  const { scenario, setScenario, startDemo, demoActive } = useGridStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<typeof AREA_DEFS[number][]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = (v: string) => {
    setSearch(v);
    setResults(v.length > 0 ? AREA_DEFS.filter(a => a.name.toLowerCase().includes(v.toLowerCase())).slice(0, 6) : []);
  };

  // Ctrl+K focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const scenarios: { value: Scenario; label: string }[] = [
    { value: 'live',           label: 'Live' },
    { value: 'cloudy',         label: 'Simulation: Cloudy afternoon' },
    { value: 'heatwave',       label: 'Simulation: Heatwave evening' },
    { value: 'hydro_reduced',  label: 'Simulation: Reduced hydro' },
    { value: 'forecast_error', label: 'Simulation: Forecast error' },
  ];

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '7px 0' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="scenario-sel" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-sec)', whiteSpace: 'nowrap' }}>Data view:</label>
            <select id="scenario-sel" className="select" style={{ minHeight: '34px', fontSize: '13px', padding: '4px 8px', width: 'auto', minWidth: '160px' }}
              value={scenario} onChange={e => setScenario(e.target.value as Scenario)}>
              {scenarios.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={startDemo} disabled={demoActive} style={{ fontSize: '13px' }}>
            {demoActive ? 'Demo running…' : 'Guided Demo'}
          </button>

          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <input
              ref={searchRef}
              type="search"
              className="input"
              placeholder={`${t('search')} (Ctrl+K)`}
              value={search}
              onChange={e => handleSearch(e.target.value)}
              onBlur={() => setTimeout(() => setResults([]), 200)}
              style={{ minHeight: '34px', fontSize: '13px', padding: '4px 10px', width: '220px' }}
              aria-label="Search area"
              aria-autocomplete="list"
              aria-controls="area-search-results"
            />
            {results.length > 0 && (
              <ul id="area-search-results" role="listbox" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', listStyle: 'none', margin: 0, padding: '4px 0', boxShadow: '0 4px 12px rgba(0,0,0,.1)', maxHeight: '220px', overflowY: 'auto' }}>
                {results.map(a => (
                  <li key={a.id} role="option" onMouseDown={() => { navigate(`/areas/${a.id}`); setSearch(''); setResults([]); }}
                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '14px' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-tint)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    {a.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {scenario !== 'live' && (
          <div className="sim-banner" style={{ marginTop: '7px' }}>
            ℹ You are viewing a simulation. These are not live values.
          </div>
        )}

        {demoActive && (
          <div className="sim-banner" style={{ marginTop: '7px', gap: '12px' }}>
            <span>Demo mode active</span>
            <button className="btn btn-sm" onClick={() => useGridStore.getState().nextDemoStep()} style={{ background: 'var(--blue)', color: '#fff', minHeight: '28px', padding: '0 10px', fontSize: '12px' }}>Next step</button>
            <button className="btn btn-sm" onClick={() => useGridStore.getState().endDemo()} style={{ background: '#fff', color: 'var(--text-sec)', border: '1px solid var(--border)', minHeight: '28px', padding: '0 10px', fontSize: '12px' }}>Exit demo</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Notice banner ────────────────────────────────────────────────────────────
export function NoticeBanner() {
  const { notices, acknowledgeNotice } = useGridStore();
  const urgentOpen = notices.filter(n => n.status === 'open' && n.type === 'urgent');
  const warnOpen   = notices.filter(n => n.status === 'open' && n.type === 'advisory');
  const mostSevere = urgentOpen[0] ?? warnOpen[0];
  if (!mostSevere) return null;
  const extra = (urgentOpen.length + warnOpen.length) - 1;
  const isUrgent = mostSevere.type === 'urgent';

  return (
    <div className={`notice-box ${isUrgent ? '' : 'notice-box-warn'}`}
      style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}
      role="alert" aria-live="assertive">
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          {isUrgent ? '⚠ Notice:' : '● Advisory:'}
        </span>
        <span style={{ fontSize: '14px', flex: 1 }}>
          {mostSevere.areaName}: {mostSevere.message}
          {extra > 0 && <strong> (+{extra} more)</strong>}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/areas/${mostSevere.areaId}`} className="btn btn-secondary btn-xs">View Details</Link>
          <button className="btn btn-secondary btn-xs" onClick={() => acknowledgeNotice(mostSevere.id)}>Acknowledge</button>
        </div>
      </div>
    </div>
  );
}

// ─── Site footer ──────────────────────────────────────────────────────────────
export function SiteFooter() {
  const { t } = useLang();
  const lastUpdated = useGridStore(s => s.lastUpdated);
  const updStr = lastUpdated?.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) ?? '—';

  return (
    <footer style={{ background: 'var(--blue)', color: '#fff', paddingBottom: '48px' }} role="contentinfo">
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '20px 16px 8px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', justifyContent: 'center', marginBottom: '12px' }}>
          {[
            ['#about',   'About'],
            ['/help#contact', 'Contact'],
            ['/help',    t('navHelp')],
            ['/help#access', 'Accessibility Statement'],
            ['#terms',   'Terms'],
            ['#privacy', 'Privacy'],
          ].map(([to, label]) => (
            <Link key={label} to={to} style={{ color: 'rgba(255,255,255,.8)', fontSize: '13px', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.8)')}>
              {label}
            </Link>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.15)', paddingTop: '10px', fontSize: '12px', color: 'rgba(255,255,255,.6)', display: 'flex', flexWrap: 'wrap', gap: '6px 24px', justifyContent: 'space-between' }}>
          <span>{t('lastUpdated')}: {updStr}</span>
          <span style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span>Forecast model: <strong style={{ color: '#4ADE80' }}>Working</strong></span>
            <span>Data feed: <strong style={{ color: '#4ADE80' }}>Updated 0 s ago</strong></span>
            <span>Response time: <strong>~250 ms</strong></span>
          </span>
          <span>&copy; {new Date().getFullYear()} {ORG}</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Helpline bar ─────────────────────────────────────────────────────────────
export function HelplineBar() {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', color: 'rgba(255,255,255,.85)', fontSize: '12px', padding: '5px 16px', textAlign: 'center', zIndex: 7000, borderTop: '1px solid #333' }}>
      Control Room Helpline (24×7):&nbsp;
      <a href="tel:1800XXXXXXX" style={{ color: '#FCD34D', fontWeight: '700', textDecoration: 'none' }}>1800-XXX-XXXX</a>
      &nbsp;|&nbsp;
      <a href="mailto:control.room@example.gov.in" style={{ color: '#FCD34D', textDecoration: 'none' }}>control.room@example.gov.in</a>
    </div>
  );
}

// ─── Floating Help button ─────────────────────────────────────────────────────
export function FloatingHelp() {
  const [open, setOpen] = useState(false);
  const faqs = [
    { q: 'How do I read the status colours?', a: 'Green = Normal (under 70%). Amber = Needs attention (70–90%). Red = Urgent (over 90%). Each status also shows a word and an icon, never colour alone.' },
    { q: 'What does "supply limit" mean?', a: 'The limit is the maximum power the distribution equipment in that area can safely handle. Going over it risks damage or a power cut.' },
    { q: 'How do I adjust supply?', a: 'Click Adjust Supply in the menu. Select an area. In Step 3, enter the new amount — you cannot go above the safe maximum.' },
    { q: 'What is the Demand Forecast?', a: 'The forecast estimates how much power each area will need in the coming hours, based on past data and the current scenario.' },
    { q: 'Who do I call for urgent problems?', a: 'Call the Control Room on 1800-XXX-XXXX (toll-free, 24×7) or email control.room@example.gov.in.' },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label="Open help panel"
        style={{ position: 'fixed', bottom: '40px', right: '16px', zIndex: 7100, background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: '50%', width: '48px', height: '48px', fontSize: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
        ?
      </button>
      {open && (
        <div style={{ position: 'fixed', bottom: '96px', right: '16px', zIndex: 7100, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', width: '320px', maxHeight: '60vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,.15)' }}
          role="dialog" aria-label="Quick help">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: '700', fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Quick Help
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-sec)' }} aria-label="Close help">×</button>
          </div>
          <div style={{ padding: '12px' }}>
            {faqs.map((f, i) => (
              <details key={i} style={{ marginBottom: '8px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', fontSize: '14px', padding: '6px 0', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {f.q} <span aria-hidden="true">+</span>
                </summary>
                <p style={{ fontSize: '13px', color: 'var(--text-sec)', marginTop: '4px', marginBottom: '4px', lineHeight: '1.6' }}>{f.a}</p>
              </details>
            ))}
            <Link to="/help" onClick={() => setOpen(false)} style={{ fontSize: '13px', fontWeight: '600' }}>View full Help page →</Link>
          </div>
        </div>
      )}
    </>
  );
}
