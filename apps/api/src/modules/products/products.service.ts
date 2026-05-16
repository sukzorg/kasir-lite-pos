import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/http-error";
import type { ProductListQuery, ProductPayload } from "./products.schema";

function cleanProductPayload(payload: ProductPayload) {
  return {
    ...payload,
    barcode: payload.barcode || null,
    description: payload.description || null,
    image: payload.image || null
  };
}

export async function listProducts(query: ProductListQuery) {
  return prisma.product.findMany({
    where: {
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { sku: { contains: query.search } },
              { barcode: { contains: query.search } }
            ]
          }
        : {})
    },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getProductByBarcode(barcode: string) {
  const product = await prisma.product.findUnique({
    where: { barcode },
    include: { category: true }
  });
  if (!product) throw new HttpError(404, "Produk dengan barcode ini belum terdaftar.");
  return product;
}

export async function getProductById(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, movements: { orderBy: { createdAt: "desc" }, take: 10 } }
  });
  if (!product) throw new HttpError(404, "Produk tidak ditemukan.");
  return product;
}

export async function createProduct(payload: ProductPayload) {
  return prisma.product.create({
    data: cleanProductPayload(payload),
    include: { category: true }
  });
}

export async function updateProduct(id: number, payload: Partial<ProductPayload>) {
  const before = await prisma.product.findUnique({ where: { id } });
  if (!before) throw new HttpError(404, "Produk tidak ditemukan.");

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...payload,
      barcode: payload.barcode === undefined ? undefined : payload.barcode || null,
      description: payload.description === undefined ? undefined : payload.description || null,
      image: payload.image === undefined ? undefined : payload.image || null
    },
    include: { category: true }
  });

  return { before, product };
}

export async function deactivateProduct(id: number) {
  return prisma.product.update({
    where: { id },
    data: { status: "inactive" },
    include: { category: true }
  });
}

export async function logProductMutation({
  userId,
  storeId,
  action,
  oldData,
  newData
}: {
  userId: number;
  storeId: number;
  action: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      storeId,
      userId,
      action,
      module: "products",
      oldData: oldData as Prisma.InputJsonValue | undefined,
      newData: newData as Prisma.InputJsonValue | undefined
    }
  });
}
