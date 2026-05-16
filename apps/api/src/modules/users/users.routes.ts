import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { requireRole } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/async-handler";
import { HttpError } from "../../utils/http-error";

export const userRoutes = Router();

const userSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  username: z.string().min(3).max(80),
  password: z.string().min(8).optional(),
  phone: z.string().max(40).optional().nullable(),
  roleId: z.coerce.number().int().positive(),
  status: z.enum(["active", "inactive"]).default("active")
});

const roleSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().optional().nullable()
});

userRoutes.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({
      data: users.map(({ passwordHash, ...user }) => ({ ...user, passwordHash: undefined }))
    });
  })
);

userRoutes.get(
  "/roles",
  asyncHandler(async (_req, res) => {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: { permission: true }
        }
      },
      orderBy: { name: "asc" }
    });
    res.json({ data: roles });
  })
);

userRoutes.put(
  "/roles/:id",
  requireRole(["Owner"]),
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const payload = roleSchema.parse(req.body);
    const role = await prisma.role.update({
      where: { id },
      data: {
        name: payload.name,
        description: payload.description || null
      },
      include: {
        rolePermissions: {
          include: { permission: true }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "update",
        module: "roles",
        newData: { id: role.id, name: role.name }
      }
    });

    res.json({ data: role });
  })
);

userRoutes.post(
  "/",
  requireRole(["Owner", "Admin"]),
  asyncHandler(async (req, res) => {
    const payload = userSchema.required({ password: true }).parse(req.body);
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        username: payload.username,
        passwordHash,
        phone: payload.phone || null,
        roleId: payload.roleId,
        status: payload.status
      },
      include: { role: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "create",
        module: "users",
        newData: { id: user.id, email: user.email, role: user.role.name }
      }
    });

    const { passwordHash: _passwordHash, ...safeUser } = user;
    res.status(201).json({ data: safeUser });
  })
);

userRoutes.put(
  "/:id",
  requireRole(["Owner", "Admin"]),
  asyncHandler(async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const payload = userSchema.partial().parse(req.body);
    const before = await prisma.user.findUnique({ where: { id } });
    if (!before) throw new HttpError(404, "User tidak ditemukan.");

    const passwordHash = payload.password ? await bcrypt.hash(payload.password, 10) : undefined;
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: payload.name,
        email: payload.email,
        username: payload.username,
        passwordHash,
        phone: payload.phone === undefined ? undefined : payload.phone || null,
        roleId: payload.roleId,
        status: payload.status
      },
      include: { role: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: "update",
        module: "users",
        oldData: { id: before.id, email: before.email, roleId: before.roleId },
        newData: { id: user.id, email: user.email, role: user.role.name }
      }
    });

    const { passwordHash: _passwordHash, ...safeUser } = user;
    res.json({ data: safeUser });
  })
);
