import Link from "next/link";
import Image from "next/image";
import { StallThumb } from "@/components/stalls/StallThumb";
import { ZoneTag } from "@/components/stalls/ZoneTag";
import { stallScene } from "@/lib/stall-scenes";
import type { Stall } from "@/lib/types";

export type StallListItem = Stall & {
  itemCount: number;
};

function firstSentence(story: string): string {
  const match = story.trim().match(/^[^.!?]+[.!?]?/);
  return match ? match[0].trim() : story.trim();
}

/** Mobile list row — unchanged behaviour below lg. */
export function StallRow({ stall }: { stall: StallListItem }) {
  const countLabel =
    stall.itemCount === 1 ? "1 item" : `${stall.itemCount} items`;

  return (
    <li className="border-b border-cobble last:border-0 lg:hidden">
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

/** Desktop card — image, name, origin, zone, count, story teaser. */
export function StallCard({ stall }: { stall: StallListItem }) {
  const countLabel =
    stall.itemCount === 1 ? "1 item" : `${stall.itemCount} items`;
  const scene = stallScene(stall);
  const teaser = firstSentence(stall.story);

  return (
    <li className="hidden lg:block">
      <Link
        href={`/stalls/${stall.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-md ring-1 ring-cobble transition-[box-shadow,ring-color] duration-200 ease-out hover:ring-2 hover:ring-awning/40 focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none"
      >
        <span className="relative aspect-4/3 overflow-hidden bg-cobble">
          <Image
            src={scene.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            placeholder="blur"
            className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            style={{ objectPosition: scene.position }}
            aria-hidden
          />
        </span>
        <span className="flex flex-1 flex-col gap-2 p-4">
          <span className="display-sm text-awning">{stall.name}</span>
          <span className="text-meta text-ink/55">{stall.origin}</span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <ZoneTag zone={stall.zone} />
            <span className="text-xs text-ink/45">{countLabel}</span>
          </span>
          <span className="text-meta line-clamp-3 pt-1 text-ink/70">
            {teaser}
          </span>
        </span>
      </Link>
    </li>
  );
}
