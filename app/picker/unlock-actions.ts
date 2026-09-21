"use server";

import { isPickerUnlocked, unlockPicker as unlock } from "@/lib/picker-auth";

export async function checkPickerAccess() {
  return isPickerUnlocked();
}

export async function unlockPickerAccess(secret: string) {
  return unlock(secret);
}
