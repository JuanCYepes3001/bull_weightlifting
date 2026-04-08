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
            return {
              items: state.items.map((i) =>
                i.variantId === incoming.variantId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...incoming, quantity }] };
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
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
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
