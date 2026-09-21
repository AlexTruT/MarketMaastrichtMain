"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/types";

const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "picking",
  "ready",
  "out",
  "delivered",
];

// Server actions are real POST endpoints under the hood — TypeScript types
// only constrain the app's own client code, not a hand-crafted request. The
// database has matching check constraints too, but failing fast here avoids
// relying on that alone.
function assertPositiveInt(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${name}.`);
  }
}

// Sets `picked` on every order_item for this product, across every order
// still on the shopping list (status new or picking). The shopping list
// aggregates by product across orders, so ticking one line ticks all of them.
export async function setProductPicked(productId: number, picked: boolean) {
  assertPositiveInt(productId, "productId");
  if (typeof picked !== "boolean") throw new Error("Invalid picked value.");

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
  assertPositiveInt(orderId, "orderId");
  if (!ORDER_STATUSES.includes(status)) throw new Error("Invalid status.");

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;

  revalidatePath("/picker");
}
