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
import { Camera, ChevronDown, Lock, Navigation, Phone } from "lucide-react";

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

/**
 * The drop card. On a phone it is a bottom sheet over the map, kept short so
 * the route stays visible; details fold away. From lg up it is a full-height
 * side panel with the details always open.
 */
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
      onHeightChange(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
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
      : street;

  const subline = hasArrived
    ? "Hand it over or leave it safe, then confirm"
    : isRiding
      ? `Arrive around ${etaClock(minutesLeft)} · ${stop.deliveryWindow}`
      : `About ${minutesLeft} min by bike · ${stop.deliveryWindow}`;

  return (
    <div
      ref={sheetRef}
      className="animate-sheet-up pointer-events-auto rounded-t-sheet bg-paper shadow-[0_-8px_30px_rgba(0,0,0,0.14)] lg:flex lg:h-full lg:animate-none lg:flex-col lg:rounded-none lg:shadow-none"
    >
      {/* Grab handle: a big, quiet target for folding the details. */}
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-label={expanded ? "Hide order details" : "Show order details"}
        className="flex h-5 w-full items-center justify-center lg:hidden"
      >
        <span className="h-1 w-10 rounded-full bg-cobble" aria-hidden />
      </button>

      <div className="max-h-[56dvh] overflow-y-auto overscroll-contain px-4 pb-3 lg:max-h-none lg:flex-1 lg:px-5 lg:pt-5 lg:pb-5">
        {/* Where we are in this crate */}
        <div className="flex items-center gap-1.5">
          <div
            className="flex flex-1 items-center gap-1"
            role="img"
            aria-label={`Drop ${stopIndex} of ${totalStops}`}
          >
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
          </div>
          <span className="ml-1 shrink-0 text-[11px] font-semibold text-ink-faint">
            {clusterTitle} · {stopIndex} of {totalStops}
          </span>
        </div>

        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="display-md leading-tight">{headline}</h2>
            <p className="mt-0.5 text-sm text-ink-soft">{subline}</p>
          </div>
          <span className="price-sign shrink-0 text-sm leading-none whitespace-nowrap">
            {stop.packageNumber}
          </span>
        </div>

        {isRiding && (
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-cobble">
            <div
              className="h-full rounded-full bg-awning transition-[width] duration-300 ease-linear"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}

        {/* Who, where, and the two things a courier reaches for mid-ride. */}
        <div className="mt-2.5 rounded-xl bg-canvas px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 select-text">
              <p className="text-sm font-semibold">{stop.customerName}</p>
              <p className="text-sm leading-snug text-ink-soft">{stop.address}</p>
              {stop.addressHint && (
                <p className="mt-0.5 text-xs font-semibold text-ink">
                  {stop.addressHint}
                </p>
              )}
            </div>
            <a
              href={`tel:${stop.customerPhone}`}
              aria-label={`Call ${stop.customerName}`}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-paper ring-1 ring-cobble active:scale-95"
            >
              <Phone aria-hidden className="size-4.5" />
            </a>
            <a
              href={bicycleNavigationUrl(stop)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cycling directions in Google Maps"
              title="Cycling directions in Google Maps"
              className={`flex size-11 shrink-0 items-center justify-center rounded-full active:scale-95 ${
                isRiding
                  ? "bg-awning text-white"
                  : "bg-paper ring-1 ring-cobble"
              }`}
            >
              <Navigation aria-hidden className="size-4.5" />
            </a>
          </div>
          {stop.handling.length > 0 && (
            <div className="mt-2">
              <HandlingPills tags={stop.handling} size="sm" />
            </div>
          )}
        </div>

        <div className="mt-0.5 flex min-h-9 items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="-ml-1 flex min-h-9 items-center gap-1 px-1 text-xs font-semibold text-ink-soft lg:hidden"
          >
            {stopItemCount(stop)} items and notes
            <ChevronDown
              aria-hidden
              className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          {dropsAfterThis > 0 && (
            <p className="flex items-center gap-1 text-[11px] text-ink-faint">
              <Lock aria-hidden className="size-3.5 shrink-0" />
              {dropsAfterThis} more {dropsAfterThis === 1 ? "drop" : "drops"}{" "}
              after this
            </p>
          )}
        </div>

        <div
          className={`animate-fade-in mt-1 flex-col gap-3 lg:mt-3 lg:flex ${
            expanded ? "flex" : "hidden"
          }`}
        >
          {stop.deliveryNotes && (
            <p className="rounded-xl border-l-4 border-price-yellow bg-price-yellow/15 px-3 py-2.5 text-xs leading-relaxed">
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
              <dd className="font-semibold">{formatPhone(stop.customerPhone)}</dd>
            </div>
          </dl>
        </div>

        <div className="lg:sticky lg:bottom-0 lg:mt-auto lg:bg-paper lg:pt-3">
          {stop.status === "queued" && (
            <button
              type="button"
              onClick={onStart}
              className="mt-2 min-h-14 w-full rounded-xl bg-awning px-4 text-base font-bold text-white active:scale-[0.99]"
            >
              Start riding
            </button>
          )}

          {isRiding && (
            <button
              type="button"
              onClick={onArrived}
              className="mt-2 min-h-14 w-full rounded-xl bg-awning px-4 text-base font-bold text-white active:scale-[0.99]"
            >
              I am at the door
            </button>
          )}

          {hasArrived && (
            <button
              type="button"
              onClick={onConfirmDrop}
              className="mt-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-awning px-4 text-base font-bold text-white active:scale-[0.99]"
            >
              <Camera aria-hidden className="size-5" />
              Confirm the drop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
