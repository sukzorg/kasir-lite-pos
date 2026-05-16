# Dokumentasi API

Base URL lokal: `http://localhost:4000/api`

Semua endpoint selain auth membutuhkan header:

```http
Authorization: Bearer <token>
```

Untuk fondasi multi-outlet, endpoint private juga membaca header opsional:

```http
X-Store-Id: 1
```

Jika header tidak dikirim, API memakai outlet default `1`.

## Health

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/health` | Cek status API |

## Auth

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/auth/login` | Login email atau username |
| GET | `/auth/me` | Profil user login |
| POST | `/auth/logout` | Catat logout ke audit log |

Payload login:

```json
{
  "identifier": "owner@kasirlite.local",
  "password": "<password-dari-SEED_ADMIN_PASSWORD>"
}
```

Jangan gunakan kredensial seed default untuk demo public. Set `SEED_ADMIN_EMAIL`,
`SEED_ADMIN_USERNAME`, dan `SEED_ADMIN_PASSWORD` sebelum menjalankan seed production.

## Dashboard

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/dashboard/summary` | Ringkasan penjualan, chart, stok menipis, transaksi terbaru |

Data penjualan dashboard difilter berdasarkan `X-Store-Id`.
Query `trendRange` mendukung `7d`, `1m`, `3m`, dan `5y` untuk grafik tren penjualan.

## Kategori

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/categories` | List kategori |
| POST | `/categories` | Tambah kategori |
| PUT | `/categories/:id` | Update kategori |
| DELETE | `/categories/:id` | Hapus atau nonaktifkan kategori |

## Produk

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/products` | List produk dengan query `search`, `categoryId`, `status` |
| GET | `/products/:id` | Detail produk |
| GET | `/products/barcode/:barcode` | Cari produk berdasarkan barcode |
| POST | `/products` | Tambah produk |
| PUT | `/products/:id` | Update produk |
| DELETE | `/products/:id` | Nonaktifkan produk |

Field `image` menerima URL atau data URL hasil upload gambar JPG/JPEG/PNG dari frontend.

## Pelanggan

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/customers` | List pelanggan |
| GET | `/customers/:id` | Detail pelanggan dan riwayat transaksi |
| POST | `/customers` | Tambah pelanggan |
| PUT | `/customers/:id` | Update pelanggan |
| DELETE | `/customers/:id` | Hapus pelanggan atau ubah status menjadi nonaktif jika sudah punya transaksi |

Pelanggan memiliki field `status` (`regular`, `member`, `inactive`) dan `points`. Tukar point POS hanya berlaku untuk pelanggan `member`.

## Supplier

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/suppliers` | List supplier dengan query `search` |
| GET | `/suppliers/:id` | Detail supplier |
| POST | `/suppliers` | Tambah supplier |
| PUT | `/suppliers/:id` | Update supplier |
| DELETE | `/suppliers/:id` | Hapus supplier |

Payload supplier mendukung field opsional `warehouse` untuk nama gudang.

## Inventory

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/inventory/stocks` | Daftar stok produk |
| GET | `/inventory/low-stock` | Produk stok menipis |
| GET | `/inventory/movements` | Riwayat pergerakan stok |
| POST | `/inventory/stock-in` | Stok masuk |
| POST | `/inventory/stock-out` | Stok keluar manual |
| POST | `/inventory/adjustment` | Koreksi stok dengan alasan |

Riwayat pergerakan stok menyimpan `storeId`.

## Penjualan

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/sales` | Buat transaksi POS |
| GET | `/sales` | Riwayat transaksi |
| GET | `/sales/:id` | Detail transaksi |
| POST | `/sales/:id/cancel` | Batalkan transaksi dan kembalikan stok |
| GET | `/sales/:id/receipt` | Data struk |

Payload transaksi:

```json
{
  "customerId": 1,
  "discountAmount": 0,
  "taxRate": 11,
  "redeemedPoints": 1000,
  "paidAmount": 50000,
  "paymentMethod": "cash",
  "items": [
    {
      "productId": 1,
      "qty": 2,
      "discountAmount": 0
    }
  ]
}
```

Business rule utama:

- Keranjang tidak boleh kosong.
- Pembayaran tidak boleh kurang dari total.
- Produk nonaktif tidak bisa dijual.
- Diskon item dikirim sebagai `items[].discountAmount`; POS frontend menghitungnya dari persentase per item.
- `redeemedPoints` mengurangi total sesuai nilai point pada `/settings/loyalty`.
- Member mendapat `earnedPoints` otomatis jika nilai transaksi memenuhi aturan loyalty.
- Stok berkurang dalam database transaction yang sama dengan transaksi.
- Pembatalan transaksi mengubah status menjadi `cancelled` dan mencatat stok kembali sebagai `RETURN`.
- Pembatalan transaksi juga mengembalikan point yang ditukar dan menarik point yang sempat didapat.
- Harga produk disimpan sebagai snapshot di `sale_items`.

Frontend memakai endpoint penjualan untuk halaman `Transaksi`, termasuk filter tanggal, filter status,
filter metode pembayaran, detail item, cetak ulang struk, dan flow pembatalan.

Nomor transaksi dihitung per outlet (`storeId`) dan per tanggal.

## Laporan

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/reports/sales` | Laporan penjualan dengan filter tanggal dan metode pembayaran |
| GET | `/reports/inventory` | Laporan stok, stok menipis, stok habis |

## Pengaturan

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/settings/store` | Ambil profil toko |
| PUT | `/settings/store` | Update profil toko, pajak, dan footer struk |
| GET | `/settings/loyalty` | Ambil aturan point member |
| PUT | `/settings/loyalty` | Update minimal belanja, point didapat, dan nilai point |

## User

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/users` | List user |
| GET | `/users/roles` | List role dan permission |
| POST | `/users` | Tambah user, role Owner/Admin |
| PUT | `/users/:id` | Update user, role, dan status |
| PUT | `/users/roles/:id` | Update nama dan deskripsi role, khusus Owner |
