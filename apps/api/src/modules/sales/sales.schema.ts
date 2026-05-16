import { z } from "zod";

export const createSaleSchema = z.object({
  customerId: z.coerce.number().int().positive().optional().nullable(),
  discountAmount: z.coerce.number().nonnegative().default(0),
  taxRate: z.coerce.number().nonnegative().max(100).optional(),
  redeemedPoints: z.coerce.number().int().nonnegative().default(0),
  paidAmount: z.coerce.number().nonnegative(),
  paymentMethod: z.enum(["cash", "transfer", "qris", "ewallet", "card"]).default("cash"),
  notes: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        qty: z.coerce.number().int().positive(),
        discountAmount: z.coerce.number().nonnegative().default(0)
      })
    )
    .min(1, "Keranjang tidak boleh kosong.")
});

export const listSalesQuerySchema = z.object({
  status: z.enum(["completed", "cancelled", "refunded"]).optional(),
  paymentMethod: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

export const cancelSaleSchema = z.object({
  reason: z.string().min(3, "Alasan pembatalan wajib diisi.")
});

export const saleIdParamSchema = z.coerce.number().int().positive();

export type CreateSalePayload = z.infer<typeof createSaleSchema>;
export type ListSalesQuery = z.infer<typeof listSalesQuerySchema>;
export type CancelSalePayload = z.infer<typeof cancelSaleSchema>;
