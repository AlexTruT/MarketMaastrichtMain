"use client";

import { useEffect, useState } from "react";

type MarketClockProps = {
  /** Friday 10:00 — the moment our shopper leaves for the market. */
  cutoffIso: string;
  /** Friday 15:00 — the moment the market packs up. */
  closeIso: string;
  /** Server-rendered text, shown until the clock takes over after mount. */
  fallback: string;
};

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function label(now: Date, cutoff: Date, close: Date): string {
  if (now >= cutoff && now < close) return "Shopping now";

  const ms = cutoff.getTime() - now.getTime();
  if (ms <= 0) return "Closed for today";

  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  if (days > 0) {
    return `${plural(days, "day", "days")} ${plural(hours, "hour", "hours")} left`;
  }
  if (hours > 0) {
    return `${plural(hours, "hour", "hours")} ${plural(mins, "minute", "minutes")} left`;
  }
  return `${plural(mins, "minute", "minutes")} left`;
}

function note(now: Date, cutoff: Date, close: Date): string {
  if (now >= cutoff && now < close) {
    return "Our shopper is on the Markt right now. Ordering reopens tonight.";
  }
  return "Order before Friday 10:00 and it is on your table the same afternoon.";
}

const DEFAULT_NOTE =
  "Order before Friday 10:00 and it is on your table the same afternoon.";

/**
 * Hero order: cutoff line first, then the yellow countdown card.
 * Countdown stays client-only so SSR and the first client paint match.
 */
export function MarketClock({ cutoffIso, closeIso, fallback }: MarketClockProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const cutoff = new Date(cutoffIso);
  const close = new Date(closeIso);
  const ready = mounted && now !== null;

  return (
    <>
      <p className="max-w-[46ch] text-sm leading-relaxed text-ink/70">
        {ready ? note(now, cutoff, close) : DEFAULT_NOTE}
      </p>
      <div className="pt-4">
        <span
          className="price-sign text-[1.6rem] leading-tight"
          aria-live="polite"
          suppressHydrationWarning
        >
          {ready ? label(now, cutoff, close) : fallback}
        </span>
      </div>
    </>
  );
}
