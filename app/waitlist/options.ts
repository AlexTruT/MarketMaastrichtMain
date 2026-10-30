// Allowed values, shared by the form and the server action. They must match
// the CHECK constraints on the Supabase `waitlist` table.

export const FREQUENCIES = ["weekly", "sometimes", "rarely", "never"] as const;
export const BARRIERS = [
  "hours",
  "access",
  "crowds",
  "overview",
  "nothing",
] as const;
export const USE_MODES = ["pickup", "delivery", "unsure", "no"] as const;
export const LANGS = ["nl", "en"] as const;

export type Frequency = (typeof FREQUENCIES)[number];
export type Barrier = (typeof BARRIERS)[number];
export type UseMode = (typeof USE_MODES)[number];
export type Lang = (typeof LANGS)[number];

export const POSTCODE_MAX = 7;
export const DEFAULT_SOURCE = "direct";

/**
 * `?src=` comes from printed QR codes and shared links, so keep it to a
 * short slug. Anything else falls back to "direct".
 */
export function cleanSource(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_SOURCE;
  const value = raw.trim().toLowerCase();
  return /^[a-z0-9_-]{1,40}$/.test(value) ? value : DEFAULT_SOURCE;
}

export function looksLikeEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
