import "server-only";
import { MARKT_HUB } from "./courier-mock-data";
import {
  clusterForAddress,
  inferHandlingTags,
} from "./courier";
import type { DeliveryStop, LatLng } from "./courier-types";
import { supabase } from "./supabase";
import type { Order, OrderItemWithProduct } from "./types";

type LiveOrder = Order & { order_items: OrderItemWithProduct[] };

const CLUSTER_DEFAULT_COORDS: Record<string, LatLng> = {
  centrum_wyck: [50.84905, 5.69895],
  ceramique_randwyck: [50.84555, 5.70285],
  brusselsepoort_belfort: [50.84695, 5.68505],
};

function areaLabelFromAddress(address: string): string {
  const street = address.split(",")[0]?.trim() || address;
  return street.length > 40 ? `${street.slice(0, 37)}…` : street;
}

/** Map a ready home-delivery order into a courier stop for the hub queue. */
export function orderToDeliveryStop(order: LiveOrder): DeliveryStop {
  const address = order.address?.trim() || MARKT_HUB.address;
  const cluster = clusterForAddress(address);
  const coords = CLUSTER_DEFAULT_COORDS[cluster] ?? MARKT_HUB.coords;
  const handling = Array.from(
    new Set(
      order.order_items.flatMap((item) =>
        inferHandlingTags(item.product.name)
      )
    )
  );

  return {
    id: `live-${order.id}`,
    orderNumber: `MM-${order.id}`,
    packageNumber: `BAG-${order.id}`,
    crateNumber: `CR-${String(order.id).padStart(3, "0")}`,
    cluster,
    fulfilment: "home",
    deliveryWindow: order.time_window,
    customerName: order.customer_name,
    customerPhone: order.phone,
    address,
    // The customer note already shows as deliveryNotes; no second copy here.
    addressHint: "",
    areaLabel: areaLabelFromAddress(address),
    coords,
    deliveryNotes: order.note?.trim() || undefined,
    substitution: order.substitution,
    items: order.order_items.map((item) => ({
      id: `live-item-${item.id}`,
      name: item.product.name,
      stallName: "Market stall",
      quantity: item.qty,
      unit: item.product.unit,
      priceCents: item.unit_max_cents,
      handling: inferHandlingTags(item.product.name),
    })),
    handling,
    legFromPrevious: [MARKT_HUB.coords, coords],
    status: "queued",
    source: "live",
    liveOrderId: order.id,
  };
}

/**
 * Home-delivery orders the picker has marked ready and nobody has ridden out
 * with yet. Orders already "out" belong to the courier carrying them (kept in
 * their own browser state), so offering them again would double-deliver.
 * Returns [] when the DB is empty or unavailable.
 */
export async function fetchReadyHomeStops(): Promise<{
  stops: DeliveryStop[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, product:products(*))")
      .eq("fulfilment", "home")
      .eq("status", "ready")
      .order("id", { ascending: true })
      .limit(40);

    if (error) {
      console.error("fetchReadyHomeStops:", error);
      return { stops: [], error: "Could not load live orders." };
    }

    const stops = ((data ?? []) as LiveOrder[])
      .filter((order) => !!order.address?.trim())
      .map(orderToDeliveryStop);

    return { stops, error: null };
  } catch (err) {
    console.error("fetchReadyHomeStops:", err);
    return { stops: [], error: "Could not load live orders." };
  }
}
