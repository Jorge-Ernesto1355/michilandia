import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthFormShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return <main className="mx-auto flex min-h-[calc(100dvh-150px)] max-w-[480px] items-center px-4 py-10 sm:px-7"><section className="w-full rounded-[22px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8"><Link href="/" className="inline-flex items-center gap-2 font-head text-sm font-extrabold text-[var(--primary)]"><span aria-hidden="true" className="grid size-8 place-items-center rounded-xl bg-[var(--secondary)]">✦</span>Michilandia</Link><div className="mt-8"><h1 className="font-head text-3xl font-extrabold tracking-[-.04em] text-[var(--neutral)]">{title}</h1><p className="mt-2 font-body text-[15px] leading-relaxed text-[var(--muted)]">{description}</p></div><div className="mt-7">{children}</div><div className="mt-6 border-t border-[var(--border)] pt-5 text-center font-body text-sm text-[var(--muted)]">{footer}</div></section></main>;
}
