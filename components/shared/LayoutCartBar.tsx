"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { CartBar } from "@/components/shared/CartBar";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

function showsCartBar(pathname: string): boolean {
  if (pathname === "/" || pathname === "/map") return true;
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
  const { count } = useCart();
  const today = useMemo(() => new Date(todayIso), [todayIso]);
  const onRoute = showsCartBar(pathname);
  const barOpen = onRoute && count > 0;

  return (
    <>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          barOpen && "pb-[calc(3.5rem+env(safe-area-inset-bottom)+1.5rem)]"
        )}
      >
        {children}
      </div>
      {onRoute ? <CartBar products={products} today={today} /> : null}
    </>
  );
}
