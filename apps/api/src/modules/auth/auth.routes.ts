import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { requireAuth } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/async-handler";
import { HttpError } from "../../utils/http-error";

export const authRoutes = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi." }
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1)
});

function toAuthUser(user: Awaited<ReturnType<typeof findUserByIdentifier>>) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    status: user.status,
    role: {
      id: user.role.id,
      name: user.role.name,
      permissions: user.role.rolePermissions.map((item) => item.permission.code)
    }
  };
}

function findUserByIdentifier(identifier: string) {
  return prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }]
    },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });
}

authRoutes.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const user = await findUserByIdentifier(payload.identifier);

    if (!user || user.status !== "active") {
      throw new HttpError(401, "Email, username, atau password salah.");
    }

    const passwordMatch = await bcrypt.compare(payload.password, user.passwordHash);
    if (!passwordMatch) {
      throw new HttpError(401, "Email, username, atau password salah.");
    }

    const signOptions: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    };
    const token = jwt.sign({ sub: String(user.id), role: user.role.name }, env.JWT_SECRET, signOptions);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "login",
        module: "auth",
        ipAddress: req.ip
      }
    });

    res.json({
      token,
      user: toAuthUser(user)
    });
  })
);

authRoutes.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user) throw new HttpError(404, "User tidak ditemukan.");
    res.json({ user: toAuthUser(user) });
  })
);

authRoutes.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "logout",
        module: "auth",
        ipAddress: req.ip
      }
    });
    res.json({ message: "Logout berhasil." });
  })
);
