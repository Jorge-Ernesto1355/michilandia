import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { FREE_SHIPPING_THRESHOLD_CENTS, MICHI10_DISCOUNT_PERCENT, STANDARD_SHIPPING_CENTS, VALID_COUPON } from "@/lib/constants";

type OrderInput = {
  idempotencyKey?: unknown;
  couponCode?: unknown;
  items?: unknown;
  address?: unknown;
};

type AddressInput = {
  label?: unknown;
  recipientName?: unknown;
  phone?: unknown;
  line1?: unknown;
  line2?: unknown;
  neighborhood?: unknown;
  city?: unknown;
  state?: unknown;
  postalCode?: unknown;
};

type ItemInput = { productId?: unknown; quantity?: unknown; variant?: unknown };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return errorResponse("Debes iniciar sesión para crear un pedido.", 401);

  let input: OrderInput;
  try {
    input = (await request.json()) as OrderInput;
  } catch {
    return errorResponse("La solicitud no tiene un formato válido.");
  }

  const idempotencyKey = text(input.idempotencyKey);
  const rawItems = Array.isArray(input.items) ? input.items as ItemInput[] : [];
  const address = (input.address && typeof input.address === "object" ? input.address : {}) as AddressInput;

  if (!idempotencyKey || idempotencyKey.length > 100) return errorResponse("Falta la clave de seguridad del pedido.");
  if (!rawItems.length) return errorResponse("Tu carrito está vacío.");

  const addressData = {
    label: text(address.label) || "Casa",
    recipientName: text(address.recipientName),
    phone: text(address.phone) || null,
    line1: text(address.line1),
    line2: text(address.line2) || null,
    neighborhood: text(address.neighborhood) || null,
    city: text(address.city),
    state: text(address.state),
    postalCode: text(address.postalCode),
    country: "MX",
  };

  if (!addressData.recipientName || !addressData.line1 || !addressData.city || !addressData.state || !/^\d{5}$/.test(addressData.postalCode)) {
    return errorResponse("Completa el nombre, dirección, ciudad, estado y código postal de entrega.");
  }

  const normalizedItems = rawItems.map((item) => ({
    productId: text(item.productId),
    quantity: typeof item.quantity === "number" ? item.quantity : Number(item.quantity),
    variant: text(item.variant) || null,
  }));
  if (normalizedItems.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
    return errorResponse("Hay productos con una cantidad inválida.");
  }

  const existingOrder = await prisma.order.findFirst({ where: { userId: session.user.id, idempotencyKey } });
  if (existingOrder) return NextResponse.json({ order: { id: existingOrder.id, orderNumber: existingOrder.orderNumber } });

  const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
    include: { variants: { where: { active: true } } },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));
  if (products.length !== productIds.length) return errorResponse("Uno de los productos ya no está disponible.", 409);

  const orderItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId)!;
    const variant = item.variant ? product.variants.find((candidate) => candidate.name === item.variant) : undefined;
    const unitPriceCents = variant?.priceCents ?? product.priceCents;
    return {
      productId: product.id,
      variantId: variant?.id ?? null,
      productName: product.name,
      variantName: item.variant,
      quantity: item.quantity,
      unitPriceCents,
      totalCents: unitPriceCents * item.quantity,
    };
  });

  const subtotalCents = orderItems.reduce((sum, item) => sum + item.totalCents, 0);
  const couponCode = text(input.couponCode).toUpperCase();
  const discountCents = couponCode === VALID_COUPON ? Math.round(subtotalCents * MICHI10_DISCOUNT_PERCENT / 100) : 0;
  const shippingCents = subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
  const totalCents = subtotalCents - discountCents + shippingCents;
  const coupon = couponCode ? await prisma.coupon.findUnique({ where: { code: couponCode } }) : null;
  const orderNumber = `MICHI-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

  try {
    const order = await prisma.$transaction(async (transaction) => {
      const duplicate = await transaction.order.findFirst({ where: { userId: session.user.id, idempotencyKey } });
      if (duplicate) return duplicate;
      const savedAddress = await transaction.address.create({ data: { userId: session.user.id, ...addressData } });
      return transaction.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          idempotencyKey,
          status: "CONFIRMED",
          paymentStatus: "AUTHORIZED",
          paymentProvider: "SIMULATED",
          paymentReference: idempotencyKey,
          currency: "MXN",
          subtotalCents,
          discountCents,
          shippingCents,
          totalCents,
          couponId: coupon?.id ?? null,
          addressId: savedAddress.id,
          items: { create: orderItems },
        },
      });
    });
    return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Order_idempotencyKey_key")) {
      const duplicate = await prisma.order.findFirst({ where: { userId: session.user.id, idempotencyKey } });
      if (duplicate) return NextResponse.json({ order: { id: duplicate.id, orderNumber: duplicate.orderNumber } });
    }
    console.error("No se pudo crear el pedido", error);
    return errorResponse("No pudimos crear tu pedido. Tu carrito se conserva para intentarlo de nuevo.", 500);
  }
}
