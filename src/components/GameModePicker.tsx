"use client";

import { GAME_MODES, type GameMode } from "@/lib/gameMode";

type Props = {
  value: GameMode;
  onChange: (mode: GameMode) => void;
  practiceWeak?: boolean;
  onPracticeWeakChange?: (value: boolean) => void;
};

export function GameModePicker({
  value,
  onChange,
  practiceWeak,
  onPracticeWeakChange,
}: Props) {
  return (
    <div
      className="rounded-2xl border border-slate-200/80 bg-white/70 px-2 py-2 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70"
      role="group"
      aria-label="Game mode"
    >
      <div className="grid grid-cols-3 gap-1">
        {GAME_MODES.map((m) => {
          const active = m.id === value;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              aria-pressed={active}
              title={m.hint}
              className={`min-h-[36px] rounded-xl px-2 text-xs font-semibold tracking-wide transition-colors ${
                active
                  ? "bg-slate-900 text-white shadow-sm dark:bg-indigo-500"
                  : "text-slate-600 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      {onPracticeWeakChange && (
        <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 border-t border-slate-200/80 px-2 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
            checked={!!practiceWeak}
            onChange={(e) => onPracticeWeakChange(e.target.checked)}
          />
          <span title="New flags favor countries you miss more often">
            Practice weak flags
          </span>
        </label>
      )}
    </div>
  );
}
