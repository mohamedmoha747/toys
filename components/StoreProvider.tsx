"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Line = { id: string; qty: number };

type Store = {
  lines: Line[];
  wishlist: string[];
  count: number;
  addQty: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  toggleWish: (id: string) => void;
  wished: (id: string) => boolean;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("limee-cart") || "[]") as Line[];
      const savedWish = JSON.parse(localStorage.getItem("limee-wish") || "[]") as string[];
      setLines(Array.isArray(savedCart) ? savedCart : []);
      setWishlist(Array.isArray(savedWish) ? savedWish : []);
    } catch {
      setLines([]);
      setWishlist([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("limee-cart", JSON.stringify(lines));
  }, [lines, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem("limee-wish", JSON.stringify(wishlist));
  }, [wishlist, ready]);

  const value = useMemo<Store>(() => {
    return {
      lines,
      wishlist,
      count: lines.reduce((sum, line) => sum + line.qty, 0),
      addQty: (id, qty = 1) => {
        if (qty <= 0) return;
        setLines((prev) => {
          const found = prev.find((line) => line.id === id);
          if (!found) return [...prev, { id, qty }];
          return prev.map((line) => (line.id === id ? { ...line, qty: line.qty + qty } : line));
        });
      },
      setQty: (id, qty) => {
        setLines((prev) =>
          qty <= 0 ? prev.filter((line) => line.id !== id) : prev.map((line) => (line.id === id ? { ...line, qty } : line)),
        );
      },
      remove: (id) => setLines((prev) => prev.filter((line) => line.id !== id)),
      toggleWish: (id) =>
        setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])),
      wished: (id) => wishlist.includes(id),
    };
  }, [lines, wishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Store is missing");
  return store;
}
