"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { useCartStore } from "@/store/cartStore";
import {
  syncCartToServerAction,
  loadCartFromServerAction,
} from "@/app/actions/cart";

/**
 * Mounts once in the root layout.
 * - On login: loads server cart, merges with local (local takes precedence for
 *   items already in local cart), pushes merged result back to server.
 * - On logout: clears local cart.
 * - While logged in: syncs to server whenever cart items change.
 */
export function CartSyncProvider() {
  const { user, loading } = useUser();
  const { items, addItem, clearCart } = useCartStore();
  const prevUserId = useRef<string | null>(null);
  const synced = useRef(false);

  // On auth state change
  useEffect(() => {
    if (loading) return;

    const currentId = user?.id ?? null;
    const prevId = prevUserId.current;

    if (currentId === prevId) return; // no change
    prevUserId.current = currentId;

    if (currentId) {
      // User just logged in — load server cart and merge
      synced.current = false;
      loadCartFromServerAction().then(({ items: serverItems }) => {
        if (!serverItems) return;
        // Add server items that aren't already in local cart
        for (const si of serverItems) {
          const exists = useCartStore
            .getState()
            .items.some((li) => li.variantId === si.variantId);
          if (!exists) addItem(si);
        }
        // Push merged cart to server
        const merged = useCartStore.getState().items;
        void syncCartToServerAction(merged);
        synced.current = true;
      });
    } else {
      // User logged out — clear local cart
      clearCart();
      synced.current = false;
    }
  }, [user, loading, addItem, clearCart]);

  // While logged in, sync on every cart change
  useEffect(() => {
    if (!user || loading || !synced.current) return;
    void syncCartToServerAction(items);
  }, [items, user, loading]);

  return null;
}
