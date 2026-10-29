import Link from "next/link";
import { Suspense } from "react";
import AuthFormShell from "@/components/auth/AuthFormShell";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return <AuthFormShell title="Qué gusto verte" description="Entra a tu cuenta para continuar con tus mimos." footer={<>¿Aún no tienes cuenta? <Link href="/auth/register" className="font-bold text-[var(--primary)]">Regístrate aquí</Link></>}><Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-[var(--secondary)]" aria-label="Cargando formulario" />}><LoginForm /></Suspense></AuthFormShell>;
}
