# Aiven MySQL Notes

1. Buat service Aiven for MySQL.
2. Buat database `kasir_lite_pos`.
3. Buat user aplikasi khusus, jangan pakai user admin untuk aplikasi production.
4. Gunakan connection string Aiven sebagai `DATABASE_URL` di Render.
5. Aktifkan SSL. Untuk Prisma MySQL, gunakan format:

```text
mysql://USER:PASSWORD@HOST:PORT/kasir_lite_pos?sslaccept=strict
```

6. Setelah API Render tersambung ke Aiven, jalankan one-off command:

```bash
npm run db:push
npm run db:seed
```

Catatan: seed hanya untuk demo. Set `SEED_ADMIN_EMAIL`, `SEED_ADMIN_USERNAME`, dan
`SEED_ADMIN_PASSWORD` dengan kredensial kuat sebelum menjalankan seed production.
Untuk production berbayar, buat owner/admin pertama dengan password unik dan rotasi ulang setelah setup.
