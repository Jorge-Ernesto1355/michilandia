"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/AppProviders";
import { useSession } from "@/lib/auth-client";
import AuthRequiredModal from "@/components/auth/AuthRequiredModal";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/constants";
import { getCartProducts, getProgress } from "@/lib/cart-utils";
import { formatPrice } from "@/lib/formatters";
import { sileo } from "sileo";

export default function CartPage() {
  const cart = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  const [couponInput, setCouponInput] = useState("MICHI10");
  const [message, setMessage] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const items = getCartProducts(cart.lines);
  const progress = getProgress(cart.subtotalCents);
  const submitCoupon = () => {
    if (cart.applyCoupon(couponInput)) { setMessage("MICHI10 aplicado: -10% off"); sileo.success({ title: "Cupón aplicado", description: "Tu descuento MICHI10 está activo." }); }
    else { setMessage("Ese cupón no ronronea todavía. Intenta con MICHI10."); sileo.error({ title: "Cupón no válido", description: "Revisa el código e inténtalo de nuevo." }); }
  };
  const goToCheckout = () => {
    if (session?.user) router.push("/checkout");
    else setShowAuthModal(true);
  };

  if (!items.length) return <div className="mx-auto max-w-[700px] px-4 py-12 text-center sm:px-7"><div className="text-6xl">🐱</div><h1 className="mt-4 font-head text-2xl font-extrabold">Tu carrito está esperando mimos</h1><p className="mt-2 font-body text-sm text-[#987681]">Agrega algo bonito para tu michi y aparecerá aquí.</p><Link href="/catalogo" className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-5 py-3 font-head text-xs font-bold text-white">Ver catálogo</Link></div>;

  return <>
    <div className="mx-auto max-w-[1040px] px-4 sm:px-7 lg:px-10">
      <div className="flex items-end justify-between gap-3 pt-2 sm:pt-6"><div><p className="mb-1 font-head text-[10px] font-bold uppercase tracking-[.16em] text-[#c17b8a]">Todo listo para ir a casa</p><h1 className="font-head text-3xl font-extrabold tracking-[-.05em]">Mi Carrito Tierno <span className="text-[var(--tertiary)]">🐾</span></h1></div><span className="rounded-full bg-[#ffe4ea] px-3 py-2 font-head text-[10px] font-bold text-[var(--primary)]">{cart.units} unidades</span></div>
      <section className="mt-6 rounded-[20px] border border-[#f5d0da] bg-[#fff0f3] p-4"><div className="flex items-center justify-between"><div><p className="font-head text-[13px] font-bold text-[var(--primary)]">{progress === 100 ? "¡Envío Gratis Desbloqueado!" : "Mimos en camino"}</p><p className="mt-1 font-body text-[11px] text-[#987681]">{progress === 100 ? "Superaste los $30. ¡Tu michi viajará mimado y sin costo extra!" : `Te faltan ${formatPrice(FREE_SHIPPING_THRESHOLD_CENTS - cart.subtotalCents)} para envío gratis.`}</p></div><strong className="font-head text-xl font-extrabold text-[var(--primary)]">{progress}%</strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[var(--tertiary)] transition-all" style={{ width: `${progress}%` }}/></div></section>
      <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_350px]"><section><h2 className="mb-3 font-head text-lg font-bold">Tus accesorios</h2><div className="grid gap-3">{items.map(({ line, product }) => <div key={product.id} className="flex gap-3 rounded-[18px] border border-[var(--border)] bg-white p-3 shadow-[0_7px_20px_rgba(141,48,77,.05)]"><Image src={product.image} alt={product.name} width={88} height={88} className="size-[88px] shrink-0 rounded-2xl object-cover"/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="font-head text-[13px] font-bold leading-tight">{product.name}</h3><button onClick={() => cart.remove(product.id)} aria-label={`Eliminar ${product.name}`} className="text-[#c798a4]"><Trash2 size={16}/></button></div><p className="mt-1 font-body text-[11px] text-[#987681]">{line.variant}</p><div className="mt-3 flex items-center justify-between"><strong className="font-head text-[15px] text-[var(--primary)]">{formatPrice(product.priceCents)}</strong><div className="flex items-center gap-3 rounded-full border border-[var(--border)] px-2 py-1"><button onClick={() => cart.decrement(product.id)} aria-label="Reducir cantidad" className="text-[var(--primary)]"><Minus size={13}/></button><span className="font-head text-[11px] font-bold">{line.quantity}</span><button onClick={() => cart.add(product.id)} aria-label="Aumentar cantidad" className="text-[var(--primary)]"><Plus size={13}/></button></div></div></div></div>)}</div>
      <section className="mt-5 rounded-2xl border border-dashed border-[#e6a2b4] bg-[#fff8f2] p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#ffe4ea] font-head text-lg text-[var(--primary)]">%</span><div><h2 className="font-head text-[13px] font-bold">¿Tienes un cupón michi secreto?</h2><p className="font-body text-[10px] text-[#987681]">Un descuentito para consentirlos más.</p></div></div><div className="mt-3 flex gap-2"><input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} aria-label="Código de cupón" className="min-w-0 flex-1 rounded-full border border-[var(--border)] bg-white px-4 py-2 font-head text-xs uppercase outline-none"/><button onClick={submitCoupon} className="rounded-full bg-[var(--tertiary)] px-4 py-2 font-head text-[11px] font-bold text-white">Aplicar</button></div>{message && <p className={`mt-2 font-body text-[11px] ${cart.coupon ? "text-[#5b9a79]" : "text-[var(--primary)]"}`}>{message}{cart.coupon && <button onClick={() => { cart.clearCoupon(); setMessage(""); }} className="ml-2 underline">Quitar</button>}</p>}</section></section>
      <aside className="h-fit rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-[0_10px_28px_rgba(141,48,77,.07)] lg:sticky lg:top-5"><h2 className="font-head text-lg font-bold">Resumen de Mimitos</h2><div className="mt-4 grid gap-3 border-b border-[#f3e4e7] pb-4 font-body text-[13px] text-[#987681]"><div className="flex justify-between"><span>Subtotal</span><b className="font-head text-[var(--neutral)]">{formatPrice(cart.subtotalCents)}</b></div><div className="flex justify-between"><span>Descuento Kawaii (-10%) ♡</span><b className="font-head text-[var(--primary)]">-{formatPrice(cart.discountCents)}</b></div><div className="flex justify-between"><span>Envío con Mimo</span><b className="font-head text-[#5b9a79]">{cart.shippingCents ? formatPrice(cart.shippingCents) : "Gratis"}</b></div></div><div className="mt-4 flex items-end justify-between"><span className="font-head text-sm font-bold">Total a pagar</span><strong className="font-head text-2xl font-extrabold text-[var(--primary)]">{formatPrice(cart.totalCents)}</strong></div><p className="mt-2 font-body text-[10px] text-[#987681]">IVA incluido y ronroneos asegurados</p><button onClick={goToCheckout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8d304d] to-[#ff6b88] px-4 py-3.5 font-head text-xs font-bold text-white shadow-[0_8px_18px_rgba(112,38,63,.2)]"><LockKeyhole size={16}/><span>Proceder al Pago Seguro</span><ArrowRight size={16}/></button><div className="mt-4 flex items-center justify-center gap-2 font-body text-[10px] text-[#987681]"><ShieldCheck size={14} className="text-[#5b9a79]"/> Garantía Michi Seguro</div></aside></div>
      <div className="flex items-center justify-center gap-2 py-6 font-body text-[10px] text-[#b18d96]"><Check size={13} className="text-[#5b9a79]"/> Pago simulado · No se realiza ningún cargo</div>
    </div>
    {showAuthModal && <AuthRequiredModal onClose={() => setShowAuthModal(false)}/>} 
  </>;
}
