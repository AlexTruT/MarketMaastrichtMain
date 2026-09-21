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
 * Weekly deals and coming-soon side by side from md up (each column its own
 * heading + 2-up shelf), stacked on mobile. Cards use the default size so
 * highlight images sit closer to the main market grid, not the tiny compact
 * strip.
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
    <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-8 lg:gap-12">
      {deals.length > 0 && (
        <section>
          <h2 className="display-md text-maastricht-red">
            This week&apos;s deals
          </h2>
          <p className="text-meta max-w-[40ch] pt-1.5 text-ink/55">
            Prices our shopper checked on the boards this morning.
          </p>
          <ProductShelf className="mt-5">
            {cards(deals, stallNames, today)}
          </ProductShelf>
        </section>
      )}

      {comingSoon.length > 0 && (
        <section>
          <h2 className="display-md">Not in season yet</h2>
          <p className="text-meta max-w-[40ch] pt-1.5 text-ink/55">
            The date on the card is the Friday it lands on the stall.
          </p>
          <ProductShelf className="mt-5">
            {cards(comingSoon, stallNames, today)}
          </ProductShelf>
        </section>
      )}
    </div>
  );
}
