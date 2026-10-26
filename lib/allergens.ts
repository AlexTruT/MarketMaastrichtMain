import type { Product } from "./types";

/**
 * The 14 allergens EU Regulation 1169/2011 (Annex II) requires us to name.
 * For food sold online they must be visible before the order is placed, so
 * the keys here match the check constraint in supabase-allergens.sql.
 */
export const ALLERGENS = {
  gluten: "gluten",
  crustaceans: "crustaceans",
  eggs: "egg",
  fish: "fish",
  peanuts: "peanuts",
  soy: "soy",
  milk: "milk",
  nuts: "tree nuts",
  celery: "celery",
  mustard: "mustard",
  sesame: "sesame",
  sulphites: "sulphites",
  lupin: "lupin",
  molluscs: "molluscs",
} as const;

export type Allergen = keyof typeof ALLERGENS;

/** Flowers and plants are not food; saying "no allergens" there is noise. */
function isFood(product: Pick<Product, "category">): boolean {
  return product.category !== "flowers";
}

/**
 * One line of allergen copy for a product, or null when there is nothing to
 * say. `allergens` is null (or missing, before the migration has run) when
 * the stall has not confirmed it yet, which must never read as "none".
 */
export function allergenLine(
  product: Pick<Product, "category" | "allergens">
): { text: string; tone: "contains" | "none" | "unknown" } | null {
  if (!isFood(product)) return null;
  const list = product.allergens;
  if (list == null) {
    return { text: "Allergens not confirmed yet, ask us", tone: "unknown" };
  }
  if (list.length === 0) {
    return { text: "No listed allergens", tone: "none" };
  }
  return {
    text: `Contains ${list.map((key) => ALLERGENS[key] ?? key).join(", ")}`,
    tone: "contains",
  };
}
