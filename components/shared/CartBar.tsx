"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatRange, lineTotals } from "@/lib/pricing";
import type { Product } from "@/lib/types";

type CartBarProps = {
  products: Product[];
  today: Date | string;
};

export function CartBar({ products, today }: CartBarProps) {
  const { items, count } = useCart();
  const prevCount = useRef(count);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const timer = window.setTimeout(() => setBump(false), 320);
      prevCount.current = count;
      return () => window.clearTimeout(timer);
    }
    prevCount.current = count;
  }, [count]);

  if (count === 0) return null;

  let min = 0;
  let max = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const line = lineTotals(product, item.qty, today);
    min += line.min;
    max += line.max;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <Link
        href="/cart"
        className="pointer-events-auto mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between gap-3 rounded-md bg-awning px-5 text-paper shadow-[0_-2px_12px_rgba(22,22,22,0.08)] transition-transform active:translate-y-px"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={`grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-sm font-semibold tabular-nums ${bump ? "cart-count-bump" : ""}`}
          >
            {count}
          </span>
          <span className="truncate text-[0.9375rem] font-medium">View cart</span>
        </span>
        <span className="shrink-0 text-[0.9375rem] font-semibold tabular-nums">
          {formatRange(min, max)}
        </span>
      </Link>
    </div>
  );
}
