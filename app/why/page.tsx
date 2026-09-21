import type { Metadata } from "next";
import Link from "next/link";
import { WhyToc } from "@/components/why/WhyToc";

export const metadata: Metadata = {
  title: {
    absolute: "Why Merret",
  },
  description:
    "Why Merret exists: market access in Maastricht, who it serves, and how the money works.",
  openGraph: {
    title: "Why Merret",
    description:
      "Why Merret exists: market access in Maastricht, who it serves, and how the money works.",
    url: "https://merret.vercel.app/why",
  },
};

const WHO = [
  { group: "People working from home", share: "45%" },
  { group: "Students & internationals", share: "30%" },
  { group: "Families", share: "15%" },
  { group: "Cafés & offices", share: "10%" },
] as const;

export default function WhyPage() {
  return (
    <article className="mx-auto w-full max-w-[40rem] px-4 pt-8 pb-12 lg:max-w-[75rem]">
      <h1 className="display-lg">Why Merret</h1>
      <p className="text-lede max-w-[40ch] pt-3 text-ink/70">
        The Friday market is great — if you can get there between 09:00 and
        15:00. Most people cannot.
      </p>
      <p className="text-meta pt-2 text-ink/50">
        Planning notes · figures exclude VAT · assumptions, not results
      </p>

      <div className="pt-10 lg:grid lg:grid-cols-[11rem_minmax(0,40rem)] lg:items-start lg:gap-12">
        <WhyToc />

        <div className="flex max-w-[40rem] flex-col gap-12">
          <section id="need" className="scroll-mt-28">
            <h2 className="display-md text-ink">The gap</h2>
            <ul className="text-lede mt-4 space-y-2.5 text-ink/75">
              <li>Markets run weekday daytime — work, study and care get in the way. [1]</li>
              <li>One order, one delivery, several stalls — no vendor webshops.</li>
              <li>Vendors keep full prices and pay no commission.</li>
            </ul>
          </section>

          <section id="customers" className="scroll-mt-28">
            <h2 className="display-md text-ink">The bet</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: "Orders / market day", value: "100" },
                { label: "Radius", value: "3.5 km" },
                { label: "Days / month", value: "8.5" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md bg-cobble/30 px-2.5 py-3 sm:px-3 sm:py-4"
                >
                  <p className="text-meta text-ink/50">{stat.label}</p>
                  <p className="price-sign mt-2 text-xl leading-tight sm:text-2xl">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            <ul className="mt-5 divide-y divide-cobble border-y border-cobble">
              {WHO.map((row) => (
                <li
                  key={row.group}
                  className="flex items-baseline justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="text-ink/80">{row.group}</span>
                  <span className="shrink-0 tabular-nums text-ink">
                    {row.share}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-meta pt-3 text-ink/50">
              Assumed mix for a 100-order day · ~350–450 households to recruit
            </p>
          </section>

          <section id="how" className="scroll-mt-28">
            <h2 className="display-md text-ink">How it works</h2>
            <ol className="mt-5 flex flex-col gap-4">
              {[
                "Order online before Friday 10:00.",
                "Our shopper walks the Markt with every list.",
                "Crates leave for home delivery or the pickup stand.",
                "You pay when the bag is handed over.",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-awning text-xs font-semibold text-paper tabular-nums">
                    {i + 1}
                  </span>
                  <span className="text-lede pt-0.5 text-ink/80">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section id="pricing" className="scroll-mt-28">
            <h2 className="display-md text-ink">The money</h2>
            <p className="text-lede mt-3 text-ink/75">
              Groceries at stall prices + <strong className="font-medium text-ink">15%</strong>{" "}
              online markup + <strong className="font-medium text-ink">€4.50</strong>{" "}
              delivery (pickup free). Vendors keep 100% of the grocery bill. Tips
              go to couriers. [3]
            </p>

            <div className="-mx-4 mt-5 overflow-x-auto px-4 [scrollbar-width:thin]">
              <table className="w-full min-w-[18rem] border-collapse text-left text-meta">
                <caption className="sr-only">
                  Modelled Merret fees and surplus at 100 orders
                </caption>
                <thead>
                  <tr className="border-b border-cobble bg-cobble/35 text-ink/55">
                    <th className="py-2.5 pr-3 pl-3 font-medium">At 100 orders</th>
                    <th className="py-2.5 pr-3 text-right font-medium">Per day</th>
                    <th className="py-2.5 pr-3 text-right font-medium">Per month</th>
                  </tr>
                </thead>
                <tbody className="text-ink/80">
                  <tr className="border-b border-cobble/70">
                    <td className="py-2.5 pr-3 pl-3">Fee revenue</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">€907</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">€7,705</td>
                  </tr>
                  <tr className="border-b border-cobble/70 bg-cobble/15">
                    <td className="py-2.5 pr-3 pl-3">Operating costs</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">€575</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">€4,891</td>
                  </tr>
                  <tr className="font-medium text-ink">
                    <td className="py-3 pr-3 pl-3">Surplus</td>
                    <td className="py-3 pr-3 text-right tabular-nums">€331</td>
                    <td className="py-3 pr-3 text-right tabular-nums">€2,814</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-meta pt-3 text-ink/50">
              Break-even ~62 orders/day · bike kit ~€7.3k · model only
            </p>
          </section>

          <section id="sources" className="scroll-mt-28">
            <h2 className="display-md text-ink">Sources</h2>
            <ol className="text-meta mt-3 list-decimal space-y-1 pl-5 text-ink/60">
              <li>Gemeente Maastricht — market hours</li>
              <li>Staat van Maastricht 2024 — households 2023</li>
              <li>Flink NL terms §8.4 — tips to couriers</li>
            </ol>
          </section>
        </div>
      </div>

      <p className="text-meta pt-10 text-ink/50">
        <Link
          href="/"
          className="text-awning underline-offset-2 hover:underline"
        >
          Back to the market
        </Link>
      </p>
    </article>
  );
}
