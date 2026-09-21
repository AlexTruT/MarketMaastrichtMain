import Image from "next/image";
import { getProducts, getStalls } from "@/lib/data";
import { getNextMarketFriday, isComingSoon, isDealActive } from "@/lib/pricing";
import { ProductGrid } from "@/components/home/ProductGrid";
import { MarketHighlights } from "@/components/home/MarketHighlights";
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

        <div className="page-wide px-4 pt-6">
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
          <p className="text-meta pt-3 text-ink/55">
            Next market {formatMarketDate(nextFriday)}, 09:00 to 15:00.
          </p>
        </div>
      </section>

      <div className="page-wide flex flex-col gap-10 px-4 pt-10 pb-4">
        <MarketHighlights
          deals={deals}
          comingSoon={comingSoon}
          stallNames={stallNames}
          today={today}
        />

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
