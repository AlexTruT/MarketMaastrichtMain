import type { Zone } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Zone labels on the stalls list — brand colours, no purple. */
const ZONE_CLASS: Record<Zone, string> = {
  Stadhuis: "bg-awning/12 text-awning",
  Boschstraat: "bg-maastricht-red/10 text-maastricht-red",
  "Mosae Forum": "bg-[#8B6A2B]/12 text-[#8B6A2B]",
};

export function ZoneTag({
  zone,
  className,
}: {
  zone: Zone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[0.6875rem] font-medium leading-none",
        ZONE_CLASS[zone],
        className
      )}
    >
      {zone}
    </span>
  );
}
