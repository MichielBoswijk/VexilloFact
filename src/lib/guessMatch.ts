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
 * Case-insensitive match with light typo tolerance (Levenshtein cap scales with length).
 */
export function countryNameMatchesGuess(
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
