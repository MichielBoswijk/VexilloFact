/**
 * Approximate parent / sovereign-state for non-independent territories and
 * dependencies. Keyed by ISO 3166-1 alpha-3 (cca3).
 *
 * Notes:
 * - Some entries (e.g. Crown Dependencies, Cook Islands/Niue) are nuanced
 *   constitutional cases; we use the country most people associate them with.
 * - Disputed/uncertain cases are intentionally omitted so we don't take a side.
 */
export const TERRITORY_PARENT: Record<string, string> = {
  PRI: "United States",
  GUM: "United States",
  VIR: "United States",
  ASM: "United States",
  MNP: "United States",
  UMI: "United States",

  HKG: "China",
  MAC: "China",

  GRL: "Denmark",
  FRO: "Denmark",

  ABW: "Netherlands",
  CUW: "Netherlands",
  SXM: "Netherlands",
  BES: "Netherlands",

  GUF: "France",
  GLP: "France",
  MTQ: "France",
  REU: "France",
  MYT: "France",
  BLM: "France",
  MAF: "France",
  SPM: "France",
  WLF: "France",
  PYF: "France",
  NCL: "France",
  ATF: "France",

  AIA: "United Kingdom",
  BMU: "United Kingdom",
  VGB: "United Kingdom",
  CYM: "United Kingdom",
  FLK: "United Kingdom",
  GIB: "United Kingdom",
  IOT: "United Kingdom",
  MSR: "United Kingdom",
  PCN: "United Kingdom",
  SHN: "United Kingdom",
  TCA: "United Kingdom",
  SGS: "United Kingdom",
  GGY: "United Kingdom",
  JEY: "United Kingdom",
  IMN: "United Kingdom",

  COK: "New Zealand",
  NIU: "New Zealand",
  TKL: "New Zealand",

  NFK: "Australia",
  CCK: "Australia",
  CXR: "Australia",
  HMD: "Australia",

  ALA: "Finland",

  SJM: "Norway",
  BVT: "Norway",
};

export function getParentCountry(cca3: string | undefined): string | null {
  if (!cca3) return null;
  return TERRITORY_PARENT[cca3.toUpperCase()] ?? null;
}
