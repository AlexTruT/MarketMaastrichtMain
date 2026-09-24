"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { CourierProfile } from "@/lib/courier-types";
import { useCourierStore } from "@/lib/courier-store";
import { CLUSTER_META } from "@/lib/courier-mock-data";
import { calculateShiftPayout, formatEuro, SHIFT_RATES } from "@/lib/courier";
import { Package, RotateCcw } from "lucide-react";
import { CourierAvatar } from "./CourierProfileCard";

function timeOf(iso?: string) {
  if (!iso) return "–";
  return new Date(iso).toLocaleTimeString("en-NL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function EarningsView({ profile }: { profile: CourierProfile }) {
  const { deliveredStops, myStops, hoursWorked, resetShift } = useCourierStore();
  const payout = calculateShiftPayout(hoursWorked, deliveredStops.length);
  const cluster = CLUSTER_META[profile.preferredCluster];
  // Reset throws away the shift, so it takes a second tap to confirm.
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    if (!confirmingReset) return;
    const timeout = setTimeout(() => setConfirmingReset(false), 4000);
    return () => clearTimeout(timeout);
  }, [confirmingReset]);

  const onReset = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    setConfirmingReset(false);
    resetShift();
  };

  return (
    <div className="mx-auto flex w-full max-w-160 flex-col gap-4 px-4 pt-4">
      <section className="rounded-md bg-paper p-4 ring-1 ring-cobble">
        <div className="flex items-center gap-3.5">
          <CourierAvatar profile={profile} size="lg" />
          <div className="min-w-0">
            <p className="text-[0.8125rem] text-awning">Courier profile</p>
            <h2 className="display-sm pt-0.5">{profile.name}</h2>
            <p className="truncate text-xs text-ink-soft">
              {profile.role} · {profile.vehicle}
            </p>
            <p className="truncate text-xs text-ink-faint">
              Prefers {cluster.shortTitle}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-md bg-paper p-4 ring-1 ring-cobble">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="display-sm">Earned this shift</p>
            <p className="mt-1 text-sm text-ink-soft">
              {hoursWorked}h on the bike ·{" "}
              {deliveredStops.length === 1
                ? "1 drop"
                : `${deliveredStops.length} drops`}
            </p>
          </div>
          <span className="price-sign text-2xl leading-none">
            {formatEuro(payout.totalCents)}
          </span>
        </div>

        <dl className="mt-4 divide-y divide-cobble text-sm">
          <div className="flex justify-between gap-3 py-2.5">
            <dt className="text-ink-soft">
              Hourly, {formatEuro(SHIFT_RATES.baseHourlyCents)}/h
              <span className="block text-[11px] text-ink-faint">
                Two hours guaranteed, however quiet the market
              </span>
            </dt>
            <dd className="font-medium">{formatEuro(payout.basePayCents)}</dd>
          </div>
          <div className="flex justify-between gap-3 py-2.5">
            <dt className="text-ink-soft">
              Drop bonus, {formatEuro(SHIFT_RATES.dropBonusCents)} each
            </dt>
            <dd className="font-medium">{formatEuro(payout.bonusPayCents)}</dd>
          </div>
        </dl>
      </section>

      <section className="overflow-hidden rounded-md bg-paper ring-1 ring-cobble">
        <h2 className="display-sm border-b border-cobble px-4 py-3">
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
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={stop.proof.photoDataUrl}
                      alt={`Doorstep at ${stop.address}`}
                      fill
                      unoptimized
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-canvas">
                    <Package aria-hidden className="size-5 text-ink-faint" />
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
        onClick={onReset}
        className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border border-dashed text-xs font-semibold active:scale-[0.99] ${
          confirmingReset
            ? "border-maastricht-red bg-maastricht-red/8 text-maastricht-red"
            : "border-cobble bg-paper text-ink-soft"
        }`}
      >
        <RotateCcw aria-hidden className="size-4" />
        {confirmingReset
          ? myStops.length > 0
            ? "Tap again: hand the crate back and restart"
            : "Tap again to restart the shift"
          : "Reset the demo shift"}
      </button>
    </div>
  );
}
