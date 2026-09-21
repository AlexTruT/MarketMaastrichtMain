"use server";

import { supabase } from "@/lib/supabase";
import { getProducts, phoneDigits } from "@/lib/data";
import { grantOrderConfirmation } from "@/lib/order-access";
import { feeFor, isComingSoon, markupCents, unitRange } from "@/lib/pricing";
import type { Fulfilment, Substitution } from "@/lib/types";

type PlaceOrderInput = {
  items: { productId: number; qty: number }[];
  customerName: string;
  phone: string;
  fulfilment: Fulfilment;
  address: string | null;
  pickupPoint: string | null;
  timeWindow: string;
  substitution: Substitution;
  note: string | null;
};

const SUBSTITUTIONS: Substitution[] = ["substitute", "skip", "call"];
const TIME_WINDOWS = ["12:00 to 13:00", "13:00 to 14:00", "14:00 to 15:00"];
const PICKUP_POINTS = ["Merret stand, Markt"];
const MAX_QTY = 99;

// Server actions are real POST endpoints under the hood, so every field is
// re-validated here rather than trusted from the client — including prices,
// which are recomputed from the database, never taken from the cart.
export async function placeOrder(
  input: PlaceOrderInput
): Promise<{ orderId: number } | { error: string }> {
  const customerName = input.customerName.trim();
  const phone = input.phone.trim();

  if (!customerName) return { error: "Add your name so we know whose bag this is." };
  if (!phone || phoneDigits(phone).length < 8) {
    return { error: "Add a phone number so our shopper can reach you." };
  }
  if (input.fulfilment !== "home" && input.fulfilment !== "pickup") {
    return { error: "Choose home delivery or a pickup point." };
  }
  if (input.fulfilment === "home" && !input.address?.trim()) {
    return { error: "Add an address for home delivery." };
  }
  if (
    input.fulfilment === "pickup" &&
    !PICKUP_POINTS.includes(input.pickupPoint ?? "")
  ) {
    return { error: "Choose a pickup point." };
  }
  if (!TIME_WINDOWS.includes(input.timeWindow)) {
    return { error: "Choose a delivery window." };
  }
  if (!SUBSTITUTIONS.includes(input.substitution)) {
    return { error: "Choose what to do if something is out of stock." };
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { error: "Your bag is empty." };
  }

  const today = new Date();
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));

  // Merge duplicate productIds (sum qty, capped) before validating lines.
  const merged = new Map<number, number>();
  for (const item of input.items) {
    if (
      typeof item?.productId !== "number" ||
      !Number.isInteger(item.productId) ||
      item.productId <= 0
    ) {
      return { error: "Your bag has an invalid item. Refresh and try again." };
    }
    if (
      typeof item.qty !== "number" ||
      !Number.isInteger(item.qty) ||
      item.qty < 1 ||
      item.qty > MAX_QTY
    ) {
      return {
        error: `Quantities must be whole numbers between 1 and ${MAX_QTY}.`,
      };
    }
    const next = Math.min(MAX_QTY, (merged.get(item.productId) ?? 0) + item.qty);
    merged.set(item.productId, next);
  }

  const lines: {
    product_id: number;
    qty: number;
    unit_min_cents: number;
    unit_max_cents: number;
  }[] = [];
  let subtotalMin = 0;
  let subtotalMax = 0;
  const failed: string[] = [];

  for (const [productId, qty] of merged) {
    const product = byId.get(productId);
    if (!product) {
      failed.push(
        "An item in your bag is no longer sold. Remove it and try again"
      );
      continue;
    }
    if (isComingSoon(product, today)) {
      failed.push(
        `${product.name} is coming soon. Remove it from your bag and try again`
      );
      continue;
    }
    const { min, max } = unitRange(product, today);
    if (
      !Number.isInteger(min) ||
      !Number.isInteger(max) ||
      min < 0 ||
      max < min
    ) {
      failed.push(
        `${product.name} has no price right now. Remove it from your bag and try again`
      );
      continue;
    }
    lines.push({
      product_id: product.id,
      qty,
      unit_min_cents: min,
      unit_max_cents: max,
    });
    subtotalMin += min * qty;
    subtotalMax += max * qty;
  }

  if (failed.length > 0) {
    return {
      error: `${failed.join(". ")}.`,
    };
  }
  if (lines.length === 0) return { error: "Your bag is empty." };
  if (
    !Number.isInteger(subtotalMin) ||
    !Number.isInteger(subtotalMax) ||
    subtotalMin < 0 ||
    subtotalMax < subtotalMin
  ) {
    return { error: "Could not price your bag. Remove an item and try again." };
  }

  const fee = feeFor(input.fulfilment);
  const markupMin = markupCents(subtotalMin);
  const markupMax = markupCents(subtotalMax);

  const orderRow = {
    customer_name: customerName,
    phone,
    fulfilment: input.fulfilment,
    address: input.fulfilment === "home" ? input.address!.trim() : null,
    pickup_point: input.fulfilment === "pickup" ? input.pickupPoint : null,
    time_window: input.timeWindow,
    substitution: input.substitution,
    note: input.note?.trim() || null,
    subtotal_min_cents: subtotalMin,
    subtotal_max_cents: subtotalMax,
    fee_cents: fee,
  };

  // Prefer storing the 15% snapshots. Live DBs created before
  // supabase-markup.sql reject those columns (PGRST204); retry without.
  let { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      ...orderRow,
      markup_min_cents: markupMin,
      markup_max_cents: markupMax,
    })
    .select("id")
    .single();

  if (orderError?.code === "PGRST204") {
    const retry = await supabase
      .from("orders")
      .insert(orderRow)
      .select("id")
      .single();
    order = retry.data;
    orderError = retry.error;
  }

  if (orderError || !order) {
    console.error("placeOrder: insert order failed:", orderError);
    return { error: "Could not place your order. Try again." };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(lines.map((line) => ({ ...line, order_id: order.id })));

  if (itemsError) {
    console.error("placeOrder: insert items failed:", itemsError);
    // No place_order RPC in schema — roll back the orphan order so success
    // only means both the order row and its items persisted.
    const { error: cleanupError } = await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);
    if (cleanupError) {
      console.error(
        "placeOrder: failed to delete orphan order",
        order.id,
        cleanupError
      );
    }
    return { error: "Could not place your order. Try again." };
  }

  await grantOrderConfirmation(order.id);
  return { orderId: order.id };
}
