"use server";

import { revalidatePath } from "next/cache";
import { fetchReadyHomeStops } from "@/lib/courier-live";
import { requirePickerAccess } from "@/lib/picker-auth";
import { supabase } from "@/lib/supabase";

export async function loadCourierReadyStops() {
  return fetchReadyHomeStops();
}

/**
 * Mark a live home-delivery order out for delivery or delivered.
 * Reuses the picker unlock cookie (same ungated-when-unset demo pattern).
 */
export async function setCourierOrderStatus(
  orderId: number,
  status: "out" | "delivered"
): Promise<{ ok: true } | { error: string }> {
  const gate = await requirePickerAccess();
  if (gate) return { error: gate.error };

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { error: "Invalid order." };
  }
  if (status !== "out" && status !== "delivered") {
    return { error: "Invalid status." };
  }

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, fulfilment, status")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError || !order) {
    return { error: "Order not found." };
  }
  if (order.fulfilment !== "home") {
    return { error: "Only home-delivery orders can be updated here." };
  }

  if (status === "out") {
    if (order.status !== "ready" && order.status !== "out") {
      return { error: "Order must be ready before riding out." };
    }
  } else if (order.status !== "ready" && order.status !== "out") {
    return { error: "Order is not out for delivery." };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    console.error("setCourierOrderStatus:", error);
    return { error: "Could not update order status." };
  }

  revalidatePath("/courier");
  revalidatePath("/picker");
  return { ok: true };
}
