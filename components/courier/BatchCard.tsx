"use client";

import React from "react";
import type { DeliveryBatch } from "@/lib/courier-types";
import {
  formatDistance,
  formatEuro,
  stopItemCount,
} from "@/lib/courier";
import { HandlingPills } from "./HandlingPills";

export function BatchCard({
  batch,
  onClaim,
  disabled,
}: {
  batch: DeliveryBatch;
  onClaim: (cluster: DeliveryBatch["cluster"]) => void;
  disabled: boolean;
}) {
  const handling = Array.from(
    new Set(batch.stops.flatMap((stop) => stop.handling)),
  );

  return (
    <article className="overflow-hidden rounded-2xl bg-paper ring-1 ring-cobble">
      <div className="flex items-start gap-3 px-4 pt-4">
        <span
          className="mt-0.5 h-10 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: batch.crateColor }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg leading-tight font-bold">{batch.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {batch.description}
          </p>
        </div>
        <span className="shrink-0 -rotate-2 rounded-xs bg-price px-2.5 py-1 font-marker text-lg leading-none">
          {formatEuro(batch.payoutCents)}
        </span>
      </div>

      <dl className="mx-4 mt-4 grid grid-cols-3 divide-x divide-cobble rounded-xl bg-canvas py-2.5 text-center">
        <div className="px-1">
          <dt className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
            Drops
          </dt>
          <dd className="text-sm font-bold">{batch.stops.length}</dd>
        </div>
        <div className="px-1">
          <dt className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
            Ride
          </dt>
          <dd className="text-sm font-bold">
            {formatDistance(batch.distanceMeters)}
          </dd>
        </div>
        <div className="px-1">
          <dt className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
            Time
          </dt>
          <dd className="text-sm font-bold">{batch.etaMinutes} min</dd>
        </div>
      </dl>

      {handling.length > 0 && (
        <div className="px-4 pt-3">
          <HandlingPills tags={handling} size="sm" />
        </div>
      )}

      {/* Area only: the exact address belongs to the courier who takes the crate. */}
      <ol className="mt-3 divide-y divide-cobble border-y border-cobble">
        {batch.stops.map((stop, index) => (
          <li key={stop.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-ink-soft">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{stop.areaLabel}</p>
              <p className="truncate text-xs text-ink-soft">
                {stopItemCount(stop)}{" "}
                {stopItemCount(stop) === 1 ? "item" : "items"} ·{" "}
                {stop.deliveryWindow}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-canvas px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft">
              {stop.crateNumber}
            </span>
          </li>
        ))}
      </ol>

      <p className="flex items-start gap-1.5 px-4 pt-3 text-[11px] leading-relaxed text-ink-faint">
        <span aria-hidden>🔒</span>
        Door numbers and names unlock once the crate is yours, one drop at a time.
      </p>

      <div className="p-4">
        <button
          type="button"
          onClick={() => onClaim(batch.cluster)}
          disabled={disabled}
          className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-awning text-sm font-bold text-white transition-transform active:scale-[0.99] disabled:bg-cobble disabled:text-ink-faint"
        >
          {disabled
            ? "Finish your current route first"
            : `Take ${batch.stops.length} ${batch.stops.length === 1 ? "drop" : "drops"} and go`}
        </button>
      </div>
    </article>
  );
}
