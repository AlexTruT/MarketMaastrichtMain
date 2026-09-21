"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { isComingSoon } from "@/lib/pricing";
import { CartBar } from "@/components/shared/CartBar";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

function showsCartBar(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/stalls" || pathname.startsWith("/stalls/")) return true;
  return false;
}

/**
 * Single CartBar for market browsing routes. Padding on the shared content
 * shell keeps the last product row clear of the sticky bar when it is open.
 */
export function LayoutCartBar({
  products,
  todayIso,
  children,
}: {
  products: Product[];
  todayIso: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { count, items, remove } = useCart();
  const today = useMemo(() => new Date(todayIso), [todayIso]);
  const onRoute = showsCartBar(pathname);
  // Bottom sticky bar is mobile-only; desktop uses the header cart.
  const barOpen = onRoute && count > 0;

  useEffect(() => {
    if (products.length === 0) return;
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || isComingSoon(product, today)) {
        remove(item.productId);
      }
    }
  }, [items, products, today, remove]);

  return (
    <>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          barOpen &&
            "pb-[calc(3.5rem+env(safe-area-inset-bottom)+1.5rem)] lg:pb-0"
        )}
      >
        {children}
      </div>
      {onRoute ? <CartBar products={products} today={today} /> : null}
    </>
  );
}
