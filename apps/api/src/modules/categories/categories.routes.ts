import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/async-handler";
import { HttpError } from "../../utils/http-error";

export const categoryRoutes = Router();

const categorySchema = z.object({
  name: z.string().min(2).max(120),
  color: z.string().min(4).max(20).default("#005bbf"),
  status: z.enum(["active", "inactive"]).default("active"),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

categoryRoutes.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    res.json({ data: categories });
  })
);

categoryRoutes.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data: payload });
    res.status(201).json({ data: category });
  })
);

categoryRoutes.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().parse(req.params.id);
    const payload = categorySchema.partial().parse(req.body);
    const category = await prisma.category.update({
      where: { id },
      data: payload
    });

    res.json({ data: category });
  })
);

categoryRoutes.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().parse(req.params.id);
    const products = await prisma.product.count({ where: { categoryId: id } });
    if (products > 0) {
      const category = await prisma.category.update({
        where: { id },
        data: { status: "inactive" }
      });
      return res.json({
        message: "Kategori sudah dipakai produk, sehingga dinonaktifkan.",
        data: category
      });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new HttpError(404, "Kategori tidak ditemukan.");
    await prisma.category.delete({ where: { id } });
    res.json({ message: "Kategori berhasil dihapus." });
  })
);
