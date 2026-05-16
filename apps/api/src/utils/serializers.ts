import type { Prisma } from "@prisma/client";

export function toNumber(value: Prisma.Decimal | number | string | null | undefined) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value);
}

export function serializeProduct<T extends Record<string, unknown>>(product: T) {
  return {
    ...product,
    purchasePrice: toNumber(product.purchasePrice as Prisma.Decimal),
    sellingPrice: toNumber(product.sellingPrice as Prisma.Decimal)
  };
}

export function serializeSale<T extends Record<string, unknown>>(sale: T) {
  return {
    ...sale,
    subtotal: toNumber(sale.subtotal as Prisma.Decimal),
    discountAmount: toNumber(sale.discountAmount as Prisma.Decimal),
    pointDiscountAmount: toNumber(sale.pointDiscountAmount as Prisma.Decimal),
    taxAmount: toNumber(sale.taxAmount as Prisma.Decimal),
    grandTotal: toNumber(sale.grandTotal as Prisma.Decimal),
    paidAmount: toNumber(sale.paidAmount as Prisma.Decimal),
    changeAmount: toNumber(sale.changeAmount as Prisma.Decimal),
    items: Array.isArray(sale.items)
      ? sale.items.map((item) => ({
          ...(item as Record<string, unknown>),
          price: toNumber((item as Record<string, unknown>).price as Prisma.Decimal),
          discountAmount: toNumber(
            (item as Record<string, unknown>).discountAmount as Prisma.Decimal
          ),
          subtotal: toNumber((item as Record<string, unknown>).subtotal as Prisma.Decimal)
        }))
      : sale.items
  };
}
