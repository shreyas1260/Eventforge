import { FullEventPlan, PlanSnapshot } from '../types';

const STORAGE_KEY_PREFIX = 'eventforge_event_';
const ACTIVE_EVENT_KEY = 'eventforge_active_event_id';
const ALL_EVENTS_KEY = 'eventforge_event_ids';

export function getSavedEventIds(): string[] {
  try {
    const raw = localStorage.getItem(ALL_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_e) {
    return [];
  }
}

export function saveEventPlan(plan: FullEventPlan): void {
  try {
    plan.event.updatedAt = new Date().toISOString();
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${plan.event.id}`, JSON.stringify(plan));

    const ids = getSavedEventIds();
    if (!ids.includes(plan.event.id)) {
      ids.push(plan.event.id);
      localStorage.setItem(ALL_EVENTS_KEY, JSON.stringify(ids));
    }
    localStorage.setItem(ACTIVE_EVENT_KEY, plan.event.id);
  } catch (_e) {
    // Non-fatal
  }
}

export function loadEventPlan(id: string): FullEventPlan | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as FullEventPlan;
  } catch (_e) {
    return null;
  }
}

export function getActiveEvent(): FullEventPlan | null {
  const activeId = localStorage.getItem(ACTIVE_EVENT_KEY);
  if (activeId) {
    const existing = loadEventPlan(activeId);
    if (existing) return existing;
  }
  return null;
}

export function clearActiveEvent(): void {
  try {
    localStorage.removeItem(ACTIVE_EVENT_KEY);
  } catch (_e) {
    // Non-fatal
  }
}

export function deleteEventPlan(id: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
    const ids = getSavedEventIds().filter(i => i !== id);
    localStorage.setItem(ALL_EVENTS_KEY, JSON.stringify(ids));
    
    const active = localStorage.getItem(ACTIVE_EVENT_KEY);
    if (active === id) {
      if (ids.length > 0) {
        localStorage.setItem(ACTIVE_EVENT_KEY, ids[0]);
      } else {
        localStorage.removeItem(ACTIVE_EVENT_KEY);
      }
    }
  } catch (_e) {
    // Non-fatal
  }
}

export function createSnapshot(plan: FullEventPlan, changeSummary: string): PlanSnapshot {
  const versionNumber = (plan.snapshots?.length || 0) + 1;
  return {
    id: `snapshot-${Date.now()}-${versionNumber}`,
    eventId: plan.event.id,
    versionNumber,
    createdAt: new Date().toISOString(),
    changeSummary,
    data: {
      event: JSON.parse(JSON.stringify(plan.event)),
      budgetItems: JSON.parse(JSON.stringify(plan.budgetItems)),
      tasks: JSON.parse(JSON.stringify(plan.tasks)),
      vendors: JSON.parse(JSON.stringify(plan.vendors)),
      ideas: JSON.parse(JSON.stringify(plan.ideas)),
    },
  };
}

export function restoreFromSnapshot(plan: FullEventPlan, snapshotId: string): FullEventPlan {
  const snapshot = plan.snapshots?.find(s => s.id === snapshotId);
  if (!snapshot) return plan;

  const safetySnapshot = createSnapshot(plan, `Auto-backup before restoring Version #${snapshot.versionNumber}`);

  const restoredPlan: FullEventPlan = {
    event: JSON.parse(JSON.stringify(snapshot.data.event)),
    budgetItems: JSON.parse(JSON.stringify(snapshot.data.budgetItems)),
    tasks: JSON.parse(JSON.stringify(snapshot.data.tasks)),
    vendors: JSON.parse(JSON.stringify(snapshot.data.vendors)),
    ideas: JSON.parse(JSON.stringify(snapshot.data.ideas)),
    snapshots: [...(plan.snapshots || []), safetySnapshot],
    activeScenario: undefined,
  };

  saveEventPlan(restoredPlan);
  return restoredPlan;
}
