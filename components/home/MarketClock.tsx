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

function label(now: Date, cutoff: Date, close: Date): string {
  if (now >= cutoff && now < close) return "Shopping now";

  const ms = cutoff.getTime() - now.getTime();
  if (ms <= 0) return "Closed for today";

  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
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
 * The 10:00 cutoff is the whole product: miss it and your order waits a
 * week. It gets the market's own voice — written on a card — rather than a
 * line of grey body text.
 *
 * Countdown must be client-only: computing "now" during SSR and again on
 * hydrate produces a mismatch (Next.js "1 Issue" badge). We keep a stable
 * placeholder until after mount.
 */
export function MarketClock({ cutoffIso, closeIso, fallback }: MarketClockProps) {
  // null until mount — first client paint must match SSR HTML exactly
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
      <span
        className="price-sign text-[1.6rem] leading-tight"
        aria-live="polite"
        suppressHydrationWarning
      >
        {ready ? label(now, cutoff, close) : fallback}
      </span>
      <p className="max-w-[46ch] pt-3 text-sm leading-relaxed text-ink/70">
        {ready ? note(now, cutoff, close) : DEFAULT_NOTE}
      </p>
    </>
  );
}
