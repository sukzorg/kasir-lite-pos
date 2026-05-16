import { z } from "zod";

export const productSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  sku: z.string().min(2).max(80),
  barcode: z.string().max(120).optional().nullable(),
  name: z.string().min(2).max(180),
  description: z.string().optional().nullable(),
  unit: z.string().min(1).max(30).default("pcs"),
  purchasePrice: z.coerce.number().nonnegative(),
  sellingPrice: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().min(0).default(0),
  minimumStock: z.coerce.number().int().min(0).default(0),
  image: z.string().min(1).optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active")
});

export const productListQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.coerce.number().int().optional(),
  status: z.enum(["active", "inactive"]).optional()
});

export const productIdParamSchema = z.coerce.number().int().positive();

export type ProductPayload = z.infer<typeof productSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
