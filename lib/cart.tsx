"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: number;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (productId: number, qty?: number) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
  count: number;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "merret-cart";
export const CART_MAX_QTY = 99;
const MAX_QTY = CART_MAX_QTY;

function sanitizeQty(qty: unknown): number | null {
  if (typeof qty !== "number" || !Number.isFinite(qty)) return null;
  if (!Number.isInteger(qty) || qty < 1) return null;
  return Math.min(qty, MAX_QTY);
}

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const merged = new Map<number, number>();
    for (const item of parsed) {
      if (typeof item?.productId !== "number" || !Number.isInteger(item.productId)) {
        continue;
      }
      if (item.productId <= 0) continue;
      const qty = sanitizeQty(item.qty);
      if (qty == null) continue;
      merged.set(
        item.productId,
        Math.min(MAX_QTY, (merged.get(item.productId) ?? 0) + qty)
      );
    }
    return Array.from(merged, ([productId, qty]) => ({ productId, qty }));
  } catch {
    return [];
  }
}

function writeStoredCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable (private mode, quota, etc). Cart just
    // won't persist across reloads for this session.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const add = useCallback((productId: number, qty = 1) => {
    if (!Number.isInteger(productId) || productId <= 0) return;
    const delta = Number.isInteger(qty) ? qty : 0;
    if (delta === 0) return;
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        const nextQty = existing.qty + delta;
        if (nextQty <= 0) {
          return prev.filter((item) => item.productId !== productId);
        }
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, qty: Math.min(MAX_QTY, nextQty) }
            : item
        );
      }
      if (delta <= 0) return prev;
      return [...prev, { productId, qty: Math.min(MAX_QTY, delta) }];
    });
  }, []);

  useEffect(() => {
    if (hydrated) writeStoredCart(items);
  }, [items, hydrated]);

  useEffect(() => {
    const stored = readStoredCart();
    setItems((current) => {
      if (current.length === 0) return stored;
      if (stored.length === 0) return current;
      const merged = new Map<number, number>();
      for (const item of stored) merged.set(item.productId, item.qty);
      for (const item of current) {
        merged.set(
          item.productId,
          Math.min(MAX_QTY, (merged.get(item.productId) ?? 0) + item.qty)
        );
      }
      return Array.from(merged, ([productId, qty]) => ({ productId, qty }));
    });
    setHydrated(true);
  }, []);

  const remove = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const setQty = useCallback((productId: number, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((item) => item.productId !== productId);
      const next = Number.isInteger(qty) ? Math.min(MAX_QTY, qty) : 1;
      return prev.map((item) =>
        item.productId === productId ? { ...item, qty: next } : item
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, add, remove, setQty, clear, count, ready: hydrated }),
    [items, add, remove, setQty, clear, count, hydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
