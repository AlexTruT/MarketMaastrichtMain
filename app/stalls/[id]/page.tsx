import Image from "next/image";
import { notFound } from "next/navigation";
import { getProducts, getProductsByStall, getStall } from "@/lib/data";
import { stallScene } from "@/lib/stall-scenes";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductShelf } from "@/components/shared/ProductShelf";
import { CartBar } from "@/components/shared/CartBar";
import { SellerProfileHeader } from "@/components/stalls/SellerProfileHeader";

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

  const scene = stallScene(stall);

  return (
    <>
      {/* Full-bleed market scene — same breakout pattern as the home hero. */}
      <div className="relative h-[min(58vw,20rem)] w-screen max-w-[100vw] ml-[calc(50%-50vw)] overflow-hidden bg-cobble">
        <Image
          src={scene.src}
          alt={scene.alt}
          fill
          sizes="100vw"
          priority
          placeholder="blur"
          className="object-cover"
          style={{ objectPosition: scene.position }}
        />
      </div>

      <div className="flex flex-col px-4 pt-6 pb-4">
        <SellerProfileHeader stall={stall} />

        <section className="pt-10">
          <h2 className="display-md">On the table this Friday</h2>
          <p className="max-w-[48ch] pt-2 text-sm leading-relaxed text-ink/65">
            Fixed prices from {stall.owner}. You pay what the card says.
          </p>
          {stallProducts.length === 0 ? (
            <p className="pt-4 text-sm text-ink/55">
              Nothing listed from this stall yet. Our shopper will still walk
              past it on Friday.
            </p>
          ) : (
            <ProductShelf dense className="pt-7">
              {stallProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  stallName={stall.name}
                  showSource={false}
                  today={today}
                />
              ))}
            </ProductShelf>
          )}
        </section>
      </div>
      <CartBar products={allProducts} today={today} />
    </>
  );
}
