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
 * Plus/minus for a bag line. 44px hits, qty 0 means remove, 99 is the cap.
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
        "flex items-center rounded-full p-0.5",
        awning ? "bg-awning text-paper" : "bg-cobble/55 text-ink"
      )}
    >
      <button
        type="button"
        aria-label={`Remove one ${name}`}
        onClick={() => onChange(qty - 1)}
        className={cn(
          "grid size-11 place-items-center rounded-full text-lg leading-none active:translate-y-px",
          awning ? "hover:bg-white/15" : "hover:bg-paper"
        )}
      >
        −
      </button>
      <span
        aria-live="polite"
        className="min-w-6 text-center text-sm font-semibold tabular-nums"
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
          "grid size-11 place-items-center rounded-full text-lg leading-none active:translate-y-px disabled:opacity-40",
          awning ? "hover:bg-white/15" : "hover:bg-paper"
        )}
      >
        +
      </button>
    </div>
  );
}
