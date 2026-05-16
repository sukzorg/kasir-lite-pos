import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { authRoutes } from "./modules/auth/auth.routes";
import { categoryRoutes } from "./modules/categories/categories.routes";
import { customerRoutes } from "./modules/customers/customers.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { inventoryRoutes } from "./modules/inventory/inventory.routes";
import { productRoutes } from "./modules/products/products.routes";
import { reportRoutes } from "./modules/reports/reports.routes";
import { salesRoutes } from "./modules/sales/sales.routes";
import { settingsRoutes } from "./modules/settings/settings.routes";
import { supplierRoutes } from "./modules/suppliers/suppliers.routes";
import { userRoutes } from "./modules/users/users.routes";
import { requireAuth } from "./middlewares/auth";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";

export const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const contentSecurityPolicyDirectives = {
  defaultSrc: ["'self'"],
  baseUri: ["'self'"],
  frameAncestors: ["'none'"],
  objectSrc: ["'none'"],
  scriptSrc: ["'self'"],
  connectSrc: ["'self'", ...allowedOrigins],
  imgSrc: ["'self'", "data:", "https:"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  ...(env.NODE_ENV === "production" ? { upgradeInsecureRequests: [] } : {})
};

app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY);
app.use((req, res, next) => {
  if (req.method === "TRACE") {
    return res.status(405).json({ message: "Method tidak diizinkan." });
  }
  next();
});
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: contentSecurityPolicyDirectives
    }
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin tidak diizinkan oleh CORS."));
    },
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Terlalu banyak request. Coba beberapa saat lagi." }
  })
);
app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "Kasir Lite POS",
    copyright: "tumbuhapp.com"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/categories", requireAuth, categoryRoutes);
app.use("/api/products", requireAuth, productRoutes);
app.use("/api/customers", requireAuth, customerRoutes);
app.use("/api/suppliers", requireAuth, supplierRoutes);
app.use("/api/inventory", requireAuth, inventoryRoutes);
app.use("/api/sales", requireAuth, salesRoutes);
app.use("/api/reports", requireAuth, reportRoutes);
app.use("/api/settings", requireAuth, settingsRoutes);
app.use("/api/users", requireAuth, userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
