import { Children } from "react";
import { cn } from "@/lib/utils";

/**
 * Product tiles. `dense` fills a long catalogue (2 / 3@640 / 4@1024).
 * `rail` is the short highlight strip when a horizontal crate is wanted.
 * `compact` shrinks highlight shelves (deals / coming soon) without touching
 * the main market grid — cards stay readable but sit a bit smaller.
 */
export function ProductShelf({
  className,
  dense = false,
  rail = false,
  compact = false,
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
          <div
            className={
              compact
                ? "w-[8.75rem] shrink-0 sm:w-[9.5rem]"
                : "w-[10.25rem] shrink-0 sm:w-44"
            }
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          "grid w-full max-w-md grid-cols-2 justify-items-center gap-x-3 gap-y-6 sm:max-w-lg",
          className
        )}
      >
        {Children.map(children, (child) => (
          <div className="w-full max-w-[9.75rem] sm:max-w-[11rem]">{child}</div>
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
