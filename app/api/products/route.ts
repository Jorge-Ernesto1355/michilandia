import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const products = await getProducts({ search: url.searchParams.get("search") ?? undefined, category: url.searchParams.get("category") ?? undefined });
  return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } });
}
