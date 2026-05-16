import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { serializeProduct } from "../../utils/serializers";
import { getStoreId } from "../../utils/store-context";
import { adjustmentSchema, movementQuerySchema, movementSchema } from "./inventory.schema";
import {
  createAdjustment,
  createStockIn,
  createStockOut,
  listLowStock,
  listMovements,
  listStocks
} from "./inventory.service";

export const listStocksController = asyncHandler(async (_req: Request, res: Response) => {
  const products = await listStocks();
  res.json({ data: products.map(serializeProduct) });
});

export const listLowStockController = asyncHandler(async (_req: Request, res: Response) => {
  const products = await listLowStock();
  res.json({ data: products.map(serializeProduct) });
});

export const listMovementsController = asyncHandler(async (req: Request, res: Response) => {
  const query = movementQuerySchema.parse(req.query);
  const movements = await listMovements(getStoreId(req), query);
  res.json({ data: movements });
});

export const stockInController = asyncHandler(async (req: Request, res: Response) => {
  const payload = movementSchema.parse(req.body);
  const result = await createStockIn({
    payload,
    storeId: getStoreId(req),
    userId: req.user!.id
  });

  res.status(201).json({
    data: {
      product: serializeProduct(result.product),
      movement: result.movement
    }
  });
});

export const stockOutController = asyncHandler(async (req: Request, res: Response) => {
  const payload = movementSchema.parse(req.body);
  const result = await createStockOut({
    payload,
    storeId: getStoreId(req),
    userId: req.user!.id
  });

  res.status(201).json({
    data: {
      product: serializeProduct(result.product),
      movement: result.movement
    }
  });
});

export const adjustmentController = asyncHandler(async (req: Request, res: Response) => {
  const payload = adjustmentSchema.parse(req.body);
  const result = await createAdjustment({
    payload,
    storeId: getStoreId(req),
    userId: req.user!.id
  });

  res.status(201).json({
    data: {
      product: serializeProduct(result.product),
      movement: result.movement
    }
  });
});
