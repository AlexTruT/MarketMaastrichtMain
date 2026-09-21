// Types matching supabase.sql exactly. Keep in sync with that file.

export type Zone = "Stadhuis" | "Boschstraat" | "Mosae Forum";

export type ProductCategory =
  | "vegetables"
  | "fruit"
  | "fish"
  | "meat"
  | "cheese"
  | "bakery"
  | "pantry"
  | "flowers"
  | "more";

export type Fulfilment = "home" | "pickup";

export type Substitution = "substitute" | "skip" | "call";

export type OrderStatus = "new" | "picking" | "ready" | "out" | "delivered";

export type Stall = {
  id: string;
  name: string;
  owner: string;
  category: ProductCategory;
  zone: Zone;
  origin: string;
  km_from_market: number | null;
  years_at_market: number;
  story: string;
  emoji: string;
};

export type Product = {
  id: number;
  stall_id: string | null; // null = general market item, bought by our shopper
  name: string;
  unit: string;
  category: ProductCategory;
  price_min_cents: number;
  price_max_cents: number;
  deal_price_cents: number | null;
  deal_note: string | null;
  deal_starts_on: string | null; // ISO date string, null = active now
  emoji: string;
  sort: number;
};

export type Order = {
  id: number;
  created_at: string;
  customer_name: string;
  phone: string;
  fulfilment: Fulfilment;
  address: string | null;
  pickup_point: string | null;
  time_window: string;
  substitution: Substitution;
  note: string | null;
  subtotal_min_cents: number;
  subtotal_max_cents: number;
  /** 15% online markup snapshot on subtotal_min at order time. */
  markup_min_cents: number;
  /** 15% online markup snapshot on subtotal_max at order time. */
  markup_max_cents: number;
  /** Fulfilment only: home delivery or free pickup (not markup). */
  fee_cents: number;
  status: OrderStatus;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  unit_min_cents: number;
  unit_max_cents: number;
  /** Settled unit price after pick; null until set. Requires migration. */
  actual_unit_cents: number | null;
  picked: boolean;
  substitute_note: string | null;
};

// Convenience joins used by a few routes (picker, order confirmation).
export type OrderWithItems = Order & { order_items: OrderItem[] };
export type OrderItemWithProduct = OrderItem & { product: Product };

// Shape returned by GET /api/picker: each order with its items, each item
// with its product, each product with its stall (for zone grouping).
export type PickerOrderItem = OrderItem & {
  product: Product & { stall: Stall | null };
};
export type PickerOrder = Order & { order_items: PickerOrderItem[] };
