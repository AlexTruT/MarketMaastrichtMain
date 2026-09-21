import Image from "next/image";
import { stallScene } from "@/lib/stall-scenes";
import type { Stall } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Market-scene thumbnail for the partner stalls list.
 * Wide rounded rect (not a circle) — reads as a place, not a product cutout.
 */
export function StallThumb({
  stall,
  className,
}: {
  stall: Pick<Stall, "id" | "name" | "category">;
  className?: string;
}) {
  const scene = stallScene(stall);

  return (
    <span
      className={cn(
        "relative h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-md bg-cobble ring-1 ring-cobble/60",
        className
      )}
    >
      <Image
        src={scene.src}
        alt=""
        fill
        sizes="72px"
        placeholder="blur"
        className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
        style={{ objectPosition: scene.position }}
        aria-hidden
      />
    </span>
  );
}
