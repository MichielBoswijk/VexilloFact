"use client";

import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Flag, SkipForward } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CountryDetails } from "@/components/CountryDetails";
import { CountryLearnPanel } from "@/components/CountryLearnPanel";
import {
  type Country,
  fetchCountries,
} from "@/lib/countries";
import { getCountrySuggestions } from "@/lib/countrySuggestions";
import {
  filterByMode,
  type GameMode,
  loadGameMode,
} from "@/lib/gameMode";
import {
  playCorrectSound,
  playWrongSound,
  vibrateWin,
  vibrateWrong,
} from "@/lib/gameSounds";
import { guessMatchesAnswerCountry } from "@/lib/guessMatch";
import {
  resolveWrongGuessFlag,
  type WrongGuessFlag,
} from "@/lib/findGuessCountry";
import {
  type GamePace,
  loadGamePace,
} from "@/lib/gamePaceStorage";
import {
  recordConfusion,
  recordRoundLoss,
  recordRoundWin,
  recordSkip,
  recordWrongSubmit,
} from "@/lib/guessStatsStorage";
import { buildMarathonFlagQueue } from "@/lib/marathonQueue";
import {
  buildSessionSnapshot,
  clearGameSession,
  restoreGameSession,
  saveGameSession,
} from "@/lib/gameSessionStorage";
import {
  applyLoss,
  applyWin,
  loadStreaks,
  resetCurrentStreak,
  type StreakSnapshot,
} from "@/lib/streakStorage";

const LIVES_PER_GAME = 3;

type GameState = "playing" | "won" | "lost";

type CasualLearn =
  | { kind: "country"; country: Country }
  | { kind: "skip" }
  | null;

function LifeMarathonSlot({
  pace,
  spent,
  wrong,
  index,
  pulseToken,
}: {
  pace: GamePace;
  spent: boolean;
  wrong?: WrongGuessFlag;
  index: number;
  pulseToken: number;
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (!spent || pulseToken === 0) return;
    void controls.start({
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.07,
      },
    });
  }, [pulseToken, spent, controls, index]);

  if (pace === "fast") {
    return (
      <motion.div
        animate={controls}
        title={spent ? "Life used" : "Life available"}
        className={`relative flex h-9 w-14 items-center justify-center rounded-md border shadow-sm ${
          spent
            ? "border-2 border-rose-500 bg-rose-50 text-rose-600 ring-2 ring-rose-400/30 dark:border-rose-400 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/25"
            : "border-emerald-200/80 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-900/10 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/30"
        }`}
        aria-hidden
      >
        <Flag className="h-4 w-5" strokeWidth={2.25} />
        <span className="sr-only">{spent ? "Life used" : "Life available"}</span>
      </motion.div>
    );
  }

  const showWrongPng = spent && wrong?.png;
  const title =
    spent && wrong?.label ? `Life lost — ${wrong.label}` : spent ? "Life used" : "Life available";

  return (
    <motion.div
      animate={controls}
      title={title}
      className={`relative flex h-9 w-14 items-center justify-center overflow-hidden rounded-md border shadow-sm ${
        spent
          ? showWrongPng
            ? "border-2 border-rose-500 ring-2 ring-rose-400/30 dark:border-rose-400 dark:ring-rose-500/25"
            : "border-2 border-rose-500 bg-rose-50 text-rose-600 ring-2 ring-rose-400/30 dark:border-rose-400 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/25"
          : "border-emerald-200/80 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-900/10 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/30"
      }`}
      aria-hidden
    >
      {showWrongPng ? (
        <Image
          src={wrong.png!}
          alt=""
          fill
          className="object-cover"
          sizes="56px"
        />
      ) : spent ? (
        <span className="px-1 text-center text-[11px] font-bold leading-tight text-rose-600 dark:text-rose-300">
          {wrong?.label === "Skipped" ? "Skip" : "?"}
        </span>
      ) : (
        <Flag className="h-4 w-5" strokeWidth={2.25} />
      )}
      <span className="sr-only">{title}</span>
    </motion.div>
  );
}

export function GameContainer() {
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [mode, setMode] = useState<GameMode>("independent");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [flagQueue, setFlagQueue] = useState<Country[]>([]);
  const [marathonTotal, setMarathonTotal] = useState(0);
  const [livesRemaining, setLivesRemaining] = useState(LIVES_PER_GAME);
  const [lifePulseToken, setLifePulseToken] = useState(0);
  const [gamePace, setGamePace] = useState<GamePace>(() => loadGamePace());
  const [lifeLossFlags, setLifeLossFlags] = useState<WrongGuessFlag[]>([]);
  const [casualLearn, setCasualLearn] = useState<CasualLearn>(null);

  const [userGuess, setUserGuess] = useState("");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [outcomeCountry, setOutcomeCountry] = useState<Country | null>(null);

  const [streaks, setStreaks] = useState<StreakSnapshot>({
    current: 0,
    high: 0,
  });
  const [suggestOpen, setSuggestOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputShake = useAnimation();
  const marathonInitialized = useRef(false);
  const modePaceRef = useRef({ mode, gamePace });

  useEffect(() => {
    setStreaks(loadStreaks());
    setMode(loadGameMode());
    setGamePace(loadGamePace());
  }, []);

  useEffect(() => {
    const syncMode = () => {
      setMode(loadGameMode());
      setGamePace(loadGamePace());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "vexillo-mode" || e.key === "vexillo-game-pace") syncMode();
    };
    window.addEventListener("focus", syncMode);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", syncMode);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

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

  const playableCountries = useMemo(
    () => eligibleCountries.filter((c) => Boolean(c.flags?.png)),
    [eligibleCountries],
  );

  const gameplayRef = useRef({
    gameState,
    flagQueue,
    livesRemaining,
    userGuess,
    gamePace,
    mode,
    playableCountries,
  });
  gameplayRef.current = {
    gameState,
    flagQueue,
    livesRemaining,
    userGuess,
    gamePace,
    mode,
    playableCountries,
  };

  const startNewMarathon = useCallback(() => {
    if (!playableCountries.length) {
      setFlagQueue([]);
      setMarathonTotal(0);
      setLivesRemaining(LIVES_PER_GAME);
      setGameState("playing");
      setOutcomeCountry(null);
      setUserGuess("");
      setSuggestOpen(false);
      setLifeLossFlags([]);
      setCasualLearn(null);
      clearGameSession();
      return;
    }
    const queue = buildMarathonFlagQueue(playableCountries, mode);
    setFlagQueue(queue);
    setMarathonTotal(playableCountries.length);
    setLivesRemaining(LIVES_PER_GAME);
    setGameState("playing");
    setOutcomeCountry(null);
    setUserGuess("");
    setSuggestOpen(false);
    setLifeLossFlags([]);
    setCasualLearn(null);
    saveGameSession(
      buildSessionSnapshot({
        mode,
        gamePace,
        marathonTotal: playableCountries.length,
        flagQueue: queue,
        livesRemaining: LIVES_PER_GAME,
        gameState: "playing",
        outcomeCountry: null,
        lifeLossFlags: [],
        casualLearn: null,
      }),
    );
  }, [playableCountries, mode, gamePace]);

  const startNewGame = useCallback(() => {
    setStreaks((s) => resetCurrentStreak(s));
    startNewMarathon();
  }, [startNewMarathon]);

  useEffect(() => {
    if (loading || !countries) return;
    if (marathonInitialized.current) return;

    if (!playableCountries.length) {
      marathonInitialized.current = true;
      return;
    }

    const restored = restoreGameSession(playableCountries, mode, gamePace);
    if (restored) {
      setFlagQueue(restored.flagQueue);
      setMarathonTotal(restored.marathonTotal);
      setLivesRemaining(restored.livesRemaining);
      setGameState(restored.gameState);
      setOutcomeCountry(restored.outcomeCountry);
      setLifeLossFlags(restored.lifeLossFlags);
      setCasualLearn(restored.casualLearn);
      setUserGuess("");
      setSuggestOpen(false);
    } else {
      startNewMarathon();
    }
    marathonInitialized.current = true;
    modePaceRef.current = { mode, gamePace };
  }, [loading, countries, playableCountries, mode, gamePace, startNewMarathon]);

  useEffect(() => {
    if (!marathonInitialized.current || loading || !countries) return;
    if (!playableCountries.length) return;
    const prev = modePaceRef.current;
    if (prev.mode === mode && prev.gamePace === gamePace) return;
    modePaceRef.current = { mode, gamePace };

    const restored = restoreGameSession(playableCountries, mode, gamePace);
    if (restored) {
      setFlagQueue(restored.flagQueue);
      setMarathonTotal(restored.marathonTotal);
      setLivesRemaining(restored.livesRemaining);
      setGameState(restored.gameState);
      setOutcomeCountry(restored.outcomeCountry);
      setLifeLossFlags(restored.lifeLossFlags);
      setCasualLearn(restored.casualLearn);
      setUserGuess("");
      setSuggestOpen(false);
    } else {
      startNewMarathon();
    }
  }, [loading, countries, playableCountries, mode, gamePace, startNewMarathon]);

  useEffect(() => {
    if (!marathonInitialized.current || loading || !countries) return;
    if (!playableCountries.length && marathonTotal === 0) return;

    saveGameSession(
      buildSessionSnapshot({
        mode,
        gamePace,
        marathonTotal,
        flagQueue,
        livesRemaining,
        gameState,
        outcomeCountry,
        lifeLossFlags,
        casualLearn,
      }),
    );
  }, [
    loading,
    countries,
    mode,
    gamePace,
    marathonTotal,
    flagQueue,
    livesRemaining,
    gameState,
    outcomeCountry,
    lifeLossFlags,
    casualLearn,
    playableCountries.length,
  ]);

  const currentCountry = flagQueue[0];
  const currentCca3 = currentCountry?.cca3;

  useEffect(() => {
    if (gameState === "playing" && !loading && playableCountries.length) {
      inputRef.current?.focus();
    }
  }, [gameState, loading, playableCountries.length, currentCca3]);

  const suggestions = useMemo(
    () =>
      playableCountries.length
        ? getCountrySuggestions(playableCountries, userGuess)
        : [],
    [playableCountries, userGuess],
  );

  const submitGuess = useCallback(
    async (overrideText?: string) => {
      const snap = gameplayRef.current;
      const queue = snap.flagQueue;
      const country = queue[0];
      if (snap.gameState !== "playing" || !country) return;

      const trimmed = (overrideText ?? snap.userGuess).trim();
      if (!trimmed) return;

      if (
        guessMatchesAnswerCountry(trimmed, country, snap.playableCountries)
      ) {
        recordRoundWin(snap.mode, country.cca3);
        void playCorrectSound();
        vibrateWin();
        setStreaks((s) => applyWin(s));

        if (queue.length <= 1) {
          setOutcomeCountry(country);
          setFlagQueue([]);
          setGameState("won");
        } else {
          if (snap.gamePace === "casual") {
            setCasualLearn({ kind: "country", country });
          }
          setFlagQueue((q) => q.slice(1));
        }
        setSuggestOpen(false);
        setUserGuess("");
        return;
      }

      const wrong = resolveWrongGuessFlag(
        snap.playableCountries,
        trimmed,
        country,
      );
      recordWrongSubmit(snap.mode, country.cca3);
      if (wrong.guessedCca3) {
        recordConfusion(snap.mode, country.cca3, wrong.guessedCca3);
      }

      if (snap.gamePace === "casual") {
        setLifeLossFlags((f) => [...f, wrong].slice(0, LIVES_PER_GAME));
        setCasualLearn(null);
      }

      void playWrongSound();
      vibrateWrong();
      setLifePulseToken((t) => t + 1);
      await inputShake.start({
        x: [0, -11, 11, -9, 9, -5, 5, 0],
        transition: { duration: 0.48, ease: "easeInOut" },
      });
      void inputShake.set({ x: 0 });

      const prevLives = gameplayRef.current.livesRemaining;
      const nextLives = prevLives - 1;
      setLivesRemaining(nextLives <= 0 ? 0 : nextLives);
      if (nextLives <= 0) {
        recordRoundLoss(snap.mode, country.cca3);
        setOutcomeCountry(country);
        setStreaks((s) => applyLoss(s));
        setGameState("lost");
      } else {
        setFlagQueue((q) => {
          if (q.length === 0) return q;
          const [head, ...tail] = q;
          return [...tail, head];
        });
      }
      setUserGuess("");
    },
    [inputShake],
  );

  const handleSkip = useCallback(() => {
    const snap = gameplayRef.current;
    const queue = snap.flagQueue;
    const country = queue[0];
    if (snap.gameState !== "playing" || !country) return;

    recordSkip(snap.mode, country.cca3);

    if (snap.gamePace === "casual") {
      setLifeLossFlags((f) =>
        [...f, { label: "Skipped" }].slice(0, LIVES_PER_GAME),
      );
      setCasualLearn({ kind: "skip" });
    }

    setLifePulseToken((t) => t + 1);

    const prevLives = gameplayRef.current.livesRemaining;
    const nextLives = prevLives - 1;
    setLivesRemaining(nextLives <= 0 ? 0 : nextLives);
    if (nextLives <= 0) {
      recordRoundLoss(snap.mode, country.cca3);
      setOutcomeCountry(country);
      setStreaks((s) => applyLoss(s));
      setGameState("lost");
    } else {
      setFlagQueue((q) => {
        if (q.length === 0) return q;
        const [head, ...tail] = q;
        return [...tail, head];
      });
    }
    setUserGuess("");
    setSuggestOpen(false);
  }, []);

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

  const playing = gameState === "playing";
  const src = currentCountry?.flags?.png;
  const solved = marathonTotal - flagQueue.length;
  const flagNumber =
    marathonTotal > 0 && playing && currentCountry
      ? solved + 1
      : 0;
  const positionLabel =
    flagNumber > 0 ? `Flag ${flagNumber} of ${marathonTotal}` : "";

  const emptyMode = countries.length > 0 && eligibleCountries.length === 0;
  const noPlayable =
    !emptyMode && eligibleCountries.length > 0 && playableCountries.length === 0;

  const detailsCountry = outcomeCountry ?? currentCountry;
  const detailsSrc = detailsCountry?.flags?.png;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2.5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-center">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
              title="Each correct flag adds 1 to current. Resets when you start a new game or run out of lives."
            >
              Streaks
            </p>
            <div className="mt-1 flex items-center justify-center gap-4 text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                Current{" "}
                <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                  {streaks.current}
                </span>
              </span>
              <span
                className="h-4 w-px bg-slate-200 dark:bg-slate-600"
                aria-hidden
              />
              <span className="text-slate-600 dark:text-slate-300">
                Best{" "}
                <span className="font-semibold tabular-nums text-indigo-700 dark:text-indigo-300">
                  {streaks.high}
                </span>
              </span>
            </div>
          </div>
          {!emptyMode && !noPlayable && marathonTotal > 0 && (
            <button
              type="button"
              onClick={startNewGame}
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              New game
            </button>
          )}
        </div>
      </div>

      {emptyMode && (
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          No flags in this mode — open Settings and pick a different game mode.
        </p>
      )}

      {noPlayable && (
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          No flag images in this mode — try another game mode in Settings.
        </p>
      )}

      {!emptyMode && !noPlayable && detailsSrc && (
        <>
          <div
            className="flex justify-center gap-2"
            role="status"
            aria-label={`${livesRemaining} of ${LIVES_PER_GAME} lives remaining`}
          >
            {Array.from({ length: LIVES_PER_GAME }, (_, i) => {
              const spent = i < LIVES_PER_GAME - livesRemaining;
              const wrong =
                gamePace === "casual" && spent ? lifeLossFlags[i] : undefined;
              return (
                <LifeMarathonSlot
                  key={i}
                  pace={gamePace}
                  index={i}
                  spent={spent}
                  wrong={wrong}
                  pulseToken={lifePulseToken}
                />
              );
            })}
          </div>

          {positionLabel && playing && (
            <p className="text-center text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
              {positionLabel}
            </p>
          )}

          {playing && currentCountry && src && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${mode}-${currentCountry.cca3}`}
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
          )}

          <AnimatePresence>
            {(gameState === "won" || gameState === "lost") &&
              detailsCountry &&
              detailsSrc && (
                <CountryDetails
                  key={`${detailsCountry.cca3}-${gameState}`}
                  gameState={gameState}
                  country={detailsCountry}
                  flagSrc={detailsSrc}
                  attemptsLeft={livesRemaining}
                  onPlayAgain={startNewGame}
                  playAgainLabel="New game"
                  resultTitle={gameState === "won" ? "You win!" : "Game over"}
                  resultDescription={
                    gameState === "won" ? (
                      <>
                        You guessed all{" "}
                        <span className="font-semibold tabular-nums">
                          {marathonTotal}
                        </span>{" "}
                        flags in this run. Last:{" "}
                        <span className="font-semibold">
                          {detailsCountry.name.common}
                        </span>
                        .
                      </>
                    ) : (
                      <>
                        Out of lives. This flag was{" "}
                        <span className="font-semibold">
                          {detailsCountry.name.common}
                        </span>
                        .
                      </>
                    )
                  }
                />
              )}
          </AnimatePresence>

          {playing && currentCountry && (
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
                          void submitGuess(name);
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={!playing}
                  title="Skip this flag (uses one life and moves it to the end of the queue)"
                  className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                >
                  <SkipForward className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => void submitGuess()}
                  disabled={!playing || !userGuess.trim()}
                  className="min-h-[52px] flex-1 rounded-xl bg-slate-900 px-4 py-3 text-lg font-semibold text-white transition-colors hover:bg-slate-800 active:bg-slate-950 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:active:bg-indigo-700 dark:disabled:bg-slate-600"
                >
                  Submit
                </button>
              </div>

              {gamePace === "casual" &&
                casualLearn?.kind === "country" &&
                casualLearn.country.flags?.png && (
                  <CountryLearnPanel
                    country={casualLearn.country}
                    flagSrc={casualLearn.country.flags.png}
                    compact
                  />
                )}

              {gamePace === "casual" && casualLearn?.kind === "skip" && (
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3 py-3 text-sm text-amber-950 shadow-sm dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-100">
                  <p className="font-medium">Skipped</p>
                  <p className="mt-1 text-xs text-amber-900/90 dark:text-amber-200/90">
                    This uses a life. The flag moves to the end of the queue — you
                    will see it again later in this run.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
