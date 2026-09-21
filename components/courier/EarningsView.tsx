"use client";

import React from "react";
import { useCourierStore } from "@/lib/courier-store";
import { calculateShiftPayout, formatEuro, SHIFT_RATES } from "@/lib/courier";

function timeOf(iso?: string) {
  if (!iso) return "–";
  return new Date(iso).toLocaleTimeString("en-NL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function EarningsView() {
  const { deliveredStops, hoursWorked, resetShift } = useCourierStore();
  const payout = calculateShiftPayout(hoursWorked, deliveredStops.length);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <section className="rounded-2xl bg-paper p-4 ring-1 ring-cobble">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
              Earned this shift
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {hoursWorked}h on the bike ·{" "}
              {deliveredStops.length === 1
                ? "1 drop"
                : `${deliveredStops.length} drops`}
            </p>
          </div>
          <span className="-rotate-2 rounded-xs bg-price-yellow px-3 py-1.5 font-price text-2xl leading-none">
            {formatEuro(payout.totalCents)}
          </span>
        </div>

        <dl className="mt-4 divide-y divide-cobble text-sm">
          <div className="flex justify-between gap-3 py-2.5">
            <dt className="text-ink-soft">
              Hourly guarantee, {formatEuro(SHIFT_RATES.baseHourlyCents)}/h
            </dt>
            <dd className="font-semibold">{formatEuro(payout.basePayCents)}</dd>
          </div>
          <div className="flex justify-between gap-3 py-2.5">
            <dt className="text-ink-soft">
              Drop bonus, {formatEuro(SHIFT_RATES.dropBonusCents)} each
            </dt>
            <dd className="font-semibold">{formatEuro(payout.bonusPayCents)}</dd>
          </div>
        </dl>
      </section>

      <section className="overflow-hidden rounded-2xl bg-paper ring-1 ring-cobble">
        <h2 className="border-b border-cobble px-4 py-3 text-sm font-bold">
          Delivered with proof
        </h2>

        {deliveredStops.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">
            Nothing delivered yet. Your proof photos land here as you ride.
          </p>
        ) : (
          <ul className="divide-y divide-cobble">
            {deliveredStops.map((stop) => (
              <li key={stop.id} className="flex items-center gap-3 px-4 py-3">
                {stop.proof?.photoDataUrl ? (
                  <img
                    src={stop.proof.photoDataUrl}
                    alt={`Doorstep at ${stop.address}`}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-canvas text-lg">
                    📦
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {stop.address.split(",")[0]}
                  </p>
                  <p className="truncate text-xs text-ink-soft">
                    {stop.orderNumber} · {stop.customerName}
                  </p>
                  {stop.proof?.notes && (
                    <p className="truncate text-xs text-ink-faint">
                      “{stop.proof.notes}”
                    </p>
                  )}
                </div>

                <span className="shrink-0 text-xs font-semibold text-awning">
                  {timeOf(stop.deliveredAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={resetShift}
        className="min-h-12 rounded-xl border border-dashed border-cobble bg-paper text-xs font-semibold text-ink-soft active:scale-[0.99]"
      >
        Reset the demo shift
      </button>
    </div>
  );
}
