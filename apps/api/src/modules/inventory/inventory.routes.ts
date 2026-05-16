import { Router } from "express";
import {
  adjustmentController,
  listLowStockController,
  listMovementsController,
  listStocksController,
  stockInController,
  stockOutController
} from "./inventory.controller";

export const inventoryRoutes = Router();

inventoryRoutes.get("/stocks", listStocksController);
inventoryRoutes.get("/low-stock", listLowStockController);
inventoryRoutes.get("/movements", listMovementsController);
inventoryRoutes.post("/stock-in", stockInController);
inventoryRoutes.post("/stock-out", stockOutController);
inventoryRoutes.post("/adjustment", adjustmentController);
