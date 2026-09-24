"use server";

import { revalidatePath } from "next/cache";
import { fetchReadyHomeStops } from "@/lib/courier-live";
import { requirePickerAccess } from "@/lib/picker-auth";
import { supabase } from "@/lib/supabase";
import type { DeliveryStop } from "@/lib/courier-types";

export type CourierStopsResult = {
  stops: DeliveryStop[];
  error: string | null;
  /** PICKER_SECRET is set and this browser has not unlocked /picker. */
  locked: boolean;
};

/**
 * Live stops carry customer names, phones and addresses, so they sit behind
 * the same picker unlock as the order status writes.
 */
export async function loadCourierReadyStops(): Promise<CourierStopsResult> {
  const gate = await requirePickerAccess();
  if (gate) return { stops: [], error: null, locked: true };

  const result = await fetchReadyHomeStops();
  return { ...result, locked: false };
}

type CourierStatus = "ready" | "out" | "delivered";

/** Which current order statuses each courier write may start from. */
const ALLOWED_FROM: Record<CourierStatus, string[]> = {
  // Riding out, or a retry after a flaky network.
  out: ["ready", "out"],
  delivered: ["ready", "out"],
  // Handing a crate back to the hub when a shift is reset mid-route.
  ready: ["out"],
};

/**
 * Mark a live home-delivery order out, delivered, or back to ready.
 * Reuses the picker unlock cookie (same ungated-when-unset demo pattern).
 */
export async function setCourierOrderStatus(
  orderId: number,
  status: CourierStatus
): Promise<{ ok: true } | { error: string }> {
  const gate = await requirePickerAccess();
  if (gate) return { error: gate.error };

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { error: "Invalid order." };
  }
  if (!(status in ALLOWED_FROM)) {
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
  if (order.status === status) {
    return { ok: true };
  }
  if (!ALLOWED_FROM[status].includes(order.status)) {
    return {
      error:
        status === "ready"
          ? "Order is no longer out for delivery."
          : "Order must be ready before riding out.",
    };
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
