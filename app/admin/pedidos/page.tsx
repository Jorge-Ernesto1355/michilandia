import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ClipboardList, PackagePlus } from "lucide-react";
import OrderList from "@/components/orders/OrderList";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/cuenta");
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } }, items: { select: { quantity: true } } } });
  const orderList = orders.map((order) => ({ id: order.id, orderNumber: order.orderNumber, status: order.status, totalCents: order.totalCents, createdAt: order.createdAt, itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0), customerName: order.user.name, customerEmail: order.user.email }));
  return <main className="mx-auto max-w-[1040px] px-4 py-5 sm:px-7 sm:py-8"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><Link href="/" aria-label="Volver a la tienda" className="grid size-10 place-items-center rounded-full bg-white text-[var(--primary)] shadow-sm"><ArrowLeft size={18}/></Link><div><p className="font-head text-[10px] font-bold uppercase tracking-[.16em] text-[#c17b8a]">Administración</p><h1 className="font-head text-3xl font-extrabold tracking-[-.05em]">Todos los pedidos</h1></div></div><Link href="/admin/productos" className="grid size-11 place-items-center rounded-full bg-[#fff8ed] text-[#b56720]" aria-label="Administrar productos"><PackagePlus size={19}/></Link></div><section className="mt-6 rounded-[22px] border border-[var(--border)] bg-white p-5 shadow-[0_8px_22px_rgba(141,48,77,.05)] sm:p-7"><div className="mb-5 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#fff0f3] text-[var(--primary)]"><ClipboardList size={19}/></span><div><h2 className="font-head text-lg font-bold">Pedidos recibidos</h2><p className="font-body text-xs text-[var(--muted)]">Consulta cliente, estado, productos y total.</p></div></div><OrderList orders={orderList} admin/></section></main>;
}
