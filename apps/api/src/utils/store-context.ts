import type { Request } from "express";

export const DEFAULT_STORE_ID = 1;

export function getStoreId(req: Pick<Request, "headers">) {
  const header = req.headers["x-store-id"];
  const rawValue = Array.isArray(header) ? header[0] : header;
  const storeId = Number(rawValue);
  return Number.isInteger(storeId) && storeId > 0 ? storeId : DEFAULT_STORE_ID;
}
