import type { Country } from "@/lib/countries";
import { normalizeCountryGuess } from "@/lib/guessMatch";

const MAX = 8;

export function getCountrySuggestions(
  countries: Country[],
  query: string,
): string[] {
  const q = normalizeCountryGuess(query);
  if (!q.length) return [];

  const names = countries.map((c) => c.name.common);
  const starts: string[] = [];
  const includes: string[] = [];

  for (const name of names) {
    const n = normalizeCountryGuess(name);
    if (n.startsWith(q)) starts.push(name);
    else if (n.includes(q)) includes.push(name);
  }

  const dedupe = new Set<string>();
  const out: string[] = [];
  const push = (arr: string[]) => {
    for (const s of arr) {
      if (dedupe.has(s)) continue;
      dedupe.add(s);
      out.push(s);
      if (out.length >= MAX) return out;
    }
    return out;
  };
  starts.sort((a, b) => a.localeCompare(b));
  includes.sort((a, b) => a.localeCompare(b));
  push(starts);
  if (out.length < MAX) push(includes);
  return out;
}
