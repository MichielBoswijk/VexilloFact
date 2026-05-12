"use client";

import { useCallback, useEffect, useState } from "react";
import { GameModePicker } from "@/components/GameModePicker";
import { type GameMode, loadGameMode, saveGameMode } from "@/lib/gameMode";
import {
  type GamePace,
  loadGamePace,
  saveGamePace,
} from "@/lib/gamePaceStorage";
import { loadPracticeWeak, savePracticeWeak } from "@/lib/practiceWeakStorage";

export function SettingsScreen() {
  const [mode, setMode] = useState<GameMode>(() => loadGameMode());
  const [practiceWeak, setPracticeWeak] = useState(() => loadPracticeWeak());
  const [gamePace, setGamePace] = useState<GamePace>(() => loadGamePace());

  const syncFromStorage = useCallback(() => {
    setMode(loadGameMode());
    setPracticeWeak(loadPracticeWeak());
    setGamePace(loadGamePace());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "vexillo-mode" ||
        e.key === "vexillo-practice-weak" ||
        e.key === "vexillo-game-pace"
      ) {
        syncFromStorage();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncFromStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncFromStorage);
    };
  }, [syncFromStorage]);

  const handleModeChange = useCallback((next: GameMode) => {
    setMode(next);
    saveGameMode(next);
  }, []);

  const handlePracticeWeakChange = useCallback((value: boolean) => {
    savePracticeWeak(value);
    setPracticeWeak(value);
  }, []);

  const handlePaceChange = useCallback((pace: GamePace) => {
    saveGamePace(pace);
    setGamePace(pace);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-3 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Game pace
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Fast keeps the marathon lean. Casual shows facts after guesses and tiny
          flags on spent lives while you play.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handlePaceChange("fast")}
            aria-pressed={gamePace === "fast"}
            className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
              gamePace === "fast"
                ? "border-indigo-500 bg-indigo-50 font-semibold text-indigo-950 ring-2 ring-indigo-400/40 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-50"
                : "border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <span className="block font-semibold">Fast</span>
            <span className="mt-0.5 block text-xs font-normal text-slate-600 dark:text-slate-400">
              Results sheet only when the run ends — quick guessing.
            </span>
          </button>
          <button
            type="button"
            onClick={() => handlePaceChange("casual")}
            aria-pressed={gamePace === "casual"}
            className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
              gamePace === "casual"
                ? "border-indigo-500 bg-indigo-50 font-semibold text-indigo-950 ring-2 ring-indigo-400/40 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-50"
                : "border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <span className="block font-semibold">Casual</span>
            <span className="mt-0.5 block text-xs font-normal text-slate-600 dark:text-slate-400">
              Learn-more panel after each guess and wrong-flag thumbnails on used
              lives.
            </span>
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-3 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Game mode
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Which flags appear in the quiz.
        </p>
        <div className="mt-3">
          <GameModePicker
            value={mode}
            onChange={handleModeChange}
            practiceWeak={practiceWeak}
            onPracticeWeakChange={handlePracticeWeakChange}
          />
        </div>
      </section>
    </div>
  );
}
