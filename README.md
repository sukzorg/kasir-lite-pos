# Kasir Lite POS

Kasir Lite POS adalah aplikasi POS berbasis website untuk UMKM. Project ini memakai:

- Backend: Node.js, Express, Prisma
- Frontend: React, Vite, Tailwind CSS
- Database: MySQL
- Copyright: tumbuhapp.com

## Fitur MVP

- Login JWT dengan role dasar.
- Dashboard ringkasan penjualan, transaksi terbaru, kategori, dan stok menipis.
- Manajemen produk, kategori, stok, dan pelanggan, termasuk upload gambar produk dan point member.
- Manajemen supplier untuk data pemasok barang, termasuk gudang opsional.
- POS kasir dengan pencarian produk, input barcode, keranjang, pajak, diskon persen per item, tukar point member, pembayaran, pembatalan transaksi, dan struk cetak browser.
- Riwayat transaksi dengan filter tanggal, status, metode pembayaran, detail item, cetak ulang struk, pembatalan transaksi, dan SweetAlert2 feedback.
- Fondasi multi-outlet awal melalui header `X-Store-Id` dan `storeId` pada transaksi, pergerakan stok, dan audit log.
- Laporan penjualan dengan grafik dan export PDF frontend.
- Master Data khusus Owner untuk kategori, master produk, dan aturan perhitungan point.
- Pengaturan profil toko, footer struk, user, dan edit role.
- Favicon Kasir Lite POS berbasis logo kasir hijau.
- Mode paket `free`/`full` untuk membatasi modul demo.
- Seed data demo untuk toko, user, kategori, produk, pelanggan, dan supplier.

## Struktur Project

```text
kasir_lite_POS/
  apps/
    api/      Backend Express + Prisma
    web/      Frontend React + Vite
  docs/       Dokumentasi teknis dan perubahan
  scripts/    Tempat script utilitas project
  deployment/ Panduan dan contoh konfigurasi deploy Vercel, Render, Aiven, Cloudflare
```

Detail struktur ada di [docs/FILE_STRUCTURE.md](docs/FILE_STRUCTURE.md).

## Menjalankan Lokal

1. Salin konfigurasi env.

```bash
cp .env.example .env
```

2. Jalankan MySQL dengan Docker.

```bash
docker compose up -d mysql
```

Jika memakai MySQL lokal/WAMP tanpa Docker, pastikan service MySQL aktif di `localhost:3306`, lalu buat database dan user:

```sql
CREATE DATABASE IF NOT EXISTS kasir_lite_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'kasir_lite'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'kasir_lite_secret';
ALTER USER 'kasir_lite'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'kasir_lite_secret';
GRANT ALL PRIVILEGES ON kasir_lite_pos.* TO 'kasir_lite'@'localhost';
FLUSH PRIVILEGES;
```

3. Install dependency.

```bash
npm install
```

4. Generate Prisma client dan push schema.

```bash
npm run prisma:generate -w apps/api
npm run db:push -w apps/api
npm run db:seed -w apps/api
```

5. Jalankan backend dan frontend.

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend health check: `http://localhost:4000/api/health`

Frontend mengirim header `X-Store-Id: 1` secara default. Nilai ini bisa diubah melalui `localStorage` key `kasir-lite-store-id` untuk pengujian multi-outlet awal.

Untuk melihat UI tanpa MySQL/API saat development, aktifkan `VITE_DEMO_MODE_ENABLED=true` lalu gunakan tombol `Masuk Mode Demo` di halaman login.

## Akun Seed

Kredensial seed diatur melalui `.env`:

```env
SEED_ADMIN_EMAIL="owner@kasirlite.local"
SEED_ADMIN_USERNAME="owner"
SEED_ADMIN_PASSWORD="ganti-password-lokal-minimal-12"
```

Untuk production atau demo public, gunakan email dan password baru yang kuat sebelum menjalankan seed.

## Deployment Demo

Panduan deployment Vercel, Render, Aiven, dan Cloudflare ada di [deployment/README_DEPLOY.md](deployment/README_DEPLOY.md). Project tetap monorepo; Vercel cukup diarahkan ke `apps/web` dan Render ke `apps/api`, sehingga source inti tidak perlu dipisah manual.

Paket demo bisa diatur dari environment frontend:

```env
VITE_APP_PLAN="free"
VITE_DEMO_MODE_ENABLED="false"
```

## Verifikasi

```bash
npm run build
npm run lint
```

## Dokumentasi

- [docs/API.md](docs/API.md)
- [docs/DATABASE.md](docs/DATABASE.md)
- [docs/FILE_STRUCTURE.md](docs/FILE_STRUCTURE.md)
- [docs/CHANGELOG.md](docs/CHANGELOG.md)
