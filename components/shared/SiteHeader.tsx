"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Market" },
  { href: "/stalls", label: "Stalls" },
  { href: "/map", label: "Map" },
  { href: "/profile", label: "Profile" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-paper">
      <div className="mx-auto flex w-full max-w-[1200px] items-baseline justify-between gap-3 px-4 pt-3 pb-2.5">
        <Link
          href="/"
          className="display-md shrink-0 text-awning"
          aria-label="Merret, home"
        >
          Merret
        </Link>
        <nav className="flex min-w-0 flex-wrap items-baseline justify-end gap-x-4 gap-y-1 text-sm">
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
                  "-mb-0.5 border-b-2 pb-0.5 transition-colors",
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
