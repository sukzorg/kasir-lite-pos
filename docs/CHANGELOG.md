# Changelog

## 2026-05-16

### Ditambahkan

- Konfigurasi deployment demo untuk Vercel (`apps/web/vercel.json`), Render (`render.yaml`), Aiven, dan Cloudflare di folder `deployment`.
- Security headers frontend dan backend: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, dan Helmet.
- Rate limit global API dan rate limit khusus login.
- Proteksi method `TRACE` untuk mitigasi XST.
- Environment `REQUEST_BODY_LIMIT`, `TRUST_PROXY`, `VITE_DEMO_MODE_ENABLED`, dan `VITE_APP_PLAN`.
- Mode paket `free`/`full`; paket gratis membuka dashboard, penjualan, transaksi, produk, stok, dan pengaturan, sedangkan modul berbayar diarahkan ke halaman upgrade.
- Halaman `UpgradePage` untuk menjelaskan modul Full Version yang terkunci.

### Diperbaiki

- Halaman login tidak lagi menampilkan akun seed dan tidak lagi mengisi email/password otomatis.
- Seed admin sekarang bisa dikonfigurasi melalui `SEED_ADMIN_EMAIL`, `SEED_ADMIN_USERNAME`, dan `SEED_ADMIN_PASSWORD`.
- API client membersihkan storage auth yang rusak dan tidak mengirim token demo ke API sungguhan.

### Verifikasi

- Pengecekan source untuk pola raw SQL (`queryRaw`, `executeRaw`), injeksi DOM (`dangerouslySetInnerHTML`, `innerHTML`, `document.write`), dan `eval`.
- Build dan lint dijalankan setelah perubahan.

## 2026-05-15

### Ditambahkan

- SweetAlert2 untuk feedback sukses transaksi, cetak ulang, pembatalan, CRUD data, export, dan pengaturan.
- Export PDF laporan penjualan berdasarkan filter dan data yang sedang tampil.
- Favicon SVG Kasir Lite POS di `apps/web/public/favicon.svg`.
- Master Data khusus Owner untuk CRUD kategori, CRUD master produk, dan pengaturan aturan point member.
- Tabel `loyalty_rules` dan endpoint `/settings/loyalty` untuk konfigurasi minimal belanja, point didapat, dan nilai point.
- Field `status` dan `points` pelanggan untuk dukungan member dan tukar point di POS.
- Field `warehouse` supplier untuk informasi gudang opsional.
- Field `redeemedPoints`, `earnedPoints`, dan `pointDiscountAmount` pada transaksi penjualan.
- Upload gambar produk JPG/JPEG/PNG maksimal 2 MB dengan penyimpanan data URL.
- Edit user dan edit role di halaman pengaturan.
- Refactor backend modul besar `products`, `sales`, dan `inventory` menjadi pola `routes`, `controller`, `schema`, dan `service`.
- Utilitas `getStoreId` dan header `X-Store-Id` untuk fondasi multi-outlet awal.
- Field `storeId` dan index outlet pada `sales`, `stock_movements`, dan `audit_logs`.
- Filter outlet pada dashboard, laporan penjualan, riwayat sales, receipt, dan pergerakan stok.
- Komponen lokal frontend untuk login dan transaksi.
- Redesign login mengikuti referensi layout visual POS, tetap memakai logo dan warna Kasir Lite POS.
- Seed supplier ke database lokal.
- Integrasi MySQL lokal WAMP: database `kasir_lite_pos`, user `kasir_lite`, `prisma db push`, dan seed berhasil.

### Verifikasi

- `npm run prisma:generate -w apps/api`
- `npm run db:push -w apps/api`
- `npm run db:seed -w apps/api`
- `npm run build`
- `npm run lint`
- API lokal berhasil login dengan akun seed dan dashboard mengembalikan data produk/pelanggan.

### Diperbaiki

- Favicon disamakan dengan icon aplikasi biru Kasir Lite POS.
- Footer copyright `tumbuhapp.com` ditambahkan pada layout aplikasi dan halaman login.
- Footer copyright dirapikan dari layout utama agar tetap berada di bawah halaman pada POS, pelanggan, supplier, dan halaman pendek lain.
- Header halaman Transaksi disejajarkan dengan pola halaman Inventory.
- Dashboard mendapat filter tren penjualan `7 Hari`, `1 Bulan`, `3 Bulan`, dan `5 Tahun`.
- Tombol notifikasi top navbar diaktifkan dengan dropdown stok menipis dan transaksi terbaru.
- Export CSV produk dibuat lebih lengkap dengan metadata, ringkasan, margin, status stok, dan kolom bisnis lengkap.
- Export PDF laporan penjualan dibuat lebih profesional dengan header brand, filter aktif, kartu KPI, tabel metode pembayaran, produk terlaris, daftar transaksi, zebra row, dan footer halaman.
- Keranjang POS dirapikan menjadi kartu item yang lebih lebar, menampilkan SKU, stok, harga, qty, subtotal, dan diskon item tanpa terpotong.
- Modal struk POS dan transaksi tidak lagi blank karena aturan `.print-receipt` kini hanya aktif saat print.
- Modal detail transaksi dirapikan agar tabel item bisa scroll dan panel struk tidak terpotong.
- Diskon POS dipindah dari nominal transaksi menjadi persentase per item.
- Input uang diterima dan tukar point memakai input teks ber-prefix tanpa spinner browser.
- Aksi hapus produk, pelanggan, supplier, export produk, export laporan, dan koreksi stok kini aktif.

## 2026-05-13

Inisialisasi aplikasi Kasir Lite POS dari PRD.

### Ditambahkan

- Monorepo npm workspaces.
- Backend Express TypeScript di `apps/api`.
- Frontend React Vite TypeScript di `apps/web`.
- Prisma schema MySQL untuk role, user, toko, kategori, produk, pelanggan, supplier, penjualan, sale item, stock movement, dan audit log.
- Seed data demo untuk admin, toko, kategori, produk, pelanggan, dan permission.
- Endpoint auth, dashboard, kategori, produk, pelanggan, inventory, sales, laporan, pengaturan, dan user.
- Endpoint supplier untuk CRUD pemasok barang.
- Endpoint pembatalan transaksi yang mengembalikan stok dan mencatat audit log.
- UI dashboard, POS, transaksi, produk, stok, pelanggan, supplier, laporan, pengaturan, dan login.
- UI riwayat transaksi dengan filter, pencarian, detail transaksi, cetak ulang struk, dan flow pembatalan transaksi.
- Redesign halaman login agar tampil lebih profesional dan konsisten dengan tema dashboard.
- POS interaktif dengan keranjang, barcode input, pembayaran, pajak, diskon, dan modal struk print.
- Mode demo frontend ketika backend atau MySQL belum aktif.
- Dokumentasi README, API, database, struktur file, dan changelog.
- Docker Compose MySQL untuk development lokal.
- Verifikasi `npm run build` dan `npm run lint` sudah lolos.
- Verifikasi browser lokal di `http://localhost:5173` untuk login demo, dashboard, dan halaman POS.

### Catatan

- Export laporan saat ini tersedia sebagai CSV dari frontend.
- Printer struk memakai browser print untuk MVP.
- Direct thermal printing, retur lengkap, shift kasir, dan multi-outlet disiapkan untuk fase berikutnya.
- `npm run format:check` masih menemukan warning format pada banyak file sehingga belum dijadikan gate akhir.
