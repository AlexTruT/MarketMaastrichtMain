import { Children } from "react";
import { cn } from "@/lib/utils";

/**
 * Product tiles.
 * Default: 2 under 640px, 3 from 640px, 4 from 1024px.
 * `dense`: always 2 columns (half-width highlight shelves).
 * `rail`: optional horizontal strip.
 */
export function ProductShelf({
  className,
  dense = false,
  rail = false,
  compact: _compact = false,
  children,
}: {
  className?: string;
  dense?: boolean;
  rail?: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  if (rail) {
    return (
      <div className={cn("flex gap-4 overflow-x-auto pb-1", className)}>
        {Children.map(children, (child) => (
          <div className="w-[10.25rem] shrink-0 sm:w-44">{child}</div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid w-full gap-x-4 gap-y-9 sm:gap-x-5 sm:gap-y-10",
        dense
          ? "grid-cols-2"
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
