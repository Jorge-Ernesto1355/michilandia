import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function slugify(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function fail(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }

export async function GET() {
  if (!await getAdminSession()) return fail("No autorizado.", 403);
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (!await getAdminSession()) return fail("No autorizado.", 403);
  let input: Record<string, unknown>;
  try { input = await request.json() as Record<string, unknown>; } catch { return fail("La solicitud no es válida."); }
  const name = text(input.name);
  const slug = slugify(text(input.slug) || name);
  const description = text(input.description);
  const imageUrl = text(input.imageUrl);
  const categoryName = text(input.categoryName);
  const priceCents = typeof input.priceCents === "number" ? input.priceCents : Number(input.priceCents);
  if (name.length < 2 || !slug || description.length < 3 || !imageUrl || !categoryName || !Number.isInteger(priceCents) || priceCents < 1) return fail("Completa nombre, descripción, imagen, categoría y un precio válido.");
  const categorySlug = slugify(categoryName);
  try {
    const product = await prisma.product.create({
      data: {
        id: crypto.randomUUID(), sku: text(input.sku) || null, slug, name, description, priceCents, imageUrl,
        badge: text(input.badge) || null, featured: input.featured === true, category: { connectOrCreate: { where: { slug: categorySlug }, create: { name: categoryName, slug: categorySlug } } },
      },
      include: { category: true },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message.includes("Product_slug_key") || error.message.includes("Category_slug_key"))) return fail("Ya existe un producto o categoría con ese nombre.", 409);
    console.error("No se pudo crear el producto", error);
    return fail("No pudimos crear el producto.", 500);
  }
}
