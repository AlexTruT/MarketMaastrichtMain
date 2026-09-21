"use client";

import React, { useEffect, useRef, useState } from "react";
import type { DeliveryStop } from "@/lib/courier-types";
import {
  bicycleNavigationUrl,
  etaClock,
  formatEuro,
  formatPhone,
  stopItemCount,
  stopTotalCents,
  substitutionLabel,
} from "@/lib/courier";
import { HandlingPills } from "./HandlingPills";

interface RouteSheetProps {
  stop: DeliveryStop;
  stopIndex: number;
  totalStops: number;
  clusterTitle: string;
  progress: number;
  minutesLeft: number;
  /** How many drops stay locked behind this one. */
  dropsAfterThis: number;
  onStart: () => void;
  onArrived: () => void;
  onConfirmDrop: () => void;
  onHeightChange: (height: number) => void;
}

export function RouteSheet({
  stop,
  stopIndex,
  totalStops,
  clusterTitle,
  progress,
  minutesLeft,
  dropsAfterThis,
  onStart,
  onArrived,
  onConfirmDrop,
  onHeightChange,
}: RouteSheetProps) {
  const [expanded, setExpanded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Tell the map how much of its bottom edge is covered.
  useEffect(() => {
    const element = sheetRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      onHeightChange(entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [onHeightChange]);

  const street = stop.address.split(",")[0];
  const isRiding = stop.status === "riding";
  const hasArrived = stop.status === "arrived";

  const headline = hasArrived
    ? "You are at the door"
    : isRiding
      ? `${minutesLeft} min to ${street}`
      : `Next drop: ${street}`;

  const subline = hasArrived
    ? "Hand it over or leave it safe, then photograph it"
    : isRiding
      ? `Arrive around ${etaClock(minutesLeft)}`
      : `${minutesLeft} min ride, ${stop.deliveryWindow} window`;

  return (
    <div
      ref={sheetRef}
      className="animate-sheet-up pointer-events-auto rounded-t-sheet bg-paper shadow-[0_-8px_30px_rgba(0,0,0,0.14)]"
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full flex-col items-center gap-2 px-4 pt-2.5 pb-1"
      >
        <span className="h-1 w-10 rounded-full bg-cobble" aria-hidden />
        <span className="text-[11px] font-semibold text-ink-faint">
          {expanded ? "Hide order details" : "Show order details"}
        </span>
      </button>

      <div className="max-h-[52dvh] overflow-y-auto px-4 pb-4">
        {/* Where we are in the batch */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalStops }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 flex-1 rounded-full ${
                index < stopIndex - 1
                  ? "bg-awning"
                  : index === stopIndex - 1
                    ? "bg-awning/35"
                    : "bg-cobble"
              }`}
            />
          ))}
          <span className="ml-1 shrink-0 text-[11px] font-semibold text-ink-faint">
            {stopIndex}/{totalStops}
          </span>
        </div>


        <div className="mt-2.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
              {clusterTitle} crate
            </p>
            <h2 className="text-xl leading-tight font-bold">{headline}</h2>
            <p className="mt-0.5 text-sm text-ink-soft">{subline}</p>
          </div>
          <span className="shrink-0 -rotate-2 rounded-xs bg-price px-2 py-1 font-marker text-sm leading-none whitespace-nowrap">
            {stop.packageNumber}
          </span>
        </div>

        {isRiding && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cobble">
            <div
              className="h-full rounded-full bg-awning transition-[width] duration-300 ease-linear"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}

        {/* Address plus the two things a courier reaches for mid-ride. */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-canvas px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{stop.customerName}</p>
            <p className="text-sm text-ink-soft">{stop.address}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{stop.addressHint}</p>
          </div>
          <a
            href={`tel:${stop.customerPhone}`}
            aria-label={`Call ${stop.customerName}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-base ring-1 ring-cobble active:scale-95"
          >
            📞
          </a>
          <a
            href={bicycleNavigationUrl(stop)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open turn by turn navigation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-base ring-1 ring-cobble active:scale-95"
          >
            🚲
          </a>
        </div>

        {stop.handling.length > 0 && (
          <div className="mt-3">
            <HandlingPills tags={stop.handling} size="sm" />
          </div>
        )}

        {expanded && (
          <div className="animate-fade-in mt-3 flex flex-col gap-3">
            {stop.deliveryNotes && (
              <p className="rounded-xl border-l-4 border-price bg-price/15 px-3 py-2.5 text-xs leading-relaxed">
                <span className="block font-bold">From the customer</span>
                {stop.deliveryNotes}
              </p>
            )}

            <div className="rounded-xl ring-1 ring-cobble">
              <div className="flex items-center justify-between border-b border-cobble px-3 py-2">
                <span className="text-xs font-bold">
                  {stopItemCount(stop)} items in {stop.crateNumber}
                </span>
                <span className="text-xs font-semibold text-ink-soft">
                  {formatEuro(stopTotalCents(stop))}
                </span>
              </div>
              <ul className="divide-y divide-cobble">
                {stop.items.map((item) => (
                  <li key={item.id} className="px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {item.quantity} × {item.name}
                      </span>
                      <span className="shrink-0 text-xs text-ink-faint">
                        {formatEuro(item.priceCents * item.quantity)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-soft">{item.stallName}</p>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="rounded-xl bg-canvas px-3 py-2.5 text-xs">
              <div className="flex justify-between gap-2 py-0.5">
                <dt className="text-ink-soft">Order</dt>
                <dd className="font-semibold">{stop.orderNumber}</dd>
              </div>
              <div className="flex justify-between gap-2 py-0.5">
                <dt className="text-ink-soft">If something is missing</dt>
                <dd className="text-right font-semibold">
                  {substitutionLabel(stop.substitution)}
                </dd>
              </div>
              <div className="flex justify-between gap-2 py-0.5">
                <dt className="text-ink-soft">Phone</dt>
                <dd className="font-semibold">
                  {formatPhone(stop.customerPhone)}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {stop.status === "queued" && (
          <button
            type="button"
            onClick={onStart}
            className="mt-3 min-h-14 w-full rounded-xl bg-awning text-base font-bold text-white active:scale-[0.99]"
          >
            Start riding to {street}
          </button>
        )}

        {isRiding && (
          <button
            type="button"
            onClick={onArrived}
            className="mt-3 min-h-14 w-full rounded-xl bg-awning text-base font-bold text-white active:scale-[0.99]"
          >
            I am at the door
          </button>
        )}

        {hasArrived && (
          <button
            type="button"
            onClick={onConfirmDrop}
            className="mt-3 min-h-14 w-full rounded-xl bg-awning text-base font-bold text-white active:scale-[0.99]"
          >
            📸 Confirm the drop
          </button>
        )}

        {dropsAfterThis > 0 && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-ink-faint">
            <span aria-hidden>🔒</span>
            {dropsAfterThis === 1
              ? "1 more drop in the crate, revealed once this one is confirmed"
              : `${dropsAfterThis} more drops in the crate, revealed one at a time`}
          </p>
        )}
      </div>
    </div>
  );
}
