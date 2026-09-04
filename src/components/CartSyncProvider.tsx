"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { useCartStore } from "@/store/cartStore";
import {
  syncCartToServerAction,
  loadCartFromServerAction,
} from "@/app/actions/cart";
import { createClient } from "@/lib/supabase/client";

/**
 * Mounts once in the root layout.
 * - On login: loads server cart, merges with local (local takes precedence),
 *   pushes merged result back to server.
 * - On logout: clears local cart.
 * - While logged in: syncs to server on every cart change.
 * - Supabase Realtime: receives cart changes from other devices instantly.
 *   Requires the `cart_items` table to be enabled in Supabase Realtime
 *   (Dashboard → Database → Replication → supabase_realtime publication).
 */
export function CartSyncProvider() {
  const { user, loading } = useUser();
  const { items, addItem, clearCart } = useCartStore();
  const prevUserId = useRef<string | null>(null);
  const synced = useRef(false);
  /** True while we are pushing to server — prevents reacting to our own Realtime events. */
  const isSyncing = useRef(false);
  /** True after a Realtime-triggered load — skips the outbound sync for that items change. */
  const skipNextSync = useRef(false);

  /** Sync to server with isSyncing guard so our own Realtime events are ignored. */
  const syncToServer = async (itemsToSync: typeof items) => {
    isSyncing.current = true;
    await syncCartToServerAction(itemsToSync);
    // Keep the flag up long enough for the Realtime event to arrive (~500 ms)
    setTimeout(() => {
      isSyncing.current = false;
    }, 500);
  };

  // ── Auth state change ────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const currentId = user?.id ?? null;
    const prevId = prevUserId.current;

    if (currentId === prevId) return;
    prevUserId.current = currentId;

    if (currentId) {
      // User just logged in — load server cart and merge
      synced.current = false;
      loadCartFromServerAction().then(({ items: serverItems }) => {
        if (!serverItems) return;
        // Add server items not already in local cart
        for (const si of serverItems) {
          const exists = useCartStore
            .getState()
            .items.some((li) => li.variantId === si.variantId);
          if (!exists) addItem(si);
        }
        // Push merged cart to server
        const merged = useCartStore.getState().items;
        void syncToServer(merged);
        synced.current = true;
      });
    } else {
      // User logged out — clear local cart
      clearCart();
      synced.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading, addItem, clearCart]);

  // ── Outbound sync on cart change ─────────────────────────
  // Keyed on user?.id (a stable primitive), not the user object itself —
  // Supabase's onAuthStateChange hands back a new object reference on
  // every event (including no-op ones like TOKEN_REFRESHED), which would
  // otherwise re-fire this effect and re-sync the cart on every tick.
  useEffect(() => {
    if (!user || loading || !synced.current) return;
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    void syncToServer(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, user?.id, loading]);

  // ── Realtime: receive changes from other devices ─────────
  useEffect(() => {
    if (!user || loading) return;
    const userId = user.id;

    const supabase = createClient();
    let cleanup: (() => void) | undefined;
    let mounted = true;

    supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data: cart }) => {
        if (!mounted || !cart) return;

        const channel = supabase
          .channel(`cart-${cart.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cart_items",
              filter: `cart_id=eq.${cart.id}`,
            },
            async () => {
              // Ignore events we triggered ourselves
              if (isSyncing.current) return;

              const { items: serverItems } = await loadCartFromServerAction();
              if (serverItems) {
                skipNextSync.current = true; // Don't echo back to server
                useCartStore.getState().replaceItems(serverItems);
              }
            }
          )
          .subscribe();

        cleanup = () => supabase.removeChannel(channel);
      });

    return () => {
      mounted = false;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  return null;
}
