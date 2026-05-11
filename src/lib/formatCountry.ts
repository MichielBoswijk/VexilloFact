import type { Country } from "@/lib/countries";

export function formatPopulation(n: number): string {
  return new Intl.NumberFormat(undefined).format(n);
}

export function formatCapital(country: Country): string {
  const c = country.capital?.filter(Boolean);
  if (c?.length) return c.join(", ");
  return "Not listed";
}

export function formatRegionLine(country: Country): string {
  const r = country.region?.trim();
  const s = country.subregion?.trim();
  if (r && s) return `${r} / ${s}`;
  if (r) return r;
  if (s) return s;
  return "—";
}

export function formatCurrencies(country: Country): string {
  const cur = country.currencies;
  if (!cur || Object.keys(cur).length === 0) return "—";
  return Object.entries(cur)
    .map(([code, v]) => {
      const sym = v.symbol ? ` (${v.symbol})` : "";
      return `${v.name} — ${code}${sym}`;
    })
    .join(", ");
}

export function formatLanguages(country: Country): string {
  const lang = country.languages;
  if (!lang || Object.keys(lang).length === 0) return "—";
  return Object.values(lang).join(", ");
}
