import Link from "next/link";
import { SettingsScreen } from "@/components/SettingsScreen";

export default function SettingsPage() {
  return (
    <main className="relative w-full max-w-sm">
      <div className="mb-6 flex flex-col gap-2 text-center">
        <Link
          href="/"
          className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to game
        </Link>
        <h1 className="bg-gradient-to-br from-slate-900 via-indigo-800 to-slate-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent dark:from-indigo-200 dark:via-white dark:to-slate-300">
          Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Game mode and practice options.
        </p>
      </div>
      <SettingsScreen />
    </main>
  );
}
