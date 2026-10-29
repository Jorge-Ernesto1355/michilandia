import { notFound } from "next/navigation";
import ProductDetail from "@/components/products/ProductDetail";
import { products } from "@/data/products";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
