"use client";

import React from "react";
import Link from "next/link";
import type { CourierProfile } from "@/lib/courier-types";
import { useCourierStore, type LiveStatus } from "@/lib/courier-store";
import { MARKT_HUB } from "@/lib/courier-mock-data";
import { formatEuro } from "@/lib/courier";
import { BatchCard } from "./BatchCard";
import { Lock, PackagePlus, RefreshCw, ShoppingBasket } from "lucide-react";

const STATUS_COPY: Record<LiveStatus, { label: string; dot: string }> = {
  live: { label: "Live shop orders", dot: "bg-price-yellow" },
  demo: { label: "Demo queue", dot: "bg-white/70" },
  locked: { label: "Demo queue · live orders locked", dot: "bg-white/70" },
};

function clockOf(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function HubView({
  profile,
  onClaimed,
}: {
  profile: CourierProfile;
  onClaimed: () => void;
}) {
  const {
    batches,
    myStops,
    claimBatch,
    pushIncomingOrder,
    liveStatus,
    liveError,
    refreshing,
    lastRefreshedAt,
    refreshLiveStops,
  } = useCourierStore();
  const hasActiveRoute = myStops.length > 0;

  // The courier's usual neighbourhood first; they know those doors.
  const sorted = [...batches].sort(
    (a, b) =>
      Number(b.cluster === profile.preferredCluster) -
      Number(a.cluster === profile.preferredCluster),
  );
  const dropsWaiting = batches.reduce((sum, batch) => sum + batch.stops.length, 0);
  const bonusWaiting = batches.reduce((sum, batch) => sum + batch.payoutCents, 0);
  const status = STATUS_COPY[liveStatus];

  return (
    <div className="mx-auto flex w-full max-w-160 flex-col gap-4 px-4 pt-4">
      <section className="rounded-2xl bg-awning px-4 py-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold">
            <span className={`size-1.5 rounded-full ${status.dot}`} aria-hidden />
            {status.label}
          </p>
          <button
            type="button"
            onClick={() => void refreshLiveStops()}
            disabled={refreshing}
            aria-label="Check the shop for newly packed orders"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[11px] font-semibold text-white/85 active:scale-95 disabled:opacity-70"
          >
            <RefreshCw
              aria-hidden
              className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing
              ? "Checking…"
              : lastRefreshedAt
                ? `Updated ${clockOf(lastRefreshedAt)}`
                : "Refresh"}
          </button>
        </div>

        <h2 className="display-md mt-3">{MARKT_HUB.name}</h2>
        <p className="mt-1 text-sm leading-relaxed text-white/85">
          Crates are packed per neighbourhood. Take one, ride it, photograph
          each drop.
        </p>

        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/10 py-2">
            <dt className="text-[11px] text-white/70">Crates</dt>
            <dd className="text-lg leading-tight font-semibold tabular-nums">
              {batches.length}
            </dd>
          </div>
          <div className="rounded-xl bg-white/10 py-2">
            <dt className="text-[11px] text-white/70">Drops</dt>
            <dd className="text-lg leading-tight font-semibold tabular-nums">
              {dropsWaiting}
            </dd>
          </div>
          <div className="rounded-xl bg-white/10 py-2">
            <dt className="text-[11px] text-white/70">Bonus</dt>
            <dd className="text-lg leading-tight font-semibold tabular-nums">
              {formatEuro(bonusWaiting)}
            </dd>
          </div>
        </dl>

        {liveError && (
          <p className="mt-3 text-xs text-white/80">
            {liveError} Showing the demo queue.
          </p>
        )}
      </section>

      {liveStatus === "locked" && (
        <p className="flex items-start gap-2 rounded-xl bg-canvas px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
          <Lock aria-hidden className="mt-px size-3.5 shrink-0" />
          <span>
            Real customer orders are behind the picker unlock.{" "}
            <Link href="/picker" className="font-semibold text-awning underline">
              Unlock on the picker
            </Link>
            , then refresh here.
          </span>
        </p>
      )}

      {hasActiveRoute && batches.length > 0 && (
        <p className="rounded-xl bg-price-yellow/25 px-3 py-2.5 text-xs font-semibold">
          You are carrying a crate. Finish it before taking the next one.
        </p>
      )}

      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-paper px-4 py-10 text-center ring-1 ring-cobble">
          <ShoppingBasket aria-hidden className="mx-auto size-10 text-ink-faint" />
          <h3 className="display-sm mt-3">Every crate is on the road</h3>
          <p className="mx-auto mt-1 max-w-70 text-sm text-ink-soft">
            Nothing left at the hub. Refresh when the shopper packs the next
            batch.
          </p>
        </div>
      ) : (
        sorted.map((batch) => (
          <BatchCard
            key={batch.cluster}
            batch={batch}
            isUsualRun={batch.cluster === profile.preferredCluster}
            disabled={hasActiveRoute}
            onClaim={(cluster) => {
              claimBatch(cluster);
              onClaimed();
            }}
          />
        ))
      )}

      {liveStatus !== "live" && (
        <button
          type="button"
          onClick={pushIncomingOrder}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-cobble bg-paper text-xs font-semibold text-ink-soft active:scale-[0.99]"
        >
          <PackagePlus aria-hidden className="size-4" />
          Demo: shopper packs one more order
        </button>
      )}
    </div>
  );
}
