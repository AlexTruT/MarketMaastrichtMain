import { ProductCard } from "@/components/shared/ProductCard";
import { ProductShelf } from "@/components/shared/ProductShelf";
import type { Product } from "@/lib/types";

function cards(
  products: Product[],
  stallNames: Record<string, string>,
  today: Date
) {
  return products.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
      stallName={product.stall_id ? stallNames[product.stall_id] : null}
      today={today}
    />
  ));
}

const panelClass =
  "scroll-mt-24 lg:rounded-xl lg:bg-cobble/35 lg:p-6";

/**
 * Deals and coming-soon share the same panel treatment and heading rhythm.
 * Each panel is full width with the same shelf as the market grid below
 * (2 / 3 / 4 across), so a handful of deals reads as one row, not a 2×2 block.
 */
export function MarketHighlights({
  deals,
  comingSoon,
  stallNames,
  today,
}: {
  deals: Product[];
  comingSoon: Product[];
  stallNames: Record<string, string>;
  today: Date;
}) {
  if (deals.length === 0 && comingSoon.length === 0) return null;

  return (
    <div className="flex flex-col gap-10 sm:gap-6">
      {deals.length > 0 && (
        <section id="deals" className={panelClass}>
          <h2 className="display-md text-maastricht-red">
            This week&apos;s deals
          </h2>
          <p className="text-meta max-w-[40ch] pt-1.5 text-ink/55">
            Checked on the boards this morning.
          </p>
          <ProductShelf className="mt-5">
            {cards(deals, stallNames, today)}
          </ProductShelf>
        </section>
      )}

      {comingSoon.length > 0 && (
        <section className={panelClass}>
          <h2 className="display-md text-ink">Coming later</h2>
          <p className="text-meta max-w-[40ch] pt-1.5 text-ink/55">
            Date on the card is the Friday it lands.
          </p>
          <ProductShelf className="mt-5">
            {cards(comingSoon, stallNames, today)}
          </ProductShelf>
        </section>
      )}
    </div>
  );
}
