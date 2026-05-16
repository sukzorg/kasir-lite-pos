import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, `Endpoint ${req.method} ${req.path} tidak ditemukan.`));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(422).json({
      message: "Data yang dikirim belum valid.",
      errors: error.flatten()
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Data unik sudah digunakan.",
        details: error.meta
      });
    }
  }

  console.error(error);
  return res.status(500).json({
    message: "Terjadi kesalahan pada server."
  });
}
