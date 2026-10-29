import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { address: true, items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  return NextResponse.json({ order });
}
