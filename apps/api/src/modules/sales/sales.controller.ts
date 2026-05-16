import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { serializeSale } from "../../utils/serializers";
import { getStoreId } from "../../utils/store-context";
import {
  cancelSaleSchema,
  createSaleSchema,
  listSalesQuerySchema,
  saleIdParamSchema
} from "./sales.schema";
import { cancelSale, createSale, getSale, getSaleReceipt, listSales } from "./sales.service";

export const createSaleController = asyncHandler(async (req: Request, res: Response) => {
  const payload = createSaleSchema.parse(req.body);
  const result = await createSale({
    payload,
    storeId: getStoreId(req),
    userId: req.user!.id,
    ipAddress: req.ip
  });

  res.status(201).json({ data: serializeSale(result) });
});

export const listSalesController = asyncHandler(async (req: Request, res: Response) => {
  const query = listSalesQuerySchema.parse(req.query);
  const sales = await listSales(getStoreId(req), query);
  res.json({ data: sales.map(serializeSale) });
});

export const cancelSaleController = asyncHandler(async (req: Request, res: Response) => {
  const id = saleIdParamSchema.parse(req.params.id);
  const payload = cancelSaleSchema.parse(req.body);
  const result = await cancelSale({
    id,
    payload,
    storeId: getStoreId(req),
    userId: req.user!.id,
    ipAddress: req.ip
  });

  res.json({ data: serializeSale(result!) });
});

export const getSaleController = asyncHandler(async (req: Request, res: Response) => {
  const id = saleIdParamSchema.parse(req.params.id);
  const sale = await getSale(getStoreId(req), id);
  res.json({ data: serializeSale(sale) });
});

export const getSaleReceiptController = asyncHandler(async (req: Request, res: Response) => {
  const id = saleIdParamSchema.parse(req.params.id);
  const receipt = await getSaleReceipt(getStoreId(req), id);
  res.json({
    data: {
      store: receipt.store,
      sale: serializeSale(receipt.sale)
    }
  });
});
