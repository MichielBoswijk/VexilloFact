"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { Country } from "@/lib/countries";
import { CountryLearnPanel } from "@/components/CountryLearnPanel";

type GameOutcome = "won" | "lost";

type CountryDetailsProps = {
  gameState: GameOutcome;
  country: Country;
  flagSrc: string;
  /** Lives still available when the round ended (0 = used them all). */
  attemptsLeft: number;
  onPlayAgain: () => void;
  /** Optional copy overrides for marathon / custom flows. */
  resultTitle?: string;
  resultDescription?: ReactNode;
  playAgainLabel?: string;
};

const WIN_SPARKLES = [
  { left: "8%", top: "18%", delay: 0, size: 6 },
  { left: "22%", top: "8%", delay: 0.05, size: 5 },
  { left: "78%", top: "12%", delay: 0.08, size: 7 },
  { left: "88%", top: "28%", delay: 0.03, size: 5 },
  { left: "12%", top: "42%", delay: 0.1, size: 4 },
  { left: "92%", top: "48%", delay: 0.06, size: 6 },
  { left: "48%", top: "6%", delay: 0.12, size: 5 },
];

export function CountryDetails({
  gameState,
  country,
  flagSrc,
  attemptsLeft,
  onPlayAgain,
  resultTitle,
  resultDescription,
  playAgainLabel,
}: CountryDetailsProps) {
  const playAgainRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => playAgainRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, []);

  const won = gameState === "won";
  const usedAllLives = attemptsLeft <= 0;
  const continueLabel = playAgainLabel ?? (usedAllLives ? "Play Again" : "Next");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] dark:bg-black/70"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative flex max-h-[min(92dvh,720px)] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.18)] dark:bg-slate-900 dark:shadow-[0_-8px_40px_rgba(0,0,0,0.45)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vexillo-result-title"
        aria-describedby="vexillo-result-desc"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
      >
        <div className="flex shrink-0 justify-center pt-3 pb-1">
          <div
            className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-600"
            aria-hidden
          />
        </div>

        <div
          className={`relative shrink-0 overflow-hidden px-5 pb-4 pt-3 text-center ${
            won ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          {won && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {WIN_SPARKLES.map((s, i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full bg-white/90 shadow-sm"
                  style={{
                    left: s.left,
                    top: s.top,
                    width: s.size,
                    height: s.size,
                  }}
                  initial={{ opacity: 0, scale: 0, y: 12 }}
                  animate={{
                    opacity: [0, 1, 0.85, 0],
                    scale: [0, 1.4, 1, 0.6],
                    y: [12, -6, -18, -28],
                  }}
                  transition={{
                    duration: 1.35,
                    delay: s.delay,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={won ? { scale: 0.92, opacity: 0.85 } : { opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 22,
              delay: won ? 0.05 : 0,
            }}
            className="relative z-[1]"
          >
            <p
              id="vexillo-result-title"
              className="text-2xl font-bold tracking-tight"
            >
              {resultTitle ?? (won ? "Correct!" : "Incorrect")}
            </p>
            <p id="vexillo-result-desc" className="mt-1 text-base text-white/90">
              {resultDescription ??
                (won ? (
                  <>
                    You identified{" "}
                    <span className="font-semibold">{country.name.common}</span>.
                  </>
                ) : (
                  <>
                    The answer was{" "}
                    <span className="font-semibold">{country.name.common}</span>.
                  </>
                ))}
            </p>
          </motion.div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-4">
          <CountryLearnPanel country={country} flagSrc={flagSrc} hideHeading />
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 dark:border-slate-700 dark:bg-slate-900">
          <button
            ref={playAgainRef}
            type="button"
            onClick={onPlayAgain}
            className={`min-h-[52px] w-full rounded-xl px-4 py-3 text-lg font-semibold text-white shadow-md transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${
              won
                ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500"
                : "bg-rose-700 hover:bg-rose-800 active:bg-rose-900 focus-visible:ring-rose-400"
            }`}
          >
            {continueLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
