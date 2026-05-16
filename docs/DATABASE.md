# Dokumentasi Database

Database utama menggunakan MySQL melalui Prisma ORM. Schema ada di:

```text
apps/api/prisma/schema.prisma
```

## Entity Utama

| Model | Fungsi |
|---|---|
| `Role` | Master role user |
| `Permission` | Master permission |
| `RolePermission` | Relasi role dan permission |
| `User` | Akun login, kasir, owner, admin |
| `Store` | Profil toko dan pengaturan struk |
| `Category` | Kategori produk |
| `Product` | Produk, harga, barcode, stok |
| `Customer` | Data pelanggan, status member, dan saldo point |
| `Supplier` | Master supplier pemasok barang dan gudang opsional |
| `Sale` | Header transaksi penjualan, termasuk redeem dan earning point |
| `SaleItem` | Detail item transaksi, termasuk snapshot harga |
| `StockMovement` | Riwayat stok masuk, keluar, koreksi, retur, rusak |
| `LoyaltyRule` | Aturan minimal belanja, point didapat, dan nilai point |
| `AuditLog` | Log aktivitas sensitif |

## Multi-Outlet Awal

Field `storeId` sudah ditambahkan pada tabel transaksional berikut:

- `sales.store_id`
- `stock_movements.store_id`
- `audit_logs.store_id`

API membaca outlet dari header `X-Store-Id`. Jika header tidak ada, sistem memakai outlet default `1`.

## Index dan Unik

- `users.email`, `users.username`
- `categories.name`
- `products.sku`, `products.barcode`
- `products.name`
- `sales.transaction_number`
- `sales.store_id`, `sales.store_id + sales.created_at`
- `sales.created_at`
- `customers.name`, `customers.status`
- `stock_movements.store_id`, `stock_movements.store_id + stock_movements.created_at`
- `stock_movements.product_id`, `stock_movements.created_at`
- `audit_logs.store_id`
- `audit_logs.module`, `audit_logs.created_at`

## Aturan Konsistensi

- Transaksi POS memakai Prisma transaction.
- Stok produk dikurangi setelah `Sale` dan `SaleItem` dibuat.
- Pergerakan stok dicatat di `StockMovement`.
- Harga jual pada transaksi disimpan di `SaleItem.price`, sehingga laporan historis tidak berubah saat harga produk diedit.
- Produk dihapus secara soft-delete melalui `status = inactive`.
- Pembatalan transaksi mengembalikan stok melalui `StockMovement` bertipe `RETURN`.
- Pelanggan member dapat menukar `points` di POS sesuai `loyalty_rules.point_value`.
- Transaksi menyimpan `redeemed_points`, `earned_points`, dan `point_discount_amount`.
- Pembatalan transaksi mengembalikan point yang ditukar dan mengurangi point yang sempat diberikan.
- Gambar produk dapat disimpan sebagai data URL pada kolom `products.image` bertipe `LongText`.
- Laporan dan dashboard penjualan difilter berdasarkan `storeId`.

## Seed Data

Seed ada di:

```text
apps/api/prisma/seed.ts
```

Isi seed:

- Role Owner dan Kasir.
- Permission dasar.
- User admin.
- Toko Sejahtera.
- Kategori awal.
- Produk demo dengan barcode.
- Pelanggan demo.
- Supplier demo.
- Loyalty rule default: minimal belanja Rp100.000 mendapat 1000 point, 1 point bernilai Rp1.
- Audit log seed.

Jalankan:

```bash
npm run db:seed -w apps/api
```

## Rencana Database Berikutnya

- Tambah tabel retur lengkap: `returns` dan `return_items`.
- Tambah pemisahan stok per outlet jika produk sudah mulai dikelola multi-cabang.
- Tambah tabel shift kasir dan cash management.
- Tambah migration versioning setelah schema MVP stabil.
