import type { Country } from "@/lib/countries";
import type { GameMode } from "@/lib/gameMode";
import {
  completedRoundsFor,
  type CountryRoundStats,
  type GuessStatsRoot,
  getCountryStatsFor,
} from "@/lib/guessStatsStorage";

const WEIGHT_WRONG = 1;
const WEIGHT_LOSS = 3;
const WEIGHT_SKIP = 2;
const WEIGHT_WIN = 2;

/** Higher = more practice priority. */
export function weaknessScore(stats: CountryRoundStats): number {
  return (
    WEIGHT_WRONG * stats.wrongSubmits +
    WEIGHT_LOSS * stats.losses +
    WEIGHT_SKIP * stats.skips -
    WEIGHT_WIN * stats.wins
  );
}

export type WeakFlagEntry = {
  cca3: string;
  country: Country;
  score: number;
  stats: CountryRoundStats;
};

const DEFAULT_MIN_COMPLETED = 2;
const DEFAULT_TOP_N = 10;

/**
 * Weak flags = countries you have finished at least `minCompleted` rounds with as the answer,
 * whose {@link weaknessScore} is **strictly positive** (more wrongs/losses/skips than wins on balance),
 * sorted worst-first, capped at `topN`.
 *
 * A flag **drops off** the list when its score is ≤ 0 (e.g. enough wins without misses), or when
 * it has fewer than `minCompleted` completed rounds (wins + losses) so we do not noise-rank new data.
 */
export function getWeakFlagsForMode(
  eligibleCountries: Country[],
  root: GuessStatsRoot,
  mode: GameMode,
  options?: { minCompletedRounds?: number; topN?: number },
): WeakFlagEntry[] {
  const minCompleted = options?.minCompletedRounds ?? DEFAULT_MIN_COMPLETED;
  const topN = options?.topN ?? DEFAULT_TOP_N;
  const entries: WeakFlagEntry[] = [];
  for (const country of eligibleCountries) {
    const stats = getCountryStatsFor(root, mode, country.cca3);
    if (completedRoundsFor(stats) < minCompleted) continue;
    const score = weaknessScore(stats);
    if (score <= 0) continue;
    entries.push({
      cca3: country.cca3,
      country,
      score,
      stats,
    });
  }
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, topN);
}

/** Per-index weights for weighted random pick; minimum weight is 1. */
export function weaknessWeightsForIndices(
  eligibleCountries: Country[],
  root: GuessStatsRoot,
  mode: GameMode,
): number[] {
  return eligibleCountries.map((c) => {
    const stats = getCountryStatsFor(root, mode, c.cca3);
    const w = 1 + Math.max(0, weaknessScore(stats));
    return w;
  });
}

export type ConfusionHint = { guessedCca3: string; label: string; count: number };

export function topConfusionsForAnswer(
  root: GuessStatsRoot,
  mode: GameMode,
  answerCca3: string,
  nameByCca3: Map<string, string>,
  limit = 2,
): ConfusionHint[] {
  const slice = root.byMode[mode];
  if (!slice) return [];
  const inner = slice.confusions[answerCca3];
  if (!inner) return [];
  const pairs = Object.entries(inner)
    .map(([guessedCca3, count]) => ({
      guessedCca3,
      count,
      label: nameByCca3.get(guessedCca3) ?? guessedCca3,
    }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return pairs;
}
