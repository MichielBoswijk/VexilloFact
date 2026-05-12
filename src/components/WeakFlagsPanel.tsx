"use client";

import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Country } from "@/lib/countries";
import {
  clearGuessStats,
  type GuessStatsRoot,
} from "@/lib/guessStatsStorage";
import type { GameMode } from "@/lib/gameMode";
import {
  getWeakFlagsForMode,
  topConfusionsForAnswer,
  weaknessScore,
} from "@/lib/weakFlags";

type Props = {
  mode: GameMode;
  eligibleCountries: Country[];
  guessStats: GuessStatsRoot;
  onStatsChange: () => void;
  onEnablePracticeWeak?: () => void;
};

export function WeakFlagsPanel({
  mode,
  eligibleCountries,
  guessStats,
  onStatsChange,
  onEnablePracticeWeak,
}: Props) {
  const [open, setOpen] = useState(true);

  const nameByCca3 = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of eligibleCountries) {
      m.set(c.cca3, c.name.common);
    }
    return m;
  }, [eligibleCountries]);

  const weak = useMemo(
    () => getWeakFlagsForMode(eligibleCountries, guessStats, mode),
    [eligibleCountries, guessStats, mode],
  );

  if (!eligibleCountries.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
        aria-expanded={open}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Your weak flags
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-200/80 px-3 pb-3 pt-1 dark:border-slate-700">
          {weak.length === 0 ? (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              A flag is listed when you have finished at least two rounds with it as the answer and
              your weakness score is still positive (wrong submits, losses, and skips outweigh wins).
              It drops off when the score reaches zero or below.
            </p>
          ) : (
            <ul className="flex max-h-64 flex-col gap-2 overflow-auto">
              {weak.map((entry) => {
                const png = entry.country.flags?.png;
                const confusions = topConfusionsForAnswer(
                  guessStats,
                  mode,
                  entry.cca3,
                  nameByCca3,
                  2,
                );
                return (
                  <li
                    key={entry.cca3}
                    className="flex gap-2 rounded-lg border border-slate-100 bg-white/90 px-2 py-2 dark:border-slate-600 dark:bg-slate-900/80"
                  >
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
                      {png ? (
                        <Image
                          src={png}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-slate-400">
                          —
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {entry.country.name.common}
                      </p>
                      <p className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                        score {weaknessScore(entry.stats)} · W{entry.stats.wins} L
                        {entry.stats.losses} · wrong {entry.stats.wrongSubmits} · skip{" "}
                        {entry.stats.skips}
                      </p>
                      {confusions.length > 0 && (
                        <p className="mt-0.5 text-[11px] leading-snug text-indigo-700 dark:text-indigo-300">
                          Often confused with:{" "}
                          {confusions.map((c, i) => (
                            <span key={c.guessedCca3}>
                              {i > 0 ? "; " : ""}
                              {c.label} ({c.count})
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {onEnablePracticeWeak && weak.length > 0 && (
              <button
                type="button"
                onClick={onEnablePracticeWeak}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Practice weak flags
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (
                  typeof window !== "undefined" &&
                  !window.confirm("Clear all guess stats and confusion data on this device?")
                ) {
                  return;
                }
                clearGuessStats();
                onStatsChange();
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Clear stats
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
