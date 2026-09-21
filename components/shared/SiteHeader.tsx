"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HeaderCart } from "@/components/shared/HeaderCart";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import type { Product } from "@/lib/types";

const LINKS = [
  { href: "/", label: "Market" },
  { href: "/stalls", label: "Stalls" },
  { href: "/profile", label: "Profile" },
  { href: "/why", label: "Why" },
] as const;

function linkIsActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({
  products,
  todayIso,
}: {
  products: Product[];
  todayIso: string;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 overflow-visible border-b border-cobble bg-paper">
      <div className="page-wide flex items-end gap-3 overflow-visible pt-3 pb-2 sm:gap-6 sm:pt-4 sm:pb-2.5">
        <Link
          href="/"
          className="display-lg inline-flex min-h-11 shrink-0 items-end text-awning"
          aria-label="Merret, home"
        >
          Merret
        </Link>

        <div className="ml-auto flex min-w-0 items-end gap-1 sm:gap-1.5">
          <nav
            aria-label="Primary"
            className="flex min-w-0 flex-nowrap items-end gap-x-0.5 text-sm sm:gap-x-1 sm:text-lede"
          >
            {LINKS.map((link) => {
              const active = linkIsActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : undefined}
                  className={cn(
                    "-mb-0.5 inline-flex min-h-11 shrink-0 items-end border-b-2 px-2 pb-1 transition-[color,border-color] duration-150 ease-out sm:px-2.5",
                    active
                      ? "border-awning font-medium text-awning"
                      : "border-transparent font-normal text-ink/65 hover:text-awning"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <span
            aria-hidden
            className="mb-2.5 hidden h-4 w-px shrink-0 bg-cobble sm:block"
          />

          <LanguageToggle />
          <HeaderCart products={products} todayIso={todayIso} />
        </div>
      </div>
    </header>
  );
}
