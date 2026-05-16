import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";

type TokenPayload = {
  sub: string;
  role: string;
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new HttpError(401, "Token autentikasi wajib dikirim."));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = {
      id: Number(payload.sub),
      role: payload.role
    };
    next();
  } catch {
    next(new HttpError(401, "Token autentikasi tidak valid atau sudah kedaluwarsa."));
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, "User belum login."));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "User tidak memiliki akses ke fitur ini."));
    }
    next();
  };
}
