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

/**
 * Deals lead (buy now). Coming-soon is quieter secondary context.
 * Stacked under 640px; half-width side by side from sm. Dense = 2-col shelves.
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
    <div className="grid gap-10 sm:grid-cols-2 sm:items-start sm:gap-6">
      {deals.length > 0 && (
        <section
          id="deals"
          className="scroll-mt-24 lg:rounded-xl lg:bg-cobble/35 lg:p-6"
        >
          <h2 className="display-md text-maastricht-red">
            This week&apos;s deals
          </h2>
          <p className="text-meta max-w-[40ch] pt-1.5 text-ink/55">
            Board prices our shopper checked this morning — add before Friday
            10:00.
          </p>
          <ProductShelf dense className="mt-5">
            {cards(deals, stallNames, today)}
          </ProductShelf>
        </section>
      )}

      {comingSoon.length > 0 && (
        <section className="sm:pt-1 lg:pt-2">
          <h2 className="display-sm text-ink/70">Coming later</h2>
          <p className="text-meta max-w-[40ch] pt-1 text-ink/45">
            Date on the card is the Friday it lands.
          </p>
          <ProductShelf dense className="mt-4">
            {cards(comingSoon, stallNames, today)}
          </ProductShelf>
        </section>
      )}
    </div>
  );
}
