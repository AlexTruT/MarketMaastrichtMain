import { cn } from "@/lib/utils";
import { formatEuro } from "@/lib/pricing";

type PriceCardProps = {
  min: number;
  max: number;
  /**
   * Set when a deal is active, to show the old price struck through above
   * the deal price inside the yellow card.
   */
  oldMin?: number;
  oldMax?: number;
  dealNote?: string;
  /** "md" for grids and strips, "lg" for a stall or product headline. */
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Ranges are written the way a stallholder writes them on the card —
 * "€2.40–3.20", not "€2.40 to €3.20". The long form stays in lib/pricing
 * for running text, where the word reads better than the dash.
 */
function signText(min: number, max: number): string {
  if (min === max) return formatEuro(min);
  return `${formatEuro(min)}–${(max / 100).toFixed(2)}`;
}

const SIZES = {
  sm: "text-base",
  md: "text-[1.25rem]",
  lg: "text-[1.75rem]",
} as const;

export function PriceCard({
  min,
  max,
  oldMin,
  oldMax,
  dealNote,
  size = "md",
  className,
}: PriceCardProps) {
  const isDeal = oldMin != null && oldMax != null;

  return (
    <span className={cn("inline-flex flex-col items-start gap-1", className)}>
      <span
        className={cn(
          "price-sign leading-tight",
          SIZES[size],
          isDeal && "text-maastricht-red"
        )}
      >
        {isDeal && (
          <span className="mb-0.5 block text-[0.65em] font-sans font-normal tracking-normal text-ink/55 line-through">
            {signText(oldMin, oldMax)}
          </span>
        )}
        {signText(min, max)}
      </span>
      {isDeal && dealNote && (
        <span className="pl-0.5 text-xs text-maastricht-red">{dealNote}</span>
      )}
    </span>
  );
}
