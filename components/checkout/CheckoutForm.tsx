"use client";

import Link from "next/link";
import { ArrowLeft, Check, CreditCard, LockKeyhole, MapPin, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/AppProviders";
import { getCartProducts } from "@/lib/cart-utils";
import { formatPrice } from "@/lib/formatters";
import { sileo } from "sileo";

type FieldErrors = Partial<Record<"cardholder" | "cardNumber" | "expiry" | "cvv" | "recipientName" | "line1" | "city" | "state" | "postalCode", string>>;

function onlyDigits(value: string, max: number) { return value.replace(/\D/g, "").slice(0, max); }
function formatCardNumber(value: string) { return onlyDigits(value, 16).replace(/(.{4})/g, "$1 ").trim(); }

export default function CheckoutForm() {
  const router = useRouter();
  const cart = useCart();
  const items = useMemo(() => getCartProducts(cart.lines), [cart.lines]);
  const [cardholder, setCardholder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState("");
  const [loading, setLoading] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  function validate() {
    const next: FieldErrors = {};
    if (!cardholder.trim()) next.cardholder = "Escribe el nombre del titular.";
    if (cardNumber.replace(/\D/g, "").length !== 16) next.cardNumber = "El número debe tener exactamente 16 dígitos.";
    const expiryMatch = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
    if (!expiryMatch) next.expiry = "Usa un mes válido con formato MM/AA.";
    else {
      const month = Number(expiryMatch[1]);
      const year = 2000 + Number(expiryMatch[2]);
      const now = new Date();
      if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) next.expiry = "La tarjeta está vencida.";
    }
    if (!/^\d{3}$/.test(cvv)) next.cvv = "El CVV debe tener 3 dígitos.";
    if (!recipientName.trim()) next.recipientName = "Escribe quién recibe el pedido.";
    if (!line1.trim()) next.line1 = "Escribe la calle y número.";
    if (!city.trim()) next.city = "Escribe la ciudad.";
    if (!state.trim()) next.state = "Escribe el estado.";
    if (!/^\d{5}$/.test(postalCode)) next.postalCode = "Usa un código postal de 5 dígitos.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !validate() || !idempotencyKey || !items.length) return;
    setLoading(true);
    setRequestError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey,
          couponCode: cart.coupon,
          items: cart.lines.map((line) => ({ productId: line.productId, quantity: line.quantity, variant: line.variant })),
          address: { label: "Casa", recipientName, phone, line1, line2, neighborhood, city, state, postalCode },
        }),
      });
      const rawResponse = await response.text();
      let result: { error?: string; order?: { id: string } } = {};
      try {
        result = rawResponse ? JSON.parse(rawResponse) as { error?: string; order?: { id: string } } : {};
      } catch {
        throw new Error("El servidor devolvió una respuesta inválida. Tu carrito se conserva para intentarlo de nuevo.");
      }
      if (!response.ok || !result.order?.id) throw new Error(result.error || "No pudimos crear tu pedido.");
      sileo.success({ title: "Pedido confirmado", description: "Tu pago fue simulado y no se realizó ningún cargo." });
      cart.clearCart();
      router.replace(`/pedido/${result.order.id}`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No pudimos crear tu pedido. Tu carrito se conserva.";
      setRequestError(message);
      sileo.error({ title: "No se pudo crear el pedido", description: message });
      setLoading(false);
    }
  }

  const inputClass = "min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 font-body text-sm outline-none transition focus:border-[var(--primary)]";
  const field = (error?: string) => error && <p role="alert" className="mt-1 font-body text-xs text-[var(--primary-strong)]">{error}</p>;

  if (!items.length) return <div className="mx-auto max-w-[700px] px-4 py-12 text-center"><p className="text-5xl">🐾</p><h1 className="mt-4 font-head text-2xl font-extrabold">Tu carrito está vacío</h1><Link href="/catalogo" className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-5 py-3 font-head text-xs font-bold text-white">Volver a la tienda</Link></div>;

  return <main className="mx-auto max-w-[1040px] px-4 sm:px-7 lg:px-10">
    <div className="flex items-center gap-3 pt-2 sm:pt-6"><Link href="/carrito" aria-label="Volver al carrito" className="grid size-10 place-items-center rounded-full bg-white text-[var(--primary)] shadow-sm"><ArrowLeft size={18}/></Link><div><p className="font-head text-[10px] font-bold uppercase tracking-[.16em] text-[#c17b8a]">Último paso</p><h1 className="font-head text-3xl font-extrabold tracking-[-.05em]">Pago seguro</h1></div></div>
    <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_350px]">
      <form onSubmit={submit} noValidate className="grid gap-5">
        <section className="rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-[0_8px_22px_rgba(141,48,77,.05)] sm:p-7"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0f3] text-[var(--primary)]"><MapPin size={19}/></span><div><h2 className="font-head text-lg font-bold">Dirección de entrega</h2><p className="mt-1 font-body text-xs text-[var(--muted)]">La usaremos para preparar tu pedido.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1 sm:col-span-2"><span className="font-head text-xs font-bold">Nombre de quien recibe</span><input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={inputClass} autoComplete="name" />{field(errors.recipientName)}</label><label className="grid gap-1"><span className="font-head text-xs font-bold">Teléfono <small className="font-normal text-[var(--muted)]">(opcional)</small></span><input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))} className={inputClass} autoComplete="tel" /></label><label className="grid gap-1"><span className="font-head text-xs font-bold">Colonia <small className="font-normal text-[var(--muted)]">(opcional)</small></span><input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className={inputClass} autoComplete="address-level3" /></label><label className="grid gap-1 sm:col-span-2"><span className="font-head text-xs font-bold">Calle y número</span><input value={line1} onChange={(e) => setLine1(e.target.value)} className={inputClass} autoComplete="street-address" />{field(errors.line1)}</label><label className="grid gap-1 sm:col-span-2"><span className="font-head text-xs font-bold">Referencia <small className="font-normal text-[var(--muted)]">(opcional)</small></span><input value={line2} onChange={(e) => setLine2(e.target.value)} className={inputClass} /></label><label className="grid gap-1"><span className="font-head text-xs font-bold">Ciudad</span><input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} autoComplete="address-level2" />{field(errors.city)}</label><label className="grid gap-1"><span className="font-head text-xs font-bold">Estado</span><input value={state} onChange={(e) => setState(e.target.value)} className={inputClass} autoComplete="address-level1" />{field(errors.state)}</label><label className="grid gap-1"><span className="font-head text-xs font-bold">Código postal</span><input value={postalCode} onChange={(e) => setPostalCode(onlyDigits(e.target.value, 5))} className={inputClass} inputMode="numeric" autoComplete="postal-code" />{field(errors.postalCode)}</label></div></section>
        <section className="rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-[0_8px_22px_rgba(141,48,77,.05)] sm:p-7"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0f3] text-[var(--primary)]"><CreditCard size={19}/></span><div><h2 className="font-head text-lg font-bold">Tarjeta de prueba</h2><p className="mt-1 font-body text-xs text-[var(--muted)]">Aceptamos cualquier tarjeta que cumpla las validaciones.</p></div></div><div className="mt-5 grid gap-4"><label className="grid gap-1"><span className="font-head text-xs font-bold">Titular de la tarjeta</span><input value={cardholder} onChange={(e) => setCardholder(e.target.value)} className={inputClass} autoComplete="cc-name" />{field(errors.cardholder)}</label><label className="grid gap-1"><span className="font-head text-xs font-bold">Número de tarjeta</span><input value={formatCardNumber(cardNumber)} onChange={(e) => setCardNumber(onlyDigits(e.target.value, 16))} className={`${inputClass} tracking-[.08em]`} inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" />{field(errors.cardNumber)}</label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1"><span className="font-head text-xs font-bold">Vencimiento</span><input value={expiry} onChange={(e) => { const value = onlyDigits(e.target.value, 4); setExpiry(value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value); }} className={inputClass} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" />{field(errors.expiry)}</label><label className="grid gap-1"><span className="font-head text-xs font-bold">CVV</span><input value={cvv} onChange={(e) => setCvv(onlyDigits(e.target.value, 3))} className={inputClass} inputMode="numeric" autoComplete="cc-csc" placeholder="000" />{field(errors.cvv)}</label></div></div><div className="mt-5 flex gap-3 rounded-xl bg-[#fff8ed] p-3 text-xs text-[#806570]"><ShieldCheck className="shrink-0 text-[#b56720]" size={17}/><p><strong>Simulación:</strong> no guardamos ni enviamos tu tarjeta, CVV o vencimiento y no se realiza ningún cargo.</p></div></section>
        {requestError && <p role="alert" className="rounded-xl bg-[#fff0f3] px-4 py-3 font-body text-sm text-[var(--primary-strong)]">{requestError}</p>}
        <button type="submit" disabled={loading || !idempotencyKey} className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8d304d] to-[#ff6b88] px-5 py-3.5 font-head text-sm font-bold text-white shadow-[0_8px_18px_rgba(112,38,63,.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"><LockKeyhole size={17}/>{loading ? "Creando pedido…" : "Confirmar pedido simulado"}</button>
      </form>
      <aside className="h-fit rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-[0_10px_28px_rgba(141,48,77,.07)] lg:sticky lg:top-5"><h2 className="font-head text-lg font-bold">Resumen del pedido</h2><div className="mt-4 grid gap-3 border-b border-[#f3e4e7] pb-4">{items.map(({ line, product }) => <div key={product.id} className="flex justify-between gap-3 text-sm"><span className="font-body text-[var(--muted)]">{line.quantity} × {product.name}</span><b className="shrink-0 font-head text-[var(--neutral)]">{formatPrice(product.priceCents * line.quantity)}</b></div>)}</div><div className="mt-4 grid gap-3 font-body text-sm text-[var(--muted)]"><div className="flex justify-between"><span>Subtotal</span><b className="font-head text-[var(--neutral)]">{formatPrice(cart.subtotalCents)}</b></div><div className="flex justify-between"><span>Descuento</span><b className="font-head text-[var(--primary)]">-{formatPrice(cart.discountCents)}</b></div><div className="flex justify-between"><span>Envío</span><b className="font-head text-[#5b9a79]">{cart.shippingCents ? formatPrice(cart.shippingCents) : "Gratis"}</b></div></div><div className="mt-5 flex items-end justify-between border-t border-[#f3e4e7] pt-4"><span className="font-head text-sm font-bold">Total</span><strong className="font-head text-2xl font-extrabold text-[var(--primary)]">{formatPrice(cart.totalCents)}</strong></div><p className="mt-4 flex items-center gap-2 font-body text-[10px] text-[#987681]"><Check size={14} className="text-[#5b9a79]"/> Pago 100% simulado, sin cargo real</p></aside>
    </div>
  </main>;
}
