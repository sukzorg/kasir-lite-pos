import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/http-error";
import { toNumber } from "../../utils/serializers";
import type { CancelSalePayload, CreateSalePayload, ListSalesQuery } from "./sales.schema";

function getDayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function toDateStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

async function generateTransactionNumber(tx: Prisma.TransactionClient, storeId: number, date = new Date()) {
  const { start, end } = getDayRange(date);
  const count = await tx.sale.count({
    where: {
      storeId,
      createdAt: {
        gte: start,
        lte: end
      }
    }
  });
  return `TRX-${toDateStamp(date)}-${String(count + 1).padStart(4, "0")}`;
}

export async function createSale({
  payload,
  storeId,
  userId,
  ipAddress
}: {
  payload: CreateSalePayload;
  storeId: number;
  userId: number;
  ipAddress?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const store = await tx.store.findUnique({ where: { id: storeId } });
    if (!store) throw new HttpError(404, "Outlet toko tidak ditemukan.");

    const taxRate = payload.taxRate ?? toNumber(store.taxRate);
    const loyaltyRule = await tx.loyaltyRule.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        minimumSpend: 100000,
        pointsAwarded: 1000,
        pointValue: 1
      }
    });
    const customer = payload.customerId
      ? await tx.customer.findUnique({ where: { id: payload.customerId } })
      : null;
    if (payload.customerId && !customer) throw new HttpError(404, "Pelanggan tidak ditemukan.");
    if (payload.redeemedPoints > 0 && !customer) {
      throw new HttpError(422, "Tukar point hanya tersedia untuk pelanggan terdaftar.");
    }
    if (payload.redeemedPoints > 0 && customer?.status !== "member") {
      throw new HttpError(422, "Tukar point hanya tersedia untuk pelanggan member.");
    }
    if (payload.redeemedPoints > (customer?.points ?? 0)) {
      throw new HttpError(422, "Point pelanggan tidak mencukupi.");
    }

    const requestedIds = payload.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: {
        id: { in: requestedIds },
        status: "active"
      }
    });
    const productById = new Map(products.map((product) => [product.id, product]));

    let subtotal = 0;
    const itemRows = payload.items.map((item) => {
      const product = productById.get(item.productId);
      if (!product) throw new HttpError(404, `Produk ${item.productId} tidak ditemukan.`);
      if (product.stock < item.qty) {
        throw new HttpError(422, `Stok ${product.name} tidak mencukupi.`);
      }

      const price = toNumber(product.sellingPrice);
      const lineSubtotal = Math.max(price * item.qty - item.discountAmount, 0);
      subtotal += lineSubtotal;

      return {
        product,
        productId: product.id,
        productName: product.name,
        qty: item.qty,
        price,
        discountAmount: item.discountAmount,
        subtotal: lineSubtotal
      };
    });

    const pointDiscountAmount = Math.min(
      payload.redeemedPoints * toNumber(loyaltyRule.pointValue),
      Math.max(subtotal - payload.discountAmount, 0)
    );
    const taxableAmount = Math.max(subtotal - payload.discountAmount - pointDiscountAmount, 0);
    const taxAmount = Math.round((taxableAmount * taxRate) / 100);
    const grandTotal = taxableAmount + taxAmount;
    if (payload.paidAmount < grandTotal) {
      throw new HttpError(422, "Nominal pembayaran kurang dari total belanja.");
    }

    const transactionNumber = await generateTransactionNumber(tx, storeId);
    const minimumSpend = toNumber(loyaltyRule.minimumSpend);
    const earnedPoints =
      customer?.status === "member" && minimumSpend > 0
        ? Math.floor(taxableAmount / minimumSpend) * loyaltyRule.pointsAwarded
        : 0;
    const sale = await tx.sale.create({
      data: {
        storeId,
        transactionNumber,
        customerId: payload.customerId || null,
        cashierId: userId,
        subtotal,
        discountAmount: payload.discountAmount,
        pointDiscountAmount,
        redeemedPoints: payload.redeemedPoints,
        earnedPoints,
        taxAmount,
        grandTotal,
        paidAmount: payload.paidAmount,
        changeAmount: payload.paidAmount - grandTotal,
        paymentMethod: payload.paymentMethod,
        status: "completed",
        notes: payload.notes || null,
        items: {
          create: itemRows.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            qty: item.qty,
            price: item.price,
            discountAmount: item.discountAmount,
            subtotal: item.subtotal
          }))
        }
      },
      include: {
        items: true,
        cashier: { select: { id: true, name: true } },
        customer: true
      }
    });

    if (customer) {
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          points: Math.max(customer.points - payload.redeemedPoints + earnedPoints, 0)
        }
      });
    }

    for (const item of itemRows) {
      const beforeStock = item.product.stock;
      const afterStock = beforeStock - item.qty;
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: afterStock }
      });
      await tx.stockMovement.create({
        data: {
          storeId,
          productId: item.productId,
          type: "OUT",
          qty: item.qty,
          beforeStock,
          afterStock,
          referenceType: "sales",
          referenceId: sale.id,
          notes: `Penjualan ${transactionNumber}`,
          createdBy: userId
        }
      });
    }

    await tx.auditLog.create({
      data: {
        storeId,
        userId,
        action: "create",
        module: "sales",
        newData: {
          id: sale.id,
          transactionNumber: sale.transactionNumber,
          grandTotal
        },
        ipAddress
      }
    });

    return sale;
  });
}

export async function listSales(storeId: number, query: ListSalesQuery) {
  return prisma.sale.findMany({
    where: {
      storeId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            createdAt: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59.999`) } : {})
            }
          }
        : {})
    },
    include: {
      customer: true,
      cashier: { select: { id: true, name: true } },
      items: true
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });
}

export async function getSale(storeId: number, id: number) {
  const sale = await prisma.sale.findFirst({
    where: { id, storeId },
    include: {
      customer: true,
      cashier: { select: { id: true, name: true } },
      items: true
    }
  });
  if (!sale) throw new HttpError(404, "Transaksi tidak ditemukan.");
  return sale;
}

export async function getSaleReceipt(storeId: number, id: number) {
  const [sale, store] = await Promise.all([
    getSale(storeId, id),
    prisma.store.findUnique({ where: { id: storeId } })
  ]);

  return { store, sale };
}

export async function cancelSale({
  id,
  storeId,
  userId,
  ipAddress,
  payload
}: {
  id: number;
  storeId: number;
  userId: number;
  ipAddress?: string;
  payload: CancelSalePayload;
}) {
  const result = await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findFirst({
      where: { id, storeId },
      include: { items: true }
    });

    if (!sale) throw new HttpError(404, "Transaksi tidak ditemukan.");
    if (sale.status !== "completed") {
      throw new HttpError(422, "Transaksi ini tidak dapat dibatalkan.");
    }

    for (const item of sale.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      const beforeStock = product.stock;
      const afterStock = beforeStock + item.qty;
      await tx.product.update({
        where: { id: product.id },
        data: { stock: afterStock }
      });
      await tx.stockMovement.create({
        data: {
          storeId,
          productId: product.id,
          type: "RETURN",
          qty: item.qty,
          beforeStock,
          afterStock,
          referenceType: "sales_cancel",
          referenceId: sale.id,
          notes: `Pembatalan ${sale.transactionNumber}: ${payload.reason}`,
          createdBy: userId
        }
      });
    }

    await tx.sale.update({
      where: { id },
      data: {
        status: "cancelled",
        notes: sale.notes
          ? `${sale.notes}\nPembatalan: ${payload.reason}`
          : `Pembatalan: ${payload.reason}`
      }
    });

    if (sale.customerId && (sale.redeemedPoints > 0 || sale.earnedPoints > 0)) {
      const customer = await tx.customer.findUnique({ where: { id: sale.customerId } });
      if (customer) {
        await tx.customer.update({
          where: { id: customer.id },
          data: {
            points: Math.max(customer.points + sale.redeemedPoints - sale.earnedPoints, 0)
          }
        });
      }
    }

    await tx.auditLog.create({
      data: {
        storeId,
        userId,
        action: "cancel",
        module: "sales",
        oldData: { id: sale.id, status: sale.status },
        newData: { id: sale.id, status: "cancelled", reason: payload.reason },
        ipAddress
      }
    });

    return tx.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        cashier: { select: { id: true, name: true } },
        items: true
      }
    });
  });

  return result;
}
