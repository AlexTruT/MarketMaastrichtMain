import React from "react";
import type { HandlingTag } from "@/lib/courier-types";
import { HANDLING_LABELS } from "@/lib/courier-mock-data";
import { Egg, Flower2, Snowflake, type LucideIcon } from "lucide-react";

const HANDLING_ICONS: Record<HandlingTag, LucideIcon> = {
  cold: Snowflake,
  fragile: Egg,
  floral: Flower2,
};

export function HandlingPills({
  tags,
  size = "md",
}: {
  tags: HandlingTag[];
  size?: "sm" | "md";
}) {
  if (tags.length === 0) return null;

  const sizing =
    size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const meta = HANDLING_LABELS[tag];
        const Icon = HANDLING_ICONS[tag];
        return (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ${sizing} ${meta.className}`}
          >
            <Icon aria-hidden className="size-3.5" />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}
