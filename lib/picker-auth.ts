import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "merret_picker";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};

function tokenFor(secret: string): string {
  return createHash("sha256").update(`merret-picker:${secret}`).digest("hex");
}

function tokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function secretsMatch(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** When PICKER_SECRET is unset, mutates stay open (local demo). When set, require cookie. */
export async function requirePickerAccess(): Promise<{ error: string } | null> {
  const secret = process.env.PICKER_SECRET;
  if (!secret) return null;

  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token || !tokensMatch(token, tokenFor(secret))) {
    return { error: "Picker access required. Unlock with the shared secret." };
  }
  return null;
}

export async function isPickerUnlocked(): Promise<{
  configured: boolean;
  unlocked: boolean;
}> {
  const secret = process.env.PICKER_SECRET;
  if (!secret) return { configured: false, unlocked: true };

  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  return {
    configured: true,
    unlocked: !!token && tokensMatch(token, tokenFor(secret)),
  };
}

export async function unlockPicker(
  secretInput: string
): Promise<{ ok: true } | { error: string }> {
  const secret = process.env.PICKER_SECRET;
  if (!secret) {
    return {
      error: "PICKER_SECRET is not configured on this deployment.",
    };
  }

  const provided = secretInput.trim();
  if (!provided || !secretsMatch(provided, secret)) {
    return { error: "That secret does not match." };
  }

  const jar = await cookies();
  jar.set(COOKIE, tokenFor(secret), cookieBase);
  return { ok: true };
}
