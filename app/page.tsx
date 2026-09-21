import Image from "next/image";
import { getProducts, getStalls } from "@/lib/data";
import { getNextMarketFriday, isComingSoon, isDealActive } from "@/lib/pricing";
import { ProductGrid } from "@/components/home/ProductGrid";
import { MarketHighlights } from "@/components/home/MarketHighlights";
import { MarketClock } from "@/components/home/MarketClock";
import { clockLabel, clockNote } from "@/lib/market-clock";
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
  const cutoff = at(nextFriday, 10);
  const close = at(nextFriday, 15);

  const deals = products.filter((p) => isDealActive(p, today));
  const comingSoon = products.filter((p) => isComingSoon(p, today));

  const heroCopy = (
    <>
      <h1 className="display-xl max-w-[14ch]">You pick, we deliver</h1>
      <p className="text-lede max-w-[40ch] pt-2.5 text-ink/70">
        Our shopper walks the Friday market for you.
      </p>
      <div className="pt-4">
        <MarketClock
          cutoffIso={cutoff.toISOString()}
          closeIso={close.toISOString()}
          initialLabel={clockLabel(today, cutoff, close)}
          initialNote={clockNote(today, cutoff, close)}
        />
      </div>
      <p className="text-meta pt-3 text-ink/55">
        Next market {formatMarketDate(nextFriday)}, 09:00 to 15:00.
      </p>
    </>
  );

  return (
    <>
      <section>
        {/* Under lg: full-bleed photo. 220px &lt;640, 320px from 640–1023. */}
        <div className="relative h-[220px] w-full overflow-hidden sm:h-[320px] lg:hidden">
          <Image
            src={marketPhoto}
            alt="A vegetable stall on the Markt during the Maastricht Friday market"
            fill
            sizes="100vw"
            priority
            quality={80}
            placeholder="blur"
            className="object-cover object-[center_42%]"
          />
        </div>

        <div className="page-wide pt-5 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pt-10 lg:pb-2">
          {/* Same left edge as section headings; max 560px under lg. */}
          <div className="w-full max-w-[560px] text-left lg:col-span-5 lg:max-w-none">
            {heroCopy}
          </div>
          {/* No priority here — avoids a second preload; mobile LCP owns priority. */}
          <div className="relative col-span-7 hidden aspect-4/3 overflow-hidden rounded-[16px] lg:block">
            <Image
              src={marketPhoto}
              alt="A vegetable stall on the Markt during the Maastricht Friday market"
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              quality={80}
              placeholder="blur"
              className="object-cover object-[center_42%]"
            />
          </div>
        </div>
      </section>

      <div className="page-wide flex flex-col gap-12 pt-9 pb-6">
        <MarketHighlights
          deals={deals}
          comingSoon={comingSoon}
          stallNames={stallNames}
          today={today}
        />

        <section className="border-t border-cobble pt-10">
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
