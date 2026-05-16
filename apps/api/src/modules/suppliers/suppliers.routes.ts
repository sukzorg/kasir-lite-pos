import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/async-handler";
import { HttpError } from "../../utils/http-error";

export const supplierRoutes = Router();

const supplierSchema = z.object({
  name: z.string().min(2).max(160),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().nullable(),
  warehouse: z.string().max(160).optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

function cleanSupplierPayload(payload: z.infer<typeof supplierSchema>) {
  return {
    ...payload,
    phone: payload.phone || null,
    email: payload.email || null,
    warehouse: payload.warehouse || null,
    address: payload.address || null,
    notes: payload.notes || null
  };
}

supplierRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = z.object({ search: z.string().optional() }).parse(req.query);
    const suppliers = await prisma.supplier.findMany({
      where: query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { phone: { contains: query.search } },
              { email: { contains: query.search } }
            ]
          }
        : undefined,
      orderBy: { createdAt: "desc" }
    });

    res.json({ data: suppliers });
  })
);

supplierRoutes.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new HttpError(404, "Supplier tidak ditemukan.");
    res.json({ data: supplier });
  })
);

supplierRoutes.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = cleanSupplierPayload(supplierSchema.parse(req.body));
    const supplier = await prisma.supplier.create({ data: payload });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "create",
        module: "suppliers",
        newData: { id: supplier.id, name: supplier.name }
      }
    });

    res.status(201).json({ data: supplier });
  })
);

supplierRoutes.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const before = await prisma.supplier.findUnique({ where: { id } });
    if (!before) throw new HttpError(404, "Supplier tidak ditemukan.");

    const payload = supplierSchema.partial().parse(req.body);
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...payload,
        phone: payload.phone === undefined ? undefined : payload.phone || null,
        email: payload.email === undefined ? undefined : payload.email || null,
        warehouse: payload.warehouse === undefined ? undefined : payload.warehouse || null,
        address: payload.address === undefined ? undefined : payload.address || null,
        notes: payload.notes === undefined ? undefined : payload.notes || null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "update",
        module: "suppliers",
        oldData: { id: before.id, name: before.name },
        newData: { id: supplier.id, name: supplier.name }
      }
    });

    res.json({ data: supplier });
  })
);

supplierRoutes.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new HttpError(404, "Supplier tidak ditemukan.");

    await prisma.supplier.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "delete",
        module: "suppliers",
        oldData: { id: supplier.id, name: supplier.name }
      }
    });

    res.json({ message: "Supplier berhasil dihapus." });
  })
);
