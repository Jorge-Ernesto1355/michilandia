"use client";

import Link from "next/link";
import { X, LockKeyhole } from "lucide-react";

export default function AuthRequiredModal({ onClose }: { onClose: () => void }) {
  const callbackURL = encodeURIComponent("/checkout");
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#45343e]/35 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="auth-required-title">
    <div className="relative w-full max-w-[420px] rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-[0_24px_70px_rgba(69,52,62,.22)] sm:p-8">
      <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-[#9e7b86] transition hover:bg-[var(--secondary)] hover:text-[var(--primary)]"><X size={18}/></button>
      <div className="grid size-12 place-items-center rounded-2xl bg-[var(--secondary)] text-[var(--primary)]"><LockKeyhole size={21}/></div>
      <h2 id="auth-required-title" className="mt-5 font-head text-2xl font-extrabold tracking-[-.04em]">Inicia sesión para continuar</h2>
      <p className="mt-2 font-body text-sm leading-relaxed text-[var(--muted)]">Tu carrito se conservará mientras entras o creas tu cuenta. Después volverás directo al pago.</p>
      <div className="mt-6 grid gap-3">
        <Link href={`/auth/login?callbackURL=${callbackURL}`} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--primary)] px-5 font-head text-sm font-bold text-white transition hover:bg-[var(--primary-strong)]">Iniciar sesión</Link>
        <Link href={`/auth/register?callbackURL=${callbackURL}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border-strong)] px-5 font-head text-sm font-bold text-[var(--primary)] transition hover:bg-[var(--secondary)]">Crear una cuenta</Link>
      </div>
      <button type="button" onClick={onClose} className="mt-4 w-full font-body text-xs text-[var(--muted)] underline underline-offset-4">Seguir revisando el carrito</button>
    </div>
  </div>;
}
