import Link from "next/link";
import AuthFormShell from "@/components/auth/AuthFormShell";
import RegisterForm from "@/components/auth/RegisterForm";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ callbackURL?: string }> }) {
  const { callbackURL } = await searchParams;
  return <AuthFormShell title="Únete a Michilandia" description="Crea tu cuenta para guardar tus favoritos y tus compras." footer={<>¿Ya tienes cuenta? <Link href="/auth/login" className="font-bold text-[var(--primary)]">Inicia sesión</Link></>}><RegisterForm callbackURL={callbackURL} /></AuthFormShell>;
}
