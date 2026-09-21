import type { Stall } from "@/lib/types";

/**
 * Read-only seller profile for a partner stall.
 * Owner leads; stall name is secondary. Pair with the scene photo above.
 * Sentence case labels per context.md — no all-caps.
 */
export function SellerProfileHeader({ stall }: { stall: Stall }) {
  const distance =
    stall.km_from_market != null ? `${stall.km_from_market} km` : "In town";

  return (
    <header className="flex flex-col gap-7">
      <div>
        <p className="text-meta text-awning">Seller · {stall.zone}</p>
        <h1 className="display-lg pt-1">{stall.owner}</h1>
        <p className="text-meta pt-1.5 text-ink/55">
          {stall.name} · {stall.years_at_market} years on the Markt
        </p>
      </div>

      <section className="border-l-2 border-awning/25 pl-5">
        <h2 className="text-meta text-ink/50">From the stallholder</h2>
        <p className="text-lede max-w-[56ch] pt-2.5 text-ink/90">{stall.story}</p>
      </section>

      <dl className="grid grid-cols-3 gap-4 border-t border-cobble pt-5">
        <div>
          <dt className="text-meta text-ink/50">From</dt>
          <dd className="pt-1 text-sm font-medium">{stall.origin}</dd>
        </div>
        <div>
          <dt className="text-meta text-ink/50">Distance</dt>
          <dd className="pt-1 text-sm font-medium tabular-nums">{distance}</dd>
        </div>
        <div>
          <dt className="text-meta text-ink/50">On the Markt</dt>
          <dd className="pt-1 text-sm font-medium tabular-nums">
            {stall.years_at_market} years
          </dd>
        </div>
      </dl>
    </header>
  );
}
