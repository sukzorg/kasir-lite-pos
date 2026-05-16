import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ override: true });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("1d"),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  REQUEST_BODY_LIMIT: z.string().default("5mb"),
  TRUST_PROXY: z.coerce.boolean().default(false),
  NODE_ENV: z.string().default("development")
});

export const env = envSchema.parse(process.env);
