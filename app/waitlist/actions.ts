"use server";

import { supabase } from "@/lib/supabase";
import {
  BARRIERS,
  cleanSource,
  FREQUENCIES,
  LANGS,
  looksLikeEmail,
  POSTCODE_MAX,
  USE_MODES,
  type Barrier,
} from "./options";

export type JoinWaitlistInput = {
  email: string;
  frequency: string;
  barriers: string[];
  useMode: string;
  postcode: string;
  lang: string;
  source: string;
  consent: boolean;
};

function oneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

// Server actions are public POST endpoints, so nothing from the form is
// trusted. Upsert on email: a second submit updates the answers instead of
// failing on the unique constraint, and keeps the original created_at.
export async function joinWaitlist(
  input: JoinWaitlistInput
): Promise<{ ok: true } | { ok: false }> {
  const email =
    typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  if (!looksLikeEmail(email)) return { ok: false };
  if (input.consent !== true) return { ok: false };
  if (!oneOf(FREQUENCIES, input.frequency)) return { ok: false };
  if (!oneOf(USE_MODES, input.useMode)) return { ok: false };
  if (!oneOf(LANGS, input.lang)) return { ok: false };

  if (!Array.isArray(input.barriers)) return { ok: false };
  const barriers = [...new Set(input.barriers)];
  if (!barriers.every((b): b is Barrier => oneOf(BARRIERS, b))) {
    return { ok: false };
  }
  if (barriers.includes("nothing") && barriers.length > 1) return { ok: false };

  const postcodeRaw =
    typeof input.postcode === "string"
      ? input.postcode.trim().replace(/\s+/g, " ").toUpperCase()
      : "";
  if (postcodeRaw.length > POSTCODE_MAX) return { ok: false };
  if (postcodeRaw && !/^[0-9A-Z ]+$/.test(postcodeRaw)) return { ok: false };

  const { error } = await supabase.from("waitlist").upsert(
    {
      email,
      frequency: input.frequency,
      barriers,
      use_mode: input.useMode,
      postcode: postcodeRaw || null,
      lang: input.lang,
      source: cleanSource(input.source),
      consent: true,
    },
    { onConflict: "email" }
  );

  if (error) {
    console.error("joinWaitlist: upsert failed:", error);
    return { ok: false };
  }
  return { ok: true };
}
