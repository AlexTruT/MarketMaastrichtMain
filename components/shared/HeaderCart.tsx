"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import {
  formatEuro,
  isComingSoon,
  lineTotals,
  markupCents,
  midpoint,
} from "@/lib/pricing";
import { Produce } from "@/components/shared/Produce";
import { QtyStepper } from "@/components/shared/QtyStepper";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Product } from "@/lib/types";

type HeaderCartProps = {
  products: Product[];
  todayIso: string;
};

/**
 * Desktop-only header cart: trigger + right Sheet with lines and checkout.
 * Mobile keeps the sticky bottom CartBar.
 */
export function HeaderCart({ products, todayIso }: HeaderCartProps) {
  const { items, count, setQty, remove } = useCart();
  const today = new Date(todayIso);

  const lines = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product || isComingSoon(product, today)) return null;
      return { item, product, totals: lineTotals(product, item.qty, today) };
    })
    .filter((line): line is NonNullable<typeof line> => line != null);

  let subtotalMin = 0;
  let subtotalMax = 0;
  for (const line of lines) {
    subtotalMin += line.totals.min;
    subtotalMax += line.totals.max;
  }
  const groceries = midpoint(subtotalMin, subtotalMax);
  const subtotalWithMarkup = groceries + markupCents(groceries);
  const hasRange = subtotalMin !== subtotalMax;

  return (
    <Sheet>
      <SheetTrigger
        className="hidden min-h-11 items-center gap-2 rounded-md px-2.5 text-sm text-ink transition-colors hover:bg-cobble/40 focus-visible:ring-2 focus-visible:ring-awning focus-visible:outline-none lg:inline-flex"
        aria-label={
          count === 0
            ? "Open bag"
            : `Open bag, ${count} ${count === 1 ? "item" : "items"}, ${formatEuro(subtotalWithMarkup)}`
        }
      >
        <span className="relative grid size-9 place-items-center">
          <ShoppingBag className="size-5" aria-hidden />
          {count > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 grid min-w-4.5 place-items-center rounded-full bg-awning px-1 text-[0.65rem] font-semibold leading-none text-paper tabular-nums">
              {count}
            </span>
          ) : null}
        </span>
        {count > 0 ? (
          <span className="tabular-nums font-medium">
            {formatEuro(subtotalWithMarkup)}
          </span>
        ) : (
          <span className="text-ink/55">Bag</span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="gap-0 p-0">
        <SheetHeader className="border-b border-cobble">
          <SheetTitle>Your bag</SheetTitle>
          <SheetDescription>
            {count === 0
              ? "Nothing in it yet."
              : `${count} ${count === 1 ? "item" : "items"}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {lines.length === 0 ? (
            <p className="text-lede py-8 text-ink/60">
              The market is open Friday from 9. Add something from the stalls.
            </p>
          ) : (
            <ul>
              {lines.map(({ item, product, totals }) => (
                <li
                  key={product.id}
                  className="flex items-center gap-3 border-b border-cobble py-3.5"
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-paper ring-1 ring-cobble/50">
                    <Produce
                      name={product.name}
                      category={product.category}
                      sizes="48px"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-ink/55">
                      {product.unit} · {formatEuro(midpoint(totals.min, totals.max))}
                      {totals.min !== totals.max ? " (est.)" : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(product.id)}
                      className="mt-1 text-xs text-ink/45 underline-offset-2 hover:text-maastricht-red hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <QtyStepper
                    name={product.name}
                    qty={item.qty}
                    onChange={(qty) => setQty(product.id, qty)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <SheetFooter>
          {lines.length > 0 ? (
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-ink/60">
                {hasRange ? "Up to" : "Subtotal"}
              </span>
              <span className="font-medium tabular-nums">
                {formatEuro(
                  hasRange
                    ? subtotalMax + markupCents(subtotalMax)
                    : subtotalWithMarkup
                )}
              </span>
            </div>
          ) : null}
          <Link
            href="/cart"
            className="flex h-12 w-full items-center justify-center rounded-md bg-awning text-sm font-medium text-paper transition-colors hover:bg-awning/90"
          >
            Go to checkout
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
