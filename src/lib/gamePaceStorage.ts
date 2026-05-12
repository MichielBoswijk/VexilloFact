const STORAGE_KEY = "vexillo-game-pace";

export type GamePace = "fast" | "casual";

export function loadGamePace(): GamePace {
  if (typeof window === "undefined") return "fast";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "casual" || v === "fast") return v;
  } catch {
    /* ignore */
  }
  return "fast";
}

export function saveGamePace(pace: GamePace): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, pace);
  } catch {
    /* ignore */
  }
}
