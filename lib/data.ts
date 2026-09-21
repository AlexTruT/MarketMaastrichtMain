import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { supabase } from "./supabase";
import type { Order, OrderItemWithProduct, Product, Stall } from "./types";

// React cache() dedupes within one request (layout + page). unstable_cache
// persists across requests for 60s so dynamic routes (profile, etc.) don't
// re-hit Supabase on every navigation. supabase-js bypasses Next's fetch cache.

const fetchProducts = unstable_cache(
  async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort", { ascending: true });
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      // Build / offline: don't take down every page that reads the catalogue.
      console.error("[getProducts]", err);
      return [];
    }
  },
  ["catalogue-products"],
  { revalidate: 60 }
);

const fetchStalls = unstable_cache(
  async (): Promise<Stall[]> => {
    try {
      const { data, error } = await supabase
        .from("stalls")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error("[getStalls]", err);
      return [];
    }
  },
  ["catalogue-stalls"],
  { revalidate: 60 }
);

export const getProducts = cache(async (): Promise<Product[]> => fetchProducts());

export const getStalls = cache(async (): Promise<Stall[]> => fetchStalls());

export const getStall = cache(async (id: string): Promise<Stall | null> => {
  try {
    const { data, error } = await supabase
      .from("stalls")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[getStall]", err);
    return null;
  }
});

export const getProductsByStall = cache(
  async (id: string): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("stall_id", id)
        .order("sort", { ascending: true });
      if (error) throw error;
      return data ?? [];
    } catch (err) {
      console.error("[getProductsByStall]", err);
      return [];
    }
  }
);

// Used by /order/[id] to show the confirmation screen.
export const getOrder = cache(
  async (
    id: number
  ): Promise<(Order & { order_items: OrderItemWithProduct[] }) | null> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, product:products(*))")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
);

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
  ): Promise<(Order & { order_items: OrderItemWithProduct[] })[]> => {
    const needle = phoneDigits(phone);
    if (needle.length < 8) return [];

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
