/** Approximate total area of Texas (km²) — handy global yardstick. */
const TEXAS_AREA_KM2 = 696_200;

function formatKm2(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    n,
  );
}

function sizeTier(area: number): "small" | "medium" | "large" | "very large" {
  if (area >= 3_000_000) return "very large";
  if (area >= 800_000) return "large";
  if (area >= 120_000) return "medium";
  return "small";
}

/**
 * Human-readable land area: km² + size tier + optional Texas-style comparison.
 */
export function describeAreaRelatable(area: number | undefined): string {
  if (typeof area !== "number" || !Number.isFinite(area) || area <= 0) {
    return "Land area isn’t listed for this territory.";
  }

  const rounded = Math.round(area);
  const formatted = formatKm2(rounded);
  const tier = sizeTier(area);
  const ratio = area / TEXAS_AREA_KM2;

  let extra = "";
  if (ratio >= 2.2) {
    extra = ` That’s roughly ${Math.round(ratio)} times the land area of Texas.`;
  } else if (ratio >= 1.15) {
    extra = " That’s comparable to Texas — one of the largest U.S. states.";
  } else if (ratio >= 0.55) {
    extra = " That’s a bit more than half the size of Texas.";
  } else if (ratio >= 0.28) {
    extra = " That’s around a quarter to a third the size of Texas.";
  } else if (ratio <= 0.12 && area >= 50_000) {
    extra = " That’s well under one-tenth the size of Texas — still a sizable country globally.";
  } else if (area < 50_000) {
    extra = " On a world map it’s a compact country — many island nations are smaller still.";
  }

  return `${formatted} km² — a ${tier} country by land area.${extra}`;
}
