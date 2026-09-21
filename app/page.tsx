import Image from "next/image";
import { getProducts, getStalls } from "@/lib/data";
import { getNextMarketFriday, isComingSoon, isDealActive } from "@/lib/pricing";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductShelf } from "@/components/shared/ProductShelf";
import { ProductGrid } from "@/components/home/ProductGrid";
import { MarketClock } from "@/components/home/MarketClock";
import marketPhoto from "@/assets/vrijdagmarkt-groentekraam-maastricht-eighty8things_3475807105.webp";

function formatMarketDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function at(day: Date, hour: number): Date {
  const d = new Date(day);
  d.setHours(hour, 0, 0, 0);
  return d;
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
      <section>
        {/* Full-bleed hero — outer layout has no max-width, so the photo
            can span the viewport without breakout hacks. */}
        <div className="relative h-[220px] w-full overflow-hidden md:h-[42vh] md:max-h-[26rem]">
          <Image
            src={marketPhoto}
            alt="A vegetable stall on the Markt during the Maastricht Friday market"
            fill
            sizes="100vw"
            priority
            placeholder="blur"
            className="object-cover object-[center_42%]"
          />
        </div>

        <div className="mx-auto w-full max-w-[1200px] px-4 pt-6">
          <h1 className="display-xl max-w-[14ch]">
            Someone walks the market for you
          </h1>
          <div className="pt-5">
            <MarketClock
              cutoffIso={at(nextFriday, 10).toISOString()}
              closeIso={at(nextFriday, 15).toISOString()}
              fallback="Opening"
            />
          </div>
          <p className="pt-3 text-sm text-ink/55">
            Next market {formatMarketDate(nextFriday)}, 09:00 to 15:00.
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 pt-10 pb-4">
        {(deals.length > 0 || comingSoon.length > 0) && (
          <div className="flex flex-col gap-8">
            {deals.length > 0 && (
              <section>
                <h2 className="display-lg text-maastricht-red">
                  This week&apos;s deals
                </h2>
                <p className="pt-1 text-sm text-ink/55">
                  Prices our shopper checked on the boards this morning.
                </p>
                <ProductShelf dense className="mt-5">
                  {deals.map((product) => (
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
              </section>
            )}

            {comingSoon.length > 0 && (
              <section>
                <h2 className="display-md">Not in season yet</h2>
                <p className="pt-1 text-sm text-ink/55">
                  The date on the card is the Friday it lands on the stall.
                </p>
                <ProductShelf dense className="mt-5">
                  {comingSoon.map((product) => (
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
              </section>
            )}
          </div>
        )}

        <section>
          <h2 className="display-lg">The whole market</h2>
          <ProductGrid
            products={products}
            stallNames={stallNames}
            todayIso={today.toISOString()}
          />
        </section>
      </div>
    </>
  );
}
