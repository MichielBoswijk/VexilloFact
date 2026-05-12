/** Public API requires `fields` on `/all` (max 10 fields). */
export const REST_COUNTRIES_URL =
  "https://restcountries.com/v3.1/all?fields=name,flags,cca3,capital,population,region,currencies,area,independent,unMember";

export type Country = {
  cca3: string;
  name: { common: string };
  flags?: { png?: string; alt?: string };
  capital?: string[];
  population: number;
  region: string;
  currencies?: Record<string, { name: string; symbol?: string }>;
  area?: number;
  independent: boolean;
  unMember?: boolean;
};

function isCountry(value: unknown): value is Country {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  const name = o.name;
  if (!name || typeof name !== "object") return false;
  const common = (name as Record<string, unknown>).common;
  if (typeof o.cca3 !== "string" || typeof common !== "string") return false;
  if (typeof o.population !== "number") return false;
  if (typeof o.region !== "string") return false;
  if (typeof o.independent !== "boolean") return false;
  return true;
}

function hasUsableFlagPng(c: Country): boolean {
  const p = c.flags?.png;
  return typeof p === "string" && /^https?:\/\//i.test(p.trim());
}

/** RestCountries currently serves the IEA (Taliban) flag for AFG; exclude from play. */
function isExcludedFromPlay(c: Country): boolean {
  if (c.cca3 === "AFG") return true;
  const png = c.flags?.png?.toLowerCase() ?? "";
  if (png.includes("taliban")) return true;
  return false;
}

/** If the API returns duplicate `cca3` rows, keep one entry — prefer a usable flag image. */
function dedupeCountriesByCca3(list: Country[]): Country[] {
  const map = new Map<string, Country>();
  for (const c of list) {
    const prev = map.get(c.cca3);
    if (!prev) {
      map.set(c.cca3, c);
      continue;
    }
    const prevOk = hasUsableFlagPng(prev);
    const nextOk = hasUsableFlagPng(c);
    if (nextOk && !prevOk) map.set(c.cca3, c);
    else if (prevOk === nextOk && c.population > prev.population) map.set(c.cca3, c);
  }
  return Array.from(map.values());
}

export async function fetchCountries(): Promise<Country[]> {
  const res = await fetch(REST_COUNTRIES_URL);
  if (!res.ok) {
    throw new Error(`Failed to load countries (${res.status})`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected countries response");
  }
  const filtered = data.filter(isCountry);
  return dedupeCountriesByCca3(filtered).filter((c) => !isExcludedFromPlay(c));
}

/** Fisher–Yates shuffle (new array). */
export function shuffleCountries(countries: Country[]): Country[] {
  const a = [...countries];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

/** Pick an index with probability proportional to each positive weight. */
export function pickWeightedIndex(weights: number[]): number {
  if (weights.length === 0) return 0;
  if (weights.length === 1) return 0;
  const safe = weights.map((w) =>
    typeof w === "number" && Number.isFinite(w) && w > 0 ? w : 1,
  );
  const sum = safe.reduce((acc, w) => acc + w, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < safe.length; i++) {
    r -= safe[i]!;
    if (r <= 0) return i;
  }
  return safe.length - 1;
}

export function pickRandomCountryIndex(
  countries: Country[],
  avoidIndex?: number,
): number {
  if (countries.length === 0) return 0;
  if (countries.length === 1) return 0;
  let idx = Math.floor(Math.random() * countries.length);
  let guard = 0;
  while (idx === avoidIndex && guard < 8) {
    idx = Math.floor(Math.random() * countries.length);
    guard += 1;
  }
  if (idx === avoidIndex) {
    idx = (avoidIndex + 1) % countries.length;
  }
  return idx;
}

/**
 * Picks an index with probability proportional to `weights[i]`.
 * Falls back to uniform {@link pickRandomCountryIndex} if lengths mismatch or weights invalid.
 */
export function pickRandomCountryIndexWeighted(
  countries: Country[],
  weights: number[],
  avoidIndex?: number,
): number {
  if (countries.length === 0) return 0;
  if (countries.length === 1) return 0;
  if (weights.length !== countries.length) {
    return pickRandomCountryIndex(countries, avoidIndex);
  }
  const safe = weights.map((w) =>
    typeof w === "number" && Number.isFinite(w) && w > 0 ? w : 1,
  );
  let guard = 0;
  while (guard < 12) {
    const sum = safe.reduce((a, b) => a + b, 0);
    if (sum <= 0) return pickRandomCountryIndex(countries, avoidIndex);
    let r = Math.random() * sum;
    let idx = 0;
    for (let i = 0; i < safe.length; i++) {
      r -= safe[i];
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    if (idx !== avoidIndex || countries.length === 1) {
      if (idx === avoidIndex) {
        idx = (avoidIndex + 1) % countries.length;
      }
      return idx;
    }
    guard += 1;
  }
  return pickRandomCountryIndex(countries, avoidIndex);
}
