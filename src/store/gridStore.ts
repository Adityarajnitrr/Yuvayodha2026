import { create } from 'zustand';
import {
  simulateGrid, deriveNotices, deriveRecommendations,
  seedChangeLog, getBaselineComparison, generateForecast,
  applyAllocationOverride, nextRef, resetPrev,
  type GridSnapshot, type Notice, type ChangeRecord,
  type Recommendation, type Scenario, type AreaId,
  type ForecastResult, type BaselineComparison,
} from '../data/engine';

const TICK_MS = 30_000;

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  detail?: string;
}

interface GridStore {
  // ── Data ────────────────────────────────────────────────────────────────
  snapshot:        GridSnapshot | null;
  notices:         Notice[];
  changeLog:       ChangeRecord[];
  recommendations: Recommendation[];
  baseline:        BaselineComparison;
  forecast:        ForecastResult | null;

  // ── UI state ─────────────────────────────────────────────────────────────
  scenario:     Scenario;
  loading:      boolean;
  lastUpdated:  Date | null;
  toasts:       Toast[];
  demoActive:   boolean;
  demoStep:     number;
  openNotices:  number; // badge count

  // ── Tick ─────────────────────────────────────────────────────────────────
  _timer: ReturnType<typeof setInterval> | null;
  startTick: () => void;
  stopTick:  () => void;
  tick:      () => void;

  // ── Actions ───────────────────────────────────────────────────────────────
  setScenario:       (s: Scenario) => void;
  acknowledgeNotice: (id: string) => void;
  acknowledgeAll:    () => void;
  applyAllocation:   (params: {
    areaId: AreaId; newMW: number; reason: string;
    duration: string; doneBy: string; remarks?: string;
    source?: ChangeRecord['source'];
  }) => string; // returns refNo
  undoAllocation:    (refNo: string) => void;
  addToast:          (t: Omit<Toast, 'id'>) => void;
  removeToast:       (id: string) => void;
  refreshForecast:   (horizonH: number, areaId?: AreaId) => void;
  startDemo:         () => void;
  nextDemoStep:      () => void;
  endDemo:           () => void;
}

export const useGridStore = create<GridStore>((set, get) => ({
  snapshot:        null,
  notices:         [],
  changeLog:       seedChangeLog(),
  recommendations: [],
  baseline:        getBaselineComparison(),
  forecast:        null,
  scenario:        'live',
  loading:         true,
  lastUpdated:     null,
  toasts:          [],
  demoActive:      false,
  demoStep:        0,
  openNotices:     0,
  _timer:          null,

  tick: () => {
    const { scenario, notices } = get();
    const now  = new Date();
    const snap = simulateGrid(now, scenario);
    const newNotices = deriveNotices(snap, notices);
    const recs = deriveRecommendations(snap);
    const openCount = newNotices.filter(n => n.status === 'open').length;
    set({
      snapshot: snap,
      notices: newNotices,
      recommendations: recs,
      loading: false,
      lastUpdated: now,
      openNotices: openCount,
    });
  },

  startTick: () => {
    get().tick();
    const id = setInterval(() => get().tick(), TICK_MS);
    set({ _timer: id });
  },

  stopTick: () => {
    const { _timer } = get();
    if (_timer) clearInterval(_timer);
    set({ _timer: null });
  },

  setScenario: (s) => {
    resetPrev();
    set({ scenario: s, loading: true });
    setTimeout(() => get().tick(), 50);
  },

  acknowledgeNotice: (id) => {
    set(st => {
      const notices = st.notices.map(n => n.id === id ? { ...n, status: 'acknowledged' as const } : n);
      const openNotices = notices.filter(n => n.status === 'open').length;
      return { notices, openNotices };
    });
  },

  acknowledgeAll: () => {
    set(st => ({
      notices: st.notices.map(n => n.status === 'open' ? { ...n, status: 'acknowledged' as const } : n),
      openNotices: 0,
    }));
  },

  applyAllocation: ({ areaId, newMW, reason, duration, doneBy, remarks, source = 'Operator' }) => {
    const { snapshot, changeLog } = get();
    if (!snapshot) return '';
    const area = snapshot.areas.find(a => a.id === areaId);
    if (!area) return '';
    const oldMW = area.allocatedMW;
    const refNo = nextRef();
    applyAllocationOverride(areaId, newMW);
    const record: ChangeRecord = {
      refNo, ts: new Date().toISOString(), areaId, areaName: area.name,
      oldMW, newMW, reason, duration, doneBy, source, remarks,
    };
    set({ changeLog: [record, ...changeLog] });
    get().tick();
    return refNo;
  },

  undoAllocation: (refNo) => {
    const { changeLog } = get();
    const orig = changeLog.find(r => r.refNo === refNo);
    if (!orig) return;
    get().applyAllocation({
      areaId: orig.areaId, newMW: orig.oldMW,
      reason: `Undo of ${refNo}`, duration: orig.duration,
      doneBy: orig.doneBy, source: 'Undo',
    });
  },

  addToast: (t) => {
    const id = `toast-${Date.now()}`;
    set(st => ({ toasts: [...st.toasts, { ...t, id }] }));
    setTimeout(() => get().removeToast(id), 6000);
  },

  removeToast: (id) => set(st => ({ toasts: st.toasts.filter(t => t.id !== id) })),

  refreshForecast: (horizonH, areaId) => {
    const { scenario } = get();
    const from = new Date();
    from.setMinutes(0, 0, 0);
    const result = generateForecast(from, horizonH, scenario, areaId);
    set({ forecast: result });
  },

  startDemo: () => {
    set({ demoActive: true, demoStep: 0 });
    get().setScenario('cloudy');
    get().addToast({ type: 'info', message: 'Demo step 1/7: Cloud cover reduces solar output.' });
  },
  nextDemoStep: () => {
    const { demoStep, setScenario, tick, addToast } = get();
    const next = demoStep + 1;
    set({ demoStep: next });
    if (next === 1) { addToast({ type: 'info', message: 'Demo step 2/7: An area becomes Urgent.' }); tick(); }
    if (next === 2) { addToast({ type: 'info', message: 'Demo step 3/7: Notice appears in the bar.' }); }
    if (next === 3) { addToast({ type: 'info', message: 'Demo step 4/7: Open the recommended action.' }); }
    if (next === 4) { addToast({ type: 'info', message: 'Demo step 5/7: Apply the recommendation.' }); }
    if (next === 5) { addToast({ type: 'info', message: 'Demo step 6/7: Area returns to Needs attention.' }); tick(); }
    if (next === 6) { addToast({ type: 'info', message: 'Demo step 7/7: View the change record and improvement.' }); }
    if (next >= 7)  { get().endDemo(); }
  },
  endDemo: () => {
    set({ demoActive: false, demoStep: 0 });
    get().setScenario('live');
  },
}));
