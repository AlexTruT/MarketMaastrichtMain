"use client";

import React from "react";
import Link from "next/link";
import type { CourierProfile } from "@/lib/courier-types";
import { MARKT_HUB } from "@/lib/courier-mock-data";

/** The 8px awning stripe that heads every Merret screen. */
export function AwningStripe({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-2 w-full ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, #1e5b3f 0, #1e5b3f 16px, #ffffff 16px, #ffffff 32px)",
      }}
    />
  );
}

export function CourierTopBar({
  profile,
  dropsDone,
  totalDrops,
}: {
  profile: CourierProfile;
  dropsDone: number;
  totalDrops: number;
}) {
  return (
    <header className="z-30 shrink-0 bg-paper">
      <AwningStripe />
      <div className="mx-auto flex w-full max-w-160 items-center gap-3 px-4 py-3">
        <Link
          href="/courier"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-awning-tint text-xl ring-1 ring-awning/15"
          aria-label="Switch courier"
        >
          {profile.avatar}
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-tight font-semibold">
            {profile.firstName} on shift
          </p>
          <p className="truncate text-xs leading-tight text-ink-soft">
            {profile.vehicle}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm leading-tight font-bold text-awning">
            {dropsDone}/{totalDrops || "–"}
          </p>
          <p className="text-xs leading-tight text-ink-soft">drops done</p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-160 items-center gap-2 border-t border-cobble px-4 py-2 text-xs text-ink-soft">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-awning opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-awning" />
        </span>
        <span className="font-semibold text-ink">{MARKT_HUB.name}</span>
        <span aria-hidden>·</span>
        <span className="truncate">{MARKT_HUB.windowLabel}</span>
      </div>
    </header>
  );
}
