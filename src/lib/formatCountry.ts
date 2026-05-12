import type { Country } from "@/lib/countries";
import { getParentCountry } from "@/data/parentCountries";

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
  if (r) return r;
  return "—";
}

export function formatSovereignty(country: Country): string {
  if (country.independent) {
    if (country.unMember === true) {
      return "Independent country — UN member state";
    }
    if (country.unMember === false) {
      return "Independent country — not a UN member (e.g. observer or microstate)";
    }
    return "Independent country";
  }
  const parent = getParentCountry(country.cca3);
  if (parent) {
    return `Territory or dependency — part of ${parent}`;
  }
  return "Territory, dependency, or other non-independent entity";
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

