"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, Star } from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";
import { useCart, useFavorites } from "@/context/AppProviders";

export default function ProductCard({ product, tall = false }: { product: Product; tall?: boolean }) {
  const { add } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  return <article className="group overflow-hidden rounded-[16px] border border-[var(--border)] bg-white shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(112,38,63,.12)]"><Link href={`/producto/${product.id}`} className="block"><div className={`relative ${tall ? "aspect-[4/5]" : "aspect-square"} overflow-hidden bg-[#fff0f2]`}><Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 45vw, 240px" className="object-cover transition duration-500 ease-out group-hover:scale-105"/><span className="absolute inset-0 bg-transparent transition group-hover:bg-white/5"/>{product.badge && <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 font-head text-[9px] font-bold text-[var(--primary)] shadow-sm">{product.badge}</span>}</div><div className="p-3.5"><div className="mb-1 flex items-center gap-1 font-head text-[10px] font-semibold text-[#b56720]"><Star aria-hidden="true" size={12} fill="currentColor" strokeWidth={1.5}/>{product.rating} <span className="font-body text-[#806570]">({product.reviews})</span></div><h3 className="line-clamp-2 min-h-9 font-head text-[12px] font-bold leading-tight text-[var(--neutral)]">{product.name}</h3><p className="mt-1 line-clamp-1 font-body text-[11px] text-[var(--muted)]">{product.description}</p></div></Link><div className="flex items-center justify-between gap-2 px-3.5 pb-3.5"><strong className="font-head text-[16px] font-extrabold text-[var(--primary)]">{formatPrice(product.priceCents)}</strong><div className="flex items-center gap-2"><button type="button" onClick={() => toggleFavorite(product.id)} aria-pressed={favorite} aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"} className={`grid size-9 place-items-center rounded-full border border-[var(--border)] bg-white transition hover:scale-105 ${favorite ? "text-[var(--tertiary)]" : "text-[#9e6576]"}`}><Heart size={16} fill={favorite ? "currentColor" : "none"} strokeWidth={1.75}/></button><button type="button" onClick={() => add(product.id)} className="flex min-h-10 items-center gap-1 rounded-xl bg-[var(--secondary)] px-2.5 font-head text-[10px] font-bold text-[var(--primary)] transition hover:bg-[var(--tertiary)] hover:text-white active:scale-95"><Plus aria-hidden="true" size={14} strokeWidth={2}/><span className="hidden sm:inline">Añadir</span><span className="sr-only sm:hidden">Añadir</span></button></div></div></article>;
}
