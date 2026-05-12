/**
 * Approximate religious composition by country, keyed by ISO 3166-1 alpha-3 (cca3).
 *
 * Numbers are rough rounded percentages drawn from widely-cited surveys
 * (Pew Research Center, national census summaries, CIA World Factbook).
 * They are educational approximations, not authoritative statistics, and may
 * not sum to exactly 100 due to rounding or "Other" categories.
 */
export type ReligionEntry = {
  name: string;
  share: number;
};

export const COUNTRY_RELIGIONS: Record<string, ReligionEntry[]> = {
  USA: [
    { name: "Christian", share: 63 },
    { name: "Unaffiliated", share: 29 },
    { name: "Jewish", share: 2 },
    { name: "Other / not stated", share: 6 },
  ],
  GBR: [
    { name: "Christian", share: 46 },
    { name: "Unaffiliated", share: 37 },
    { name: "Muslim", share: 7 },
    { name: "Hindu / Sikh / Other", share: 10 },
  ],
  FRA: [
    { name: "Christian", share: 47 },
    { name: "Unaffiliated", share: 40 },
    { name: "Muslim", share: 9 },
    { name: "Other", share: 4 },
  ],
  DEU: [
    { name: "Christian", share: 53 },
    { name: "Unaffiliated", share: 39 },
    { name: "Muslim", share: 6 },
    { name: "Other", share: 2 },
  ],
  ITA: [
    { name: "Christian", share: 80 },
    { name: "Unaffiliated", share: 15 },
    { name: "Muslim", share: 3 },
    { name: "Other", share: 2 },
  ],
  ESP: [
    { name: "Christian", share: 64 },
    { name: "Unaffiliated", share: 31 },
    { name: "Muslim", share: 3 },
    { name: "Other", share: 2 },
  ],
  JPN: [
    { name: "Shinto / folk", share: 48 },
    { name: "Buddhist", share: 36 },
    { name: "Unaffiliated", share: 13 },
    { name: "Other", share: 3 },
  ],
  CHN: [
    { name: "Unaffiliated / folk", share: 75 },
    { name: "Buddhist", share: 18 },
    { name: "Christian", share: 5 },
    { name: "Muslim / Other", share: 2 },
  ],
  BRA: [
    { name: "Christian", share: 86 },
    { name: "Unaffiliated", share: 9 },
    { name: "Spiritist / Afro-Brazilian", share: 4 },
    { name: "Other", share: 1 },
  ],
  IND: [
    { name: "Hindu", share: 80 },
    { name: "Muslim", share: 14 },
    { name: "Christian", share: 2 },
    { name: "Sikh / Other", share: 4 },
  ],
  CAN: [
    { name: "Christian", share: 53 },
    { name: "Unaffiliated", share: 35 },
    { name: "Muslim", share: 5 },
    { name: "Hindu / Sikh / Other", share: 7 },
  ],
  AUS: [
    { name: "Christian", share: 44 },
    { name: "Unaffiliated", share: 39 },
    { name: "Muslim / Hindu / Buddhist", share: 10 },
    { name: "Other / not stated", share: 7 },
  ],
  MEX: [
    { name: "Christian", share: 90 },
    { name: "Unaffiliated", share: 8 },
    { name: "Other", share: 2 },
  ],
  NLD: [
    { name: "Unaffiliated", share: 55 },
    { name: "Christian", share: 39 },
    { name: "Muslim", share: 5 },
    { name: "Other", share: 1 },
  ],
  SWE: [
    { name: "Christian", share: 60 },
    { name: "Unaffiliated", share: 31 },
    { name: "Muslim", share: 8 },
    { name: "Other", share: 1 },
  ],
  NOR: [
    { name: "Christian", share: 67 },
    { name: "Unaffiliated", share: 25 },
    { name: "Muslim", share: 4 },
    { name: "Other", share: 4 },
  ],
  KOR: [
    { name: "Unaffiliated", share: 56 },
    { name: "Christian", share: 28 },
    { name: "Buddhist", share: 15 },
    { name: "Other", share: 1 },
  ],
  ARG: [
    { name: "Christian", share: 80 },
    { name: "Unaffiliated", share: 18 },
    { name: "Other", share: 2 },
  ],
  ZAF: [
    { name: "Christian", share: 81 },
    { name: "Unaffiliated", share: 11 },
    { name: "Traditional African", share: 5 },
    { name: "Muslim / Hindu / Other", share: 3 },
  ],
  EGY: [
    { name: "Muslim", share: 90 },
    { name: "Christian", share: 10 },
  ],
  NGA: [
    { name: "Muslim", share: 50 },
    { name: "Christian", share: 47 },
    { name: "Traditional / Other", share: 3 },
  ],
  TUR: [
    { name: "Muslim", share: 96 },
    { name: "Unaffiliated", share: 3 },
    { name: "Christian / Other", share: 1 },
  ],
  POL: [
    { name: "Christian", share: 88 },
    { name: "Unaffiliated", share: 11 },
    { name: "Other", share: 1 },
  ],
  PRT: [
    { name: "Christian", share: 82 },
    { name: "Unaffiliated", share: 16 },
    { name: "Other", share: 2 },
  ],
  GRC: [
    { name: "Christian (Greek Orthodox)", share: 88 },
    { name: "Unaffiliated", share: 7 },
    { name: "Muslim", share: 4 },
    { name: "Other", share: 1 },
  ],
  AUT: [
    { name: "Christian", share: 64 },
    { name: "Unaffiliated", share: 26 },
    { name: "Muslim", share: 8 },
    { name: "Other", share: 2 },
  ],
  CHE: [
    { name: "Christian", share: 63 },
    { name: "Unaffiliated", share: 30 },
    { name: "Muslim", share: 5 },
    { name: "Other", share: 2 },
  ],
  BEL: [
    { name: "Christian", share: 63 },
    { name: "Unaffiliated", share: 27 },
    { name: "Muslim", share: 8 },
    { name: "Other", share: 2 },
  ],
  FIN: [
    { name: "Christian", share: 67 },
    { name: "Unaffiliated", share: 30 },
    { name: "Other", share: 3 },
  ],
  IRL: [
    { name: "Christian", share: 77 },
    { name: "Unaffiliated", share: 18 },
    { name: "Muslim", share: 2 },
    { name: "Other", share: 3 },
  ],
  NZL: [
    { name: "Christian", share: 38 },
    { name: "Unaffiliated", share: 49 },
    { name: "Hindu / Muslim / Other", share: 10 },
    { name: "Māori spiritual", share: 3 },
  ],
  SGP: [
    { name: "Buddhist", share: 31 },
    { name: "Christian", share: 19 },
    { name: "Muslim", share: 16 },
    { name: "Taoist / Folk", share: 9 },
    { name: "Unaffiliated", share: 20 },
    { name: "Hindu / Other", share: 5 },
  ],
  THA: [
    { name: "Buddhist", share: 93 },
    { name: "Muslim", share: 5 },
    { name: "Christian / Other", share: 2 },
  ],
  VNM: [
    { name: "Unaffiliated / Folk", share: 73 },
    { name: "Buddhist", share: 15 },
    { name: "Christian", share: 9 },
    { name: "Other", share: 3 },
  ],
  IDN: [
    { name: "Muslim", share: 87 },
    { name: "Christian", share: 10 },
    { name: "Hindu", share: 2 },
    { name: "Buddhist / Other", share: 1 },
  ],
  MYS: [
    { name: "Muslim", share: 64 },
    { name: "Buddhist", share: 19 },
    { name: "Christian", share: 9 },
    { name: "Hindu", share: 6 },
    { name: "Other", share: 2 },
  ],
  PHL: [
    { name: "Christian", share: 90 },
    { name: "Muslim", share: 6 },
    { name: "Folk / Other", share: 4 },
  ],
  PAK: [
    { name: "Muslim", share: 96 },
    { name: "Hindu", share: 2 },
    { name: "Christian / Other", share: 2 },
  ],
  SAU: [
    { name: "Muslim", share: 93 },
    { name: "Christian / Other", share: 7 },
  ],
  ARE: [
    { name: "Muslim", share: 76 },
    { name: "Christian", share: 12 },
    { name: "Hindu / Buddhist", share: 10 },
    { name: "Other", share: 2 },
  ],
  RUS: [
    { name: "Christian", share: 73 },
    { name: "Unaffiliated", share: 15 },
    { name: "Muslim", share: 10 },
    { name: "Other", share: 2 },
  ],
  UKR: [
    { name: "Christian", share: 85 },
    { name: "Unaffiliated", share: 12 },
    { name: "Other", share: 3 },
  ],
  CHL: [
    { name: "Christian", share: 67 },
    { name: "Unaffiliated", share: 30 },
    { name: "Other", share: 3 },
  ],
  COL: [
    { name: "Christian", share: 87 },
    { name: "Unaffiliated", share: 11 },
    { name: "Other", share: 2 },
  ],
  PER: [
    { name: "Christian", share: 90 },
    { name: "Unaffiliated", share: 8 },
    { name: "Other", share: 2 },
  ],
  KEN: [
    { name: "Christian", share: 85 },
    { name: "Muslim", share: 11 },
    { name: "Traditional / Other", share: 4 },
  ],
  MAR: [
    { name: "Muslim", share: 99 },
    { name: "Other", share: 1 },
  ],
  ISR: [
    { name: "Jewish", share: 74 },
    { name: "Muslim", share: 18 },
    { name: "Christian / Druze / Other", share: 8 },
  ],
  CZE: [
    { name: "Unaffiliated", share: 68 },
    { name: "Christian", share: 22 },
    { name: "Other", share: 10 },
  ],
  DNK: [
    { name: "Christian", share: 74 },
    { name: "Unaffiliated", share: 19 },
    { name: "Muslim", share: 5 },
    { name: "Other", share: 2 },
  ],
};

export function getReligions(
  cca3: string | undefined,
): ReligionEntry[] | null {
  if (!cca3) return null;
  const entries = COUNTRY_RELIGIONS[cca3.toUpperCase()];
  return entries && entries.length ? entries : null;
}
