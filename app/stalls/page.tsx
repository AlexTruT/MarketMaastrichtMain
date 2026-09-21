import { getProducts, getStalls } from "@/lib/data";
import { StallsBrowser } from "@/components/stalls/StallsBrowser";
import type { StallListItem } from "@/components/stalls/StallRow";

export default async function StallsPage() {
  const [stalls, products] = await Promise.all([getStalls(), getProducts()]);

  const counts = new Map<string, number>();
  for (const product of products) {
    if (!product.stall_id) continue;
    counts.set(product.stall_id, (counts.get(product.stall_id) ?? 0) + 1);
  }

  const items: StallListItem[] = stalls.map((stall) => ({
    ...stall,
    itemCount: counts.get(stall.id) ?? 0,
  }));

  // Mobile: narrow column. Desktop: full 1200px for the 2-col card grid.
  return (
    <div className="mx-auto w-full max-w-[40rem] pb-4 lg:max-w-[75rem]">
      <div className="px-4 pt-8">
        <h1 className="display-lg">Partner stalls</h1>
        <p className="text-lede max-w-[56ch] pt-3 text-ink/70">
          Fixed prices from stalls we shop first. Fish on Boschstraat, flowers
          at Mosae Forum, everything else around the Stadhuis. Open Friday
          09:00 to 15:00.
        </p>
      </div>

      <StallsBrowser stalls={items} />
    </div>
  );
}
