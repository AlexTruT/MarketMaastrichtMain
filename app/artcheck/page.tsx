import { getProducts } from "@/lib/data";
import { Produce } from "@/components/shared/Produce";

export default async function ArtCheck() {
  const products = await getProducts();
  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-6 p-4">
      {products.map((p) => (
        <div key={p.id}>
          <div className="relative aspect-square overflow-hidden rounded-sm bg-paper ring-1 ring-cobble/50">
            <Produce name={p.name} category={p.category} />
          </div>
          <p className="pt-1 text-[11px] leading-tight">{p.name}</p>
        </div>
      ))}
    </div>
  );
}
