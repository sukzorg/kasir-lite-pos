import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/async-handler";
import { HttpError } from "../../utils/http-error";
import { serializeSale } from "../../utils/serializers";

export const customerRoutes = Router();

const customerSchema = z.object({
  name: z.string().min(2).max(160),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["regular", "member", "inactive"]).default("regular"),
  points: z.coerce.number().int().min(0).default(0)
});

customerRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = z.object({ search: z.string().optional() }).parse(req.query);
    const customers = await prisma.customer.findMany({
      where: query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { phone: { contains: query.search } },
              { email: { contains: query.search } }
            ]
          }
        : undefined,
      include: {
        sales: {
          where: { status: "completed" },
          select: { grandTotal: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const data = customers.map((customer) => {
      const totalPurchase = customer.sales.reduce((total, sale) => total + Number(sale.grandTotal), 0);
      return {
        ...customer,
        totalPurchase,
        loyaltyPoints: customer.points,
        sales: undefined
      };
    });

    res.json({ data });
  })
);

customerRoutes.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().parse(req.params.id);
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          include: { items: true, cashier: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!customer) throw new HttpError(404, "Pelanggan tidak ditemukan.");
    res.json({ data: { ...customer, sales: customer.sales.map(serializeSale) } });
  })
);

customerRoutes.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = customerSchema.parse(req.body);
    const customer = await prisma.customer.create({
      data: {
        ...payload,
        phone: payload.phone || null,
        email: payload.email || null,
        address: payload.address || null,
        notes: payload.notes || null,
        status: payload.status,
        points: payload.points
      }
    });

    res.status(201).json({ data: customer });
  })
);

customerRoutes.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().parse(req.params.id);
    const payload = customerSchema.partial().parse(req.body);
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...payload,
        phone: payload.phone === undefined ? undefined : payload.phone || null,
        email: payload.email === undefined ? undefined : payload.email || null,
        address: payload.address === undefined ? undefined : payload.address || null,
        notes: payload.notes === undefined ? undefined : payload.notes || null,
        status: payload.status,
        points: payload.points
      }
    });

    res.json({ data: customer });
  })
);

customerRoutes.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new HttpError(404, "Pelanggan tidak ditemukan.");

    const sales = await prisma.sale.count({ where: { customerId: id } });
    if (sales > 0) {
      const inactive = await prisma.customer.update({
        where: { id },
        data: { status: "inactive" }
      });
      return res.json({
        message: "Pelanggan sudah memiliki transaksi, sehingga status diubah menjadi nonaktif.",
        data: inactive
      });
    }

    await prisma.customer.delete({ where: { id } });
    res.json({ message: "Pelanggan berhasil dihapus." });
  })
);
