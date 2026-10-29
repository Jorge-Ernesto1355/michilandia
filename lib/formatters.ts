export function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(cents / 100);
}
