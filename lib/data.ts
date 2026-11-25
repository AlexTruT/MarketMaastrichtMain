import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { DEMO_PRODUCTS, DEMO_STALLS } from "./demo-catalogue";
import { readDemoOrder } from "./demo-order";
import { getNextMarketFriday } from "./pricing";
import { hasSupabase, supabase } from "./supabase";
import type { Order, OrderItemWithProduct, Product, Stall } from "./types";

// React cache() dedupes within one request (layout + page). unstable_cache
// persists across requests for 60s so dynamic routes (profile, etc.) don't
// re-hit Supabase on every navigation. supabase-js bypasses Next's fetch cache.

export type Catalogue = {
  products: Product[];
  stalls: Stall[];
  /** True when the built-in seed copy is shown instead of the database. */
  demo: boolean;
};

/** Week after the next market Friday, as YYYY-MM-DD. */
function comingSoonDate(today: Date): string {
  const next = getNextMarketFriday(today);
  next.setUTCDate(next.getUTCDate() + 7);
  return next.toISOString().slice(0, 10);
}

export function demoCatalogue(today: Date = new Date()): Catalogue {
  const soon = comingSoonDate(today);
  return {
    products: DEMO_PRODUCTS.map((p) => ({
      ...p,
      deal_starts_on: p.deal_starts_on === "COMING_SOON" ? soon : null,
    })),
    stalls: DEMO_STALLS,
    demo: true,
  };
}

const fetchCatalogue = unstable_cache(
  async (): Promise<Catalogue> => {
    if (!hasSupabase()) return demoCatalogue();
    const [products, stalls] = await Promise.all([
      supabase.from("products").select("*").order("sort", { ascending: true }),
      supabase.from("stalls").select("*").order("name", { ascending: true }),
    ]);
    const error = products.error ?? stalls.error;
    if (error) {
      // Loud in the logs and visible on every page (demo banner), so a dead
      // database never looks like an empty market.
      console.error("[catalogue] Supabase read failed, showing demo catalogue:", error);
      return demoCatalogue();
    }
    return { products: products.data ?? [], stalls: stalls.data ?? [], demo: false };
  },
  ["catalogue"],
  { revalidate: 60 }
);

export const getCatalogue = cache(async (): Promise<Catalogue> => fetchCatalogue());

export const getProducts = cache(
  async (): Promise<Product[]> => (await getCatalogue()).products
);

export const getStalls = cache(
  async (): Promise<Stall[]> => (await getCatalogue()).stalls
);

export const getStall = cache(
  async (id: string): Promise<Stall | null> =>
    (await getStalls()).find((s) => s.id === id) ?? null
);

export const getProductsByStall = cache(
  async (id: string): Promise<Product[]> =>
    (await getProducts()).filter((p) => p.stall_id === id)
);

type OrderWithProducts = Order & { order_items: OrderItemWithProduct[] };

// Used by /order/[id] to show the confirmation screen.
export const getOrder = cache(async (id: number): Promise<OrderWithProducts | null> => {
  const { demo, products } = await getCatalogue();
  if (demo) {
    const order = await readDemoOrder(products);
    return order?.id === id ? order : null;
  }
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(*))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
});

/** Digits only, strip leading NL country code / trunk 0 for loose matching. */
export function phoneDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("31") && digits.length >= 11) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

/**
 * Lightweight buyer lookup for /profile after the phone OTP session is set.
 * Matches on digit-normalised phone so "06 1234 5601" and "0612345601" both work.
 */
export const getOrdersByPhone = cache(
  async (
    phone: string
  ): Promise<OrderWithProducts[]> => {
    const needle = phoneDigits(phone);
    if (needle.length < 8) return [];

    const { demo, products } = await getCatalogue();
    if (demo) {
      const order = await readDemoOrder(products);
      return order && phoneDigits(order.phone) === needle ? [order] : [];
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, product:products(*))")
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) throw error;

    // Exact match on normalised digits (NL trunk 0 / +31 stripped the same way
    // as buyer session phones). Avoids loose endsWith collisions.
    return (data ?? [])
      .filter((order) => phoneDigits(order.phone) === needle)
      .slice(0, 8);
  }
);
