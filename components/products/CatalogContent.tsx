"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Check, ShieldCheck } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/constants";

export default function CatalogContent({ products, categories }: { products: Product[]; categories: string[] }) {
  const [filter, setFilter] = useState("Todos");
  const [sort, setSort] = useState("Novedades");
  const visible = useMemo(() => {
    const filtered = filter === "Todos" ? products : products.filter((product) => product.category === filter);
    return [...filtered].sort((a, b) => sort === "Precio menor" ? a.priceCents - b.priceCents : sort === "Precio mayor" ? b.priceCents - a.priceCents : sort === "Mejor calificados" ? b.rating - a.rating : 0);
  }, [filter, products, sort]);
  return <div className="mx-auto max-w-[1040px] px-4 sm:px-7 lg:px-10"><section className="mt-2 rounded-2xl bg-[#8d304d] px-4 py-3 text-white"><p className="font-head text-[11px] font-bold">Envío gratis en accesorios desde {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)}</p></section><div className="mt-8"><p className="mb-1 font-head text-[10px] font-bold uppercase tracking-[.16em] text-[#c17b8a]">Todo para tu michi</p><h1 className="font-head text-3xl font-extrabold tracking-[-.05em]">Catálogo <span className="text-[var(--tertiary)]">♡</span></h1></div><div className="mt-5 flex gap-2 overflow-x-auto pb-1"><button onClick={() => setFilter("Todos")} className={`whitespace-nowrap rounded-full border px-4 py-2 font-head text-[10px] font-bold ${filter === "Todos" ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] bg-white text-[#a57d88]"}`}>Todos ({products.length})</button>{categories.map((category) => <button key={category} onClick={() => setFilter(category)} className={`whitespace-nowrap rounded-full border px-4 py-2 font-head text-[10px] font-bold ${filter === category ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] bg-white text-[#a57d88]"}`}>{category}</button>)}</div><div className="mt-5 flex items-center justify-between gap-3"><p className="font-body text-[12px] text-[#987681]">Mostrando <b className="font-head text-[var(--neutral)]">{visible.length}</b> accesorios</p><label className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-2 font-head text-[10px] font-bold text-[var(--primary)]"><select aria-label="Ordenar productos" value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none bg-transparent outline-none"><option>Novedades</option><option>Precio menor</option><option>Precio mayor</option><option>Mejor calificados</option></select><ChevronDown size={14}/></label></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{visible.map((product) => <ProductCard key={product.id} product={product} tall/>)}</div><section className="my-8 flex items-center gap-4 rounded-[20px] border border-[var(--border)] bg-white p-4"><ShieldCheck size={22} className="text-[var(--primary)]"/><div><h2 className="font-head text-[14px] font-bold">Garantía Michi Seguro</h2><p className="font-body text-[11px] text-[#987681]">Materiales seleccionados con cuidado.</p></div><Check className="ml-auto text-[#74af8f]" size={18}/></section></div>;
}
