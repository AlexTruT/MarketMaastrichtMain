import type { Fulfilment, Product } from "./types";

// All money is integer cents everywhere except at render time.
// "today" is always passed in, never read from inside these functions,
// so every screen and the picker agree on the same date during a demo.

export function formatEuro(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isDealActive(product: Product, today: Date): boolean {
  if (product.deal_price_cents == null) return false;
  if (product.deal_starts_on == null) return true;
  return product.deal_starts_on <= toDateStr(today);
}

export function isComingSoon(product: Product, today: Date): boolean {
  if (product.deal_price_cents == null || product.deal_starts_on == null) {
    return false;
  }
  return product.deal_starts_on > toDateStr(today);
}

export function unitRange(
  product: Product,
  today: Date
): { min: number; max: number } {
  if (isDealActive(product, today) && product.deal_price_cents != null) {
    return { min: product.deal_price_cents, max: product.deal_price_cents };
  }
  return { min: product.price_min_cents, max: product.price_max_cents };
}

export function formatRange(min: number, max: number): string {
  if (min === max) return formatEuro(min);
  return `${formatEuro(min)} to ${formatEuro(max)}`;
}

export function feeFor(fulfilment: Fulfilment): number {
  return fulfilment === "home" ? 595 : 195;
}

// Not in the original shared-lib list, but every route that shows the
// market date (home cutoff line, checkout, confirmation) needs the same
// answer, so it lives here instead of being reimplemented three times.
export function getNextMarketFriday(today: Date): Date {
  const result = new Date(today);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay(); // 0 = Sunday, 5 = Friday
  const daysUntilFriday = (5 - day + 7) % 7;
  result.setDate(result.getDate() + daysUntilFriday);
  return result;
}
