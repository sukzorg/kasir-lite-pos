import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/async-handler";
import { toNumber } from "../../utils/serializers";
import { getStoreId } from "../../utils/store-context";

export const settingsRoutes = Router();

const storeSchema = z.object({
  name: z.string().min(2).max(160),
  address: z.string().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().nullable(),
  logo: z.string().url().optional().nullable(),
  currency: z.string().min(2).max(10).default("IDR"),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  receiptFooter: z.string().optional().nullable()
});

const loyaltyRuleSchema = z.object({
  minimumSpend: z.coerce.number().min(0).default(100000),
  pointsAwarded: z.coerce.number().int().min(0).default(1000),
  pointValue: z.coerce.number().min(0).default(1)
});

function serializeStore<T extends { taxRate: unknown }>(store: T) {
  return {
    ...store,
    taxRate: toNumber(store.taxRate as never)
  };
}

function serializeLoyaltyRule<T extends { minimumSpend: unknown; pointValue: unknown }>(rule: T) {
  return {
    ...rule,
    minimumSpend: toNumber(rule.minimumSpend as never),
    pointValue: toNumber(rule.pointValue as never)
  };
}

settingsRoutes.get(
  "/store",
  asyncHandler(async (req, res) => {
    const storeId = getStoreId(req);
    let store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      store = await prisma.store.create({
        data: {
          id: storeId,
          name: "Toko Sejahtera",
          currency: "IDR",
          taxRate: 0,
          receiptFooter: "Terima kasih sudah berbelanja."
        }
      });
    }
    res.json({ data: serializeStore(store) });
  })
);

settingsRoutes.get(
  "/loyalty",
  asyncHandler(async (_req, res) => {
    const rule = await prisma.loyaltyRule.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        minimumSpend: 100000,
        pointsAwarded: 1000,
        pointValue: 1
      }
    });

    res.json({ data: serializeLoyaltyRule(rule) });
  })
);

settingsRoutes.put(
  "/loyalty",
  asyncHandler(async (req, res) => {
    const payload = loyaltyRuleSchema.parse(req.body);
    const rule = await prisma.loyaltyRule.upsert({
      where: { id: 1 },
      update: payload,
      create: { id: 1, ...payload }
    });

    await prisma.auditLog.create({
      data: {
        storeId: getStoreId(req),
        userId: req.user!.id,
        action: "update",
        module: "loyalty",
        newData: payload
      }
    });

    res.json({ data: serializeLoyaltyRule(rule) });
  })
);

settingsRoutes.put(
  "/store",
  asyncHandler(async (req, res) => {
    const storeId = getStoreId(req);
    const payload = storeSchema.parse(req.body);
    const existing = await prisma.store.findUnique({ where: { id: storeId } });
    const store = existing
      ? await prisma.store.update({
          where: { id: existing.id },
          data: {
            ...payload,
            address: payload.address || null,
            phone: payload.phone || null,
            email: payload.email || null,
            logo: payload.logo || null,
            receiptFooter: payload.receiptFooter || null
          }
        })
      : await prisma.store.create({
          data: {
            id: storeId,
            ...payload,
            address: payload.address || null,
            phone: payload.phone || null,
            email: payload.email || null,
            logo: payload.logo || null,
            receiptFooter: payload.receiptFooter || null
          }
        });

    await prisma.auditLog.create({
      data: {
        storeId,
        userId: req.user!.id,
        action: "update",
        module: "settings",
        newData: { storeId: store.id, name: store.name }
      }
    });

    res.json({ data: serializeStore(store) });
  })
);
