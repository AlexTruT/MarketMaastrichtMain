"use server";

import { supabase } from "@/lib/supabase";
import { getProducts } from "@/lib/data";
import { feeFor, isComingSoon, unitRange } from "@/lib/pricing";
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
const PICKUP_POINTS = [
  "Randwyck campus",
  "Buurtcentrum Malberg",
  "Merret stand, Markt",
];

// Server actions are real POST endpoints under the hood, so every field is
// re-validated here rather than trusted from the client — including prices,
// which are recomputed from the database, never taken from the cart.
export async function placeOrder(
  input: PlaceOrderInput
): Promise<{ orderId: number } | { error: string }> {
  const customerName = input.customerName.trim();
  const phone = input.phone.trim();

  if (!customerName) return { error: "Add your name." };
  if (!phone) {
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
  if (input.items.length === 0) return { error: "Your bag is empty." };

  const today = new Date();
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: {
    product_id: number;
    qty: number;
    unit_min_cents: number;
    unit_max_cents: number;
  }[] = [];
  let subtotalMin = 0;
  let subtotalMax = 0;

  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product || item.qty <= 0 || isComingSoon(product, today)) continue;
    const { min, max } = unitRange(product, today);
    lines.push({
      product_id: product.id,
      qty: item.qty,
      unit_min_cents: min,
      unit_max_cents: max,
    });
    subtotalMin += min * item.qty;
    subtotalMax += max * item.qty;
  }

  if (lines.length === 0) return { error: "Your bag is empty." };

  const fee = feeFor(input.fulfilment);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
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
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("placeOrder: insert order failed:", orderError);
    return { error: "Could not place your order. Try again." };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(lines.map((line) => ({ ...line, order_id: order.id })));

  if (itemsError) {
    console.error("placeOrder: insert items failed:", itemsError);
    return { error: "Could not place your order. Try again." };
  }

  return { orderId: order.id };
}
