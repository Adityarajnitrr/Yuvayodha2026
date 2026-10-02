/**
 * engine.ts — Single source of truth for ALL grid data.
 * Every page reads ONLY from the Zustand store which calls this.
 */

export type Scenario = 'live' | 'cloudy' | 'heatwave' | 'hydro_reduced' | 'forecast_error';
export type StatusLevel = 'normal' | 'warn' | 'urgent';

// ─── Area definitions ─────────────────────────────────────────────────────────
export const AREA_DEFS = [
  { id: 'a01', name: 'Sector 14 – North',     limitMW: 4.2,  baseDemand: 2.8, priority: false },
  { id: 'a02', name: 'Sector 21 – East',      limitMW: 3.8,  baseDemand: 2.5, priority: false },
  { id: 'a03', name: 'Sector 7 – Central',    limitMW: 5.1,  baseDemand: 3.9, priority: true  },
  { id: 'a04', name: 'Green Valley',          limitMW: 2.9,  baseDemand: 1.8, priority: false },
  { id: 'a05', name: 'River Bend',            limitMW: 3.5,  baseDemand: 2.2, priority: false },
  { id: 'a06', name: 'Industrial Zone A',     limitMW: 7.4,  baseDemand: 6.1, priority: true  },
  { id: 'a07', name: 'Residential Block B',   limitMW: 2.6,  baseDemand: 1.7, priority: false },
  { id: 'a08', name: 'Tech Corridor',         limitMW: 4.9,  baseDemand: 3.4, priority: false },
  { id: 'a09', name: 'Old Town',              limitMW: 3.1,  baseDemand: 2.7, priority: false },
  { id: 'a10', name: 'Hillside Estate',       limitMW: 2.3,  baseDemand: 2.1, priority: false },
  { id: 'a11', name: 'Commerce Hub',          limitMW: 6.0,  baseDemand: 4.8, priority: true  },
  { id: 'a12', name: 'Lakeside',             limitMW: 3.3,  baseDemand: 1.9, priority: false },
] as const;

export type AreaId = typeof AREA_DEFS[number]['id'];

export interface House {
  id: string;
  loadKW: number;
  flexible: boolean;
}

export interface Area {
  id: AreaId;
  name: string;
  limitMW: number;
  allocatedMW: number;
  loadMW: number;
  priority: boolean;
  flexibleLoadMW: number;
  status: StatusLevel;
  shareOfLimit: number; // 0-1
  trend: 'up' | 'down' | 'flat';
  sparkline: number[];
  houses: House[];
  maxAllocatableMW: number;
}

export interface SupplyBreakdown {
  solar: number;
  hydro: number;
  thermal: number;
  battery: number;
  total: number;
}

export interface Battery {
  socPct: number;
  usableKwh: number;
  maxDischargeKW: number;
  isCharging: boolean;
  timeToEmptyH: number | null;
}

export interface GridSnapshot {
  ts: string;
  demandMW: number;
  supply: SupplyBreakdown;
  spareMW: number;
  battery: Battery;
  areas: Area[];
  renewablePct: number;
  co2AvoidedKg: number;
  avgCostRsPerUnit: number;
}

export interface Notice {
  id: string;
  type: 'urgent' | 'advisory';
  areaId: AreaId | 'system';
  areaName: string;
  message: string;
  ts: string;
  status: 'open' | 'acknowledged' | 'resolved';
}

export interface ChangeRecord {
  refNo: string;
  ts: string;
  areaId: AreaId;
  areaName: string;
  oldMW: number;
  newMW: number;
  reason: string;
  duration: string;
  doneBy: string;
  source: 'Operator' | 'Recommendation' | 'Emergency Boost' | 'Undo';
  remarks?: string;
}

export interface Recommendation {
  id: string;
  fromAreaId: AreaId;
  fromAreaName: string;
  toAreaId: AreaId;
  toAreaName: string;
  shiftMW: number;
  headroomMW: number;
  reason: string;
}

export interface ForecastPoint {
  hour: number;
  ts: string;
  demandMW: number;
  p10: number;
  p90: number;
  solar: number;
  hydro: number;
  thermal: number;
  battery: number;
  isActual: boolean;
}

export interface ForecastResult {
  points: ForecastPoint[];
  peakMW: number;
  peakHour: number;
  minMW: number;
  avgMW: number;
  renewablePct: number;
  modelStatus: 'working' | 'degraded' | 'offline';
  lastRefresh: string;
  typicalErrorPct: number;
}

// ─── Deterministic pseudo-random ─────────────────────────────────────────────
function prng(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}
function rWalk(prev: number, seed: number, maxPct = 0.03): number {
  return prev * (1 + (prng(seed) - 0.5) * 2 * maxPct);
}

// ─── Solar curve: 0 outside 05:30–18:30, bell peak ~12:30 ────────────────────
export function solarMW(date: Date, cloudFactor: number, peakMW: number): number {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h < 5.5 || h > 18.5) return 0;
  const norm = (h - 5.5) / 13; // 0→1 across daylight
  const bell = Math.sin(norm * Math.PI); // 0 at sunrise/sunset, 1 at noon
  return Math.max(0, bell * peakMW * cloudFactor);
}

// ─── Diurnal demand multiplier ────────────────────────────────────────────────
function demandMult(h: number, scenario: Scenario): number {
  // Morning peak 8-10, evening peak 19-22, low at night
  let base = 0.55
    + 0.25 * Math.exp(-0.5 * ((h - 9) / 1.5) ** 2)   // morning peak
    + 0.35 * Math.exp(-0.5 * ((h - 20) / 1.8) ** 2);  // evening peak
  base = Math.max(0.45, Math.min(1.0, base));
  if (scenario === 'heatwave' && h >= 17 && h <= 22) base *= 1.25;
  return base;
}

// ─── Build 20-40 houses for an area ──────────────────────────────────────────
function buildHouses(areaId: string, totalKW: number, seed: number): House[] {
  const count = 20 + Math.floor(prng(seed) * 20); // 20-40
  const houses: House[] = [];
  for (let i = 0; i < count; i++) {
    const s = seed * 100 + i;
    const fraction = prng(s) * 1.5 + 0.5;
    const loadKW = parseFloat(((totalKW / count) * fraction).toFixed(2));
    houses.push({
      id: `H-${areaId.slice(1)}${String(i + 1).padStart(2, '0')}`,
      loadKW,
      flexible: prng(s + 500) > 0.65,
    });
  }
  // Normalize so sum equals totalKW
  const sum = houses.reduce((s, h) => s + h.loadKW, 0);
  const scale = totalKW / sum;
  return houses.map(h => ({ ...h, loadKW: parseFloat((h.loadKW * scale).toFixed(2)) }));
}

// ─── Scenario config ──────────────────────────────────────────────────────────
interface ScenMod { cloudFactor: number; demandBoost: number; hydroMod: number; battMod: number; }
function scenMod(s: Scenario): ScenMod {
  switch (s) {
    case 'cloudy':         return { cloudFactor: 0.4,  demandBoost: 1.0,  hydroMod: 1.0,  battMod: 0.9 };
    case 'heatwave':       return { cloudFactor: 0.85, demandBoost: 1.25, hydroMod: 1.0,  battMod: 0.75 };
    case 'hydro_reduced':  return { cloudFactor: 0.9,  demandBoost: 1.0,  hydroMod: 0.6,  battMod: 1.0 };
    case 'forecast_error': return { cloudFactor: 0.7,  demandBoost: 1.1,  hydroMod: 0.85, battMod: 0.9 };
    default:               return { cloudFactor: 0.9,  demandBoost: 1.0,  hydroMod: 1.0,  battMod: 1.0 };
  }
}

// ─── Previous snapshot for smooth walk ───────────────────────────────────────
let _prev: GridSnapshot | null = null;
let _prevAllocations: Map<AreaId, number> = new Map();

export function applyAllocationOverride(areaId: AreaId, newMW: number): void {
  _prevAllocations.set(areaId, newMW);
  // Recalculate status in _prev
  if (_prev) {
    _prev = { ..._prev, areas: _prev.areas.map(a => {
      if (a.id !== areaId) return a;
      const share = a.loadMW / newMW;
      return { ...a, allocatedMW: newMW, shareOfLimit: a.loadMW / a.limitMW, maxAllocatableMW: newMW };
    })};
  }
}

export function simulateGrid(now: Date, scenario: Scenario): GridSnapshot {
  const mod  = scenMod(scenario);
  const tick = Math.floor(now.getTime() / 30_000); // one seed per 30 s
  const h    = now.getHours() + now.getMinutes() / 60;
  const dMult = demandMult(h, scenario) * mod.demandBoost;

  // ── Areas ────────────────────────────────────────────────────────────────
  const areas: Area[] = AREA_DEFS.map((def, idx) => {
    const seed      = idx * 9973 + tick;
    const prevLoad  = _prev?.areas[idx]?.loadMW ?? def.baseDemand * dMult;
    const loadMW    = parseFloat(Math.max(def.baseDemand * 0.4,
                        Math.min(def.limitMW * 1.12, rWalk(prevLoad, seed))).toFixed(3));
    const allocMW   = _prevAllocations.has(def.id)
      ? _prevAllocations.get(def.id)!
      : parseFloat(Math.min(_prev?.areas[idx]?.allocatedMW ?? def.baseDemand * 1.05, def.limitMW).toFixed(3));
    const share     = loadMW / def.limitMW;
    const status: StatusLevel = share > 0.9 ? 'urgent' : share > 0.7 ? 'warn' : 'normal';
    const prevSpark = _prev?.areas[idx]?.sparkline ?? [];
    const sparkline = [...prevSpark.slice(-23), loadMW];
    const prevVal   = sparkline[sparkline.length - 2] ?? loadMW;
    const trend     = loadMW > prevVal * 1.005 ? 'up' : loadMW < prevVal * 0.995 ? 'down' : 'flat';
    const flexLoad  = parseFloat((loadMW * 0.12 * prng(seed + 7)).toFixed(3));
    const systemSpare = 2.5; // rough unallocated spare
    const maxAlloc  = parseFloat((allocMW + systemSpare * 0.3 + 2).toFixed(2));
    const houses    = buildHouses(def.id, loadMW * 1000, idx * 41 + tick % 100);
    return {
      id: def.id as AreaId, name: def.name, limitMW: def.limitMW,
      allocatedMW: allocMW, loadMW, priority: def.priority,
      flexibleLoadMW: flexLoad, status, shareOfLimit: share, trend,
      sparkline, houses, maxAllocatableMW: maxAlloc,
    };
  });

  // Seed: ensure 2 urgent + 3 warn in live view at startup
  // Force a10 and a09 to be urgent in first tick of live
  if (!_prev && scenario === 'live') {
    const a10 = areas.find(a => a.id === 'a10')!;
    const a09 = areas.find(a => a.id === 'a09')!;
    const a02 = areas.find(a => a.id === 'a02')!;
    const a05 = areas.find(a => a.id === 'a05')!;
    const a07 = areas.find(a => a.id === 'a07')!;
    Object.assign(a10, { loadMW: parseFloat((a10.limitMW * 0.96).toFixed(3)), shareOfLimit: 0.96, status: 'urgent' as StatusLevel });
    Object.assign(a09, { loadMW: parseFloat((a09.limitMW * 0.93).toFixed(3)), shareOfLimit: 0.93, status: 'urgent' as StatusLevel });
    Object.assign(a02, { loadMW: parseFloat((a02.limitMW * 0.82).toFixed(3)), shareOfLimit: 0.82, status: 'warn' as StatusLevel });
    Object.assign(a05, { loadMW: parseFloat((a05.limitMW * 0.78).toFixed(3)), shareOfLimit: 0.78, status: 'warn' as StatusLevel });
    Object.assign(a07, { loadMW: parseFloat((a07.limitMW * 0.75).toFixed(3)), shareOfLimit: 0.75, status: 'warn' as StatusLevel });
  }

  // ── Supply ───────────────────────────────────────────────────────────────
  const totalDemand = parseFloat(areas.reduce((s, a) => s + a.loadMW, 0).toFixed(3));
  const solar  = parseFloat(solarMW(now, mod.cloudFactor, 18).toFixed(3));
  const hydro  = parseFloat((12 * mod.hydroMod * (0.9 + prng(tick + 99) * 0.2)).toFixed(3));
  const battDisch = parseFloat(Math.max(0, Math.min(4, totalDemand - solar - hydro - 15)).toFixed(3));
  const thermal = parseFloat(Math.max(0, totalDemand - solar - hydro - battDisch + 1.5).toFixed(3));
  const totalSupply = solar + hydro + thermal + battDisch;
  const spareMW = parseFloat((totalSupply - totalDemand).toFixed(3));

  // ── Battery ──────────────────────────────────────────────────────────────
  const prevSoc = _prev?.battery.socPct ?? 72;
  const socDelta = battDisch > 0.5 ? -0.4 * mod.battMod : 0.3;
  const socPct   = parseFloat(Math.max(10, Math.min(100, prevSoc + socDelta)).toFixed(1));
  const usableKwh = parseFloat((socPct * 2.4).toFixed(1));
  const isCharging = battDisch < 0.1;
  const timeToEmptyH = !isCharging && battDisch > 0
    ? parseFloat((usableKwh / (battDisch * 1000 / 1000)).toFixed(1)) : null;

  const renewPct = totalSupply > 0 ? parseFloat(((solar + hydro) / totalSupply * 100).toFixed(1)) : 0;
  const co2 = parseFloat(((solar + hydro) * 0.82 * 1000).toFixed(0));
  const cost = parseFloat((thermal * 6.8 / Math.max(totalDemand, 0.01)).toFixed(2));

  const snap: GridSnapshot = {
    ts: now.toISOString(),
    demandMW: totalDemand,
    supply: { solar, hydro, thermal, battery: battDisch, total: totalSupply },
    spareMW,
    battery: { socPct, usableKwh, maxDischargeKW: 80, isCharging, timeToEmptyH },
    areas, renewablePct: renewPct, co2AvoidedKg: co2,
    avgCostRsPerUnit: cost,
  };
  _prev = snap;
  return snap;
}

// ─── Notices ──────────────────────────────────────────────────────────────────
let _noticeSeq = 0;
export function deriveNotices(snap: GridSnapshot, existing: Notice[]): Notice[] {
  const notices: Notice[] = [];
  for (const area of snap.areas) {
    const existingId = `ntc-${area.id}`;
    const existing_ = existing.find(n => n.id === existingId);
    if (area.status === 'urgent') {
      if (existing_?.status === 'acknowledged') { notices.push(existing_); continue; }
      notices.push({
        id: existingId,
        type: 'urgent',
        areaId: area.id,
        areaName: area.name,
        message: `Share of limit in use is ${(area.shareOfLimit * 100).toFixed(0)}%. Immediate reallocation required.`,
        ts: snap.ts,
        status: existing_?.status === 'resolved' ? 'resolved' : 'open',
      });
    } else if (area.status === 'warn') {
      if (existing_?.status === 'acknowledged') { notices.push(existing_); continue; }
      notices.push({
        id: existingId,
        type: 'advisory',
        areaId: area.id,
        areaName: area.name,
        message: `Share of limit in use is ${(area.shareOfLimit * 100).toFixed(0)}%. Monitor closely.`,
        ts: snap.ts,
        status: existing_?.status === 'resolved' ? 'resolved' : 'open',
      });
    } else {
      // Area recovered — resolve its notice
      if (existing_) {
        notices.push({ ...existing_, status: 'resolved' });
      }
    }
  }
  return notices;
}

// ─── Recommendations ──────────────────────────────────────────────────────────
export function deriveRecommendations(snap: GridSnapshot): Recommendation[] {
  const recs: Recommendation[] = [];
  const overloaded  = snap.areas.filter(a => a.status !== 'normal')
    .sort((a, b) => b.shareOfLimit - a.shareOfLimit);
  const hasHeadroom = snap.areas
    .filter(a => !a.priority && a.allocatedMW < a.maxAllocatableMW * 0.75)
    .sort((a, b) => (b.maxAllocatableMW - b.loadMW) - (a.maxAllocatableMW - a.loadMW));

  for (const to of overloaded) {
    const from = hasHeadroom.find(a => a.id !== to.id);
    if (!from) continue;
    const headroom = parseFloat((from.maxAllocatableMW - from.loadMW).toFixed(2));
    const shift    = parseFloat(Math.min(headroom * 0.5, Math.max(0.1, to.loadMW - to.allocatedMW)).toFixed(2));
    if (shift < 0.05) continue;
    recs.push({
      id: `rec-${to.id}`,
      fromAreaId: from.id, fromAreaName: from.name,
      toAreaId: to.id,    toAreaName: to.name,
      shiftMW: shift, headroomMW: headroom,
      reason: `${to.name} is at ${(to.shareOfLimit * 100).toFixed(0)}% of limit. ${from.name} has ${headroom.toFixed(2)} MW spare.`,
    });
    if (recs.length >= 4) break;
  }
  return recs;
}

// ─── Forecast ─────────────────────────────────────────────────────────────────
export function generateForecast(from: Date, horizonH: number, scenario: Scenario, areaId?: AreaId): ForecastResult {
  const mod = scenMod(scenario);
  const isSystem = !areaId;
  const scale = isSystem ? 1 : 0.08;
  const points: ForecastPoint[] = [];
  const nowH = new Date().getHours() + new Date().getMinutes() / 60;

  for (let i = 0; i < horizonH; i++) {
    const dt   = new Date(from.getTime() + i * 3_600_000);
    const h    = dt.getHours() + dt.getMinutes() / 60;
    const dm   = demandMult(h, scenario) * mod.demandBoost;
    const base = (isSystem ? 42 : 3.2) * dm * scale;
    const noise = (prng(i * 37 + 11) - 0.5) * 0.06;
    const demand = parseFloat(Math.max(0.5, base * (1 + noise)).toFixed(3));
    const p10 = parseFloat((demand * 0.924).toFixed(3));
    const p90 = parseFloat((demand * 1.076).toFixed(3));
    const solar_  = parseFloat(solarMW(dt, mod.cloudFactor, isSystem ? 18 : 1.5).toFixed(3));
    const hydro_  = parseFloat(((isSystem ? 12 : 1) * mod.hydroMod).toFixed(3));
    const batt_   = parseFloat(Math.max(0, demand - solar_ - hydro_ - demand * 0.35).toFixed(3));
    const therm_  = parseFloat(Math.max(0, demand - solar_ - hydro_ - batt_).toFixed(3));
    const isActual = h <= nowH && i === 0;

    // Forecast error scenario: shift forecast 15% high
    const fDemand = scenario === 'forecast_error' ? parseFloat((demand * 1.15).toFixed(3)) : demand;
    points.push({ ts: dt.toISOString(), hour: dt.getHours(), demandMW: fDemand, p10, p90, solar: solar_, hydro: hydro_, thermal: therm_, battery: batt_, isActual });
  }

  const demands = points.map(p => p.demandMW);
  const peakMW  = Math.max(...demands);
  const peakHour = points[demands.indexOf(peakMW)].hour;
  const minMW   = Math.min(...demands);
  const avgMW   = parseFloat((demands.reduce((a, b) => a + b, 0) / demands.length).toFixed(2));
  const renewTotal = points.reduce((s, p) => s + p.solar + p.hydro, 0);
  const demTotal   = points.reduce((s, p) => s + p.demandMW, 0);
  const renewablePct = parseFloat((renewTotal / demTotal * 100).toFixed(1));

  return {
    points, peakMW, peakHour, minMW, avgMW, renewablePct,
    modelStatus: 'working', lastRefresh: new Date().toISOString(), typicalErrorPct: 3.8,
  };
}

// ─── Seed change log ──────────────────────────────────────────────────────────
let _refSeq = 123;
export function nextRef(): string {
  return `ADJ-2026-${String(++_refSeq).padStart(5, '0')}`;
}

export function seedChangeLog(): ChangeRecord[] {
  const ops     = ['R. Sharma', 'A. Mehta', 'P. Iyer', 'System'];
  const reasons = ['Peak demand management', 'Scheduled maintenance', 'Emergency reallocation', 'Follows automatic forecast'];
  const now     = Date.now();
  return AREA_DEFS.slice(0, 6).map((def, i) => ({
    refNo:    `ADJ-2026-${String(100 + i).padStart(5, '0')}`,
    ts:       new Date(now - i * 1_800_000).toISOString(),
    areaId:   def.id as AreaId,
    areaName: def.name,
    oldMW:    parseFloat((def.baseDemand * 0.9).toFixed(2)),
    newMW:    parseFloat((def.baseDemand * 1.05).toFixed(2)),
    reason:   reasons[i % reasons.length],
    duration: i % 2 === 0 ? '4 hours' : 'Until cancelled',
    doneBy:   ops[i % ops.length],
    source:   'Operator' as const,
  }));
}

// ─── Baseline comparison ──────────────────────────────────────────────────────
export interface BaselineComparison {
  outageHoursAvoided: number;
  unservedEnergyKwh: number;
  thermalReducedPct: number;
  co2AvoidedKg: number;
}
export function getBaselineComparison(): BaselineComparison {
  return { outageHoursAvoided: 4.2, unservedEnergyKwh: 1840, thermalReducedPct: 18.3, co2AvoidedKg: 9419 };
}

export function resetPrev(): void { _prev = null; _prevAllocations.clear(); }
