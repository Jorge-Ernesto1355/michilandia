import type { CartLine } from "@/types/cart";
import { FREE_SHIPPING_THRESHOLD_CENTS, MICHI10_DISCOUNT_PERCENT, STANDARD_SHIPPING_CENTS } from "@/lib/constants";
import type { Product } from "@/types/product";

export function getCartProducts(lines: CartLine[], products: Product[]) {
  return lines.map((line) => ({ line, product: products.find((item) => item.id === line.productId) })).filter((item): item is { line: CartLine; product: Product } => Boolean(item.product));
}
export function getSubtotalCents(lines: CartLine[], products: Product[]) { return getCartProducts(lines, products).reduce((sum, { line, product }) => sum + product.priceCents * line.quantity, 0); }
export function getUnits(lines: CartLine[]) { return lines.reduce((sum, line) => sum + line.quantity, 0); }
export function getDiscountCents(subtotal: number, coupon: string | null) { return coupon === "MICHI10" ? Math.round(subtotal * MICHI10_DISCOUNT_PERCENT / 100) : 0; }
export function getShippingCents(subtotal: number) { return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS; }
export function getProgress(subtotal: number) { return Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD_CENTS) * 100)); }
