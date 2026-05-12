import type { Country } from "@/lib/countries";
import { pickWeightedIndex, shuffleCountries } from "@/lib/countries";
import type { GameMode } from "@/lib/gameMode";
import { getCountryStatsFor, loadGuessStats } from "@/lib/guessStatsStorage";
import { loadPracticeWeak } from "@/lib/practiceWeakStorage";
import { weaknessScore } from "@/lib/weakFlags";

/**
 * One ordered pass through every eligible flag for a marathon run.
 * Uniform shuffle by default; with "practice weak" on, builds order by repeatedly
 * picking the next flag weighted by weakness (one random pass at game start).
 */
export function buildMarathonFlagQueue(
  eligible: Country[],
  mode: GameMode,
): Country[] {
  if (!eligible.length) return [];
  if (!loadPracticeWeak()) {
    return shuffleCountries(eligible);
  }
  const root = loadGuessStats();
  const remaining = [...eligible];
  const out: Country[] = [];
  while (remaining.length) {
    const weights = remaining.map((c) => {
      const stats = getCountryStatsFor(root, mode, c.cca3);
      return 1 + Math.max(0, weaknessScore(stats));
    });
    const wi = pickWeightedIndex(weights);
    const next = remaining.splice(wi, 1)[0];
    if (next) out.push(next);
  }
  return out;
}
