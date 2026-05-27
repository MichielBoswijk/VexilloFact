const STORAGE_KEY = "vexillo-streaks";

export type StreakSnapshot = {
  current: number;
  high: number;
};

function defaultSnapshot(): StreakSnapshot {
  return { current: 0, high: 0 };
}

export function loadStreaks(): StreakSnapshot {
  if (typeof window === "undefined") return defaultSnapshot();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSnapshot();
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof (parsed as StreakSnapshot).current !== "number" ||
      typeof (parsed as StreakSnapshot).high !== "number"
    ) {
      return defaultSnapshot();
    }
    const { current, high } = parsed as StreakSnapshot;
    return {
      current: Math.max(0, Math.floor(current)),
      high: Math.max(0, Math.floor(high)),
    };
  } catch {
    return defaultSnapshot();
  }
}

export function saveStreaks(snapshot: StreakSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    const next = {
      current: Math.max(0, Math.floor(snapshot.current)),
      high: Math.max(0, Math.floor(snapshot.high)),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

export function applyWin(snapshot: StreakSnapshot): StreakSnapshot {
  const current = snapshot.current + 1;
  const high = Math.max(snapshot.high, current);
  const next = { current, high };
  saveStreaks(next);
  return next;
}

export function applyLoss(snapshot: StreakSnapshot): StreakSnapshot {
  const next = { current: 0, high: snapshot.high };
  saveStreaks(next);
  return next;
}

/** Start a fresh marathon run; best streak is preserved. */
export function resetCurrentStreak(snapshot: StreakSnapshot): StreakSnapshot {
  return applyLoss(snapshot);
}
