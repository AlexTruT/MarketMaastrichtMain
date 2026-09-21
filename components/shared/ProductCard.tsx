"use client";

import Link from "next/link";
import { PriceCard } from "@/components/shared/PriceCard";
import { Produce } from "@/components/shared/Produce";
import { QtyStepper } from "@/components/shared/QtyStepper";
import { useCart } from "@/lib/cart";
import { isDealActive, isComingSoon, unitRange } from "@/lib/pricing";
import type { Product } from "@/lib/types";

type ProductCardProps = {
  product: Product;
  stallName?: string | null;
  today: Date | string;
  /** Off on a stall's own page, where naming the stall on every tile is noise. */
  showSource?: boolean;
  /** Compact for deals / coming-soon highlight shelves only. */
  size?: "default" | "compact";
};

function formatStartDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Goods on the stall table: the produce sits on the paper and the price is
 * written on a card propped against it. Nothing here is boxed — the sign is
 * the only element allowed to lift off the page, which is what makes a
 * screen of these read as a market rather than a catalogue.
 */
export function ProductCard({
  product,
  stallName,
  today,
  showSource = true,
  size = "default",
}: ProductCardProps) {
  const { items, add, setQty, ready } = useCart();
  const deal = isDealActive(product, today);
  const comingSoon = isComingSoon(product, today);
  const { min, max } = unitRange(product, today);
  // Wait for localStorage cart so SSR (+) matches the first client paint.
  const cartItem = ready
    ? items.find((item) => item.productId === product.id)
    : undefined;
  const compact = size === "compact";

  return (
    <article className="group flex h-full min-w-0 flex-col">
      <div className="relative">
        <div className="relative aspect-square overflow-hidden rounded-md bg-paper ring-1 ring-cobble/50 transition-[box-shadow,ring-color] duration-200 ease-out lg:group-hover:ring-2 lg:group-hover:ring-awning/45">
          <div className="absolute inset-0 transition-transform duration-200 ease-out lg:group-hover:scale-[1.03]">
            <Produce name={product.name} category={product.category} />
          </div>
        </div>

        {comingSoon ? (
          <span
            className={
              compact
                ? "price-sign absolute -bottom-2 left-1.5 bg-cobble text-base leading-tight text-ink/70"
                : "price-sign absolute -bottom-2.5 left-2 bg-cobble text-[1.25rem] leading-tight text-ink/70"
            }
          >
            {formatStartDate(product.deal_starts_on!)}
          </span>
        ) : (
          <PriceCard
            min={min}
            max={max}
            oldMin={deal ? product.price_min_cents : undefined}
            oldMax={deal ? product.price_max_cents : undefined}
            size={compact ? "sm" : "md"}
            className={
              compact ? "absolute -bottom-2 left-1.5" : "absolute -bottom-2.5 left-2"
            }
          />
        )}

        {!comingSoon &&
          (cartItem ? (
            <div className={compact ? "absolute top-1 right-1" : "absolute top-1.5 right-1.5"}>
              <QtyStepper
                name={product.name}
                qty={cartItem.qty}
                onChange={(qty) => setQty(product.id, qty)}
                tone="awning"
              />
            </div>
          ) : (
            <button
              type="button"
              aria-label={`Add ${product.name} to your bag`}
              onClick={() => add(product.id)}
              className={
                compact
                  ? "absolute top-1 right-1 grid size-9 place-items-center rounded-full bg-awning text-base leading-none text-paper shadow-sm transition-transform duration-150 ease-out hover:scale-105 active:scale-95"
                  : "absolute top-1.5 right-1.5 grid size-11 place-items-center rounded-full bg-awning text-lg leading-none text-paper shadow-sm transition-transform duration-150 ease-out hover:scale-105 active:scale-95"
              }
            >
              +
            </button>
          ))}
      </div>

      <div
        className={
          compact
            ? "flex min-w-0 flex-1 flex-col gap-0.5 pt-3"
            : "flex min-w-0 flex-1 flex-col gap-0.5 pt-4"
        }
      >
        <h3 className="display-sm line-clamp-2 leading-tight">{product.name}</h3>
        <p className="text-meta text-ink/55">{product.unit}</p>
        {deal && product.deal_note ? (
          <p className="line-clamp-2 text-xs text-maastricht-red">
            {product.deal_note}
          </p>
        ) : null}
        {!showSource ? null : product.stall_id && stallName ? (
          <Link
            href={`/stalls/${product.stall_id}`}
            className="mt-auto block truncate pt-1 text-xs text-awning underline decoration-awning/30 underline-offset-2 transition-[text-decoration-color] duration-150 ease-out hover:decoration-awning"
          >
            {stallName}
          </Link>
        ) : (
          <p className="mt-auto pt-1 text-xs leading-snug text-ink/45">
            Picked by our shopper at the best stall of the day
          </p>
        )}
      </div>
    </article>
  );
}
