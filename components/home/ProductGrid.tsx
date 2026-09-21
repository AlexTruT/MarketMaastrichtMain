"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductShelf } from "@/components/shared/ProductShelf";
import type { Product, ProductCategory } from "@/lib/types";

const CATEGORIES: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "vegetables", label: "Vegetables" },
  { value: "fruit", label: "Fruit" },
  { value: "fish", label: "Fish" },
  { value: "cheese", label: "Cheese" },
  { value: "bakery", label: "Bakery" },
  { value: "pantry", label: "Pantry" },
  { value: "flowers", label: "Flowers" },
  { value: "more", label: "More" },
];

type ProductGridProps = {
  products: Product[];
  stallNames: Record<string, string>;
  todayIso: string;
};

export function ProductGrid({
  products,
  stallNames,
  todayIso,
}: ProductGridProps) {
  const today = useMemo(() => new Date(todayIso), [todayIso]);
  const [category, setCategory] = useState<ProductCategory | "all">("all");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      map.set(product.category, (map.get(product.category) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const available = CATEGORIES.filter(
    (c) => c.value === "all" || counts.has(c.value)
  );
  const visible = products.filter(
    (product) => category === "all" || product.category === category
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter the market by category"
        className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {available.map((c) => {
          const active = category === c.value;
          return (
            <button
              key={c.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(c.value)}
              className={cn(
                "flex h-11 shrink-0 items-center rounded-full px-3.5 text-sm transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98]",
                active
                  ? "bg-awning font-medium text-paper"
                  : "bg-cobble/55 text-ink/70 hover:bg-cobble"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="pt-8 text-sm text-ink/55">
          Nothing in this corner of the market this week. Try another category.
        </p>
      ) : (
        <ProductShelf dense className="pt-8">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              stallName={
                product.stall_id ? stallNames[product.stall_id] : null
              }
              today={today}
            />
          ))}
        </ProductShelf>
      )}
    </div>
  );
}
