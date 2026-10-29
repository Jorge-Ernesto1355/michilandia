import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import AdminProducts from "@/components/admin/AdminProducts";

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/cuenta");
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
  return <AdminProducts initialProducts={products.map((product) => ({ id: product.id, name: product.name, priceCents: product.priceCents, imageUrl: product.imageUrl, category: product.category.name, active: product.active }))} />;
}
