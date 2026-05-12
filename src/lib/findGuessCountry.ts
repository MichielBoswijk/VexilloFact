import type { Country } from "@/lib/countries";
import {
  fuzzyMatchGuessToCountryName,
  normalizeCountryGuess,
} from "@/lib/guessMatch";

export type WrongGuessFlag = {
  /** Flag image URL when we could resolve the guess to a country */
  png?: string;
  /** Resolved country name or the raw guess text */
  label: string;
  /** When the guess resolved to a dataset country (for confusion stats). */
  guessedCca3?: string;
};

/**
 * Map a wrong free-text guess to a flag for feedback (never returns the answer country).
 */
export function resolveWrongGuessFlag(
  countries: Country[],
  guess: string,
  answer: Country,
): WrongGuessFlag {
  const trimmed = guess.trim();
  if (!trimmed) {
    return { label: "?" };
  }

  const g = normalizeCountryGuess(trimmed);

  for (const c of countries) {
    if (c.cca3 === answer.cca3) continue;
    if (normalizeCountryGuess(c.name.common) === g) {
      return {
        png: c.flags?.png,
        label: c.name.common,
        guessedCca3: c.cca3,
      };
    }
  }

  const fuzzy = countries.filter(
    (c) =>
      c.cca3 !== answer.cca3 &&
      fuzzyMatchGuessToCountryName(trimmed, c.name.common),
  );
  if (fuzzy.length === 1) {
    const c = fuzzy[0];
    return {
      png: c.flags?.png,
      label: c.name.common,
      guessedCca3: c.cca3,
    };
  }

  return { label: trimmed };
}
