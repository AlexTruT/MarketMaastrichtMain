import Link from "next/link";
import { StallThumb } from "@/components/stalls/StallThumb";
import { ZoneTag } from "@/components/stalls/ZoneTag";
import type { Stall } from "@/lib/types";

export type StallListItem = Stall & {
  itemCount: number;
};

export function StallRow({ stall }: { stall: StallListItem }) {
  const countLabel =
    stall.itemCount === 1 ? "1 item" : `${stall.itemCount} items`;

  return (
    <li className="border-b border-cobble last:border-0">
      <Link
        href={`/stalls/${stall.id}`}
        className="group flex min-h-14 items-center gap-3.5 py-4 transition-colors duration-150 ease-out hover:bg-cobble/25 focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none"
      >
        <StallThumb stall={stall} />

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="display-sm truncate text-awning">
              {stall.name}
            </span>
            <span className="truncate text-meta text-ink/50">
              {stall.origin}
            </span>
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <ZoneTag zone={stall.zone} />
            <span className="text-xs text-ink/45">{countLabel}</span>
          </span>
        </span>

        <span
          aria-hidden
          className="shrink-0 text-lg leading-none text-ink/35 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
        >
          ›
        </span>
      </Link>
    </li>
  );
}
