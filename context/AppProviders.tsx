"use client";
/* Hydration effects intentionally rehydrate browser-only state after the server render. */
/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine } from "@/types/cart";
import { products } from "@/data/products";
import { CART_STORAGE_KEY, COUPON_STORAGE_KEY, FAVORITES_STORAGE_KEY, SEARCH_STORAGE_KEY } from "@/lib/constants";
import { getDiscountCents, getShippingCents, getSubtotalCents, getUnits } from "@/lib/cart-utils";

type CartContextValue = { lines: CartLine[]; coupon: string | null; hydrated: boolean; units: number; subtotalCents: number; discountCents: number; shippingCents: number; totalCents: number; add: (productId: string, variant?: string) => void; decrement: (productId: string) => void; remove: (productId: string) => void; clearCart: () => void; applyCoupon: (coupon: string) => boolean; clearCoupon: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function AppProviders({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([{ productId: "princesa", quantity: 1, variant: "Rosa Bebé · Talla S" }, { productId: "osito", quantity: 1, variant: "Rosa Pastel · Talla Única" }, { productId: "raton", quantity: 2, variant: "Menta & Rosa" }]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "null");
      if (Array.isArray(saved)) setLines(saved.filter((line): line is CartLine => line && typeof line.productId === "string" && products.some((product) => product.id === line.productId) && Number.isInteger(line.quantity) && line.quantity > 0).map((line) => ({ ...line, variant: line.variant || "Edición pastel" })));
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon === "MICHI10") setCoupon(savedCoupon);
    } catch { /* storage can be corrupted; use the safe defaults */ }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines)); }, [lines, hydrated]);
  useEffect(() => { if (!hydrated) return; if (coupon) localStorage.setItem(COUPON_STORAGE_KEY, coupon); else localStorage.removeItem(COUPON_STORAGE_KEY); }, [coupon, hydrated]);
  const value = useMemo(() => {
    const subtotalCents = getSubtotalCents(lines);
    const discountCents = getDiscountCents(subtotalCents, coupon);
    return {
      lines, coupon, hydrated, units: getUnits(lines), subtotalCents, discountCents,
      shippingCents: getShippingCents(subtotalCents), totalCents: subtotalCents - discountCents + getShippingCents(subtotalCents),
      add: (productId: string, variant = "Edición pastel") => setLines((current) => { const found = current.find((line) => line.productId === productId); return found ? current.map((line) => line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { productId, quantity: 1, variant }]; }),
      decrement: (productId: string) => setLines((current) => current.flatMap((line) => line.productId !== productId ? [line] : line.quantity <= 1 ? [] : [{ ...line, quantity: line.quantity - 1 }])),
      remove: (productId: string) => setLines((current) => current.filter((line) => line.productId !== productId)),
      clearCart: () => { setLines([]); setCoupon(null); },
      applyCoupon: (value: string) => { const valid = value.trim().toUpperCase() === "MICHI10"; if (valid) setCoupon("MICHI10"); return valid; },
      clearCoupon: () => setCoupon(null),
    };
  }, [coupon, hydrated, lines]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart debe usarse dentro de AppProviders"); return context; }

type FavoritesContextValue = { favorites: string[]; isFavorite: (id: string) => boolean; toggleFavorite: (id: string) => void };
const FavoritesContext = createContext<FavoritesContextValue | null>(null);
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]"); if (Array.isArray(saved)) setFavorites(saved.filter((id): id is string => typeof id === "string")); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites)); }, [favorites, ready]);
  return <FavoritesContext.Provider value={{ favorites, isFavorite: (id) => favorites.includes(id), toggleFavorite: (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]) }}>{children}</FavoritesContext.Provider>;
}
export function useFavorites() { const context = useContext(FavoritesContext); if (!context) throw new Error("useFavorites debe usarse dentro de FavoritesProvider"); return context; }

type SearchContextValue = { searches: string[]; addSearch: (value: string) => void; removeSearch: (value: string) => void; clearSearches: () => void };
const SearchContext = createContext<SearchContextValue | null>(null);
export function SearchProvider({ children }: { children: ReactNode }) {
  const [searches, setSearches] = useState<string[]>(["Bandana floral rosa", "Gorro tejido"]);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(SEARCH_STORAGE_KEY) || "null"); if (Array.isArray(saved)) setSearches(saved.filter((item): item is string => typeof item === "string")); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(searches)); }, [searches, ready]);
  const addSearch = (value: string) => { const clean = value.trim(); if (!clean) return; setSearches((current) => [clean, ...current.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6)); };
  return <SearchContext.Provider value={{ searches, addSearch, removeSearch: (value) => setSearches((current) => current.filter((item) => item !== value)), clearSearches: () => setSearches([]) }}>{children}</SearchContext.Provider>;
}
export function useSearchHistory() { const context = useContext(SearchContext); if (!context) throw new Error("useSearchHistory debe usarse dentro de SearchProvider"); return context; }
