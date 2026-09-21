"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const COPYRIGHT = "© 2026 Merret. Maastricht Friday market.";

function showsCartBar(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/stalls" || pathname.startsWith("/stalls/")) return true;
  return false;
}

/** Quiet links under the shop — not shown on picker or courier tools. */
export function SiteFooter() {
  const pathname = usePathname();
  const { count } = useCart();
  if (pathname.startsWith("/courier") || pathname.startsWith("/picker")) {
    return null;
  }

  const clearCartBar = showsCartBar(pathname) && count > 0;

  return (
    <footer
      className={cn(
        "mt-auto border-t border-cobble",
        clearCartBar &&
          "pb-[calc(3.5rem+env(safe-area-inset-bottom)+1.5rem)] lg:pb-0"
      )}
    >
      {/* Mobile: compact link row (unchanged feel). Desktop: brand + links. */}
      <div className="page-wide py-6 lg:hidden">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 text-meta text-ink/55">
          <span>Merret · Maastricht</span>
          <span className="text-ink/40">Personal project</span>
          <Link
            href="/why"
            className="underline-offset-2 transition-colors duration-150 ease-out hover:text-awning hover:underline"
          >
            Why Merret
          </Link>
          <Link
            href="/privacy"
            className="underline-offset-2 transition-colors duration-150 ease-out hover:text-awning hover:underline"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="underline-offset-2 transition-colors duration-150 ease-out hover:text-awning hover:underline"
          >
            Terms
          </Link>
        </div>
        <p className="text-xs pt-3 text-ink/40">{COPYRIGHT}</p>
      </div>

      <div className="page-wide hidden py-12 lg:flex lg:items-start lg:justify-between lg:gap-8">
        <div className="max-w-[36ch]">
          <p className="display-sm text-awning">Merret</p>
          <p className="text-meta pt-1.5 text-ink/55">
            The Maastricht Friday market, delivered — or ready at pickup.
          </p>
          <p className="text-xs pt-4 text-ink/40">{COPYRIGHT}</p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-baseline gap-x-4 gap-y-2 text-meta text-ink/55"
        >
          <Link
            href="/why"
            className="underline-offset-2 transition-colors duration-150 ease-out hover:text-awning hover:underline"
          >
            Why Merret
          </Link>
          <Link
            href="/privacy"
            className="underline-offset-2 transition-colors duration-150 ease-out hover:text-awning hover:underline"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="underline-offset-2 transition-colors duration-150 ease-out hover:text-awning hover:underline"
          >
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
