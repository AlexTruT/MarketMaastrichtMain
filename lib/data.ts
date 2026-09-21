import "server-only";
import { cache } from "react";
import { supabase } from "./supabase";
import type { Product, Stall } from "./types";

// supabase-js doesn't go through Next's fetch cache, so without this,
// calling e.g. getProducts() from both a page and a layout would hit the
// database twice for one request. React's cache() dedupes calls made
// during the same render — it never persists across requests, so data is
// exactly as fresh as before, just without redundant round-trips.

export const getProducts = cache(async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort", { ascending: true });
  if (error) throw error;
  return data ?? [];
});

export const getStalls = cache(async (): Promise<Stall[]> => {
  const { data, error } = await supabase
    .from("stalls")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
});

export const getStall = cache(async (id: string): Promise<Stall | null> => {
  const { data, error } = await supabase
    .from("stalls")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
});

export const getProductsByStall = cache(
  async (id: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("stall_id", id)
      .order("sort", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
);
