import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

// Module-level singleton. Calling createBrowserClient() more than once per
// browser tab spins up multiple GoTrueClient instances that all fight over
// the same auth storage key — Supabase logs "Multiple GoTrueClient instances
// detected" and, worse, they contend over its refresh-token lock (can hang)
// and each fires its own onAuthStateChange, producing duplicate events with
// a fresh `user` object reference each time (which re-triggers any effect
// that depends on `user` by reference, e.g. CartSyncProvider). Every caller
// must share the same client instance.
let client: SupabaseClient<Database> | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
