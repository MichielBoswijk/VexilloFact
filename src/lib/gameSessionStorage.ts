import type { Country } from "@/lib/countries";
import type { GameMode } from "@/lib/gameMode";
import type { GamePace } from "@/lib/gamePaceStorage";
import type { WrongGuessFlag } from "@/lib/findGuessCountry";

const STORAGE_KEY = "vexillo-game-session";
const SCHEMA_VERSION = 1;

export type SessionGameState = "playing" | "won" | "lost";

export type SavedLifeLoss = {
  label: string;
  guessedCca3?: string;
};

export type SavedCasualLearn =
  | { kind: "country"; cca3: string }
  | { kind: "skip" };

export type GameSessionSnapshot = {
  schemaVersion: number;
  mode: GameMode;
  gamePace: GamePace;
  marathonTotal: number;
  queueCca3s: string[];
  livesRemaining: number;
  gameState: SessionGameState;
  outcomeCca3: string | null;
  lifeLossFlags: SavedLifeLoss[];
  casualLearn: SavedCasualLearn | null;
};

export type RestoredSession = {
  flagQueue: Country[];
  marathonTotal: number;
  livesRemaining: number;
  gameState: SessionGameState;
  outcomeCountry: Country | null;
  lifeLossFlags: WrongGuessFlag[];
  casualLearn:
    | { kind: "country"; country: Country }
    | { kind: "skip" }
    | null;
};

function isGameMode(v: unknown): v is GameMode {
  return v === "independent" || v === "territories" || v === "both";
}

function isGamePace(v: unknown): v is GamePace {
  return v === "fast" || v === "casual";
}

function isSavedLifeLoss(v: unknown): v is SavedLifeLoss {
  if (!v || typeof v !== "object") return false;
  const o = v as SavedLifeLoss;
  return typeof o.label === "string";
}

function parseSnapshot(raw: string): GameSessionSnapshot | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as GameSessionSnapshot;
    if (o.schemaVersion !== SCHEMA_VERSION) return null;
    if (!isGameMode(o.mode) || !isGamePace(o.gamePace)) return null;
    if (typeof o.marathonTotal !== "number" || !Number.isFinite(o.marathonTotal)) {
      return null;
    }
    if (!Array.isArray(o.queueCca3s) || !o.queueCca3s.every((id) => typeof id === "string")) {
      return null;
    }
    if (
      typeof o.livesRemaining !== "number" ||
      !Number.isFinite(o.livesRemaining)
    ) {
      return null;
    }
    if (o.gameState !== "playing" && o.gameState !== "won" && o.gameState !== "lost") {
      return null;
    }
    if (o.outcomeCca3 !== null && typeof o.outcomeCca3 !== "string") return null;
    if (!Array.isArray(o.lifeLossFlags) || !o.lifeLossFlags.every(isSavedLifeLoss)) {
      return null;
    }
    if (
      o.casualLearn !== null &&
      (typeof o.casualLearn !== "object" ||
        (o.casualLearn.kind !== "country" && o.casualLearn.kind !== "skip") ||
        (o.casualLearn.kind === "country" && typeof o.casualLearn.cca3 !== "string"))
    ) {
      return null;
    }
    return o;
  } catch {
    return null;
  }
}

function countryByCca3(
  playable: Country[],
): Map<string, Country> {
  return new Map(playable.map((c) => [c.cca3, c]));
}

function restoreLifeLoss(
  saved: SavedLifeLoss[],
  byCca3: Map<string, Country>,
): WrongGuessFlag[] {
  return saved.map((s) => {
    if (s.guessedCca3) {
      const c = byCca3.get(s.guessedCca3);
      if (c) {
        return {
          label: c.name.common,
          guessedCca3: c.cca3,
          png: c.flags?.png,
        };
      }
    }
    return { label: s.label, guessedCca3: s.guessedCca3 };
  });
}

export function loadGameSession(): GameSessionSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseSnapshot(raw);
  } catch {
    return null;
  }
}

export function saveGameSession(snapshot: GameSessionSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...snapshot, schemaVersion: SCHEMA_VERSION }),
    );
  } catch {
    /* quota / private mode */
  }
}

export function clearGameSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function restoreGameSession(
  playableCountries: Country[],
  mode: GameMode,
  gamePace: GamePace,
): RestoredSession | null {
  const saved = loadGameSession();
  if (!saved) return null;
  if (saved.mode !== mode || saved.gamePace !== gamePace) return null;

  const lives = Math.floor(saved.livesRemaining);
  if (lives < 0 || lives > 3) return null;

  const marathonTotal = Math.floor(saved.marathonTotal);
  if (marathonTotal <= 0) return null;

  const byCca3 = countryByCca3(playableCountries);

  const flagQueue: Country[] = [];
  for (const id of saved.queueCca3s) {
    const c = byCca3.get(id);
    if (!c?.flags?.png) return null;
    flagQueue.push(c);
  }

  let outcomeCountry: Country | null = null;
  if (saved.outcomeCca3) {
    outcomeCountry = byCca3.get(saved.outcomeCca3) ?? null;
    if (!outcomeCountry?.flags?.png) return null;
  }

  if (saved.gameState === "playing") {
    if (flagQueue.length === 0) return null;
  } else if (saved.gameState === "won") {
    if (!outcomeCountry) return null;
  } else if (saved.gameState === "lost") {
    if (!outcomeCountry) return null;
  }

  let casualLearn: RestoredSession["casualLearn"] = null;
  if (saved.casualLearn?.kind === "skip") {
    casualLearn = { kind: "skip" };
  } else if (saved.casualLearn?.kind === "country") {
    const c = byCca3.get(saved.casualLearn.cca3);
    if (!c?.flags?.png) return null;
    casualLearn = { kind: "country", country: c };
  }

  return {
    flagQueue,
    marathonTotal,
    livesRemaining: lives,
    gameState: saved.gameState,
    outcomeCountry,
    lifeLossFlags: restoreLifeLoss(saved.lifeLossFlags, byCca3),
    casualLearn,
  };
}

export function buildSessionSnapshot(input: {
  mode: GameMode;
  gamePace: GamePace;
  marathonTotal: number;
  flagQueue: Country[];
  livesRemaining: number;
  gameState: SessionGameState;
  outcomeCountry: Country | null;
  lifeLossFlags: WrongGuessFlag[];
  casualLearn:
    | { kind: "country"; country: Country }
    | { kind: "skip" }
    | null;
}): GameSessionSnapshot {
  const lifeLossFlags: SavedLifeLoss[] = input.lifeLossFlags.map((f) => ({
    label: f.label,
    ...(f.guessedCca3 ? { guessedCca3: f.guessedCca3 } : {}),
  }));

  let casualLearn: SavedCasualLearn | null = null;
  if (input.casualLearn?.kind === "skip") {
    casualLearn = { kind: "skip" };
  } else if (input.casualLearn?.kind === "country") {
    casualLearn = { kind: "country", cca3: input.casualLearn.country.cca3 };
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    mode: input.mode,
    gamePace: input.gamePace,
    marathonTotal: input.marathonTotal,
    queueCca3s: input.flagQueue.map((c) => c.cca3),
    livesRemaining: input.livesRemaining,
    gameState: input.gameState,
    outcomeCca3: input.outcomeCountry?.cca3 ?? null,
    lifeLossFlags,
    casualLearn,
  };
}
