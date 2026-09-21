import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { phoneDigits } from "./data";

const OTP_COOKIE = "merret_otp";
const SESSION_COOKIE = "merret_buyer";
const OTP_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type OtpPayload = {
  p: string;
  h: string;
  e: number;
  n: number;
};

type SessionPayload = {
  p: string;
  d: string;
  e: number;
};

function otpSecret(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "merret-demo-otp";
}

function hashOtp(phone: string, code: string): string {
  return createHash("sha256")
    .update(`${otpSecret()}:${phone}:${code}`)
    .digest("hex");
}

function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function normalizeBuyerPhone(phone: string): string | null {
  const digits = phoneDigits(phone);
  if (digits.length < 8) return null;
  return digits;
}

export async function getBuyerSession(): Promise<{
  phone: string;
  display: string;
} | null> {
  const jar = await cookies();
  const session = parseJson<SessionPayload>(jar.get(SESSION_COOKIE)?.value);
  if (!session || session.e < Date.now() || !session.p) return null;
  return { phone: session.p, display: session.d || session.p };
}

export async function createOtp(
  phoneInput: string
): Promise<{ phone: string; display: string; code: string } | { error: string }> {
  const phone = normalizeBuyerPhone(phoneInput);
  if (!phone) {
    return { error: "That number is too short. Add the digits we can text." };
  }

  const code = String(randomInt(0, 10000)).padStart(4, "0");
  const jar = await cookies();
  const payload: OtpPayload = {
    p: phone,
    h: hashOtp(phone, code),
    e: Date.now() + OTP_TTL_MS,
    n: 0,
  };
  jar.set(OTP_COOKIE, JSON.stringify(payload), {
    ...cookieBase,
    maxAge: OTP_TTL_MS / 1000,
  });

  return { phone, display: phoneInput.trim(), code };
}

export async function checkOtp(
  phoneInput: string,
  code: string
): Promise<{ phone: string; display: string } | { error: string }> {
  const phone = normalizeBuyerPhone(phoneInput);
  const trimmed = code.replace(/\D/g, "");
  if (!phone) {
    return { error: "That number is too short. Add the digits we can text." };
  }
  if (trimmed.length !== 4) {
    return { error: "Enter the four-digit code." };
  }

  const jar = await cookies();
  const payload = parseJson<OtpPayload>(jar.get(OTP_COOKIE)?.value);
  if (!payload || payload.e < Date.now() || payload.p !== phone) {
    return { error: "That code has expired. Send a new one." };
  }
  if (payload.n >= MAX_ATTEMPTS) {
    jar.delete(OTP_COOKIE);
    return { error: "Too many tries. Send a new code." };
  }

  if (!hashesMatch(payload.h, hashOtp(phone, trimmed))) {
    payload.n += 1;
    jar.set(OTP_COOKIE, JSON.stringify(payload), {
      ...cookieBase,
      maxAge: Math.max(1, Math.floor((payload.e - Date.now()) / 1000)),
    });
    return { error: "That code does not match. Try again." };
  }

  const display = phoneInput.trim();
  const session: SessionPayload = {
    p: phone,
    d: display,
    e: Date.now() + SESSION_TTL_MS,
  };
  jar.delete(OTP_COOKIE);
  jar.set(SESSION_COOKIE, JSON.stringify(session), {
    ...cookieBase,
    maxAge: SESSION_TTL_MS / 1000,
  });

  return { phone, display };
}

export async function clearBuyerSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(OTP_COOKIE);
  jar.delete(SESSION_COOKIE);
}
