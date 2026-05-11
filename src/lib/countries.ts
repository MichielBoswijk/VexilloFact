/** Public API requires `fields` on `/all` (max 10 fields). */
export const REST_COUNTRIES_URL =
  "https://restcountries.com/v3.1/all?fields=name,flags,cca3,capital,population,region,subregion,currencies,languages,area";

export type Country = {
  cca3: string;
  name: { common: string };
  flags?: { png?: string; alt?: string };
  capital?: string[];
  population: number;
  region: string;
  subregion?: string;
  currencies?: Record<string, { name: string; symbol?: string }>;
  languages?: Record<string, string>;
  area?: number;
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
  return true;
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
  return data.filter(isCountry);
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
