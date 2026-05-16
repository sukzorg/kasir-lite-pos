# Security Checklist

## Sudah Diterapkan

- Query database memakai Prisma ORM tanpa raw SQL pada source aplikasi.
- Validasi payload backend memakai Zod pada modul utama.
- React tidak memakai `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, atau `eval` pada source aplikasi.
- Backend menolak method `TRACE` untuk mitigasi XST.
- Header keamanan aktif melalui Helmet di API dan `vercel.json` di frontend.
- CORS memakai allowlist dari `CORS_ORIGIN`, bukan wildcard.
- Rate limit global API dan rate limit khusus login.
- Body JSON dibatasi melalui `REQUEST_BODY_LIMIT`.
- Login page tidak menampilkan akun seed dan tidak mengisi email/password otomatis.
- Seed admin production memakai `SEED_ADMIN_EMAIL`, `SEED_ADMIN_USERNAME`, dan `SEED_ADMIN_PASSWORD`.
- Demo mode frontend bisa dimatikan dengan `VITE_DEMO_MODE_ENABLED=false`.

## Wajib Sebelum Demo Public

- Set `JWT_SECRET` minimal 32 karakter acak.
- Set `CORS_ORIGIN` hanya ke domain frontend resmi.
- Set `VITE_DEMO_MODE_ENABLED=false`.
- Set `VITE_APP_PLAN=free` jika demo hanya untuk paket gratis.
- Gunakan `DATABASE_URL` Aiven dengan SSL.
- Jalankan `npm audit --omit=dev`.
- Jalankan `npm run build -w apps/api`, `npm run build -w apps/web`, dan `npm run lint`.

## Catatan Untuk Versi Berbayar

Pembatasan paket di frontend berguna untuk demo dan UX. Untuk monetisasi production,
tambahkan status langganan di database dan middleware backend agar endpoint modul berbayar
juga ditolak dari API saat subscription belum aktif.
