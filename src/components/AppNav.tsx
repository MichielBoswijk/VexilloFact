"use client";

import { BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

const iconBase =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800";

export function AppNav() {
  const pathname = usePathname();
  const statsActive = pathname === "/stats";
  const settingsActive = pathname === "/settings";

  return (
    <div className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-40 flex flex-col gap-2">
      <ThemeToggle />
      <Link
        href="/stats"
        aria-label="Stats"
        title="Stats"
        aria-current={statsActive ? "page" : undefined}
        className={`${iconBase} ${
          statsActive
            ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
            : ""
        }`}
      >
        <BarChart3 className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
      <Link
        href="/settings"
        aria-label="Settings"
        title="Settings"
        aria-current={settingsActive ? "page" : undefined}
        className={`${iconBase} ${
          settingsActive
            ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
            : ""
        }`}
      >
        <Settings className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  );
}
