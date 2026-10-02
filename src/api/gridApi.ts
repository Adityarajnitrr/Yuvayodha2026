/**
 * gridApi.ts — Service layer.
 * Set VITE_API_BASE in .env to switch to the real ML API.
 * All functions are async so they drop in as fetch() calls later.
 */

import { useGridStore } from '../store/gridStore';
import type { AreaId } from '../data/engine';

const USE_REAL_API = Boolean(import.meta.env.VITE_API_BASE);

export async function getGridSnapshot() {
  if (USE_REAL_API) {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/snapshot`);
    return res.json();
  }
  return useGridStore.getState().snapshot;
}

export async function getForecast(params: { scope: 'system' | 'area'; areaId?: AreaId; from: Date; horizonH: number }) {
  if (USE_REAL_API) {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/forecast`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params),
    });
    return res.json();
  }
  useGridStore.getState().refreshForecast(params.horizonH, params.areaId);
  return useGridStore.getState().forecast;
}

export async function postAllocation(params: {
  areaId: AreaId; newMW: number; reason: string; duration: string; remarks?: string;
}) {
  if (USE_REAL_API) {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/allocation`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params),
    });
    return res.json();
  }
  return useGridStore.getState().applyAllocation({ ...params, doneBy: 'R. Sharma' });
}

export async function getNotices() {
  return useGridStore.getState().notices;
}

export async function acknowledgeNotice(id: string) {
  useGridStore.getState().acknowledgeNotice(id);
}

export async function getChangeLog() {
  return useGridStore.getState().changeLog;
}

export async function getBaselineComparison() {
  return useGridStore.getState().baseline;
}
