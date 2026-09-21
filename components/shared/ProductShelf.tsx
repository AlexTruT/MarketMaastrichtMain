import { Children } from "react";
import { cn } from "@/lib/utils";

/**
 * Product tiles. `dense` fills a long catalogue (2 / 3@640 / 4@1024).
 * `rail` is the short highlight strip when a horizontal crate is wanted.
 */
export function ProductShelf({
  className,
  dense = false,
  rail = false,
  children,
}: {
  className?: string;
  dense?: boolean;
  rail?: boolean;
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
        "grid w-full grid-cols-2 gap-x-4 gap-y-8",
        dense && "sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
