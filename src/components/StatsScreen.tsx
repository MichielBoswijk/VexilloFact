"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GuessStatsPanel } from "@/components/GuessStatsPanel";
import { WeakFlagsPanel } from "@/components/WeakFlagsPanel";
import {
  type Country,
  fetchCountries,
} from "@/lib/countries";
import { filterByMode, type GameMode, loadGameMode } from "@/lib/gameMode";
import {
  loadGuessStats,
  type GuessStatsRoot,
} from "@/lib/guessStatsStorage";
import { savePracticeWeak } from "@/lib/practiceWeakStorage";

export function StatsScreen() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<GameMode>(() => loadGameMode());
  const [guessStats, setGuessStats] = useState<GuessStatsRoot>(() =>
    loadGuessStats(),
  );

  const refreshGuessStats = useCallback(() => {
    setGuessStats(loadGuessStats());
  }, []);

  const syncModeFromStorage = useCallback(() => {
    setMode(loadGameMode());
  }, []);

  useEffect(() => {
    const onFocus = () => syncModeFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "vexillo-mode") syncModeFromStorage();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [syncModeFromStorage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCountries();
        if (cancelled) return;
        setCountries(list);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const eligibleCountries = useMemo(
    () => (countries ? filterByMode(countries, mode) : []),
    [countries, mode],
  );

  if (loading) {
    return (
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Loading…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-sm text-red-700 dark:text-red-400" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <GuessStatsPanel mode={mode} guessStats={guessStats} />
      {eligibleCountries.length > 0 ? (
        <WeakFlagsPanel
          mode={mode}
          eligibleCountries={eligibleCountries}
          guessStats={guessStats}
          onStatsChange={refreshGuessStats}
          onEnablePracticeWeak={() => {
            savePracticeWeak(true);
            router.push("/settings");
          }}
        />
      ) : (
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          No flags in this mode — change game mode in settings.
        </p>
      )}
    </div>
  );
}
