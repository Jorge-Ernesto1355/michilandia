import CatalogContent from "@/components/products/CatalogContent";
import { getCategories, getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return <CatalogContent products={products} categories={categories.map((category) => category.label)} />;
}
