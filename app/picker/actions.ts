"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/types";

// Sets `picked` on every order_item for this product, across every order
// still on the shopping list (status new or picking). The shopping list
// aggregates by product across orders, so ticking one line ticks all of them.
export async function setProductPicked(productId: number, picked: boolean) {
  const { data: openOrders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .in("status", ["new", "picking"]);
  if (ordersError) throw ordersError;

  const orderIds = (openOrders ?? []).map((o) => o.id);
  if (orderIds.length === 0) return;

  const { error } = await supabase
    .from("order_items")
    .update({ picked })
    .eq("product_id", productId)
    .in("order_id", orderIds);
  if (error) throw error;

  revalidatePath("/picker");
}

export async function setOrderStatus(orderId: number, status: OrderStatus) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;

  revalidatePath("/picker");
}
