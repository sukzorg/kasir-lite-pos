import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/async-handler";
import { serializeProduct, serializeSale, toNumber } from "../../utils/serializers";
import { getStoreId } from "../../utils/store-context";

export const reportRoutes = Router();

function dateFilter(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return undefined;
  return {
    ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
    ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999`) } : {})
  };
}

reportRoutes.get(
  "/sales",
  asyncHandler(async (req, res) => {
    const storeId = getStoreId(req);
    const query = z
      .object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        paymentMethod: z.string().optional()
      })
      .parse(req.query);

    const sales = await prisma.sale.findMany({
      where: {
        storeId,
        status: "completed",
        ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
        ...(dateFilter(query.dateFrom, query.dateTo)
          ? { createdAt: dateFilter(query.dateFrom, query.dateTo) }
          : {})
      },
      include: {
        items: {
          include: {
            product: {
              include: { category: true }
            }
          }
        },
        cashier: { select: { id: true, name: true } },
        customer: true
      },
      orderBy: { createdAt: "desc" }
    });

    const totals = sales.reduce(
      (acc, sale) => {
        acc.revenue += toNumber(sale.grandTotal);
        acc.discount += toNumber(sale.discountAmount);
        acc.tax += toNumber(sale.taxAmount);
        acc.transactions += 1;
        return acc;
      },
      { revenue: 0, discount: 0, tax: 0, transactions: 0 }
    );

    const paymentMethods = new Map<string, number>();
    const categories = new Map<string, { name: string; color: string; total: number }>();
    const products = new Map<string, { name: string; qty: number; total: number }>();

    for (const sale of sales) {
      paymentMethods.set(
        sale.paymentMethod,
        (paymentMethods.get(sale.paymentMethod) ?? 0) + toNumber(sale.grandTotal)
      );
      for (const item of sale.items) {
        const category = item.product.category;
        const categoryValue = categories.get(category.name) ?? {
          name: category.name,
          color: category.color,
          total: 0
        };
        categoryValue.total += toNumber(item.subtotal);
        categories.set(category.name, categoryValue);

        const productValue = products.get(item.productName) ?? {
          name: item.productName,
          qty: 0,
          total: 0
        };
        productValue.qty += item.qty;
        productValue.total += toNumber(item.subtotal);
        products.set(item.productName, productValue);
      }
    }

    res.json({
      data: {
        totals,
        paymentMethods: Array.from(paymentMethods.entries()).map(([method, total]) => ({
          method,
          total
        })),
        categories: Array.from(categories.values()).sort((a, b) => b.total - a.total),
        topProducts: Array.from(products.values()).sort((a, b) => b.qty - a.qty),
        transactions: sales.map(serializeSale)
      }
    });
  })
);

reportRoutes.get(
  "/inventory",
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: [{ stock: "asc" }, { name: "asc" }]
    });
    const lowStock = products.filter((product) => product.stock <= product.minimumStock);

    res.json({
      data: {
        summary: {
          totalProducts: products.length,
          lowStock: lowStock.length,
          outOfStock: products.filter((product) => product.stock === 0).length
        },
        products: products.map(serializeProduct)
      }
    });
  })
);
