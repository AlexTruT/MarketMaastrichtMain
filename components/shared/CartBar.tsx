"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import {
  formatEuro,
  isComingSoon,
  lineTotals,
  markupCents,
  midpoint,
} from "@/lib/pricing";
import type { Product } from "@/lib/types";

type CartBarProps = {
  products: Product[];
  today: Date | string;
};

export function CartBar({ products, today }: CartBarProps) {
  const { items, count, ready } = useCart();
  const prevCount = useRef<number | null>(null);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (!ready) return;
    // First paint after hydrate: adopt count without a bump animation.
    if (prevCount.current === null) {
      prevCount.current = count;
      return;
    }
    if (count > prevCount.current) {
      setBump(true);
      const timer = window.setTimeout(() => setBump(false), 220);
      prevCount.current = count;
      return () => window.clearTimeout(timer);
    }
    prevCount.current = count;
  }, [count, ready]);

  if (!ready || count === 0) return null;

  let subtotalMin = 0;
  let subtotalMax = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || isComingSoon(product, today)) continue;
    const line = lineTotals(product, item.qty, today);
    subtotalMin += line.min;
    subtotalMax += line.max;
  }
  // Sticky bar shows groceries + online markup (delivery chosen at checkout).
  const groceries = midpoint(subtotalMin, subtotalMax);
  const barTotal = groceries + markupCents(groceries);

  return (
    <div className="cart-bar-enter pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-paper pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
      <div className="page-wide">
      <Link
        href="/cart"
        className="pointer-events-auto flex h-14 w-full items-center justify-between gap-3 rounded-md bg-awning px-5 text-paper shadow-[0_-2px_12px_rgba(22,22,22,0.08)] transition-transform duration-150 ease-out active:scale-[0.99]"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={`grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-sm font-semibold tabular-nums ${bump ? "cart-count-bump" : ""}`}
          >
            {count}
          </span>
          <span className="truncate text-sm font-medium">View cart</span>
        </span>
        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {formatEuro(barTotal)}
        </span>
      </Link>
      </div>
    </div>
  );
}
