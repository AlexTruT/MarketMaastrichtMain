"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shared/ProductCard";
import type { Product, ProductCategory } from "@/lib/types";

const CATEGORIES: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
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

export function ProductGrid({ products, stallNames, todayIso }: ProductGridProps) {
  const today = useMemo(() => new Date(todayIso), [todayIso]);
  const [category, setCategory] = useState<ProductCategory | "all">("all");

  const visible = products.filter(
    (product) => category === "all" || product.category === category
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={cn(
              "shrink-0 rounded-full border border-cobble px-3 py-1.5 text-sm font-medium",
              category === c.value
                ? "border-awning bg-awning text-paper"
                : "bg-paper text-ink"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {visible.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            stallName={product.stall_id ? stallNames[product.stall_id] : null}
            today={today}
          />
        ))}
      </div>
    </div>
  );
}
