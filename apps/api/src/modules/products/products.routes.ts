import { Router } from "express";
import {
  createProductController,
  deactivateProductController,
  getProductByBarcodeController,
  getProductController,
  listProductsController,
  updateProductController
} from "./products.controller";

export const productRoutes = Router();

productRoutes.get("/", listProductsController);
productRoutes.get("/barcode/:barcode", getProductByBarcodeController);
productRoutes.get("/:id", getProductController);
productRoutes.post("/", createProductController);
productRoutes.put("/:id", updateProductController);
productRoutes.delete("/:id", deactivateProductController);
