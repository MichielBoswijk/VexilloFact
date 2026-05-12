import type { Country } from "@/lib/countries";

/** Lowercase, trim, collapse spaces, strip combining marks for accent-insensitive compare. */
export function normalizeCountryGuess(s: string): string {
  const collapsed = s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  return collapsed.normalize("NFD").replace(/\p{M}+/gu, "");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + cost,
      );
      prev = tmp;
    }
  }
  return row[n];
}

/**
 * Typo-tolerant match between guess and a single country common name (Levenshtein cap scales with length).
 * Does not consider other countries — use {@link guessMatchesAnswerCountry} for quiz correctness.
 */
export function fuzzyMatchGuessToCountryName(
  guess: string,
  commonName: string,
): boolean {
  const g = normalizeCountryGuess(guess);
  const c = normalizeCountryGuess(commonName);
  if (g.length === 0) return false;
  if (g === c) return true;
  const dist = levenshtein(g, c);
  const n = Math.max(g.length, c.length);
  if (n <= 5) return dist <= 1;
  if (n <= 12) return dist <= 2;
  return dist <= Math.min(3, Math.ceil(n * 0.2));
}

/**
 * True if the guess counts as correct for this answer: exact match to answer, else fuzzy match to answer,
 * unless the guess is an exact normalized match for a *different* quiz country's common name (so
 * "Nigeria" is wrong when the flag is Niger, while typos like "Niger" still fuzzy-match).
 */
export function guessMatchesAnswerCountry(
  guess: string,
  answer: Country,
  quizCountries: Country[],
): boolean {
  const g = normalizeCountryGuess(guess);
  if (g.length === 0) return false;
  const answerNorm = normalizeCountryGuess(answer.name.common);
  if (g === answerNorm) return true;
  for (const c of quizCountries) {
    if (c.cca3 === answer.cca3) continue;
    if (g === normalizeCountryGuess(c.name.common)) return false;
  }
  return fuzzyMatchGuessToCountryName(guess, answer.name.common);
}
