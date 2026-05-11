import type { Country } from "@/lib/countries";
import { COUNTRY_FACTS } from "@/data/facts";

function firstCurrency(country: Country): { name: string; symbol: string } | null {
  const cur = country.currencies;
  if (!cur) return null;
  const first = Object.values(cur)[0];
  if (!first?.name) return null;
  return {
    name: first.name,
    symbol: (first.symbol && first.symbol.trim()) || "—",
  };
}

function regionLabel(country: Country): string {
  const r = country.region?.trim();
  if (r) return r;
  return "its home region";
}

/**
 * Unique fact from `data/facts.ts` (cca3), or a dynamic sentence built from API fields.
 */
export function getCountryFactLine(country: Country): string {
  const code = country.cca3?.toUpperCase?.() ?? "";
  const handcrafted = code ? COUNTRY_FACTS[code] : undefined;
  if (handcrafted) return handcrafted;

  const name = country.name.common;
  const region = regionLabel(country);
  const cur = firstCurrency(country);

  if (cur) {
    return `${name} is located in ${region} and uses the ${cur.name} (${cur.symbol}).`;
  }

  return `${name} is located in ${region}.`;
}
