"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    if (loading) return;
    setLoading(true);
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }

  return <button type="button" onClick={logout} disabled={loading} className="min-h-11 rounded-xl border border-[var(--border-strong)] px-4 font-head text-sm font-bold text-[var(--primary)] transition hover:bg-[var(--secondary)] disabled:opacity-60">{loading ? "Cerrando sesión…" : "Cerrar sesión"}</button>;
}
