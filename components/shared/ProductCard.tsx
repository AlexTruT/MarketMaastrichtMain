"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PriceCard } from "@/components/shared/PriceCard";
import { useCart } from "@/lib/cart";
import { isDealActive, isComingSoon, unitRange } from "@/lib/pricing";
import type { Product } from "@/lib/types";

type ProductCardProps = {
  product: Product;
  stallName?: string | null;
  today: Date;
};

export function ProductCard({ product, stallName, today }: ProductCardProps) {
  const { items, add, setQty } = useCart();
  const deal = isDealActive(product, today);
  const comingSoon = isComingSoon(product, today);
  const { min, max } = unitRange(product, today);
  const cartItem = items.find((item) => item.productId === product.id);

  const sourceLabel = product.stall_id
    ? stallName
    : "Picked by our shopper at the best stall of the day";

  return (
    <div className="flex flex-col gap-2 rounded-md border border-cobble bg-paper p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-cobble/40 text-3xl">
          {product.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium leading-tight">{product.name}</p>
          <p className="text-sm text-muted-foreground">{product.unit}</p>
          {sourceLabel && (
            <p className="truncate text-xs text-muted-foreground">
              {product.stall_id ? (
                <Link href={`/stalls/${product.stall_id}`} className="hover:text-awning">
                  {sourceLabel}
                </Link>
              ) : (
                sourceLabel
              )}
            </p>
          )}
        </div>
      </div>

      {comingSoon ? (
        <div className="flex items-center justify-between">
          <PriceCard min={min} max={max} />
          <span className="rounded-md bg-cobble px-2 py-1 text-xs font-medium">
            Coming {product.deal_starts_on}
          </span>
        </div>
      ) : (
        <div className="flex items-end justify-between">
          <PriceCard
            min={min}
            max={max}
            oldMin={deal ? product.price_min_cents : undefined}
            oldMax={deal ? product.price_max_cents : undefined}
            dealNote={deal ? product.deal_note ?? undefined : undefined}
          />
          {cartItem ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={`Remove one ${product.name}`}
                onClick={() => setQty(product.id, cartItem.qty - 1)}
              >
                –
              </Button>
              <span className="w-5 text-center font-medium">{cartItem.qty}</span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={`Add one more ${product.name}`}
                onClick={() => setQty(product.id, cartItem.qty + 1)}
              >
                +
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={() => add(product.id)}>
              Add
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
