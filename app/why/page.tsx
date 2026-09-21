import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "Why Merret",
  },
  description:
    "Why Merret exists: market access in Maastricht, who it serves, how fulfilment works, and the planning financial model.",
  openGraph: {
    title: "Why Merret",
    description:
      "Why Merret exists: market access in Maastricht, who it serves, how fulfilment works, and the planning financial model.",
    url: "https://merret.vercel.app/why",
  },
};

export default function WhyPage() {
  return (
    <article className="page-narrow px-4 pt-8 pb-12">
      <h1 className="display-lg">Why Merret</h1>
      <p className="text-lede max-w-[54ch] pt-3 text-ink/70">
        Making Maastricht&apos;s markets accessible throughout the week
      </p>
      <p className="text-meta max-w-[54ch] pt-3 text-ink/55">
        Personal project · September 2026 · All financial figures exclude VAT.
        Demand and budget figures are planning assumptions, not measured
        results.
      </p>

      <div className="text-lede flex flex-col gap-10 pt-10 text-ink/80">
        <section className="flex flex-col gap-3">
          <h2 className="display-md text-ink">Why this project is needed</h2>
          <p>
            Maastricht&apos;s Wednesday and Friday markets normally open from
            09:00 to 15:00. These hours can make visiting difficult for people
            with work, study or family commitments. [1] Merret would let
            customers order from several market vendors online throughout the
            week and receive their purchases on a market day.
          </p>
          <p>
            Customers gain one order and one delivery across several vendors.
            Vendors receive their full prices, pay no commission and do not need
            their own webshop. Merret manages ordering and customer
            communication, helping vendors reach customers who cannot visit.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="display-md text-ink">Customers and sales potential</h2>
          <p>
            The working target is 100 orders per market day, or 200 per week. For
            budgeting, the model uses 8.5 market days per month: 850 orders.
            Actual market days vary by month.
          </p>
          <p>
            The proposed starting delivery area is within 3.5 km of Markt
            square. The following customer mix and preferences are assumptions
            to test.
          </p>

          <div className="flex flex-col gap-0 sm:hidden">
            {[
              {
                group: "People working from home",
                orders: "45",
                purchases: "Vegetables, cheese, berries and bread",
                delivery: "40% morning; 60% evening",
              },
              {
                group:
                  "Students and international residents, including UM/Zuyd communities",
                orders: "30",
                purchases: "Speciality foods, snacks and cheese",
                delivery: "Evening, before dinner",
              },
              {
                group: "Families with children",
                orders: "15",
                purchases: "Larger meat and fish baskets",
                delivery: "Evening, before dinner",
              },
              {
                group: "Local cafés and offices",
                orders: "10",
                purchases: "Berries, milk and baked goods",
                delivery: "Morning",
              },
            ].map((row) => (
              <div
                key={row.group}
                className="border-b border-cobble/70 py-3.5 first:border-t"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-ink">{row.group}</p>
                  <p className="shrink-0 text-sm tabular-nums text-ink">
                    {row.orders}
                  </p>
                </div>
                <p className="pt-1 text-meta text-ink/65">{row.purchases}</p>
                <p className="pt-0.5 text-meta text-ink/50">{row.delivery}</p>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3 border-b border-cobble py-3.5 font-medium text-ink">
              <p className="text-sm">Total · 28 morning; 72 evening</p>
              <p className="text-sm tabular-nums">100</p>
            </div>
          </div>

          <div className="-mx-4 hidden overflow-x-auto px-4 sm:mx-0 sm:block sm:overflow-visible sm:px-0">
            <table className="w-full border-collapse text-left text-meta">
              <caption className="sr-only">
                Assumed customer mix for 100 orders per market day
              </caption>
              <thead>
                <tr className="border-b border-cobble bg-cobble/35 text-ink/60">
                  <th className="py-2.5 pr-3 pl-3 font-medium">
                    Customer group
                  </th>
                  <th className="py-2.5 pr-3 text-right font-medium whitespace-nowrap">
                    Orders / day
                  </th>
                  <th className="py-2.5 pr-3 font-medium">Likely purchases</th>
                  <th className="py-2.5 pr-3 font-medium">
                    Delivery preference
                  </th>
                </tr>
              </thead>
              <tbody className="text-ink/80">
                <tr className="border-b border-cobble/70 align-top">
                  <td className="py-3 pr-3 pl-3 font-medium text-ink">
                    People working from home
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums">45</td>
                  <td className="py-3 pr-3">
                    Vegetables, cheese, berries and bread
                  </td>
                  <td className="py-3 pr-3">40% morning; 60% evening</td>
                </tr>
                <tr className="border-b border-cobble/70 align-top bg-cobble/15">
                  <td className="py-3 pr-3 pl-3 font-medium text-ink">
                    Students and international residents, including UM/Zuyd
                    communities
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums">30</td>
                  <td className="py-3 pr-3">
                    Speciality foods, snacks and cheese
                  </td>
                  <td className="py-3 pr-3">Evening, before dinner</td>
                </tr>
                <tr className="border-b border-cobble/70 align-top">
                  <td className="py-3 pr-3 pl-3 font-medium text-ink">
                    Families with children
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums">15</td>
                  <td className="py-3 pr-3">Larger meat and fish baskets</td>
                  <td className="py-3 pr-3">Evening, before dinner</td>
                </tr>
                <tr className="border-b border-cobble/70 align-top bg-cobble/15">
                  <td className="py-3 pr-3 pl-3 font-medium text-ink">
                    Local cafés and offices
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums">10</td>
                  <td className="py-3 pr-3">Berries, milk and baked goods</td>
                  <td className="py-3 pr-3">Morning</td>
                </tr>
                <tr className="align-top font-medium text-ink">
                  <td className="py-3 pr-3 pl-3">Total</td>
                  <td className="py-3 pr-3 text-right tabular-nums">100</td>
                  <td className="py-3 pr-3" />
                  <td className="py-3 pr-3">28 morning; 72 evening</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            The marketing target is 350–450 regular households, plus business
            customers. With 90 household orders per market day, those households
            would need to order about 1.7–2.2 times per month on average.
            Ordering every 1.5–2 weeks is a stronger repeat-purchase scenario to
            test, rather than an established customer habit.
          </p>
          <p>
            For context, Maastricht recorded 70,726 households in 2023. [2] The
            suggested 8–10% share of the local target audience is unverified:
            the number of suitable customers within the delivery area has not
            been measured. Repeat purchases at the full price will be the test
            of demand.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="display-md text-ink">How the service works</h2>
          <p>
            Customers choose a market day and delivery window, then place their
            order before a cutoff agreed with vendors. Merret sends each vendor
            a consolidated order list. Vendors prepare and label their goods for
            an agreed morning handover; Merret combines purchases from different
            stalls into complete customer orders at a small collection point
            near Markt.
          </p>
          <p>
            Morning orders leave first. Evening orders remain appropriately
            stored, including refrigeration where needed, until their delivery
            window. Vendor preparation, collection space and storage must be
            agreed before launch. Customers approve substitutions and receive
            clear product, price and allergen information.
          </p>
          <p>
            The plan uses three couriers earning €16 per hour, each completing
            four deliveries per paid hour on average. Delivering 100 orders
            requires 100 ÷ 4 = 25 courier hours, averaging 8 hours 20 minutes
            per courier across the day. This includes loading, travel, waiting,
            handovers and returns. Three six-hour courier shifts would cover
            only 72 orders at that rate, so the budget uses the full 25 hours. A
            separate coordinator is budgeted for four hours of collection and
            order assembly.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="display-md text-ink">
            Pricing and expected financial result
          </h2>
          <p>
            The minimum grocery order is €25. Merret adds 15% to the vendor&apos;s
            price, plus €4.50 for delivery. Vendors retain the full grocery
            payment. Tips are optional and go entirely to couriers, following
            Flink&apos;s stated approach. [3]
          </p>
          <p>
            A minimum delivered order costs €25 + €3.75 + €4.50 = €33.25. The
            financial model assumes €35 including the 15% service fee, plus
            €4.50 delivery: €39.50 before any tip. The vendor share is €35 ÷ 1.15
            ≈ €30.43, leaving approximately €4.57 for Merret. The 15% is applied
            to the vendor price, not to the fee-inclusive €35. Pickup customers
            pay the 15% service fee without delivery; the figures below assume
            all 100 orders are delivered.
          </p>
          <p>
            At this volume, vendors receive approximately €3,043.48 per market
            day, or €25,869.57 per planning month. These grocery payments belong
            to vendors and are excluded from Merret&apos;s revenue.
          </p>

          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:thin] sm:mx-0 sm:overflow-visible sm:px-0">
            <table className="w-full min-w-[22rem] border-collapse text-left text-meta sm:min-w-0">
              <caption className="sr-only">
                Merret fee revenue and modelled operating costs
              </caption>
              <thead>
                <tr className="border-b border-cobble bg-cobble/35 text-ink/60">
                  <th className="py-2.5 pr-3 pl-2.5 font-medium sm:pl-3">
                    Merret&apos;s budget
                  </th>
                  <th className="py-2.5 pr-3 text-right font-medium whitespace-nowrap">
                    Per market day
                  </th>
                  <th className="py-2.5 pr-2.5 text-right font-medium whitespace-nowrap sm:pr-3">
                    Per month
                  </th>
                </tr>
              </thead>
              <tbody className="text-ink/80">
                <tr className="border-b border-cobble/70">
                  <td className="py-2.5 pr-3 pl-2.5 sm:pl-3">
                    15% service fees
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">€456.52</td>
                  <td className="py-2.5 pr-2.5 text-right tabular-nums sm:pr-3">
                    €3,880.43
                  </td>
                </tr>
                <tr className="border-b border-cobble/70 bg-cobble/15">
                  <td className="py-2.5 pr-3 pl-2.5 sm:pl-3">Delivery fees</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">€450.00</td>
                  <td className="py-2.5 pr-2.5 text-right tabular-nums sm:pr-3">
                    €3,825.00
                  </td>
                </tr>
                <tr className="border-b border-cobble font-medium text-ink">
                  <td className="py-2.5 pr-3 pl-2.5 sm:pl-3">
                    Total fee revenue
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">€906.52</td>
                  <td className="py-2.5 pr-2.5 text-right tabular-nums sm:pr-3">
                    €7,705.43
                  </td>
                </tr>
                <tr className="border-b border-cobble/70">
                  <td className="py-2.5 pr-3 pl-2.5 sm:pl-3">
                    Courier wages: 25 hours × €16
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">€400.00</td>
                  <td className="py-2.5 pr-2.5 text-right tabular-nums sm:pr-3">
                    €3,400.00
                  </td>
                </tr>
                <tr className="border-b border-cobble/70 bg-cobble/15">
                  <td className="py-2.5 pr-3 pl-2.5 sm:pl-3">
                    Coordinator: 4 hours × €16
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">€64.00</td>
                  <td className="py-2.5 pr-2.5 text-right tabular-nums sm:pr-3">
                    €544.00
                  </td>
                </tr>
                <tr className="border-b border-cobble/70">
                  <td className="py-2.5 pr-3 pl-2.5 sm:pl-3">
                    Collection-point rent
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">€29.41</td>
                  <td className="py-2.5 pr-2.5 text-right tabular-nums sm:pr-3">
                    €250.00
                  </td>
                </tr>
                <tr className="border-b border-cobble/70 bg-cobble/15">
                  <td className="py-2.5 pr-3 pl-2.5 sm:pl-3">
                    Payment processing: €0.29 per order
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">€29.00</td>
                  <td className="py-2.5 pr-2.5 text-right tabular-nums sm:pr-3">
                    €246.50
                  </td>
                </tr>
                <tr className="border-b border-cobble/70">
                  <td className="py-2.5 pr-3 pl-2.5 sm:pl-3">
                    Branded paper packaging: €0.25 per order
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">€25.00</td>
                  <td className="py-2.5 pr-2.5 text-right tabular-nums sm:pr-3">
                    €212.50
                  </td>
                </tr>
                <tr className="border-b border-cobble/70 bg-cobble/15">
                  <td className="py-2.5 pr-3 pl-2.5 sm:pl-3">
                    Three bikes: depreciation and charging
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">€28.00</td>
                  <td className="py-2.5 pr-2.5 text-right tabular-nums sm:pr-3">
                    €238.00
                  </td>
                </tr>
                <tr className="border-b border-cobble font-medium text-ink">
                  <td className="py-2.5 pr-3 pl-2.5 sm:pl-3">
                    Total modelled operating costs
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">€575.41</td>
                  <td className="py-2.5 pr-2.5 text-right tabular-nums sm:pr-3">
                    €4,891.00
                  </td>
                </tr>
                <tr className="font-medium text-ink">
                  <td className="py-3 pr-3 pl-2.5 sm:pl-3">Operating surplus</td>
                  <td className="py-3 pr-3 text-right tabular-nums">€331.11</td>
                  <td className="py-3 pr-2.5 text-right tabular-nums sm:pr-3">
                    €2,814.43
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            The coordinator, rent, processing, packaging and bike amounts are
            budget estimates supplied for the project. Totals use unrounded
            average basket shares and rent allocation. The surplus is 36.5% of
            fee revenue, before tax and any unbudgeted costs such as employer
            charges, marketing, software or additional staff time; it is not
            guaranteed take-home income.
          </p>
          <p>
            With the full planned courier and coordinator hours paid, the model
            breaks even at approximately 62 orders per market day, allowing
            payment and packaging costs to vary with orders. The estimated
            €7,300 initial budget for three electric bikes and bags equals about
            2.6 months of the modelled surplus at target volume. This is a
            simple investment-recovery comparison; actual cash payback depends
            on launch sales, other startup costs and the split between
            depreciation and cash expenses.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="display-md text-ink">
            Why the project is worth testing
          </h2>
          <p>
            Merret connects a specific access problem with a practical service:
            advance orders, coordinated vendor preparation and scheduled
            delivery. The pilot should test repeat purchases, the €35 average
            basket including the service fee, actual costs and additional vendor
            sales. These results will show whether the service can provide
            lasting value to customers and traders while earning a surplus.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="display-md text-ink">Sources</h2>
          <ol className="list-decimal space-y-1.5 pl-5 text-meta text-ink/70">
            <li>Gemeente Maastricht — Market days and opening hours</li>
            <li>
              Gemeente Maastricht — Staat van Maastricht 2024, household figures
              for 2023
            </li>
            <li>
              Flink — Dutch terms, section 8.4: voluntary tips for couriers
            </li>
          </ol>
        </section>
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
