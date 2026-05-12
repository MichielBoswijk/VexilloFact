"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { GuessStatsRoot, ModeStatsSummary } from "@/lib/guessStatsStorage";
import { summarizeStatsForMode } from "@/lib/guessStatsStorage";
import { GAME_MODES, type GameMode } from "@/lib/gameMode";

type Props = {
  mode: GameMode;
  guessStats: GuessStatsRoot;
};

function hasAnyActivity(s: ModeStatsSummary): boolean {
  return (
    s.roundsFinished > 0 ||
    s.wrongSubmits > 0 ||
    s.skips > 0 ||
    s.confusionEvents > 0
  );
}

export function GuessStatsPanel({ mode, guessStats }: Props) {
  const [open, setOpen] = useState(false);

  const byMode = useMemo(() => {
    const m = {} as Record<GameMode, ModeStatsSummary>;
    for (const { id } of GAME_MODES) {
      m[id] = summarizeStatsForMode(guessStats, id);
    }
    return m;
  }, [guessStats]);

  const anyStats = useMemo(
    () => GAME_MODES.some(({ id }) => hasAnyActivity(byMode[id])),
    [byMode],
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
        aria-expanded={open}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Your stats
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-200/80 px-3 pb-3 pt-1 dark:border-slate-700">
          {!anyStats ? (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Play a few rounds — round wins, losses, wrong guesses, and skips will show here for
              each game mode.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {GAME_MODES.map(({ id, label }) => {
                const s = byMode[id];
                const active = id === mode;
                const winRate =
                  s.roundsFinished > 0
                    ? Math.round((100 * s.wins) / s.roundsFinished)
                    : null;
                return (
                  <div
                    key={id}
                    className={`rounded-xl border px-2.5 py-2 text-sm ${
                      active
                        ? "border-indigo-300/80 bg-indigo-50/90 dark:border-indigo-500/40 dark:bg-indigo-950/40"
                        : "border-slate-100 bg-white/80 dark:border-slate-700 dark:bg-slate-900/60"
                    }`}
                  >
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {label}
                      {active && (
                        <span className="ml-1.5 font-normal text-indigo-600 dark:text-indigo-300">
                          (current)
                        </span>
                      )}
                    </p>
                    <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between gap-2 tabular-nums">
                        <dt>Rounds finished</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-100">
                          {s.roundsFinished}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2 tabular-nums">
                        <dt>Win rate</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-100">
                          {winRate === null ? "—" : `${winRate}%`}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2 tabular-nums">
                        <dt>Wins</dt>
                        <dd className="font-medium text-emerald-700 dark:text-emerald-400">
                          {s.wins}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2 tabular-nums">
                        <dt>Losses</dt>
                        <dd className="font-medium text-rose-700 dark:text-rose-400">
                          {s.losses}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2 tabular-nums">
                        <dt>Wrong guesses</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-100">
                          {s.wrongSubmits}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2 tabular-nums">
                        <dt>Skips</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-100">
                          {s.skips}
                        </dd>
                      </div>
                      <div className="col-span-2 flex justify-between gap-2 border-t border-slate-200/80 pt-1 tabular-nums dark:border-slate-600">
                        <dt>Resolved wrong-country picks</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-100">
                          {s.confusionEvents}
                        </dd>
                      </div>
                      <div className="col-span-2 flex justify-between gap-2 tabular-nums">
                        <dt>Flags with saved stats</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-100">
                          {s.flagsTracked}
                        </dd>
                      </div>
                    </dl>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
