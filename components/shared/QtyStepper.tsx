"use client";

import { CART_MAX_QTY } from "@/lib/cart";
import { cn } from "@/lib/utils";

type QtyStepperProps = {
  name: string;
  qty: number;
  onChange: (qty: number) => void;
  /** Overlay on a product photo vs a cart row. */
  tone?: "awning" | "paper";
};

/**
 * Plus/minus for a bag line. Paper tone keeps 44px hits in cart rows.
 * Awning tone matches the 40px product "+" so it covers no more of the photo.
 */
export function QtyStepper({
  name,
  qty,
  onChange,
  tone = "paper",
}: QtyStepperProps) {
  const atMax = qty >= CART_MAX_QTY;
  const awning = tone === "awning";

  return (
    <div
      className={cn(
        "flex items-center rounded-full",
        awning
          ? "h-10 bg-awning p-0.5 text-paper"
          : "bg-cobble/55 p-0.5 text-ink"
      )}
    >
      <button
        type="button"
        aria-label={`Remove one ${name}`}
        onClick={() => onChange(qty - 1)}
        className={cn(
          "grid place-items-center rounded-full leading-none transition-[transform,background-color] duration-150 ease-out active:scale-95",
          awning
            ? "size-9 text-base hover:bg-white/15"
            : "size-11 text-lg hover:bg-paper"
        )}
      >
        −
      </button>
      <span
        aria-live="polite"
        className={cn(
          "text-center font-semibold tabular-nums",
          awning ? "min-w-5 text-xs" : "min-w-6 text-sm"
        )}
      >
        {qty}
      </span>
      <button
        type="button"
        aria-label={
          atMax ? `${name} is at the maximum of ${CART_MAX_QTY}` : `Add one more ${name}`
        }
        disabled={atMax}
        onClick={() => onChange(qty + 1)}
        className={cn(
          "grid place-items-center rounded-full leading-none transition-[transform,background-color,opacity] duration-150 ease-out active:scale-95 disabled:opacity-40",
          awning
            ? "size-9 text-base hover:bg-white/15"
            : "size-11 text-lg hover:bg-paper"
        )}
      >
        +
      </button>
    </div>
  );
}
