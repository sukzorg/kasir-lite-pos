import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/async-handler";
import { serializeProduct, serializeSale, toNumber } from "../../utils/serializers";
import { getStoreId } from "../../utils/store-context";

export const dashboardRoutes = Router();

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

type TrendBucket = {
  label: string;
  start: Date;
  end: Date;
};

function buildTrendBuckets(range: "7d" | "1m" | "3m" | "5y"): TrendBucket[] {
  const now = new Date();
  if (range === "5y") {
    return Array.from({ length: 5 }, (_, index) => {
      const year = now.getFullYear() - (4 - index);
      return {
        label: String(year),
        start: new Date(year, 0, 1, 0, 0, 0, 0),
        end: new Date(year, 11, 31, 23, 59, 59, 999)
      };
    });
  }

  if (range === "3m") {
    return Array.from({ length: 12 }, (_, index) => {
      const start = new Date(now);
      start.setDate(now.getDate() - (11 - index) * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return {
        label: start.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        start,
        end: end > now ? now : end
      };
    });
  }

  const days = range === "1m" ? 30 : 7;
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (days - 1 - index));
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return {
      label: date.toLocaleDateString("id-ID", range === "7d" ? { weekday: "short" } : { day: "2-digit", month: "short" }),
      start,
      end
    };
  });
}

dashboardRoutes.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const storeId = getStoreId(req);
    const query = z
      .object({
        trendRange: z.enum(["7d", "1m", "3m", "5y"]).default("7d")
      })
      .parse(req.query);
    const { start, end } = todayRange();
    const trendBuckets = buildTrendBuckets(query.trendRange);
    const trendStart = trendBuckets[0].start;
    const [
      todaySales,
      trendSales,
      productsCount,
      customersCount,
      recentSales,
      lowStockProducts,
      saleItems
    ] = await Promise.all([
        prisma.sale.findMany({
          where: {
            storeId,
            status: "completed",
            createdAt: { gte: start, lte: end }
          }
        }),
        prisma.sale.findMany({
          where: {
            storeId,
            status: "completed",
            createdAt: { gte: trendStart }
          }
        }),
        prisma.product.count({ where: { status: "active" } }),
        prisma.customer.count(),
        prisma.sale.findMany({
          where: { storeId },
          include: {
            customer: true,
            cashier: { select: { id: true, name: true } },
            items: true
          },
          orderBy: { createdAt: "desc" },
          take: 6
        }),
        prisma.product.findMany({
          where: { status: "active" },
          include: { category: true },
          orderBy: { stock: "asc" },
          take: 20
        }),
        prisma.saleItem.findMany({
          where: {
            sale: {
              storeId,
              status: "completed",
              createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30))
              }
            }
          },
          include: {
            product: {
              include: { category: true }
            }
          }
        })
      ]);

    const todayRevenue = todaySales.reduce((total, sale) => total + toNumber(sale.grandTotal), 0);
    const lowStock = lowStockProducts
      .filter((product) => product.stock <= product.minimumStock)
      .slice(0, 5)
      .map(serializeProduct);

    const categoryMap = new Map<string, { name: string; color: string; total: number }>();
    for (const item of saleItems) {
      const category = item.product.category;
      const current = categoryMap.get(category.name) ?? {
        name: category.name,
        color: category.color,
        total: 0
      };
      current.total += toNumber(item.subtotal);
      categoryMap.set(category.name, current);
    }

    const productMap = new Map<string, { name: string; qty: number; total: number }>();
    for (const item of saleItems) {
      const current = productMap.get(item.productName) ?? {
        name: item.productName,
        qty: 0,
        total: 0
      };
      current.qty += item.qty;
      current.total += toNumber(item.subtotal);
      productMap.set(item.productName, current);
    }

    const trend = trendBuckets.map((bucket) => {
      const total = trendSales
        .filter((sale) => sale.createdAt >= bucket.start && sale.createdAt <= bucket.end)
        .reduce((sum, sale) => sum + toNumber(sale.grandTotal), 0);
      return {
        label: bucket.label,
        total
      };
    });

    res.json({
      data: {
        metrics: {
          todayRevenue,
          todayTransactions: todaySales.length,
          productsCount,
          customersCount
        },
        salesTrend: trend,
        categories: Array.from(categoryMap.values()).sort((a, b) => b.total - a.total),
        topProducts: Array.from(productMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 5),
        recentSales: recentSales.map(serializeSale),
        lowStock
      }
    });
  })
);
