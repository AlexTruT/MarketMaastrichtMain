import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Soft-init so `next build` can prerender when env is absent (local/CI).
// Runtime writes still fail clearly via getSupabase().
let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  // Server-only client using the service role key. RLS stays off for the
  // hackathon (see supabase.sql) so every read/write goes through server code.
  client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
} else {
  console.warn(
    "[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — catalogue reads return empty."
  );
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in .env.local (see .env.example)."
    );
  }
  return client;
}

/** Bound proxy so existing `import { supabase }` call sites keep working. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const value = Reflect.get(getSupabase() as object, prop);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(getSupabase())
      : value;
  },
});
