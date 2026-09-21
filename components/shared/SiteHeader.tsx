"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Market" },
  { href: "/stalls", label: "Stalls" },
  { href: "/profile", label: "Profile" },
  { href: "/why", label: "Why" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-paper">
      <div className="page-wide flex items-end justify-between gap-2 px-4 pt-3 pb-2 sm:gap-6 sm:pt-4 sm:pb-2.5">
        <Link
          href="/"
          className="display-lg inline-flex min-h-11 shrink-0 items-end text-awning"
          aria-label="Merret, home"
        >
          Merret
        </Link>
        <nav
          aria-label="Primary"
          className="flex min-w-0 flex-nowrap items-end justify-end gap-x-0.5 text-sm sm:gap-x-1 sm:text-lede"
        >
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-0.5 inline-flex min-h-11 shrink-0 items-end border-b-2 px-2 pb-1 transition-[color,border-color] duration-150 ease-out sm:px-2.5",
                  active
                    ? "border-awning font-medium text-awning"
                    : "border-transparent text-ink/65 hover:text-awning"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div aria-hidden className="h-px w-full bg-cobble" />
    </header>
  );
}
