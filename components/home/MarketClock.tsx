"use client";

import { useEffect, useState } from "react";
import { clockLabel } from "@/lib/market-clock";

type MarketClockProps = {
  /** Friday 10:00 — the moment our shopper leaves for the market. */
  cutoffIso: string;
  /** Friday 15:00 — the moment the market packs up. */
  closeIso: string;
  /** Server-computed label so the card is visible on first paint. */
  initialLabel: string;
  /** Small line under the card, e.g. next market hours. */
  marketDateLine: string;
};

/**
 * Yellow countdown card. Server renders the real label (no empty gap).
 * Client refreshes on an interval only — no mount tick, no reload swap.
 */
export function MarketClock({
  cutoffIso,
  closeIso,
  initialLabel,
  marketDateLine,
}: MarketClockProps) {
  const [text, setText] = useState(initialLabel);

  useEffect(() => {
    const cutoff = new Date(cutoffIso);
    const close = new Date(closeIso);
    const tick = () => {
      const nextLabel = clockLabel(new Date(), cutoff, close);
      setText((prev) => (prev === nextLabel ? prev : nextLabel));
    };
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [cutoffIso, closeIso]);

  return (
    <>
      <span className="price-sign text-2xl leading-tight">{text}</span>
      <p className="text-meta pt-2 text-ink/55">{marketDateLine}</p>
    </>
  );
}
