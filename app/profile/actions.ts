"use server";

import { revalidatePath } from "next/cache";
import {
  checkOtp,
  clearBuyerSession,
  createOtp,
} from "@/lib/profile-session";

export async function requestOtp(phone: string): Promise<
  | { ok: true; demoCode: string }
  | { ok: false; error: string }
> {
  const result = await createOtp(phone);
  if ("error" in result) return { ok: false, error: result.error };
  return { ok: true, demoCode: result.code };
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await checkOtp(phone, code);
  if ("error" in result) return { ok: false, error: result.error };
  revalidatePath("/profile");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  await clearBuyerSession();
  revalidatePath("/profile");
}
