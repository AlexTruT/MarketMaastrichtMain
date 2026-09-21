"use client";

import React from "react";
import { Map, ShoppingBasket, Wallet, type LucideIcon } from "lucide-react";

export type CourierTab = "hub" | "route" | "earnings";

const TABS: Array<{ id: CourierTab; label: string; Icon: LucideIcon }> = [
  { id: "hub", label: "Markt hub", Icon: ShoppingBasket },
  { id: "route", label: "My route", Icon: Map },
  { id: "earnings", label: "Shift", Icon: Wallet },
];

export function CourierTabBar({
  active,
  onChange,
  badges,
}: {
  active: CourierTab;
  onChange: (tab: CourierTab) => void;
  badges: Partial<Record<CourierTab, number>>;
}) {
  return (
    <nav className="z-40 shrink-0 border-t border-cobble bg-paper pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-160">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          const badge = badges[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                isActive ? "text-awning" : "text-ink-faint"
              }`}
            >
              <span className="relative leading-none" aria-hidden>
                <tab.Icon className="size-5" strokeWidth={isActive ? 2.4 : 1.8} />
                {badge ? (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-maastricht-red px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                ) : null}
              </span>
              {tab.label}
              {isActive && (
                <span className="absolute top-0 h-0.5 w-10 rounded-full bg-awning" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
