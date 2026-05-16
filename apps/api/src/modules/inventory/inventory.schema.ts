import { z } from "zod";

export const movementSchema = z.object({
  productId: z.coerce.number().int().positive(),
  qty: z.coerce.number().int().positive(),
  notes: z.string().min(2).optional()
});

export const adjustmentSchema = z.object({
  productId: z.coerce.number().int().positive(),
  newStock: z.coerce.number().int().min(0),
  notes: z.string().min(2, "Alasan koreksi stok wajib diisi.")
});

export const movementQuerySchema = z.object({
  productId: z.coerce.number().int().optional(),
  type: z.enum(["IN", "OUT", "ADJUSTMENT", "RETURN", "DAMAGE"]).optional()
});

export type MovementPayload = z.infer<typeof movementSchema>;
export type AdjustmentPayload = z.infer<typeof adjustmentSchema>;
export type MovementQuery = z.infer<typeof movementQuerySchema>;
