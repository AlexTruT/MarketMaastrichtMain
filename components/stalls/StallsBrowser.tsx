"use client";

import { useMemo, useState } from "react";
import { StallRow, type StallListItem } from "@/components/stalls/StallRow";
import type { Zone } from "@/lib/types";
import { cn } from "@/lib/utils";

const ZONE_ORDER: Zone[] = ["Stadhuis", "Boschstraat", "Mosae Forum"];

type ZoneFilter = "all" | Zone;

export function StallsBrowser({ stalls }: { stalls: StallListItem[] }) {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState<ZoneFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stalls.filter((stall) => {
      if (zone !== "all" && stall.zone !== zone) return false;
      if (!q) return true;
      return (
        stall.name.toLowerCase().includes(q) ||
        stall.owner.toLowerCase().includes(q) ||
        stall.origin.toLowerCase().includes(q) ||
        stall.zone.toLowerCase().includes(q) ||
        stall.category.toLowerCase().includes(q)
      );
    });
  }, [stalls, query, zone]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 px-4 pt-5">
        <label className="relative block">
          <span className="sr-only">Search stalls</span>
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/40"
          >
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by stall, origin or zone…"
            className="h-11 w-full rounded-md border border-cobble bg-paper pr-3 pl-10 text-sm text-ink placeholder:text-ink/40"
          />
        </label>

        <div
          role="group"
          aria-label="Filter by zone"
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ZoneChip
            label="All zones"
            active={zone === "all"}
            onClick={() => setZone("all")}
          />
          {ZONE_ORDER.map((z) => (
            <ZoneChip
              key={z}
              label={z}
              active={zone === z}
              onClick={() => setZone(z)}
            />
          ))}
        </div>
      </div>

      <p className="text-meta px-4 pt-4 text-ink/50">
        {filtered.length === stalls.length
          ? `${stalls.length} partner stalls`
          : `${filtered.length} of ${stalls.length} stalls`}
        {" · "}
        Open Friday 09:00–15:00
      </p>

      {filtered.length === 0 ? (
        <p className="text-lede px-4 py-10 text-ink/55">
          No stalls match that search. Try another name, origin or zone.
        </p>
      ) : (
        <ul className="mt-1 flex flex-col px-4 pb-4">
          {filtered.map((stall) => (
            <StallRow key={stall.id} stall={stall} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ZoneChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-11 shrink-0 items-center rounded-full px-3.5 text-sm transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98]",
        active
          ? "bg-awning font-medium text-paper"
          : "bg-cobble/55 text-ink/70 hover:bg-cobble"
      )}
    >
      {label}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 10.5L13.5 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
