import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/lib/types";

/**
 * Product photography for product tiles only.
 *
 * Every product on the market has a studio photo in `public/produce/`:
 * plain paper-white background, soft realistic shadow, shot from slightly
 * above, no props. One file per product, named by `produceKey(product.name)`.
 * Stall list/detail use market-scene photos from `lib/stall-scenes.ts`.
 */

export function produceKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Every key here must have a matching file at `public/produce/<key>.webp`. */
const PRODUCE_KEYS = [
  "tomatoes",
  "potatoes",
  "carrots",
  "leeks",
  "courgette",
  "butternut-pumpkin",
  "hokkaido-pumpkin",
  "spinach",
  "elstar-apples",
  "conference-pears",
  "plums",
  "apple-juice",
  "smoked-mackerel",
  "cod-fillet",
  "salmon-fillet",
  "zeeland-mussels",
  "old-gouda",
  "young-gouda",
  "remoudou",
  "herve",
  "cherry-vlaai",
  "vlaai-slice",
  "sourdough-loaf",
  "krentenmik",
  "free-range-eggs",
  "wildflower-honey",
  "limburgse-stroop",
  "sunflowers",
  "seasonal-bouquet",
  "bananas",
  "onions",
  "garlic",
  "mushrooms",
  "oranges",
  "grapes",
  "fresh-herbs",
  "bell-peppers",
  "minced-beef",
  "chicken-breast",
  "pork-chops",
  "verse-worst",
  "entrecote",
  "chicken-thighs",
] as const;

const HAS_PHOTO = new Set<string>(PRODUCE_KEYS);

/**
 * Map product names without their own file onto an existing studio photo.
 * Prefer this over inventing new photos for close cousins (jars, mushrooms, cheese).
 */
const PHOTO_ALIAS: Record<string, string> = {
  "extra-virgin-olive-oil": "limburgse-stroop",
  "chestnut-mushrooms": "mushrooms",
  "oyster-mushrooms": "mushrooms",
  "fresh-goat-cheese": "young-gouda",
  "aged-goat-cheese": "old-gouda",
  quinces: "conference-pears",
  "entrec-te": "entrecote",
};

/** Falls back to the category when a product has no photo of its own. */
const BY_CATEGORY: Record<ProductCategory, string> = {
  vegetables: "tomatoes",
  fruit: "elstar-apples",
  fish: "smoked-mackerel",
  meat: "minced-beef",
  cheese: "old-gouda",
  bakery: "sourdough-loaf",
  pantry: "free-range-eggs",
  flowers: "sunflowers",
  more: "onions",
};

function photoKey(name: string, category: ProductCategory): string {
  const key = produceKey(name);
  if (HAS_PHOTO.has(key)) return key;
  const alias = PHOTO_ALIAS[key];
  if (alias && HAS_PHOTO.has(alias)) return alias;
  return BY_CATEGORY[category];
}

/**
 * Fills its parent. The parent must be `relative` (or otherwise positioned)
 * and sized, e.g. `<span className="relative size-14 overflow-hidden ..." />`.
 */
export function Produce({
  name,
  category,
  className,
  label,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: {
  name: string;
  category: ProductCategory;
  className?: string;
  /** Only pass this where the product name is not already next to the tile. */
  label?: string;
  sizes?: string;
}) {
  const key = photoKey(name, category);
  const alt = label ?? name;
  return (
    <Image
      src={`/produce/${key}.webp`}
      alt={alt}
      fill
      sizes={sizes}
      quality={75}
      className={cn("object-cover", className)}
    />
  );
}
