import { GameContainer } from "@/components/GameContainer";

export default function Home() {
  return (
    <main className="relative w-full max-w-sm">
      <div className="mb-7 text-center">
        <h1 className="bg-gradient-to-br from-slate-900 via-indigo-800 to-slate-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-indigo-200 dark:via-white dark:to-slate-300 sm:text-[2.65rem]">
          Vexillo
        </h1>
        <p className="mt-2 text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400">
          Guess the flag. Learn the world.
        </p>
        <div
          className="mx-auto mt-4 h-px max-w-[10rem] bg-gradient-to-r from-transparent via-indigo-300/80 to-transparent dark:via-indigo-500/50"
          aria-hidden
        />
      </div>
      <GameContainer />
    </main>
  );
}
