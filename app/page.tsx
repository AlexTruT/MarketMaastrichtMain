import { getProducts, getStalls } from "@/lib/data";
import { getNextMarketFriday, isComingSoon, isDealActive } from "@/lib/pricing";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductGrid } from "@/components/home/ProductGrid";
import { CartBar } from "@/components/shared/CartBar";

function formatMarketDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default async function HomePage() {
  const today = new Date();
  const [products, stalls] = await Promise.all([getProducts(), getStalls()]);
  const stallNames = Object.fromEntries(stalls.map((s) => [s.id, s.name]));
  const nextFriday = getNextMarketFriday(today);

  const deals = products.filter((p) => isDealActive(p, today));
  const comingSoon = products.filter((p) => isComingSoon(p, today));

  return (
    <>
      <div className="flex flex-col gap-6 p-4">
        <section className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Friday market</h1>
          <p className="text-sm text-muted-foreground">
            Next market: {formatMarketDate(nextFriday)}, 09:00 to 15:00. Order
            before 10:00.
          </p>
        </section>

        {deals.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-maastricht-red">Deals</h2>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {deals.map((product) => (
                <div key={product.id} className="w-[220px] shrink-0">
                  <ProductCard
                    product={product}
                    stallName={product.stall_id ? stallNames[product.stall_id] : null}
                    today={today}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {comingSoon.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">Coming soon</h2>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {comingSoon.map((product) => (
                <div key={product.id} className="w-[220px] shrink-0">
                  <ProductCard
                    product={product}
                    stallName={product.stall_id ? stallNames[product.stall_id] : null}
                    today={today}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Market</h2>
          <ProductGrid
            products={products}
            stallNames={stallNames}
            todayIso={today.toISOString()}
          />
        </section>
      </div>
      <CartBar products={products} today={today} />
    </>
  );
}
