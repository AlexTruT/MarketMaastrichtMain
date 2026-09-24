"use client";

import React from "react";
import Link from "next/link";
import type { CourierProfile } from "@/lib/courier-types";
import { ChevronLeft } from "lucide-react";
import { CourierAvatar } from "./CourierProfileCard";

export function CourierTopBar({
  profile,
  dropsDone,
  dropsToGo,
}: {
  profile: CourierProfile;
  dropsDone: number;
  dropsToGo: number;
}) {
  return (
    <header className="z-30 shrink-0 border-b border-cobble bg-paper">
      <div className="mx-auto flex w-full max-w-160 items-center gap-2.5 px-4 py-2.5">
        <Link
          href="/courier"
          className="-ml-1.5 flex shrink-0 items-center rounded-full py-1 pr-1 focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none"
          aria-label={`Switch courier, currently ${profile.name}`}
        >
          <ChevronLeft aria-hidden className="size-4 text-ink-faint" />
          <CourierAvatar profile={profile} size="sm" />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-tight font-medium">
            {profile.name}
          </p>
          <p className="truncate text-xs leading-tight text-ink-soft">
            {profile.role} · {profile.vehicle}
          </p>
        </div>

        <div className="shrink-0 text-right" aria-live="polite">
          <p className="text-sm leading-tight font-semibold text-awning tabular-nums">
            {dropsDone} {dropsDone === 1 ? "drop" : "drops"}
          </p>
          <p className="text-xs leading-tight text-ink-soft tabular-nums">
            {dropsToGo > 0 ? `${dropsToGo} to go` : "delivered"}
          </p>
        </div>
      </div>
    </header>
  );
}
