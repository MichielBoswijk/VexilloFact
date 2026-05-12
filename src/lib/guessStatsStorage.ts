import type { GameMode } from "@/lib/gameMode";

const STORAGE_KEY = "vexillo-guess-stats";
export const GUESS_STATS_SCHEMA_VERSION = 1;

export type CountryRoundStats = {
  wins: number;
  losses: number;
  wrongSubmits: number;
  skips: number;
};

export type GuessStatsByMode = {
  countries: Record<string, CountryRoundStats>;
  /** answerCca3 -> guessedCca3 -> count */
  confusions: Record<string, Record<string, number>>;
};

export type GuessStatsRoot = {
  schemaVersion: number;
  byMode: Partial<Record<GameMode, GuessStatsByMode>>;
};

function emptyByMode(): GuessStatsByMode {
  return { countries: {}, confusions: {} };
}

function defaultStats(): CountryRoundStats {
  return { wins: 0, losses: 0, wrongSubmits: 0, skips: 0 };
}

function sanitizeNonNegInt(n: unknown): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function sanitizeCountryStats(raw: unknown): CountryRoundStats {
  if (!raw || typeof raw !== "object") return defaultStats();
  const o = raw as Record<string, unknown>;
  return {
    wins: sanitizeNonNegInt(o.wins),
    losses: sanitizeNonNegInt(o.losses),
    wrongSubmits: sanitizeNonNegInt(o.wrongSubmits),
    skips: sanitizeNonNegInt(o.skips),
  };
}

function sanitizeGuessStatsByMode(raw: unknown): GuessStatsByMode {
  if (!raw || typeof raw !== "object") return emptyByMode();
  const o = raw as Record<string, unknown>;
  const countries: Record<string, CountryRoundStats> = {};
  const cRaw = o.countries;
  if (cRaw && typeof cRaw === "object") {
    for (const [cca3, s] of Object.entries(cRaw as Record<string, unknown>)) {
      if (typeof cca3 === "string" && cca3.length === 3) {
        countries[cca3] = sanitizeCountryStats(s);
      }
    }
  }
  const confusions: Record<string, Record<string, number>> = {};
  const confRaw = o.confusions;
  if (confRaw && typeof confRaw === "object") {
    for (const [answer, inner] of Object.entries(confRaw as Record<string, unknown>)) {
      if (typeof answer !== "string" || answer.length !== 3) continue;
      if (!inner || typeof inner !== "object") continue;
      const m: Record<string, number> = {};
      for (const [g, n] of Object.entries(inner as Record<string, unknown>)) {
        if (typeof g === "string" && g.length === 3) {
          m[g] = sanitizeNonNegInt(n);
        }
      }
      if (Object.keys(m).length) confusions[answer] = m;
    }
  }
  return { countries, confusions };
}

export function loadGuessStats(): GuessStatsRoot {
  if (typeof window === "undefined") {
    return { schemaVersion: GUESS_STATS_SCHEMA_VERSION, byMode: {} };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { schemaVersion: GUESS_STATS_SCHEMA_VERSION, byMode: {} };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { schemaVersion: GUESS_STATS_SCHEMA_VERSION, byMode: {} };
    }
    const o = parsed as Record<string, unknown>;
    const schemaVersion =
      typeof o.schemaVersion === "number" && Number.isFinite(o.schemaVersion)
        ? Math.floor(o.schemaVersion)
        : 0;
    const byMode: Partial<Record<GameMode, GuessStatsByMode>> = {};
    const bm = o.byMode;
    if (bm && typeof bm === "object") {
      for (const mode of ["independent", "territories", "both"] as GameMode[]) {
        const slice = (bm as Record<string, unknown>)[mode];
        if (slice !== undefined) {
          byMode[mode] = sanitizeGuessStatsByMode(slice);
        }
      }
    }
    return { schemaVersion: schemaVersion || GUESS_STATS_SCHEMA_VERSION, byMode };
  } catch {
    return { schemaVersion: GUESS_STATS_SCHEMA_VERSION, byMode: {} };
  }
}

function saveGuessStats(root: GuessStatsRoot): void {
  if (typeof window === "undefined") return;
  try {
    const next: GuessStatsRoot = {
      schemaVersion: GUESS_STATS_SCHEMA_VERSION,
      byMode: root.byMode,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

function getSlice(root: GuessStatsRoot, mode: GameMode): GuessStatsByMode {
  return root.byMode[mode] ?? emptyByMode();
}

function ensureSlice(root: GuessStatsRoot, mode: GameMode): GuessStatsByMode {
  let slice = root.byMode[mode];
  if (!slice) {
    slice = emptyByMode();
    root.byMode[mode] = slice;
  }
  return slice;
}

function getCountryStats(slice: GuessStatsByMode, cca3: string): CountryRoundStats {
  return slice.countries[cca3] ?? defaultStats();
}

export function recordWrongSubmit(mode: GameMode, answerCca3: string): void {
  const root = loadGuessStats();
  const slice = ensureSlice(root, mode);
  const prev = getCountryStats(slice, answerCca3);
  slice.countries[answerCca3] = {
    ...prev,
    wrongSubmits: prev.wrongSubmits + 1,
  };
  saveGuessStats(root);
}

export function recordSkip(mode: GameMode, answerCca3: string): void {
  const root = loadGuessStats();
  const slice = ensureSlice(root, mode);
  const prev = getCountryStats(slice, answerCca3);
  slice.countries[answerCca3] = {
    ...prev,
    skips: prev.skips + 1,
  };
  saveGuessStats(root);
}

export function recordRoundWin(mode: GameMode, answerCca3: string): void {
  const root = loadGuessStats();
  const slice = ensureSlice(root, mode);
  const prev = getCountryStats(slice, answerCca3);
  slice.countries[answerCca3] = {
    ...prev,
    wins: prev.wins + 1,
  };
  saveGuessStats(root);
}

export function recordRoundLoss(mode: GameMode, answerCca3: string): void {
  const root = loadGuessStats();
  const slice = ensureSlice(root, mode);
  const prev = getCountryStats(slice, answerCca3);
  slice.countries[answerCca3] = {
    ...prev,
    losses: prev.losses + 1,
  };
  saveGuessStats(root);
}

export function recordConfusion(
  mode: GameMode,
  answerCca3: string,
  guessedCca3: string,
): void {
  if (answerCca3 === guessedCca3) return;
  const root = loadGuessStats();
  const slice = ensureSlice(root, mode);
  const byAnswer = slice.confusions[answerCca3] ?? {};
  byAnswer[guessedCca3] = (byAnswer[guessedCca3] ?? 0) + 1;
  slice.confusions[answerCca3] = byAnswer;
  saveGuessStats(root);
}

export function clearGuessStats(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Completed rounds for this flag as the answer (win or loss). */
export function completedRoundsFor(stats: CountryRoundStats): number {
  return stats.wins + stats.losses;
}

export function getCountryStatsFor(
  root: GuessStatsRoot,
  mode: GameMode,
  cca3: string,
): CountryRoundStats {
  const slice = getSlice(root, mode);
  return getCountryStats(slice, cca3);
}

export type ModeStatsSummary = {
  roundsFinished: number;
  wins: number;
  losses: number;
  wrongSubmits: number;
  skips: number;
  /** Total recorded wrong-country guesses (for confusion insights). */
  confusionEvents: number;
  /** Countries with at least one stored stat row. */
  flagsTracked: number;
};

export function summarizeStatsForMode(
  root: GuessStatsRoot,
  mode: GameMode,
): ModeStatsSummary {
  const slice = root.byMode[mode];
  if (!slice) {
    return {
      roundsFinished: 0,
      wins: 0,
      losses: 0,
      wrongSubmits: 0,
      skips: 0,
      confusionEvents: 0,
      flagsTracked: 0,
    };
  }
  let wins = 0;
  let losses = 0;
  let wrongSubmits = 0;
  let skips = 0;
  for (const s of Object.values(slice.countries)) {
    wins += s.wins;
    losses += s.losses;
    wrongSubmits += s.wrongSubmits;
    skips += s.skips;
  }
  let confusionEvents = 0;
  for (const inner of Object.values(slice.confusions)) {
    for (const n of Object.values(inner)) {
      confusionEvents += n;
    }
  }
  const flagsTracked = Object.keys(slice.countries).length;
  return {
    roundsFinished: wins + losses,
    wins,
    losses,
    wrongSubmits,
    skips,
    confusionEvents,
    flagsTracked,
  };
}
