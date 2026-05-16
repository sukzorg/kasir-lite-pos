import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/http-error";
import type { AdjustmentPayload, MovementPayload, MovementQuery } from "./inventory.schema";

export function listStocks() {
  return prisma.product.findMany({
    where: { status: "active" },
    include: { category: true },
    orderBy: [{ stock: "asc" }, { name: "asc" }]
  });
}

export async function listLowStock() {
  const products = await prisma.product.findMany({
    where: { status: "active" },
    include: { category: true },
    orderBy: { stock: "asc" }
  });

  return products.filter((product) => product.stock <= product.minimumStock);
}

export function listMovements(storeId: number, query: MovementQuery) {
  return prisma.stockMovement.findMany({
    where: {
      storeId,
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.type ? { type: query.type } : {})
    },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      user: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });
}

export async function createStockIn({
  payload,
  storeId,
  userId
}: {
  payload: MovementPayload;
  storeId: number;
  userId: number;
}) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: payload.productId } });
    if (!product) throw new HttpError(404, "Produk tidak ditemukan.");

    const beforeStock = product.stock;
    const afterStock = beforeStock + payload.qty;

    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: { stock: afterStock },
      include: { category: true }
    });

    const movement = await tx.stockMovement.create({
      data: {
        storeId,
        productId: product.id,
        type: "IN",
        qty: payload.qty,
        beforeStock,
        afterStock,
        referenceType: "manual",
        notes: payload.notes,
        createdBy: userId
      }
    });

    return { product: updatedProduct, movement };
  });
}

export async function createStockOut({
  payload,
  storeId,
  userId
}: {
  payload: MovementPayload;
  storeId: number;
  userId: number;
}) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: payload.productId } });
    if (!product) throw new HttpError(404, "Produk tidak ditemukan.");
    if (product.stock < payload.qty) throw new HttpError(422, "Stok tidak cukup untuk dikeluarkan.");

    const beforeStock = product.stock;
    const afterStock = beforeStock - payload.qty;

    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: { stock: afterStock },
      include: { category: true }
    });

    const movement = await tx.stockMovement.create({
      data: {
        storeId,
        productId: product.id,
        type: "OUT",
        qty: payload.qty,
        beforeStock,
        afterStock,
        referenceType: "manual",
        notes: payload.notes,
        createdBy: userId
      }
    });

    return { product: updatedProduct, movement };
  });
}

export async function createAdjustment({
  payload,
  storeId,
  userId
}: {
  payload: AdjustmentPayload;
  storeId: number;
  userId: number;
}) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: payload.productId } });
    if (!product) throw new HttpError(404, "Produk tidak ditemukan.");

    const beforeStock = product.stock;
    const afterStock = payload.newStock;

    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: { stock: afterStock },
      include: { category: true }
    });

    const movement = await tx.stockMovement.create({
      data: {
        storeId,
        productId: product.id,
        type: "ADJUSTMENT",
        qty: afterStock - beforeStock,
        beforeStock,
        afterStock,
        referenceType: "manual",
        notes: payload.notes,
        createdBy: userId
      }
    });

    return { product: updatedProduct, movement };
  });
}
