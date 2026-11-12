import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";

export type ProductCategory = { label: string; icon: string };

const categoryIcons: Record<string, string> = {
  "Collares": "♡", "Ropita y Lazos": "🎀", "Juguetes": "✧", "Hogar": "⌂", "Transportadoras": "✦",
};

export function toProduct(product: {
  id: string; name: string; description: string; priceCents: number; originalPriceCents: number | null;
  badge: string | null; featured: boolean; popularity: number; ratingAverage: number; reviewCount: number;
  imageUrl: string; category: { name: string };
}): Product {
  return { id: product.id, name: product.name, description: product.description, priceCents: product.priceCents,
    originalPriceCents: product.originalPriceCents ?? undefined, badge: product.badge ?? undefined,
    featured: product.featured, popularity: product.popularity, rating: product.ratingAverage,
    reviews: product.reviewCount, image: product.imageUrl, category: product.category.name };
}

export async function getProducts(options: { category?: string; search?: string; take?: number } = {}) {
  const search = options.search?.trim();
  const products = await prisma.product.findMany({
    where: { active: true,
      ...(options.category && options.category !== "Todos" ? { category: { name: options.category } } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }, { category: { name: { contains: search, mode: "insensitive" } } }] } : {}) },
    include: { category: true }, orderBy: { createdAt: "desc" }, ...(options.take ? { take: options.take } : {}),
  });
  return products.map(toProduct);
}

export async function getCategories() {
  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return categories.map((category) => ({ label: category.name, icon: categoryIcons[category.name] ?? "✦" }));
}
