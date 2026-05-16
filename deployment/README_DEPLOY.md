# Deployment Guide

Target demo:

- React frontend: Vercel
- Node.js API: Render
- MySQL database: Aiven
- DNS: Cloudflare

## Struktur Deploy

Tidak perlu memecah source menjadi dua repository. Platform modern mendukung monorepo:

- Vercel project root: `apps/web`
- Render service root: `apps/api`
- Render Blueprint: `render.yaml` di root repo

Pendekatan ini mengikuti pola monorepo resmi: Vercel memakai Root Directory untuk memilih app frontend, dan Render memakai `rootDir` untuk service backend.

## Vercel Frontend

Setting project:

- Root Directory: `apps/web`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variables:

```text
VITE_API_URL=https://YOUR_RENDER_OR_API_DOMAIN/api
VITE_DEMO_MODE_ENABLED=false
VITE_APP_PLAN=free
```

`apps/web/vercel.json` sudah menambahkan SPA rewrite dan security headers.

## Render API

Opsi paling rapi: gunakan `render.yaml` dari root repo.

Setting manual jika tidak memakai Blueprint:

- Root Directory: `apps/api`
- Runtime: Node
- Build Command: `npm install && npm run prisma:generate && npm run build`
- Start Command: `npm run start`
- Health Check Path: `/api/health`

Environment variables ada di `deployment/render-api/env.example`.

Untuk seed production, isi `SEED_ADMIN_EMAIL`, `SEED_ADMIN_USERNAME`, dan
`SEED_ADMIN_PASSWORD` terlebih dahulu. Jangan gunakan kredensial lokal untuk demo public.

## Aiven MySQL

Gunakan database `kasir_lite_pos` dan connection string SSL:

```text
mysql://USER:PASSWORD@HOST:PORT/kasir_lite_pos?sslaccept=strict
```

Set nilai itu ke `DATABASE_URL` di Render.

## Cloudflare

Gunakan subdomain terpisah:

- `pos.yourdomain.com` untuk Vercel
- `api.yourdomain.com` untuk Render

Set `CORS_ORIGIN` di Render hanya ke domain frontend yang valid.

## Checklist Sebelum Public Demo

- Ganti `JWT_SECRET`.
- Jangan tampilkan akun seed di UI.
- Set kredensial seed production melalui env, lalu ganti password setelah demo siap.
- Matikan `VITE_DEMO_MODE_ENABLED` di production.
- Pilih `VITE_APP_PLAN=free` untuk demo gratis atau `VITE_APP_PLAN=full` untuk demo lengkap.
- Set `CORS_ORIGIN` hanya ke domain Vercel/custom frontend.
- Jalankan `npm run build` dan `npm run lint`.
- Jalankan `npm audit --omit=dev` sebelum publish.

Checklist keamanan detail ada di `deployment/security-checklist.md`.
