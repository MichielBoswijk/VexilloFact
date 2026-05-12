"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  Coins,
  Flag as FlagIcon,
  Landmark,
  MapPinned,
  Ruler,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import type { Country } from "@/lib/countries";
import {
  formatCapital,
  formatCurrencies,
  formatPopulation,
  formatRegionLine,
  formatSovereignty,
} from "@/lib/formatCountry";
import { describeAreaRelatable } from "@/lib/areaCopy";
import { getCountryFactLine } from "@/lib/funFact";
import { getFlagFact } from "@/data/flagFacts";
import { getReligions, type ReligionEntry } from "@/data/religions";

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/60">
      <Icon
        className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-base font-medium leading-snug text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}

const RELIGION_COLORS = [
  "bg-indigo-500 dark:bg-indigo-400",
  "bg-emerald-500 dark:bg-emerald-400",
  "bg-amber-500 dark:bg-amber-400",
  "bg-rose-500 dark:bg-rose-400",
  "bg-sky-500 dark:bg-sky-400",
  "bg-fuchsia-500 dark:bg-fuchsia-400",
  "bg-slate-500 dark:bg-slate-400",
];

function ReligionDistribution({ data }: { data: ReligionEntry[] }) {
  const total = data.reduce((sum, e) => sum + e.share, 0) || 1;
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      <p className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
        <Users
          className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
          aria-hidden
        />
        Religions
        <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Approx.
        </span>
      </p>
      <div
        className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
        role="img"
        aria-label="Approximate religious composition"
      >
        {data.map((entry, i) => {
          const pct = Math.max(0, (entry.share / total) * 100);
          if (pct <= 0) return null;
          return (
            <div
              key={`${entry.name}-${i}`}
              className={RELIGION_COLORS[i % RELIGION_COLORS.length]}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
      <ul className="mt-3 space-y-1.5">
        {data.map((entry, i) => (
          <li
            key={`${entry.name}-${i}`}
            className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <span
              className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
                RELIGION_COLORS[i % RELIGION_COLORS.length]
              }`}
              aria-hidden
            />
            <span className="flex-1 truncate">{entry.name}</span>
            <span className="tabular-nums font-medium text-slate-900 dark:text-slate-100">
              {Math.round(entry.share)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = {
  country: Country;
  flagSrc: string;
  /** Tighter max height for inline game layout. */
  compact?: boolean;
  /** Hide the “Learn more” label (e.g. inside the result modal). */
  hideHeading?: boolean;
};

export function CountryLearnPanel({
  country,
  flagSrc,
  compact,
  hideHeading,
}: Props) {
  const factLine = getCountryFactLine(country);
  const areaLine = describeAreaRelatable(country.area);
  const flagFact = getFlagFact(country.cca3);
  const religions = getReligions(country.cca3);

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 ${
        compact ? "max-h-72 overflow-y-auto overscroll-contain" : ""
      }`}
    >
      {!hideHeading && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Learn more
        </p>
      )}
      <div
        className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/50 ${
          hideHeading ? "" : "mt-3"
        }`}
      >
        <div className="relative h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-950">
          <Image
            src={flagSrc}
            alt=""
            fill
            className="object-cover"
            sizes="72px"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Country
          </p>
          <p className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
            {country.name.common}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <StatRow
          icon={Landmark}
          label="Capital"
          value={formatCapital(country)}
        />
        <StatRow
          icon={Users}
          label="Population"
          value={formatPopulation(country.population)}
        />
        <StatRow
          icon={MapPinned}
          label="Continent"
          value={formatRegionLine(country)}
        />
        <StatRow
          icon={Shield}
          label="Sovereignty"
          value={formatSovereignty(country)}
        />
        <StatRow icon={Ruler} label="Land area" value={areaLine} />
        <StatRow
          icon={Coins}
          label="Currencies"
          value={formatCurrencies(country)}
        />
      </div>

      {flagFact && (
        <div className="mt-4 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-4 py-4 shadow-sm dark:border-indigo-800/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-sky-950/40">
          <p className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900 dark:text-indigo-50">
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-indigo-900/60 dark:text-indigo-200 dark:ring-indigo-700/60"
              aria-hidden
            >
              <FlagIcon className="h-4 w-4" strokeWidth={2.25} />
            </span>
            About the flag
            {flagFact.adopted && (
              <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Adopted {flagFact.adopted}
              </span>
            )}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
            {flagFact.description}
          </p>
        </div>
      )}

      {religions && <ReligionDistribution data={religions} />}

      <div className="mt-4 rounded-2xl border border-sky-200/80 bg-gradient-to-br from-amber-50 via-white to-sky-50 px-4 py-4 shadow-sm dark:border-sky-800/50 dark:from-amber-950/40 dark:via-slate-900 dark:to-sky-950/40">
        <p className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900 dark:text-amber-50">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-900/50 dark:text-amber-200 dark:ring-amber-700/60"
            aria-hidden
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.25} />
          </span>
          Did you know?
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          {factLine}
        </p>
      </div>
    </div>
  );
}
