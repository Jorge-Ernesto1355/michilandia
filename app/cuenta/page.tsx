import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import OrderList from "@/components/orders/OrderList";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) redirect("/auth/login?callbackURL=%2Fcuenta");
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  const orders = await prisma.order.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, include: { items: { select: { quantity: true } } } });
  const orderList = orders.map((order) => ({ id: order.id, orderNumber: order.orderNumber, status: order.status, totalCents: order.totalCents, createdAt: order.createdAt, itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0) }));

  return <main className="mx-auto max-w-[800px] px-4 py-8 sm:px-7"><section className="rounded-[22px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8"><p className="font-head text-[10px] font-bold uppercase tracking-[.14em] text-[#a95c72]">Tu espacio en Michilandia</p><h1 className="mt-2 font-head text-3xl font-extrabold tracking-[-.04em]">Hola, {session.user.name}</h1><p className="mt-2 font-body text-[15px] text-[var(--muted)]">{session.user.email}</p><div className="mt-7 flex flex-wrap gap-3"><LogoutButton />{isAdmin && <Link href="/admin/pedidos" className="inline-flex min-h-11 items-center rounded-xl bg-[#fff8ed] px-4 font-head text-sm font-bold text-[#b56720]">Ver todos los pedidos</Link>}<Link href="/catalogo" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--primary)] px-4 font-head text-sm font-bold text-white">Seguir comprando</Link></div></section><section className="mt-6 rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-[0_8px_22px_rgba(141,48,77,.05)] sm:p-7"><div className="mb-4 flex items-end justify-between gap-3"><div><p className="font-head text-[10px] font-bold uppercase tracking-[.14em] text-[#a95c72]">Tus paquetes</p><h2 className="mt-1 font-head text-xl font-bold">Pedidos y seguimiento</h2></div><span className="rounded-full bg-[#ffe4ea] px-3 py-2 font-head text-xs font-bold text-[var(--primary)]">{orderList.length}</span></div><OrderList orders={orderList} showTracking/></section></main>;
}
