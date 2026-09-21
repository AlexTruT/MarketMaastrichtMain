import Link from "next/link";
import { getProducts, getStalls } from "@/lib/data";
import { CartBar } from "@/components/shared/CartBar";

export default async function StallsPage() {
  const today = new Date();
  const [stalls, products] = await Promise.all([getStalls(), getProducts()]);

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Stalls</h1>
        <p className="text-sm text-muted-foreground">
          Our partner stalls at the Friday market. Everything else comes from
          the rest of the market — our shopper picks the best stall of the
          day.
        </p>
        <ul className="flex flex-col divide-y divide-cobble border-y border-cobble">
          {stalls.map((stall) => (
            <li key={stall.id}>
              <Link
                href={`/stalls/${stall.id}`}
                className="flex items-center gap-3 py-3"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-cobble/40 text-3xl">
                  {stall.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{stall.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {stall.owner}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stall.origin}
                    {stall.km_from_market != null
                      ? ` · ${stall.km_from_market} km`
                      : ""}{" "}
                    · {stall.years_at_market} years at the market
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <CartBar products={products} today={today} />
    </>
  );
}
