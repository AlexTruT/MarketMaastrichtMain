"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { unitRange, formatRange } from "@/lib/pricing";
import type { Product } from "@/lib/types";

type CartBarProps = {
  products: Product[];
  today: Date;
};

export function CartBar({ products, today }: CartBarProps) {
  const { items, count } = useCart();

  if (count === 0) return null;

  let min = 0;
  let max = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const range = unitRange(product, today);
    min += range.min * item.qty;
    max += range.max * item.qty;
  }

  return (
    <div className="sticky bottom-0 z-30 border-t border-cobble bg-paper shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      <Link
        href="/cart"
        className="mx-auto flex w-full max-w-[640px] items-center justify-between px-4 py-3"
      >
        <span className="text-sm">
          {count} {count === 1 ? "item" : "items"} · {formatRange(min, max)}
        </span>
        <span className="rounded-md bg-awning px-4 py-2 text-sm font-medium text-paper">
          View cart
        </span>
      </Link>
    </div>
  );
}
