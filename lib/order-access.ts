import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { phoneDigits } from "./data";
import { getBuyerSession } from "./profile-session";
import type { Order } from "./types";

const CONFIRM_COOKIE = "merret_order_ok";
/** Long enough to refresh the confirmation page; short enough to limit ID guessing. */
const CONFIRM_TTL_MS = 2 * 60 * 60 * 1000;

type ConfirmPayload = {
  ids: number[];
  e: number;
  h: string;
};

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function confirmSecret(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "merret-demo-order-ok";
}

function signIds(ids: number[], expiresAt: number): string {
  const body = [...ids].sort((a, b) => a - b).join(",") + `:${expiresAt}`;
  return createHash("sha256")
    .update(`${confirmSecret()}:${body}`)
    .digest("hex");
}

function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function parseConfirm(raw: string | undefined): ConfirmPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConfirmPayload;
    if (
      !Array.isArray(parsed.ids) ||
      typeof parsed.e !== "number" ||
      typeof parsed.h !== "string"
    ) {
      return null;
    }
    const ids = parsed.ids.filter(
      (id) => typeof id === "number" && Number.isInteger(id) && id > 0
    );
    if (!hashesMatch(parsed.h, signIds(ids, parsed.e))) return null;
    if (parsed.e < Date.now()) return null;
    return { ids, e: parsed.e, h: parsed.h };
  } catch {
    return null;
  }
}

/** Exact match on digit-normalised NL phones (same rules as buyer session). */
export function phonesMatch(a: string, b: string): boolean {
  const left = phoneDigits(a);
  const right = phoneDigits(b);
  if (left.length < 8 || right.length < 8) return false;
  return left === right;
}

async function confirmationIds(): Promise<number[]> {
  const jar = await cookies();
  const payload = parseConfirm(jar.get(CONFIRM_COOKIE)?.value);
  return payload?.ids ?? [];
}

/** Call after a successful placeOrder so /order/[id] works without OTP. */
export async function grantOrderConfirmation(orderId: number): Promise<void> {
  if (!Number.isInteger(orderId) || orderId <= 0) return;

  const jar = await cookies();
  const existing = parseConfirm(jar.get(CONFIRM_COOKIE)?.value);
  const ids = Array.from(new Set([...(existing?.ids ?? []), orderId]));
  const e = Date.now() + CONFIRM_TTL_MS;
  const payload: ConfirmPayload = { ids, e, h: signIds(ids, e) };
  jar.set(CONFIRM_COOKIE, JSON.stringify(payload), {
    ...cookieBase,
    maxAge: CONFIRM_TTL_MS / 1000,
  });
}

export async function canViewOrder(order: Pick<Order, "id" | "phone">): Promise<boolean> {
  const confirmed = await confirmationIds();
  if (confirmed.includes(order.id)) return true;

  const session = await getBuyerSession();
  if (session && phonesMatch(session.phone, order.phone)) return true;

  return false;
}
