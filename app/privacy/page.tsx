import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — Merret",
  description: "How Merret handles your data when you order from the market.",
};

export default function PrivacyPage() {
  return (
    <article className="page-narrow px-4 pt-8 pb-12">
      <h1 className="display-lg">Privacy</h1>
      <p className="text-meta pt-2 text-ink/55">Last updated 21 September 2026</p>

      <div className="text-lede flex flex-col gap-5 pt-6 text-ink/80">
        <p>
          Merret is a personal shopper for the Maastricht Friday market. This
          page explains what we collect when you place an order and how we use
          it. Keep it short: we only need what we need to buy and hand over
          your bag.
        </p>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">What we collect</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Your name and phone number (so the shopper and courier can reach you).</li>
            <li>
              Delivery address or pickup point, time window, and any note you
              leave at checkout.
            </li>
            <li>What you ordered and the prices we recorded for that order.</li>
            <li>
              On the profile page, a short phone confirmation code shown on
              screen (no SMS provider in this demo).
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">How we use it</h2>
          <p>
            To shop the Markt for you, pack your crate, deliver or hold it for
            pickup, and show you your recent orders after you confirm your
            phone. We do not sell your data or use it for advertising.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Who sees it</h2>
          <p>
            Our shopper and courier see what they need to fulfil the order.
            Hosting providers that run this site may process the same data on
            our behalf. Payment is cash or card when the crate is handed over —
            we do not store card numbers online.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">How long we keep it</h2>
          <p>
            Order details stay as long as we need them for fulfilment and a
            short record of what was bought. Profile session cookies expire
            after about a week unless you sign out sooner.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Your choices</h2>
          <p>
            Ask us to correct or delete an order record by contacting Merret
            with the phone number on your pickup ticket. You can clear the
            profile session with Sign out on your orders page.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="display-md text-ink">Contact</h2>
          <p>
            Questions about this policy: reach Merret via the phone number you
            used at checkout, or through the team running this Maastricht
            market demo.
          </p>
        </section>
      </div>

      <p className="text-meta pt-10 text-ink/50">
        <Link href="/terms" className="text-awning underline-offset-2 hover:underline">
          Terms
        </Link>
        {" · "}
        <Link href="/" className="text-awning underline-offset-2 hover:underline">
          Back to the market
        </Link>
      </p>
    </article>
  );
}
