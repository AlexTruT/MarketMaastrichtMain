import Image from "next/image";
import Link from "next/link";
import { getProducts, getStalls } from "@/lib/data";
import {
  amsterdamAt,
  getNextMarketFriday,
  isComingSoon,
  isDealActive,
} from "@/lib/pricing";
import { ProductGrid } from "@/components/home/ProductGrid";
import { MarketHighlights } from "@/components/home/MarketHighlights";
import { MarketClock } from "@/components/home/MarketClock";
import { clockLabel } from "@/lib/market-clock";
import marketPhoto from "@/assets/vrijdagmarkt-groentekraam-maastricht-eighty8things_3475807105.webp";

function formatMarketDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Amsterdam",
  });
}

export default async function HomePage() {
  const today = new Date();
  const [products, stalls] = await Promise.all([getProducts(), getStalls()]);
  const stallNames = Object.fromEntries(stalls.map((s) => [s.id, s.name]));
  const nextFriday = getNextMarketFriday(today);
  const cutoff = amsterdamAt(nextFriday, 10);
  const close = amsterdamAt(nextFriday, 15);

  const deals = products.filter((p) => isDealActive(p, today));
  const comingSoon = products.filter((p) => isComingSoon(p, today));
  const marketDateLine = `Next market: ${formatMarketDate(nextFriday)}, 09:00 to 15:00`;

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
          marketDateLine={marketDateLine}
        />
      </div>
      <p className="text-meta max-w-[46ch] pt-3 text-ink/55">
        Order before Friday 10:00 · Pickup free · Delivery €4.50
      </p>
      <div className="pt-5">
        <Link
          href="#market"
          className="inline-flex h-12 items-center rounded-md bg-awning px-5 text-sm font-medium text-paper transition-transform duration-150 ease-out hover:bg-awning/90 focus-visible:ring-2 focus-visible:ring-awning focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none active:scale-[0.99]"
        >
          Browse this week&apos;s market
        </Link>
      </div>
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

        {/* Desktop: 48px under header; copy vertically centres with the photo. */}
        <div className="page-wide pt-5 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pt-12 lg:pb-2">
          <div className="w-full max-w-[560px] text-left lg:col-span-5 lg:max-w-none">
            {heroCopy}
          </div>
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

      {/* Desktop: 96px under hero; mobile gap unchanged. */}
      <div className="page-wide flex flex-col gap-12 pt-9 pb-6 lg:pt-24">
        <MarketHighlights
          deals={deals}
          comingSoon={comingSoon}
          stallNames={stallNames}
          today={today}
        />

        <section id="market" className="scroll-mt-24 border-t border-cobble pt-10">
          <h2 className="display-lg">The whole market</h2>
          <p className="text-meta max-w-[46ch] pt-1.5 text-ink/55">
            Everything our shopper can pick this Friday. Filter by stall corner.
          </p>
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
