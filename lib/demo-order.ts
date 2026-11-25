import "server-only";
import { cookies } from "next/headers";
import type {
  Fulfilment,
  Order,
  OrderItemWithProduct,
  Product,
  Substitution,
} from "./types";

// Demo mode (no database): the last order placed on this device lives in an
// httpOnly cookie, so checkout, the confirmation page and the profile page
// still work end to end. Nothing is sent to a shopper.

const DEMO_ORDER_COOKIE = "merret_demo_order";
const DEMO_ORDER_TTL_S = 2 * 60 * 60;

export type DemoOrderLine = {
  product_id: number;
  qty: number;
  unit_min_cents: number;
  unit_max_cents: number;
};

export type DemoOrder = Omit<Order, "status"> & { lines: DemoOrderLine[] };

const FULFILMENTS: readonly Fulfilment[] = ["home", "pickup"];
const SUBSTITUTIONS: readonly Substitution[] = ["substitute", "skip", "call"];

function isCount(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0;
}

function isText(v: unknown, max: number): v is string {
  return typeof v === "string" && v.length <= max;
}

function isOptionalText(v: unknown, max: number): v is string | null {
  return v === null || isText(v, max);
}

// Lines are stored as [product_id, qty, unit_min, unit_max] tuples so a full
// bag stays well under the 4 KB cookie limit.
type StoredLine = [number, number, number, number];

function parseLine(raw: unknown): DemoOrderLine | null {
  if (!Array.isArray(raw) || raw.length !== 4) return null;
  const [productId, qty, min, max] = raw as unknown[];
  if (!isCount(productId) || !isCount(qty) || qty < 1) return null;
  if (!isCount(min) || !isCount(max) || max < min) return null;
  return { product_id: productId, qty, unit_min_cents: min, unit_max_cents: max };
}

/** Cookie value for a demo order. */
export function serializeDemoOrder(order: DemoOrder): string {
  const lines: StoredLine[] = order.lines.map((l) => [
    l.product_id,
    l.qty,
    l.unit_min_cents,
    l.unit_max_cents,
  ]);
  return JSON.stringify({ ...order, lines });
}

/** Parse the cookie value. Anything malformed or tampered with reads as no order. */
export function parseDemoOrder(value: string | undefined): DemoOrder | null {
  if (!value) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(value);
  } catch {
    return null;
  }
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;

  if (!isCount(o.id) || o.id < 1) return null;
  if (!isText(o.created_at, 40) || Number.isNaN(Date.parse(o.created_at))) return null;
  if (!isText(o.customer_name, 120) || !isText(o.phone, 40)) return null;
  if (!FULFILMENTS.includes(o.fulfilment as Fulfilment)) return null;
  if (!SUBSTITUTIONS.includes(o.substitution as Substitution)) return null;
  if (!isOptionalText(o.address, 300) || !isOptionalText(o.pickup_point, 120)) return null;
  if (!isText(o.time_window, 40) || !isOptionalText(o.note, 600)) return null;
  for (const key of [
    "subtotal_min_cents",
    "subtotal_max_cents",
    "markup_min_cents",
    "markup_max_cents",
    "fee_cents",
  ] as const) {
    if (!isCount(o[key])) return null;
  }
  if (!Array.isArray(o.lines) || o.lines.length === 0 || o.lines.length > 99) return null;
  const lines = o.lines.map(parseLine);
  if (lines.some((l) => l === null)) return null;

  return {
    id: o.id,
    created_at: o.created_at,
    customer_name: o.customer_name,
    phone: o.phone,
    fulfilment: o.fulfilment as Fulfilment,
    address: o.address,
    pickup_point: o.pickup_point,
    time_window: o.time_window,
    substitution: o.substitution as Substitution,
    note: o.note,
    subtotal_min_cents: o.subtotal_min_cents as number,
    subtotal_max_cents: o.subtotal_max_cents as number,
    markup_min_cents: o.markup_min_cents as number,
    markup_max_cents: o.markup_max_cents as number,
    fee_cents: o.fee_cents as number,
    lines: lines as DemoOrderLine[],
  };
}

/** Join a stored demo order onto the catalogue. Lines whose product is gone are dropped. */
export function withProducts(
  order: DemoOrder,
  products: Product[]
): Order & { order_items: OrderItemWithProduct[] } {
  const byId = new Map(products.map((p) => [p.id, p]));
  const { lines, ...rest } = order;
  const order_items: OrderItemWithProduct[] = [];
  lines.forEach((line, i) => {
    const product = byId.get(line.product_id);
    if (!product) return;
    order_items.push({
      ...line,
      id: i + 1,
      order_id: order.id,
      actual_unit_cents: null,
      picked: false,
      substitute_note: null,
      product,
    });
  });
  return { ...rest, status: "new", order_items };
}

export async function readDemoOrder(
  products: Product[]
): Promise<(Order & { order_items: OrderItemWithProduct[] }) | null> {
  const jar = await cookies();
  const order = parseDemoOrder(jar.get(DEMO_ORDER_COOKIE)?.value);
  return order ? withProducts(order, products) : null;
}

export async function saveDemoOrder(order: DemoOrder): Promise<void> {
  const jar = await cookies();
  jar.set(DEMO_ORDER_COOKIE, serializeDemoOrder(order), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEMO_ORDER_TTL_S,
  });
}
