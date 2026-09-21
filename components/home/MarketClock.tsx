"use client";

import { useEffect, useState } from "react";
import { clockLabel, clockNote } from "@/lib/market-clock";

type MarketClockProps = {
  /** Friday 10:00 — the moment our shopper leaves for the market. */
  cutoffIso: string;
  /** Friday 15:00 — the moment the market packs up. */
  closeIso: string;
  /** Server-computed label so the card is visible on first paint. */
  initialLabel: string;
  /** Server-computed note under the card. */
  initialNote: string;
};

/**
 * Yellow countdown card. Server renders the real label/note (no empty gap).
 * Client only refreshes on an interval — no immediate tick on mount, so a
 * reload never swaps the text for a near-identical string.
 */
export function MarketClock({
  cutoffIso,
  closeIso,
  initialLabel,
  initialNote,
}: MarketClockProps) {
  const [text, setText] = useState(initialLabel);
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    const cutoff = new Date(cutoffIso);
    const close = new Date(closeIso);
    const tick = () => {
      const now = new Date();
      const nextLabel = clockLabel(now, cutoff, close);
      const nextNote = clockNote(now, cutoff, close);
      setText((prev) => (prev === nextLabel ? prev : nextLabel));
      setNote((prev) => (prev === nextNote ? prev : nextNote));
    };
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [cutoffIso, closeIso]);

  return (
    <>
      <span className="price-sign text-2xl leading-tight">{text}</span>
      <p className="text-meta max-w-[46ch] pt-3 text-ink/60">{note}</p>
    </>
  );
}
