import { notFound } from "next/navigation";
import { getProducts, getProductsByStall, getStall } from "@/lib/data";
import { ProductCard } from "@/components/shared/ProductCard";
import { CartBar } from "@/components/shared/CartBar";

export default async function StallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const today = new Date();
  const [stall, stallProducts, allProducts] = await Promise.all([
    getStall(id),
    getProductsByStall(id),
    getProducts(),
  ]);

  if (!stall) notFound();

  return (
    <>
      <div className="flex flex-col gap-6 p-4">
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-cobble/40 text-4xl">
              {stall.emoji}
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">
                {stall.name}
              </h1>
              <p className="text-sm text-muted-foreground">{stall.owner}</p>
            </div>
          </div>
          <p>{stall.story}</p>
          <dl className="grid grid-cols-2 gap-3 rounded-md border border-cobble p-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Origin</dt>
              <dd className="font-medium">{stall.origin}</dd>
            </div>
            {stall.km_from_market != null && (
              <div>
                <dt className="text-muted-foreground">Distance</dt>
                <dd className="font-medium">{stall.km_from_market} km</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">At the market</dt>
              <dd className="font-medium">{stall.years_at_market} years</dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Products</h2>
          <div className="grid grid-cols-2 gap-3">
            {stallProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                stallName={stall.name}
                today={today}
              />
            ))}
          </div>
        </section>
      </div>
      <CartBar products={allProducts} today={today} />
    </>
  );
}
