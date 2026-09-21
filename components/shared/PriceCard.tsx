import { cn } from "@/lib/utils";
import { formatEuro, formatRange } from "@/lib/pricing";

type PriceCardProps = {
  min: number;
  max: number;
  /** Set when a deal is active, to show the old price struck through above the card. */
  oldPriceCents?: number;
  dealNote?: string;
  className?: string;
};

export function PriceCard({
  min,
  max,
  oldPriceCents,
  dealNote,
  className,
}: PriceCardProps) {
  const isDeal = oldPriceCents != null;

  return (
    <div className={cn("inline-flex flex-col items-start gap-0.5", className)}>
      {isDeal && (
        <span className="pl-1 text-xs text-muted-foreground line-through">
          {formatEuro(oldPriceCents)}
        </span>
      )}
      <span
        className={cn(
          "-rotate-2 rounded-price bg-price-yellow px-2 py-0.5 font-price text-lg leading-tight text-ink",
          isDeal && "text-maastricht-red"
        )}
      >
        {formatRange(min, max)}
      </span>
      {isDeal && dealNote && (
        <span className="pl-1 text-xs text-muted-foreground">{dealNote}</span>
      )}
    </div>
  );
}
