import "server-only";
import { supabase } from "./supabase";
import type { Product, Stall } from "./types";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getStalls(): Promise<Stall[]> {
  const { data, error } = await supabase
    .from("stalls")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getStall(id: string): Promise<Stall | null> {
  const { data, error } = await supabase
    .from("stalls")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProductsByStall(id: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("stall_id", id)
    .order("sort", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
