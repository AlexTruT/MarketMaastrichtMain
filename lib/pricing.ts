import type { Fulfilment, Product } from "./types";

// All money is integer cents everywhere except at render time.
// "today" is always passed in, never read from inside these functions,
// so every screen and the picker agree on the same date during a demo.
// Deal date comparisons use Europe/Amsterdam so Vercel (UTC) matches phones
// in Maastricht.

const MARKET_TZ = "Europe/Amsterdam";

const WEEKDAY_SUN0: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function amsterdamParts(date: Date): {
  year: number;
  month: number;
  day: number;
  weekday: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MARKET_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: WEEKDAY_SUN0[get("weekday")] ?? 0,
  };
}

function isFiniteCents(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function formatEuro(cents: number): string {
  const n = isFiniteCents(cents) ? Math.round(cents) : 0;
  return `€${(n / 100).toFixed(2)}`;
}

/**
 * Client components receive Date props from the server as ISO strings.
 * Every pricing helper that takes "today" must accept both.
 */
export function asDate(today: Date | string): Date {
  if (today instanceof Date && !Number.isNaN(today.getTime())) return today;
  const parsed = new Date(today);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("pricing: invalid today");
  }
  return parsed;
}

function toDateStr(date: Date): string {
  const { year, month, day } = amsterdamParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isDealActive(product: Product, today: Date | string): boolean {
  if (product.deal_price_cents == null) return false;
  if (product.deal_starts_on == null) return true;
  return product.deal_starts_on <= toDateStr(asDate(today));
}

export function isComingSoon(product: Product, today: Date | string): boolean {
  if (product.deal_price_cents == null || product.deal_starts_on == null) {
    return false;
  }
  return product.deal_starts_on > toDateStr(asDate(today));
}

export function unitRange(
  product: Product,
  today: Date | string
): { min: number; max: number } {
  if (isDealActive(product, today) && product.deal_price_cents != null) {
    return { min: product.deal_price_cents, max: product.deal_price_cents };
  }
  return { min: product.price_min_cents, max: product.price_max_cents };
}

/** Line total in cents. qty is a whole number; never multiply floats. */
export function lineTotals(
  product: Product,
  qty: number,
  today: Date | string
): { min: number; max: number } {
  const { min, max } = unitRange(product, today);
  return { min: min * qty, max: max * qty };
}

export function formatRange(min: number, max: number): string {
  if (min === max) return formatEuro(min);
  return `${formatEuro(min)} to ${formatEuro(max)}`;
}

/** Display midpoint for ranged general-market prices (integer cents). */
export function midpoint(min: number, max: number): number {
  return Math.round((min + max) / 2);
}

export function feeFor(fulfilment: Fulfilment): number {
  // Home delivery €4.50; market pickup point is free.
  return fulfilment === "home" ? 450 : 0;
}

export const SERVICE_FEE_RATE = 0.15;
export const SERVICE_FEE_CAP_CENTS = 800;
export const SERVICE_FEE_LABEL = "Service fee (15%, max €8)";

/** Basket subtotal (stall prices) below which "Place order" is disabled. */
export const MIN_ORDER_CENTS = 1500;

/**
 * Service fee on the basket subtotal: 15%, capped at €8. Product prices are
 * always stall prices; this is the only thing Merret adds besides delivery.
 */
export function serviceFee(subtotalCents: number): number {
  if (!isFiniteCents(subtotalCents) || subtotalCents <= 0) return 0;
  return Math.min(
    Math.round(subtotalCents * SERVICE_FEE_RATE),
    SERVICE_FEE_CAP_CENTS
  );
}

/**
 * Cents still needed to reach the minimum order. Uses the low end of a
 * ranged subtotal so a basket that clears it is guaranteed to, whatever
 * the shopper ends up paying.
 */
export function minOrderShortfall(subtotalMinCents: number): number {
  if (!isFiniteCents(subtotalMinCents)) return MIN_ORDER_CENTS;
  return Math.max(0, MIN_ORDER_CENTS - Math.round(subtotalMinCents));
}

/** Shared by checkout and placeOrder so the wording never drifts. */
export function minOrderMessage(shortfallCents: number): string {
  return `Minimum order is €${MIN_ORDER_CENTS / 100}. Add ${formatEuro(shortfallCents)} more.`;
}

/** Customer total: basket subtotal + capped service fee + delivery. */
export function orderTotals(
  subtotalMin: number,
  subtotalMax: number,
  fulfilment: Fulfilment
): {
  serviceFeeMin: number;
  serviceFeeMax: number;
  fee: number;
  totalMin: number;
  totalMax: number;
} {
  const serviceFeeMin = serviceFee(subtotalMin);
  const serviceFeeMax = serviceFee(subtotalMax);
  const fee = feeFor(fulfilment);
  return {
    serviceFeeMin,
    serviceFeeMax,
    fee,
    totalMin: subtotalMin + serviceFeeMin + fee,
    totalMax: subtotalMax + serviceFeeMax + fee,
  };
}

// The orders table still names the service fee snapshot markup_*_cents;
// renaming the columns would need a migration on the live database.
type StoredOrderMoney = {
  fulfilment: Fulfilment;
  subtotal_min_cents?: number | null;
  subtotal_max_cents?: number | null;
  markup_min_cents?: number | null;
  markup_max_cents?: number | null;
  fee_cents?: number | null;
  order_items?: {
    qty: number;
    unit_min_cents?: number | null;
    unit_max_cents?: number | null;
  }[];
};

/**
 * Customer totals from a stored order. Live DBs created before
 * supabase-markup.sql omit the fee snapshot columns (undefined on select *),
 * which used to become €NaN. Missing snapshots are recomputed in integer cents.
 */
export function customerTotals(order: StoredOrderMoney): {
  subtotalMin: number;
  subtotalMax: number;
  serviceFeeMin: number;
  serviceFeeMax: number;
  fee: number;
  totalMin: number;
  totalMax: number;
} {
  let subtotalMin = isFiniteCents(order.subtotal_min_cents)
    ? Math.round(order.subtotal_min_cents)
    : 0;
  let subtotalMax = isFiniteCents(order.subtotal_max_cents)
    ? Math.round(order.subtotal_max_cents)
    : 0;

  const needLineFallback =
    !isFiniteCents(order.subtotal_min_cents) ||
    !isFiniteCents(order.subtotal_max_cents);
  if (needLineFallback && order.order_items?.length) {
    subtotalMin = 0;
    subtotalMax = 0;
    for (const item of order.order_items) {
      const qty = Number.isInteger(item.qty) ? item.qty : 0;
      const unitMin = isFiniteCents(item.unit_min_cents)
        ? Math.round(item.unit_min_cents)
        : 0;
      const unitMax = isFiniteCents(item.unit_max_cents)
        ? Math.round(item.unit_max_cents)
        : 0;
      subtotalMin += unitMin * qty;
      subtotalMax += unitMax * qty;
    }
  }

  // A stored snapshot is what the customer was quoted, so it wins (older
  // orders keep their uncapped fee). 0 with a real subtotal is the ADD
  // COLUMN default, not a snapshot, so that is recomputed.
  const serviceFeeMin =
    isFiniteCents(order.markup_min_cents) &&
    !(order.markup_min_cents === 0 && subtotalMin > 0)
      ? Math.round(order.markup_min_cents)
      : serviceFee(subtotalMin);
  const serviceFeeMax =
    isFiniteCents(order.markup_max_cents) &&
    !(order.markup_max_cents === 0 && subtotalMax > 0)
      ? Math.round(order.markup_max_cents)
      : serviceFee(subtotalMax);
  const fee = isFiniteCents(order.fee_cents)
    ? Math.round(order.fee_cents)
    : feeFor(order.fulfilment);

  return {
    subtotalMin,
    subtotalMax,
    serviceFeeMin,
    serviceFeeMax,
    fee,
    totalMin: subtotalMin + serviceFeeMin + fee,
    totalMax: subtotalMax + serviceFeeMax + fee,
  };
}

// Not in the original shared-lib list, but every route that shows the
// market date (home cutoff line, checkout, confirmation) needs the same
// answer, so it lives here instead of being reimplemented three times.
export function getNextMarketFriday(today: Date | string): Date {
  const { year, month, day, weekday } = amsterdamParts(asDate(today));
  const daysUntilFriday = (5 - weekday + 7) % 7;
  // Noon UTC on the Amsterdam calendar day keeps the weekday stable across DST.
  return new Date(Date.UTC(year, month - 1, day + daysUntilFriday, 12, 0, 0));
}

/**
 * Wall-clock time in Europe/Amsterdam on the Amsterdam calendar day of `day`.
 * Avoids setHours() (server local TZ) so Vercel UTC and Maastricht phones agree.
 */
export function amsterdamAt(
  day: Date | string,
  hour: number,
  minute = 0
): Date {
  const { year, month, day: d } = amsterdamParts(asDate(day));
  let t = Date.UTC(year, month - 1, d, hour, minute, 0);
  for (let i = 0; i < 4; i++) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: MARKET_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(t));
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((p) => p.type === type)?.value ?? NaN);
    const desired = Date.UTC(year, month - 1, d, hour, minute);
    const actual = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute")
    );
    const diff = desired - actual;
    if (diff === 0) return new Date(t);
    t += diff;
  }
  return new Date(t);
}
