"use client";

import React from "react";
import { useCourierStore } from "@/lib/courier-store";
import { MARKT_HUB } from "@/lib/courier-mock-data";
import { BatchCard } from "./BatchCard";
import { ShoppingBasket } from "lucide-react";

export function HubView({ onClaimed }: { onClaimed: () => void }) {
  const {
    batches,
    myStops,
    claimBatch,
    pushIncomingOrder,
    liveMode,
    liveError,
    refreshLiveStops,
  } = useCourierStore();
  const hasActiveRoute = myStops.length > 0;

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <section className="rounded-2xl bg-awning px-4 py-4 text-white">
        <p className="text-[13px] text-white/75">Friday consolidation</p>
        <h2 className="display-md mt-1">
          {MARKT_HUB.name}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-white/85">
          Our shopper has walked the market. Crates are packed per neighbourhood
          and labelled with a package number. Take one cluster, ride it, drop it.
        </p>
        <p className="mt-3 text-[12px] font-semibold uppercase tracking-wide text-white/80">
          {liveMode ? "Live orders" : "Demo queue"}
        </p>
        {liveError && (
          <p className="mt-1 text-xs text-white/75">{liveError} Showing demo.</p>
        )}
      </section>

      {batches.length === 0 ? (
        <div className="rounded-2xl bg-paper px-4 py-10 text-center ring-1 ring-cobble">
          <ShoppingBasket aria-hidden className="mx-auto size-10 text-ink-faint" />
          <h3 className="display-sm mt-3">Every crate is on the road</h3>
          <p className="mx-auto mt-1 max-w-70 text-sm text-ink-soft">
            Nothing left at the hub. Ask the coordinator to pack the next batch.
          </p>
        </div>
      ) : (
        batches.map((batch) => (
          <BatchCard
            key={batch.cluster}
            batch={batch}
            disabled={hasActiveRoute}
            onClaim={(cluster) => {
              claimBatch(cluster);
              onClaimed();
            }}
          />
        ))
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void refreshLiveStops()}
          className="min-h-11 rounded-xl border border-cobble bg-paper text-xs font-semibold text-ink-soft active:scale-[0.99]"
        >
          Refresh live ready orders
        </button>
        {!liveMode && (
          <button
            type="button"
            onClick={pushIncomingOrder}
            className="min-h-12 rounded-xl border border-dashed border-cobble bg-paper text-xs font-semibold text-ink-soft active:scale-[0.99]"
          >
            Demo: coordinator packs one more order
          </button>
        )}
      </div>
    </div>
  );
}
