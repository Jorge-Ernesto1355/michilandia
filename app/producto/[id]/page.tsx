import { notFound } from "next/navigation";
import ProductDetail from "@/components/products/ProductDetail";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getProducts()).find((item) => item.id === id);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
