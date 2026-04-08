import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ── Tipos locales del carrito (sin depender de la DB) ─── */
export interface LocalCartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  size: string;
  color: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  maxStock?: number; // stock available at the time of adding — used for client-side limit
}

interface CartStore {
  items: LocalCartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<LocalCartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (open: boolean) => set({ isOpen: open }),

      addItem: (incoming) => {
        const quantity = incoming.quantity ?? 1;
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === incoming.variantId
          );
          if (existing) {
            const max = incoming.maxStock ?? existing.maxStock;
            const newQty = existing.quantity + quantity;
            const capped = max !== undefined ? Math.min(newQty, max) : newQty;
            return {
              items: state.items.map((i) =>
                i.variantId === incoming.variantId
                  ? { ...i, quantity: capped, maxStock: max }
                  : i
              ),
            };
          }
          const max = incoming.maxStock;
          const capped = max !== undefined ? Math.min(quantity, max) : quantity;
          return { items: [...state.items, { ...incoming, quantity: capped }] };
        });
      },

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) => {
        if (quantity < 1) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.variantId !== variantId) return i;
            const capped =
              i.maxStock !== undefined ? Math.min(quantity, i.maxStock) : quantity;
            return { ...i, quantity: capped };
          }),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "bull-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
