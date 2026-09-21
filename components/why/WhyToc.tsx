"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "need", label: "The gap" },
  { id: "customers", label: "The bet" },
  { id: "how", label: "How it works" },
  { id: "pricing", label: "The money" },
  { id: "sources", label: "Sources" },
] as const;

export function WhyToc() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block"
    >
      <p className="text-meta text-ink/45">On this page</p>
      <ul className="mt-3 flex flex-col gap-1 border-l border-cobble">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pl-3 text-sm transition-colors",
                active === section.id
                  ? "border-awning font-medium text-awning"
                  : "border-transparent text-ink/55 hover:text-awning"
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
