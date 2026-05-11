"use client";

import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Flag } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CountryDetails } from "@/components/CountryDetails";
import {
  type Country,
  fetchCountries,
  pickRandomCountryIndex,
} from "@/lib/countries";
import { getCountrySuggestions } from "@/lib/countrySuggestions";
import {
  playCorrectSound,
  playWrongSound,
  vibrateWin,
  vibrateWrong,
} from "@/lib/gameSounds";
import { countryNameMatchesGuess } from "@/lib/guessMatch";
import {
  resolveWrongGuessFlag,
  type WrongGuessFlag,
} from "@/lib/findGuessCountry";
import {
  applyLoss,
  applyWin,
  loadStreaks,
  type StreakSnapshot,
} from "@/lib/streakStorage";

const INITIAL_ATTEMPTS = 3;

type GameState = "playing" | "won" | "lost";

function wrongForSlot(
  i: number,
  attemptsLeft: number,
  wrongGuesses: WrongGuessFlag[],
): WrongGuessFlag | undefined {
  if (i < attemptsLeft) return undefined;
  const idx = wrongGuesses.length - (INITIAL_ATTEMPTS - i);
  if (idx < 0 || idx >= wrongGuesses.length) return undefined;
  return wrongGuesses[idx];
}

function LifeSlot({
  remainingLife,
  wrong,
  pulseToken,
  index,
}: {
  remainingLife: boolean;
  wrong?: WrongGuessFlag;
  pulseToken: number;
  index: number;
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (!remainingLife || pulseToken === 0) return;
    void controls.start({
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.07,
      },
    });
  }, [pulseToken, remainingLife, controls, index]);

  const lost = !remainingLife;
  const showFlag = lost && wrong?.png;

  return (
    <motion.div
      animate={controls}
      title={lost && wrong?.label ? `Guess: ${wrong.label}` : undefined}
      className={`relative flex h-10 w-11 items-center justify-center overflow-hidden rounded-lg border shadow-sm ${
        remainingLife
          ? "border-emerald-200/80 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-900/10 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/30"
          : showFlag
            ? "border-2 border-rose-500 ring-2 ring-rose-400/30 dark:border-rose-400 dark:ring-rose-500/25"
            : "border-2 border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/40"
      }`}
      aria-hidden
    >
      {showFlag ? (
        <Image
          src={wrong.png!}
          alt=""
          fill
          className="object-cover"
          sizes="44px"
        />
      ) : lost ? (
        <span className="px-1 text-center text-[10px] font-bold leading-tight text-rose-600 dark:text-rose-300">
          ?
        </span>
      ) : (
        <Flag className="h-5 w-5" strokeWidth={2.25} />
      )}
      <span className="sr-only">
        {remainingLife ? "Attempt remaining" : "Wrong attempt"}
      </span>
    </motion.div>
  );
}

export function GameContainer() {
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [userGuess, setUserGuess] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(INITIAL_ATTEMPTS);
  const [gameState, setGameState] = useState<GameState>("playing");

  const [streaks, setStreaks] = useState<StreakSnapshot>({
    current: 0,
    high: 0,
  });
  const [lifePulseToken, setLifePulseToken] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState<WrongGuessFlag[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputShake = useAnimation();

  useEffect(() => {
    setStreaks(loadStreaks());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCountries();
        if (cancelled) return;
        setCountries(list);
        setIndex(pickRandomCountryIndex(list));
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

  useEffect(() => {
    if (gameState === "playing" && !loading && countries?.length) {
      inputRef.current?.focus();
    }
  }, [gameState, loading, countries, index]);

  const suggestions = useMemo(
    () =>
      countries?.length
        ? getCountrySuggestions(countries, userGuess)
        : [],
    [countries, userGuess],
  );

  const startNewRound = useCallback(() => {
    if (!countries?.length) return;
    setUserGuess("");
    setAttemptsLeft(INITIAL_ATTEMPTS);
    setGameState("playing");
    setSuggestOpen(false);
    setWrongGuesses([]);
    void inputShake.set({ x: 0 });
    setIndex((prev) => pickRandomCountryIndex(countries, prev));
  }, [countries, inputShake]);

  const submitGuess = useCallback(async () => {
    if (gameState !== "playing" || !countries?.length) return;
    const country = countries[index];
    if (!country) return;

    const trimmed = userGuess.trim();
    if (!trimmed) return;

    if (countryNameMatchesGuess(trimmed, country.name.common)) {
      setStreaks((s) => applyWin(s));
      void playCorrectSound();
      vibrateWin();
      setGameState("won");
      setSuggestOpen(false);
      return;
    }

    setWrongGuesses((prev) => [
      ...prev,
      resolveWrongGuessFlag(countries, trimmed, country),
    ]);

    void playWrongSound();
    vibrateWrong();
    setLifePulseToken((t) => t + 1);
    await inputShake.start({
      x: [0, -11, 11, -9, 9, -5, 5, 0],
      transition: { duration: 0.48, ease: "easeInOut" },
    });
    void inputShake.set({ x: 0 });

    const nextAttempts = attemptsLeft - 1;
    if (nextAttempts <= 0) {
      setAttemptsLeft(0);
      setStreaks((s) => applyLoss(s));
      setGameState("lost");
    } else {
      setAttemptsLeft(nextAttempts);
    }
    setUserGuess("");
  }, [
    gameState,
    countries,
    index,
    userGuess,
    attemptsLeft,
    inputShake,
  ]);

  const scheduleBlurClose = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => setSuggestOpen(false), 160);
  };

  const cancelBlurClose = () => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  };

  useEffect(() => () => cancelBlurClose(), []);

  if (loading) {
    return (
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Loading flags…
      </p>
    );
  }

  if (error) {
    return (
      <p
        className="text-center text-sm text-red-700 dark:text-red-400"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (!countries?.length) {
    return (
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        No countries found.
      </p>
    );
  }

  const country = countries[index];
  const src = country?.flags?.png;

  if (!country || !src) {
    return (
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        No flag image for this entry.
      </p>
    );
  }

  const playing = gameState === "playing";

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2.5 text-center shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Streaks
        </p>
        <div className="mt-1 flex items-center justify-center gap-4 text-sm">
          <span className="text-slate-600 dark:text-slate-300">
            Current{" "}
            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
              {streaks.current}
            </span>
          </span>
          <span className="h-4 w-px bg-slate-200 dark:bg-slate-600" aria-hidden />
          <span className="text-slate-600 dark:text-slate-300">
            Best{" "}
            <span className="font-semibold tabular-nums text-indigo-700 dark:text-indigo-300">
              {streaks.high}
            </span>
          </span>
        </div>
      </div>

      <div
        className="flex justify-center gap-2"
        role="status"
        aria-label={`${attemptsLeft} of ${INITIAL_ATTEMPTS} attempts remaining`}
      >
        {Array.from({ length: INITIAL_ATTEMPTS }, (_, i) => {
          const remainingLife = i < attemptsLeft;
          const wrong = wrongForSlot(i, attemptsLeft, wrongGuesses);
          return (
            <LifeSlot
              key={i}
              index={i}
              remainingLife={remainingLife}
              wrong={wrong}
              pulseToken={lifePulseToken}
            />
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800/80"
            initial={{ opacity: 0, x: 56 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 30,
              mass: 0.85,
            }}
          >
            <Image
              src={src}
              alt="Mystery flag — guess the country"
              fill
              className="object-contain p-4"
              sizes="(max-width: 384px) 100vw, 384px"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(gameState === "won" || gameState === "lost") && (
          <CountryDetails
            key={`${index}-${gameState}`}
            gameState={gameState}
            country={country}
            flagSrc={src}
            onPlayAgain={startNewRound}
          />
        )}
      </AnimatePresence>

      {playing && (
        <div className="flex flex-col gap-3">
          <label htmlFor="country-guess" className="sr-only">
            Country name
          </label>
          <div className="relative">
            <motion.div animate={inputShake} className="relative z-10">
              <input
                ref={inputRef}
                id="country-guess"
                type="text"
                name="country-guess"
                autoComplete="off"
                autoCapitalize="words"
                enterKeyHint="done"
                placeholder="Which country is this?"
                value={userGuess}
                onChange={(e) => {
                  setUserGuess(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => {
                  cancelBlurClose();
                  setSuggestOpen(true);
                }}
                onBlur={scheduleBlurClose}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void submitGuess();
                  }
                }}
                disabled={!playing}
                className="w-full min-h-[52px] rounded-xl border-2 border-slate-200 bg-white px-4 text-xl text-slate-900 shadow-sm outline-none ring-slate-900/10 placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
              />
            </motion.div>

            {suggestOpen && suggestions.length > 0 && (
              <div
                className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-900"
                role="menu"
                aria-label="Country suggestions"
                onMouseDown={cancelBlurClose}
              >
                {suggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="menuitem"
                    className="flex w-full min-h-[48px] items-center px-4 text-left text-base text-slate-800 hover:bg-slate-50 active:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setUserGuess(name);
                      setSuggestOpen(false);
                      requestAnimationFrame(() => inputRef.current?.focus());
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => void submitGuess()}
            disabled={!playing || !userGuess.trim()}
            className="min-h-[52px] w-full rounded-xl bg-slate-900 px-4 py-3 text-lg font-semibold text-white transition-colors hover:bg-slate-800 active:bg-slate-950 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:active:bg-indigo-700 dark:disabled:bg-slate-600"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
