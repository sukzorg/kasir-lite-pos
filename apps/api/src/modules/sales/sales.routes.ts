import { Router } from "express";
import {
  cancelSaleController,
  createSaleController,
  getSaleController,
  getSaleReceiptController,
  listSalesController
} from "./sales.controller";

export const salesRoutes = Router();

salesRoutes.post("/", createSaleController);
salesRoutes.get("/", listSalesController);
salesRoutes.post("/:id/cancel", cancelSaleController);
salesRoutes.get("/:id", getSaleController);
salesRoutes.get("/:id/receipt", getSaleReceiptController);
