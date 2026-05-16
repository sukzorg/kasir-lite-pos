import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { getStoreId } from "../../utils/store-context";
import { serializeProduct } from "../../utils/serializers";
import {
  productIdParamSchema,
  productListQuerySchema,
  productSchema
} from "./products.schema";
import {
  createProduct,
  deactivateProduct,
  getProductByBarcode,
  getProductById,
  listProducts,
  logProductMutation,
  updateProduct
} from "./products.service";

export const listProductsController = asyncHandler(async (req: Request, res: Response) => {
  const query = productListQuerySchema.parse(req.query);
  const products = await listProducts(query);
  res.json({ data: products.map(serializeProduct) });
});

export const getProductByBarcodeController = asyncHandler(async (req: Request, res: Response) => {
  const product = await getProductByBarcode(String(req.params.barcode));
  res.json({ data: serializeProduct(product) });
});

export const getProductController = asyncHandler(async (req: Request, res: Response) => {
  const id = productIdParamSchema.parse(req.params.id);
  const product = await getProductById(id);
  res.json({ data: serializeProduct(product) });
});

export const createProductController = asyncHandler(async (req: Request, res: Response) => {
  const payload = productSchema.parse(req.body);
  const product = await createProduct(payload);

  await logProductMutation({
    storeId: getStoreId(req),
    userId: req.user!.id,
    action: "create",
    newData: { id: product.id, sku: product.sku, name: product.name }
  });

  res.status(201).json({ data: serializeProduct(product) });
});

export const updateProductController = asyncHandler(async (req: Request, res: Response) => {
  const id = productIdParamSchema.parse(req.params.id);
  const payload = productSchema.partial().parse(req.body);
  const { before, product } = await updateProduct(id, payload);

  await logProductMutation({
    storeId: getStoreId(req),
    userId: req.user!.id,
    action: "update",
    oldData: { id: before.id, sku: before.sku, name: before.name },
    newData: { id: product.id, sku: product.sku, name: product.name }
  });

  res.json({ data: serializeProduct(product) });
});

export const deactivateProductController = asyncHandler(async (req: Request, res: Response) => {
  const id = productIdParamSchema.parse(req.params.id);
  const product = await deactivateProduct(id);

  await logProductMutation({
    storeId: getStoreId(req),
    userId: req.user!.id,
    action: "deactivate",
    oldData: { id: product.id, sku: product.sku, status: "active" },
    newData: { id: product.id, sku: product.sku, status: "inactive" }
  });

  res.json({ message: "Produk berhasil dinonaktifkan.", data: serializeProduct(product) });
});
