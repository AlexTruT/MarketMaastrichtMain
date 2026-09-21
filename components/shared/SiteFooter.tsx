"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Quiet links under the shop — not shown on picker or courier tools. */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/courier") || pathname.startsWith("/picker")) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-cobble">
      <div className="page-wide flex flex-wrap items-baseline gap-x-4 gap-y-2 px-4 py-6 text-meta text-ink/55">
        <span>Merret · Maastricht</span>
        <Link
          href="/privacy"
          className="underline-offset-2 hover:text-awning hover:underline"
        >
          Privacy
        </Link>
        <Link
          href="/terms"
          className="underline-offset-2 hover:text-awning hover:underline"
        >
          Terms
        </Link>
      </div>
    </footer>
  );
}
