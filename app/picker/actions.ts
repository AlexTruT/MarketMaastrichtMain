"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { requirePickerAccess } from "@/lib/picker-auth";
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
  const gate = await requirePickerAccess();
  if (gate) throw new Error(gate.error);

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
  const gate = await requirePickerAccess();
  if (gate) throw new Error(gate.error);

  assertPositiveInt(orderId, "orderId");
  if (!ORDER_STATUSES.includes(status)) throw new Error("Invalid status.");

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;

  revalidatePath("/picker");
}

/**
 * Settled unit price for a ranged line after picking.
 * Requires `actual_unit_cents` on order_items (see supabase-order-actuals.sql).
 */
export async function setOrderItemActual(
  orderItemId: number,
  actualUnitCents: number
): Promise<{ ok: true } | { error: string }> {
  const gate = await requirePickerAccess();
  if (gate) return { error: gate.error };

  assertPositiveInt(orderItemId, "orderItemId");
  if (
    typeof actualUnitCents !== "number" ||
    !Number.isInteger(actualUnitCents) ||
    actualUnitCents < 0 ||
    actualUnitCents > 1_000_000
  ) {
    return { error: "Enter a whole-cent amount." };
  }

  const { data: item, error: fetchError } = await supabase
    .from("order_items")
    .select("id, unit_min_cents, unit_max_cents")
    .eq("id", orderItemId)
    .maybeSingle();

  if (fetchError || !item) return { error: "Order item not found." };

  if (
    actualUnitCents < item.unit_min_cents ||
    actualUnitCents > item.unit_max_cents
  ) {
    return {
      error: `Actual must be between ${item.unit_min_cents} and ${item.unit_max_cents} cents.`,
    };
  }

  const { error } = await supabase
    .from("order_items")
    .update({ actual_unit_cents: actualUnitCents, picked: true })
    .eq("id", orderItemId);

  if (error) {
    if (/actual_unit_cents/i.test(error.message ?? "")) {
      return {
        error:
          "Run supabase-order-actuals.sql in Supabase to enable post-pick actuals.",
      };
    }
    console.error("setOrderItemActual:", error);
    return { error: "Could not save actual price." };
  }

  revalidatePath("/picker");
  return { ok: true };
}
