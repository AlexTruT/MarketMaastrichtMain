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
 * Yellow countdown card. Server passes the real label/note so first paint
 * never shows a wrong word or an empty gap. Client refreshes every 30s.
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
      setText(clockLabel(now, cutoff, close));
      setNote(clockNote(now, cutoff, close));
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [cutoffIso, closeIso]);

  return (
    <>
      <span className="price-sign text-2xl leading-tight" aria-live="polite">
        {text}
      </span>
      <p className="text-meta max-w-[46ch] pt-3 text-ink/60">{note}</p>
    </>
  );
}
