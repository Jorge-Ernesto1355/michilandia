import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, ShieldCheck, Sparkles } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { getCategories, getProducts } from "@/lib/products";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/constants";
import { formatPrice } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts({ take: 4 }), getCategories()]);
  return <div className="mx-auto max-w-[1040px] px-4 sm:px-7 lg:px-10">
    <section className="flex items-end justify-between gap-4 pb-5 pt-2 sm:pt-6"><div><h1 className="font-head text-[29px] font-extrabold leading-[1.08] tracking-[-.04em] text-[var(--neutral)] sm:text-4xl">¡Hola, Michi Lover! <span className="text-[var(--tertiary)]">✦</span></h1><p className="mt-3 max-w-sm font-body text-[15px] leading-relaxed text-[var(--muted)]">Encuentra los accesorios más tiernos para tu gatito.</p></div><div className="hidden size-16 rotate-3 place-items-center rounded-[18px] bg-[#ffe5eb] text-[var(--primary)] sm:grid"><Sparkles size={27}/></div></section>
    <section className="relative min-h-[235px] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#d96887] to-[#f4a8b7] p-6 text-white sm:min-h-[270px] sm:p-9"><div className="relative z-10 max-w-[320px]"><p className="font-head text-[10px] font-bold uppercase tracking-[.14em] text-[#fff7d8]">Edición limitada</p><h2 className="mt-3 font-head text-[34px] font-extrabold leading-[.98] sm:text-5xl">Colección<br/><span className="text-[#fff7d8]">Ensueño Rosa</span></h2><p className="mt-3 max-w-[245px] text-[13px] leading-relaxed text-white/90">Collares, moñitos y juguetes únicos para mimar a tu reina.</p><Link href="/catalogo" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-head text-[11px] font-bold text-[var(--primary)]"><span>Ver novedades</span><ArrowRight size={15}/></Link></div><div className="absolute -right-5 -bottom-7 h-[270px] w-[270px] overflow-hidden rounded-full border-[14px] border-white/15 sm:right-8 sm:h-[320px] sm:w-[320px]"><Image src="https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=700&q=85" alt="Gatito blanco descansando" fill sizes="320px" className="object-cover"/></div></section>
    <section className="mt-8"><SectionHeading eyebrow="Descubre" title="Categorías tiernas"/><div className="mt-4 flex gap-3 overflow-x-auto pb-1">{categories.slice(0, 5).map((category, index) => <Link href={`/catalogo?categoria=${encodeURIComponent(category.label)}`} key={category.label} className={`grid min-h-[92px] min-w-[88px] place-items-center gap-2 rounded-[16px] border px-3 py-3 text-center ${index === 0 ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] bg-white text-[var(--neutral)]"}`}><span className="font-head text-xl">{category.icon}</span><span className="font-head text-[10px] font-bold">{category.label}</span></Link>)}</div></section>
    <section className="mt-9"><SectionHeading eyebrow="Últimos productos" title="Favoritos de los michis" action="Novedades"/><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div></section>
    <section className="mt-8 flex items-center gap-4 rounded-[16px] border border-[#f5d8c9] bg-[var(--surface-warm)] p-4"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-[var(--tertiary)]"><Gift size={23}/></span><div><h3 className="font-head text-[14px] font-bold">¡Regalo en cada compra!</h3><p className="mt-1 text-[13px] text-[var(--muted)]">Envío gratis en compras sobre {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)}.</p></div></section><div className="mt-4 flex items-center justify-center gap-2 pb-4 text-[11px] text-[#987681]"><ShieldCheck size={14}/> Hecho a mano con mucho mimo</div>
  </div>;
}
