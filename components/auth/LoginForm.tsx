"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export default function LoginForm({ callbackURL }: { callbackURL?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    const cleanEmail = normalizeEmail(email);
    if (!isValidEmail(cleanEmail)) return setError("Escribe un correo electrónico válido.");
    if (!password) return setError("Escribe tu contraseña.");

    setLoading(true);
    const result = await authClient.signIn.email({ email: cleanEmail, password, rememberMe: true });
    setLoading(false);
    if (result.error) return setError(getAuthErrorMessage(result.error, "No pudimos iniciar sesión. Inténtalo de nuevo."));

    const requestedCallback = callbackURL || searchParams.get("callbackURL");
    router.replace(requestedCallback?.startsWith("/") ? requestedCallback : "/cuenta");
    router.refresh();
  }

  return <form onSubmit={submit} noValidate className="grid gap-4"><label className="grid gap-2 font-head text-xs font-bold text-[var(--neutral)]"><span>Correo electrónico</span><input type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 rounded-xl border border-[var(--border)] px-4 font-body text-base font-normal outline-none transition focus:border-[var(--primary)]" placeholder="tu@correo.com" required /></label><label className="grid gap-2 font-head text-xs font-bold text-[var(--neutral)]"><span>Contraseña</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 rounded-xl border border-[var(--border)] px-4 font-body text-base font-normal outline-none transition focus:border-[var(--primary)]" placeholder="Tu contraseña" required /></label>{error && <p role="alert" className="rounded-xl bg-[#fff0f3] px-4 py-3 font-body text-sm leading-relaxed text-[var(--primary-strong)]">{error}</p>}<button type="submit" disabled={loading} className="mt-2 min-h-12 rounded-xl bg-[var(--primary)] px-5 font-head text-sm font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Entrando…" : "Entrar a mi cuenta"}</button><Link href="/auth/register" className="text-center font-head text-sm font-bold text-[var(--primary)] underline decoration-[var(--border-strong)] underline-offset-4">Crear una cuenta</Link></form>;
}
