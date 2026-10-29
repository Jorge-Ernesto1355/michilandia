"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export default function RegisterForm({ callbackURL }: { callbackURL?: string } = {}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);
    if (cleanName.length < 2) return setError("Escribe tu nombre para continuar.");
    if (!isValidEmail(cleanEmail)) return setError("Escribe un correo electrónico válido.");
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");

    setLoading(true);
    const result = await authClient.signUp.email({ name: cleanName, email: cleanEmail, password, callbackURL: "/cuenta" });
    setLoading(false);
    if (result.error) return setError(getAuthErrorMessage(result.error, "No pudimos crear tu cuenta. Inténtalo de nuevo."));

    if (!result.data?.token) {
      setVerificationNotice(true);
      return;
    }
    router.replace(callbackURL?.startsWith("/") ? callbackURL : "/cuenta");
    router.refresh();
  }

  if (verificationNotice) return <div role="status" className="grid gap-4 rounded-2xl bg-[#fff8ed] p-5"><h2 className="font-head text-lg font-bold text-[var(--neutral)]">Revisa tu correo ✉</h2><p className="font-body text-sm leading-relaxed text-[var(--muted)]">Tu cuenta se creó. Confirma tu correo electrónico y después inicia sesión en Michilandia.</p><Link href="/auth/login" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-4 font-head text-sm font-bold text-white">Ir a iniciar sesión</Link></div>;

  return <form onSubmit={submit} noValidate className="grid gap-4"><label className="grid gap-2 font-head text-xs font-bold text-[var(--neutral)]"><span>Nombre</span><input type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="min-h-12 rounded-xl border border-[var(--border)] px-4 font-body text-base font-normal outline-none transition focus:border-[var(--primary)]" placeholder="Tu nombre" required /></label><label className="grid gap-2 font-head text-xs font-bold text-[var(--neutral)]"><span>Correo electrónico</span><input type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 rounded-xl border border-[var(--border)] px-4 font-body text-base font-normal outline-none transition focus:border-[var(--primary)]" placeholder="tu@correo.com" required /></label><label className="grid gap-2 font-head text-xs font-bold text-[var(--neutral)]"><span>Contraseña</span><input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 rounded-xl border border-[var(--border)] px-4 font-body text-base font-normal outline-none transition focus:border-[var(--primary)]" placeholder="Mínimo 8 caracteres" required /></label>{error && <p role="alert" className="rounded-xl bg-[#fff0f3] px-4 py-3 font-body text-sm leading-relaxed text-[var(--primary-strong)]">{error}</p>}<button type="submit" disabled={loading} className="mt-2 min-h-12 rounded-xl bg-[var(--primary)] px-5 font-head text-sm font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creando cuenta…" : "Crear mi cuenta"}</button><Link href="/auth/login" className="text-center font-head text-sm font-bold text-[var(--primary)] underline decoration-[var(--border-strong)] underline-offset-4">Ya tengo una cuenta</Link></form>;
}
