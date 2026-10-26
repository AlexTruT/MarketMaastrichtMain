import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms — Merret",
  description: "Terms for ordering from the Maastricht Friday market with Merret.",
};

export default function TermsPage() {
  return (
    <article className="page-narrow px-4 pt-8 pb-12">
      <h1 className="display-lg">Terms</h1>
      <p className="text-meta pt-2 text-ink/55">Last updated 24 September 2026</p>

      <div className="text-lede flex flex-col gap-5 pt-6 text-ink/80">
        <p>
          These terms cover ordering through Merret — someone walks the
          Maastricht Friday market for you and brings the bag home or to a
          pickup point. By placing an order you agree to them.
        </p>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">The service</h2>
          <p>
            Merret is a personal shopper, not a supermarket. We buy what you
            ask for from partner stalls and the wider Markt when stock allows.
            Prices on the site are what we expect to pay; some general-market
            items are a range. You pay what the shopper actually pays, never
            more than the top of that range, plus the service fee and any
            delivery fee shown at checkout.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Ordering</h2>
          <p>
            Orders for Friday need to be in before Friday 10:00. After that we
            may already be on the Markt. Give a reachable phone number — we use
            it if a stall is sold out or the courier cannot find you.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Payment</h2>
          <p>
            You pay when you place your order. The total is your groceries at
            stall prices, a service fee of 15% of the groceries (never more
            than €8), and €4.50 for home delivery. Pickup at the Merret pickup
            point by the Markt is free. The minimum order is €15 of groceries.
            Items sold as a price range are charged at the top of the range;
            if our shopper pays less, we refund the difference, including the
            lower service fee.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Substitutions and gaps</h2>
          <p>
            Markets sell out. At checkout you choose whether we substitute,
            skip, or call. Fresh food can vary in size and ripeness; we shop
            as carefully as we can but we are not the stallholder.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Allergens</h2>
          <p>
            Each product shows the allergens its stall has told us about.
            When a stall has not confirmed them yet, the product says so. Ask
            us before ordering it if you have an allergy. Market food is sold
            unpacked, next to other products, so we cannot rule out traces.
            If you have an allergy, add it to the note at checkout.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Delivery and pickup</h2>
          <p>
            Time windows are estimates for a busy Friday. Be reachable in your
            window. If nobody is home and we cannot leave the crate safely, we
            may take it back to the Merret pickup point by the Markt and text or call you.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Cancelling and returns</h2>
          <p>
            Fresh food and flowers spoil quickly, so once delivered
            they cannot be returned under the 14-day right of withdrawal
            (Dutch Civil Code, art. 6:230p). Anything we got wrong is covered
            under Liability below. Products that keep, such as honey, stroop,
            oil and bottled juice, can be returned unopened within 14 days of
            delivery. Tell us and we arrange the refund.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Liability</h2>
          <p>
            We take care with your order. We are not liable for stall closures,
            weather, traffic, or ordinary variation in fresh produce beyond
            refunding or replacing what we clearly got wrong — tell us the same
            day with your crate number.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Who we are</h2>
          <p>
            Merret is a student project in Maastricht preparing to launch. It
            is not run by the municipality or the market. Our registered name,
            address, KvK number and VAT number will be listed here once the
            company is registered.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Dutch law</h2>
          <p>
            These terms are governed by the law of the Netherlands. Courts in
            Limburg have jurisdiction for disputes that cannot be sorted
            informally.
          </p>
        </section>
      </div>

      <p className="text-meta pt-10 text-ink/50">
        <Link href="/privacy" className="text-awning underline-offset-2 hover:underline">
          Privacy
        </Link>
        {" · "}
        <Link href="/" className="text-awning underline-offset-2 hover:underline">
          Back to the market
        </Link>
      </p>
    </article>
  );
}
