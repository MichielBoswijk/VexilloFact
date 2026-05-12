import type { Country } from "@/lib/countries";

export type GameMode = "independent" | "territories" | "both";

export const DEFAULT_MODE: GameMode = "independent";

export const GAME_MODES: { id: GameMode; label: string; hint: string }[] = [
  {
    id: "independent",
    label: "Countries",
    hint: "Independent, sovereign nations only",
  },
  {
    id: "territories",
    label: "Territories",
    hint: "Dependencies and non-independent territories only",
  },
  {
    id: "both",
    label: "All",
    hint: "Every flag in the dataset",
  },
];

const STORAGE_KEY = "vexillo-mode";

export function loadGameMode(): GameMode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "independent" || raw === "territories" || raw === "both") {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_MODE;
}

export function saveGameMode(mode: GameMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function filterByMode(countries: Country[], mode: GameMode): Country[] {
  if (mode === "both") return countries;
  if (mode === "independent") return countries.filter((c) => c.independent);
  return countries.filter((c) => !c.independent);
}
