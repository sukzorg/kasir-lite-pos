# PRD — Kasir Lite POS

**Nama Produk:** Kasir Lite POS  
**Platform:** Website / Web App  
**Backend:** Node.js  
**Frontend:** React  
**Database:** MySQL  
**Target Pengguna:** UMKM, toko retail, minimarket kecil, toko parfum, toko sembako, toko aksesoris, toko pakaian, usaha rumahan, dan bisnis yang membutuhkan pencatatan penjualan harian.  
**Referensi Desain:** Dashboard modern dengan sidebar, kartu ringkasan, grafik penjualan, kategori penjualan, transaksi terbaru, stok menipis, dukungan printer struk, scanner barcode, dan tampilan POS kasir.

---

## 1. Ringkasan Produk

Kasir Lite POS adalah aplikasi kasir berbasis website yang membantu pemilik toko mengelola penjualan, produk, stok, pelanggan, transaksi, laporan, dan aktivitas kasir dalam satu dashboard yang sederhana, cepat, dan mudah digunakan.

Aplikasi ini dirancang untuk UMKM yang membutuhkan sistem pencatatan penjualan modern tanpa proses yang rumit. Pengguna dapat menambahkan produk secara manual atau menggunakan scan barcode, melakukan transaksi kasir, mencetak struk, memantau stok menipis, melihat laporan penjualan, serta mengelola akses karyawan.

Kasir Lite POS bersifat web-based sehingga dapat diakses melalui laptop, komputer kasir, tablet, atau perangkat lain yang terhubung ke browser. Sistem juga dapat dikembangkan menjadi PWA agar terasa seperti aplikasi desktop/mobile ringan.

---

## 2. Latar Belakang Masalah

Banyak UMKM masih mencatat penjualan secara manual menggunakan buku, Excel, atau aplikasi chat. Hal ini sering menimbulkan beberapa masalah:

- Data transaksi tidak rapi dan sulit dicari kembali.
- Pemilik toko sulit mengetahui omzet harian secara real-time.
- Stok barang sering tidak terpantau dengan baik.
- Produk yang sudah hampir habis tidak terdeteksi lebih awal.
- Kesalahan input harga atau total belanja masih sering terjadi.
- Tidak ada laporan penjualan yang bisa langsung dianalisis.
- Pengelolaan kasir/karyawan belum memiliki kontrol akses yang jelas.
- Proses rekap akhir hari masih memakan waktu.

Kasir Lite POS hadir untuk menyederhanakan operasional toko dengan sistem yang mudah dipahami, cepat digunakan, dan cocok untuk kebutuhan bisnis kecil hingga menengah.

---

## 3. Tujuan Produk

### 3.1 Tujuan Utama

Membangun aplikasi kasir berbasis website yang dapat membantu toko mencatat transaksi, mengelola produk dan stok, serta menghasilkan laporan penjualan secara cepat dan akurat.

### 3.2 Tujuan Bisnis

- Membantu UMKM melakukan digitalisasi sistem kasir.
- Mengurangi kesalahan pencatatan manual.
- Mempercepat proses transaksi di kasir.
- Memberikan insight penjualan kepada pemilik usaha.
- Membantu pemilik toko mengambil keputusan berdasarkan data.
- Menjadi produk POS ringan yang dapat dikembangkan menjadi SaaS.

### 3.3 Tujuan Pengguna

- Kasir dapat melayani transaksi dengan cepat.
- Admin dapat mengelola produk, harga, dan stok dengan mudah.
- Pemilik toko dapat melihat laporan penjualan kapan saja.
- Karyawan hanya dapat mengakses fitur sesuai hak aksesnya.

---

## 4. Target Pengguna

| Pengguna | Kebutuhan Utama |
|---|---|
| Pemilik Toko | Melihat omzet, laporan, stok, performa produk, dan aktivitas kasir. |
| Admin Toko | Mengelola data produk, kategori, pelanggan, supplier, stok, dan pengaturan toko. |
| Kasir | Melakukan transaksi penjualan, scan barcode, menerima pembayaran, dan mencetak struk. |
| Staff Gudang | Mengelola stok masuk, stok keluar, koreksi stok, dan stok minimum. |
| Supervisor/Manager | Memantau transaksi, laporan, shift kasir, dan validasi pembatalan transaksi. |

---

## 5. Ruang Lingkup Produk

### 5.1 Termasuk dalam Scope

- Login dan manajemen user.
- Dashboard ringkasan bisnis.
- Modul produk dan kategori.
- Tambah produk manual dan scan barcode.
- Manajemen stok.
- Modul penjualan/POS.
- Diskon dan pajak.
- Pembayaran tunai/non-tunai.
- Cetak struk/invoice.
- Riwayat transaksi.
- Retur atau pembatalan transaksi.
- Manajemen pelanggan.
- Laporan penjualan.
- Laporan produk terlaris.
- Laporan stok menipis.
- Manajemen kasir dan hak akses.
- Pengaturan toko.

### 5.2 Tidak Termasuk dalam MVP Awal

- Integrasi pembayaran otomatis QRIS/payment gateway.
- Multi-cabang kompleks.
- Akuntansi lengkap.
- Payroll karyawan.
- Integrasi marketplace.
- Aplikasi native Android/iOS.
- Loyalty point kompleks.

Fitur tersebut dapat masuk ke fase pengembangan berikutnya.

---

## 6. Value Proposition

Kasir Lite POS menawarkan sistem POS yang:

- Mudah digunakan oleh pemilik UMKM.
- Tampilan modern dan profesional.
- Bisa berjalan di browser tanpa instalasi berat.
- Mendukung scanner barcode.
- Mendukung printer struk.
- Menampilkan laporan secara visual.
- Memiliki kontrol stok dan peringatan stok minimum.
- Dapat dikembangkan menjadi sistem multi-toko atau SaaS.

---

## 7. Role dan Hak Akses

| Fitur | Owner | Admin | Kasir | Staff Gudang | Supervisor |
|---|---:|---:|---:|---:|---:|
| Dashboard | Ya | Ya | Terbatas | Terbatas | Ya |
| Kelola Produk | Ya | Ya | Tidak | Ya | Ya |
| Kelola Kategori | Ya | Ya | Tidak | Terbatas | Ya |
| Transaksi Penjualan | Ya | Ya | Ya | Tidak | Ya |
| Retur/Pembatalan | Ya | Ya | Tidak | Tidak | Ya |
| Kelola Stok | Ya | Ya | Tidak | Ya | Ya |
| Kelola Pelanggan | Ya | Ya | Ya | Tidak | Ya |
| Laporan | Ya | Ya | Tidak/Terbatas | Terbatas | Ya |
| Pengaturan Toko | Ya | Ya | Tidak | Tidak | Tidak |
| Manajemen User | Ya | Ya | Tidak | Tidak | Tidak |

---

## 8. Modul Utama Aplikasi

## 8.1 Modul Dashboard

Dashboard menjadi halaman utama setelah login. Tujuannya adalah memberikan ringkasan performa toko secara cepat.

### Informasi yang Ditampilkan

- Penjualan hari ini.
- Jumlah transaksi hari ini.
- Total produk aktif.
- Total pelanggan.
- Grafik penjualan harian/mingguan/bulanan.
- Penjualan berdasarkan kategori.
- Transaksi terbaru.
- Stok produk yang menipis.
- Produk terlaris.
- Notifikasi stok minimum.

### Komponen UI

- Sidebar menu.
- Topbar berisi nama toko, profil pengguna, dan dropdown akun.
- Card statistik.
- Grafik line chart penjualan.
- Donut chart kategori.
- Table transaksi terbaru.
- List produk stok menipis.

### Acceptance Criteria

- Dashboard dapat menampilkan data real-time berdasarkan database.
- Data bisa difilter berdasarkan tanggal.
- Grafik tidak error meskipun data kosong.
- Stok menipis muncul jika stok produk kurang dari atau sama dengan stok minimum.

---

## 8.2 Modul Autentikasi dan User Management

Modul ini digunakan untuk mengatur akses pengguna ke aplikasi.

### Fitur

- Login menggunakan email/username dan password.
- Logout.
- Lupa password.
- Reset password.
- Ganti password.
- Manajemen user.
- Role-based access control.
- Status user aktif/nonaktif.
- Riwayat login pengguna.

### Data User

- Nama lengkap.
- Email.
- Username.
- Password terenkripsi.
- Nomor WhatsApp.
- Role.
- Status akun.
- Foto profil opsional.

### Business Rules

- Password wajib disimpan dalam bentuk hash.
- User nonaktif tidak dapat login.
- Kasir tidak dapat mengakses laporan keuangan penuh jika tidak diberi izin.
- Owner memiliki akses penuh.

---

## 8.3 Modul Produk

Modul produk digunakan untuk mengelola data barang yang dijual di toko.

### Fitur Utama

- Tambah produk.
- Edit produk.
- Hapus/nonaktifkan produk.
- Upload foto produk.
- Kategori produk.
- Satuan produk.
- Harga beli.
- Harga jual.
- Harga grosir opsional.
- SKU.
- Barcode.
- Stok awal.
- Stok minimum.
- Status produk aktif/nonaktif.
- Import produk dari Excel/CSV.
- Export data produk.

### Data Produk

| Field | Keterangan |
|---|---|
| Nama Produk | Nama barang yang dijual. |
| SKU | Kode internal produk. |
| Barcode | Kode barcode produk. |
| Kategori | Kelompok produk. |
| Satuan | pcs, botol, box, kg, liter, dll. |
| Harga Beli | Modal produk. |
| Harga Jual | Harga jual utama. |
| Stok | Jumlah stok tersedia. |
| Stok Minimum | Batas peringatan stok menipis. |
| Foto Produk | Gambar produk opsional. |
| Status | Aktif/nonaktif. |

### Acceptance Criteria

- Admin dapat menambahkan produk baru.
- Sistem menolak barcode yang sama pada produk berbeda.
- Produk nonaktif tidak muncul di halaman kasir.
- Produk bisa dicari berdasarkan nama, SKU, atau barcode.
- Produk dengan stok habis dapat diberi status tidak dapat dijual, sesuai pengaturan toko.

---

## 8.4 Fitur Tambah Produk Menggunakan Scan Barcode

Fitur ini membantu admin/kasir menambahkan atau mencari produk lebih cepat menggunakan scanner barcode.

### Cara Kerja

1. Admin membuka halaman tambah produk.
2. Kursor diarahkan ke field barcode.
3. Admin melakukan scan barcode menggunakan barcode scanner USB/Bluetooth.
4. Scanner mengirimkan kode barcode ke input field.
5. Sistem mengecek apakah barcode sudah terdaftar.
6. Jika belum terdaftar, admin dapat melengkapi nama produk, kategori, harga, dan stok.
7. Jika sudah terdaftar, sistem menampilkan notifikasi bahwa produk sudah ada.

### Jenis Barcode yang Didukung

- EAN-13.
- EAN-8.
- UPC-A.
- Code 128.
- Code 39.
- QR Code opsional untuk pengembangan berikutnya.

### Sumber Input Barcode

- Barcode scanner USB plug-and-play.
- Barcode scanner Bluetooth.
- Kamera perangkat/browser untuk scan barcode opsional.
- Input manual jika barcode rusak atau tidak terbaca.

### Fitur Tambahan Barcode

- Generate barcode internal untuk produk tanpa barcode pabrik.
- Cetak label barcode produk.
- Validasi duplikasi barcode.
- Search produk dari barcode.
- Scan barcode langsung di halaman POS.

### Business Rules

- Satu barcode hanya boleh terhubung ke satu produk aktif.
- Barcode boleh kosong untuk produk tertentu, tetapi disarankan diisi.
- Jika produk tidak memiliki barcode, sistem dapat membuat kode SKU otomatis.
- Scanner barcode diperlakukan sebagai input keyboard sehingga tidak selalu memerlukan library khusus.
- Untuk scan menggunakan kamera browser, sistem membutuhkan library tambahan di frontend.

### Acceptance Criteria

- Saat barcode discan di form produk, field barcode otomatis terisi.
- Sistem mampu mendeteksi barcode duplikat.
- Produk baru dapat disimpan setelah barcode discan dan data wajib dilengkapi.
- Pada halaman POS, scan barcode langsung menambahkan produk ke keranjang.

---

## 8.5 Modul Kategori Produk

Kategori digunakan untuk mengelompokkan produk agar mudah dicari dan dianalisis.

### Fitur

- Tambah kategori.
- Edit kategori.
- Hapus kategori jika belum digunakan.
- Nonaktifkan kategori.
- Warna kategori untuk chart.
- Urutan tampilan kategori.

### Contoh Kategori

- Makanan & Minuman.
- Kebutuhan Harian.
- Peralatan Rumah.
- Parfum.
- Aksesoris.
- Lainnya.

---

## 8.6 Modul Stok / Inventory

Modul ini digunakan untuk mencatat pergerakan stok produk.

### Fitur

- Stok masuk.
- Stok keluar.
- Penyesuaian stok.
- Riwayat stok.
- Stok minimum alert.
- Produk stok habis.
- Produk stok menipis.
- Koreksi stok dengan alasan.
- Import stok awal.
- Export laporan stok.

### Jenis Pergerakan Stok

| Tipe | Keterangan |
|---|---|
| IN | Stok masuk dari pembelian/supplier. |
| OUT | Stok keluar karena penjualan/manual. |
| ADJUSTMENT | Koreksi stok manual. |
| RETURN | Stok kembali karena retur penjualan. |
| DAMAGE | Stok rusak/hilang. |

### Business Rules

- Stok otomatis berkurang saat transaksi berhasil.
- Stok otomatis kembali jika transaksi dibatalkan/retur.
- Koreksi stok wajib memiliki alasan.
- Sistem menyimpan user yang melakukan perubahan stok.
- Produk dengan stok di bawah minimum muncul di dashboard.

---

## 8.7 Modul POS / Transaksi Penjualan

Modul POS adalah fitur utama untuk proses penjualan di kasir.

### Fitur

- Cari produk berdasarkan nama/SKU/barcode.
- Scan barcode untuk menambahkan produk ke keranjang.
- Tambah produk ke cart.
- Ubah jumlah item.
- Hapus item dari cart.
- Diskon per item.
- Diskon total transaksi.
- Pajak opsional.
- Biaya tambahan opsional.
- Pilih pelanggan.
- Pilih metode pembayaran.
- Hitung kembalian otomatis.
- Simpan transaksi.
- Cetak struk.
- Kirim struk via WhatsApp/email opsional.
- Hold transaksi opsional.
- Void/cancel transaksi dengan otorisasi.

### Alur Transaksi

1. Kasir membuka halaman POS.
2. Kasir scan barcode atau mencari produk.
3. Produk masuk ke keranjang.
4. Kasir mengatur kuantitas jika diperlukan.
5. Sistem menghitung subtotal.
6. Kasir menambahkan diskon/pajak jika ada.
7. Kasir memilih metode pembayaran.
8. Sistem menghitung total bayar dan kembalian.
9. Kasir menyimpan transaksi.
10. Sistem mengurangi stok otomatis.
11. Struk dapat dicetak.
12. Transaksi masuk ke laporan.

### Metode Pembayaran

- Tunai.
- Transfer bank.
- QRIS manual.
- E-wallet manual.
- Kartu debit/kredit manual.
- Split payment opsional.

### Business Rules

- Transaksi tidak dapat disimpan jika keranjang kosong.
- Jika pengaturan stok aktif, produk tidak boleh dijual melebihi stok tersedia.
- Nomor transaksi dibuat otomatis.
- Transaksi yang sudah selesai tidak dapat diedit langsung, hanya bisa diretur/dibatalkan sesuai hak akses.
- Pembatalan transaksi wajib mencatat alasan dan user yang membatalkan.

### Format Nomor Transaksi

Contoh: `TRX-20260520-0001`

Struktur:

- Prefix: TRX.
- Tanggal: YYYYMMDD.
- Nomor urut harian: 0001, 0002, 0003.

---

## 8.8 Modul Pembayaran

### Fitur

- Input jumlah uang diterima.
- Hitung kembalian otomatis.
- Pilih metode pembayaran.
- Catatan pembayaran.
- Status pembayaran: paid, pending, cancelled, refunded.
- Cetak bukti pembayaran.

### Acceptance Criteria

- Sistem dapat menghitung kembalian dengan benar.
- Jika pembayaran tunai kurang dari total, transaksi tidak dapat diselesaikan.
- Metode pembayaran tersimpan di detail transaksi.
- Laporan dapat difilter berdasarkan metode pembayaran.

---

## 8.9 Modul Cetak Struk / Invoice

### Fitur

- Cetak struk setelah transaksi.
- Cetak ulang struk dari riwayat transaksi.
- Preview struk sebelum cetak.
- Pengaturan ukuran struk.
- Logo toko di struk.
- Informasi toko.
- Nomor transaksi.
- Nama kasir.
- Daftar item.
- Subtotal, diskon, pajak, total.
- Uang diterima dan kembalian.
- Catatan terima kasih.

### Ukuran Struk

- 58mm.
- 80mm.
- A4 invoice opsional.

### Contoh Informasi Struk

- Nama toko.
- Alamat toko.
- Nomor WhatsApp.
- Tanggal dan jam transaksi.
- Nomor transaksi.
- Nama kasir.
- Produk, qty, harga, subtotal.
- Total pembayaran.
- Metode pembayaran.

---

## 8.10 Modul Pelanggan

Modul pelanggan digunakan untuk menyimpan data customer dan histori pembelian.

### Fitur

- Tambah pelanggan.
- Edit pelanggan.
- Hapus/nonaktifkan pelanggan.
- Cari pelanggan.
- Riwayat transaksi pelanggan.
- Total pembelian pelanggan.
- Catatan pelanggan.

### Data Pelanggan

- Nama pelanggan.
- Nomor WhatsApp.
- Email opsional.
- Alamat opsional.
- Tanggal lahir opsional.
- Catatan pelanggan.

### Pengembangan Lanjutan

- Loyalty point.
- Membership.
- Diskon khusus pelanggan.
- Segmentasi pelanggan.

---

## 8.11 Modul Supplier

Modul supplier digunakan untuk mencatat pemasok barang.

### Fitur

- Tambah supplier.
- Edit supplier.
- Nonaktifkan supplier.
- Riwayat stok masuk berdasarkan supplier.
- Catatan supplier.

### Data Supplier

- Nama supplier.
- Nomor kontak.
- Email.
- Alamat.
- Catatan.

---

## 8.12 Modul Retur dan Pembatalan Transaksi

### Fitur

- Retur sebagian item.
- Retur semua item.
- Pembatalan transaksi.
- Alasan retur/pembatalan.
- Otorisasi supervisor/admin.
- Update stok otomatis setelah retur.
- Riwayat retur.

### Business Rules

- Kasir biasa tidak dapat membatalkan transaksi tanpa izin.
- Retur wajib memilih transaksi asal.
- Retur menambah kembali stok jika barang dikembalikan dalam kondisi baik.
- Jika barang rusak, retur tidak menambah stok jual.
- Semua aktivitas retur masuk ke audit log.

---

## 8.13 Modul Laporan

Modul laporan membantu pemilik toko menganalisis performa bisnis.

### Jenis Laporan

1. Laporan penjualan harian.
2. Laporan penjualan bulanan.
3. Laporan transaksi per kasir.
4. Laporan produk terlaris.
5. Laporan kategori terlaris.
6. Laporan stok menipis.
7. Laporan stok habis.
8. Laporan keuntungan kotor.
9. Laporan metode pembayaran.
10. Laporan retur.
11. Laporan pelanggan terbaik.

### Filter Laporan

- Tanggal mulai dan tanggal akhir.
- Kasir.
- Kategori produk.
- Produk.
- Metode pembayaran.
- Status transaksi.

### Export Laporan

- PDF.
- Excel.
- CSV.

### Business Rules

- Laba kotor dihitung dari harga jual dikurangi harga beli.
- Data laporan hanya menampilkan transaksi dengan status selesai.
- Transaksi yang dibatalkan tidak dihitung sebagai pendapatan.
- Retur mengurangi nilai penjualan sesuai nilai item yang dikembalikan.

---

## 8.14 Modul Pengaturan Toko

### Fitur

- Nama toko.
- Logo toko.
- Alamat toko.
- Nomor WhatsApp.
- Email toko.
- Mata uang.
- Pajak default.
- Format nomor transaksi.
- Pengaturan stok minus.
- Pengaturan cetak struk.
- Catatan footer struk.
- Pengaturan timezone.

### Contoh Pengaturan

- Nama toko: Toko Sejahtera.
- Mata uang: Rupiah.
- Ukuran struk default: 80mm.
- Izinkan stok minus: Tidak.
- Pajak default: 0% atau 11% sesuai kebutuhan toko.

---

## 8.15 Modul Notifikasi

### Fitur

- Notifikasi stok menipis.
- Notifikasi stok habis.
- Notifikasi transaksi besar.
- Notifikasi retur/pembatalan.
- Notifikasi produk belum memiliki barcode.

### Media Notifikasi

- In-app notification.
- Email opsional.
- WhatsApp opsional untuk pengembangan lanjutan.

---

## 8.16 Modul Audit Log

Audit log digunakan untuk melacak aktivitas penting di sistem.

### Aktivitas yang Dicatat

- Login/logout.
- Tambah/edit/hapus produk.
- Perubahan harga.
- Perubahan stok.
- Transaksi penjualan.
- Retur.
- Pembatalan transaksi.
- Perubahan pengaturan toko.
- Perubahan hak akses user.

### Data Audit Log

- User.
- Aktivitas.
- Modul.
- Data sebelum perubahan.
- Data sesudah perubahan.
- IP address.
- Waktu aktivitas.

---

## 9. Struktur Halaman Aplikasi

### 9.1 Public/Auth

- Login.
- Lupa password.
- Reset password.

### 9.2 Private/Dashboard

- Dashboard utama.
- Statistik toko.
- Grafik penjualan.
- Stok menipis.
- Transaksi terbaru.

### 9.3 Produk

- Daftar produk.
- Tambah produk.
- Edit produk.
- Detail produk.
- Import produk.
- Cetak label barcode.

### 9.4 Kategori

- Daftar kategori.
- Tambah kategori.
- Edit kategori.

### 9.5 POS/Kasir

- Halaman transaksi kasir.
- Keranjang belanja.
- Pembayaran.
- Cetak struk.

### 9.6 Transaksi

- Riwayat transaksi.
- Detail transaksi.
- Cetak ulang struk.
- Retur transaksi.
- Pembatalan transaksi.

### 9.7 Stok

- Daftar stok produk.
- Stok masuk.
- Stok keluar.
- Koreksi stok.
- Riwayat stok.

### 9.8 Pelanggan

- Daftar pelanggan.
- Tambah pelanggan.
- Detail pelanggan.
- Riwayat pembelian.

### 9.9 Supplier

- Daftar supplier.
- Tambah supplier.
- Riwayat barang masuk.

### 9.10 Laporan

- Laporan penjualan.
- Laporan produk.
- Laporan stok.
- Laporan kasir.
- Laporan pembayaran.
- Export laporan.

### 9.11 Pengaturan

- Profil toko.
- Pengaturan struk.
- Pengaturan pajak.
- Pengaturan user.
- Pengaturan role.

---

## 10. User Flow Utama

## 10.1 Flow Login

1. User membuka aplikasi.
2. User memasukkan email/username dan password.
3. Sistem memvalidasi akun.
4. Jika valid, user masuk ke dashboard.
5. Jika tidak valid, sistem menampilkan pesan error.

## 10.2 Flow Tambah Produk dengan Barcode

1. Admin membuka menu Produk.
2. Admin klik Tambah Produk.
3. Admin scan barcode pada field barcode.
4. Sistem mengecek duplikasi barcode.
5. Admin mengisi nama, kategori, harga, stok, dan informasi lain.
6. Admin klik Simpan.
7. Produk tersimpan dan dapat digunakan di POS.

## 10.3 Flow Transaksi POS

1. Kasir membuka menu Kasir/POS.
2. Kasir scan barcode produk.
3. Produk masuk ke cart.
4. Kasir mengatur qty jika diperlukan.
5. Sistem menghitung total.
6. Kasir memilih metode pembayaran.
7. Kasir input uang diterima.
8. Sistem menghitung kembalian.
9. Kasir klik Bayar.
10. Transaksi tersimpan.
11. Stok berkurang.
12. Struk dicetak.

## 10.4 Flow Stok Masuk

1. Staff gudang membuka menu Stok.
2. Pilih produk.
3. Input jumlah stok masuk.
4. Pilih supplier jika ada.
5. Input catatan.
6. Simpan.
7. Sistem menambah stok produk dan mencatat riwayat stok.

## 10.5 Flow Laporan Penjualan

1. Owner membuka menu Laporan.
2. Pilih rentang tanggal.
3. Sistem menampilkan ringkasan penjualan.
4. Owner dapat melihat grafik, tabel, dan detail transaksi.
5. Owner dapat export laporan ke PDF/Excel.

---

## 11. Kebutuhan Fungsional

| Kode | Kebutuhan | Prioritas |
|---|---|---|
| FR-001 | User dapat login dan logout. | High |
| FR-002 | Admin dapat mengelola data produk. | High |
| FR-003 | Admin dapat menambahkan produk dengan scan barcode. | High |
| FR-004 | Kasir dapat melakukan transaksi penjualan. | High |
| FR-005 | Sistem mengurangi stok otomatis setelah transaksi selesai. | High |
| FR-006 | Sistem dapat mencetak struk transaksi. | High |
| FR-007 | Owner dapat melihat dashboard penjualan. | High |
| FR-008 | Sistem menampilkan stok menipis. | High |
| FR-009 | Admin dapat mengelola pelanggan. | Medium |
| FR-010 | Admin dapat mengelola supplier. | Medium |
| FR-011 | Sistem menyediakan laporan penjualan. | High |
| FR-012 | Sistem menyediakan laporan stok. | High |
| FR-013 | Sistem menyediakan manajemen role dan permission. | High |
| FR-014 | Sistem menyimpan audit log aktivitas penting. | Medium |
| FR-015 | Sistem mendukung export laporan PDF/Excel. | Medium |
| FR-016 | Sistem mendukung import produk CSV/Excel. | Medium |
| FR-017 | Sistem mendukung retur transaksi. | Medium |
| FR-018 | Sistem mendukung cetak label barcode. | Medium |
| FR-019 | Sistem mendukung pengaturan profil toko. | High |
| FR-020 | Sistem mendukung pencarian cepat produk. | High |

---

## 12. Kebutuhan Non-Fungsional

## 12.1 Performance

- Halaman dashboard maksimal memuat data awal dalam 3 detik pada koneksi normal.
- Pencarian produk di halaman POS harus responsif.
- Scan barcode harus langsung menambahkan produk ke keranjang tanpa reload halaman.
- Sistem mampu menangani minimal 10.000 produk untuk satu toko pada fase awal.
- Sistem mampu menangani transaksi harian minimal 1.000 transaksi per toko.

## 12.2 Security

- Password menggunakan hashing.
- Token autentikasi menggunakan JWT atau session-based authentication.
- API wajib dilindungi middleware authentication.
- Role-based access control wajib diterapkan.
- Validasi input dilakukan di frontend dan backend.
- Proteksi terhadap SQL injection melalui ORM/query builder.
- Proteksi terhadap XSS.
- File upload dibatasi tipe dan ukuran.
- Aktivitas penting dicatat dalam audit log.

## 12.3 Usability

- Tampilan sederhana dan mudah dipahami kasir.
- Tombol transaksi dibuat besar dan jelas.
- Halaman POS mendukung penggunaan keyboard.
- Warna status harus mudah dibedakan.
- Dashboard harus tetap rapi di desktop, tablet, dan mobile.

## 12.4 Reliability

- Transaksi harus menggunakan database transaction agar stok dan pembayaran konsisten.
- Jika proses pembayaran gagal, stok tidak boleh berkurang.
- Jika struk gagal dicetak, transaksi tetap tersimpan dan dapat dicetak ulang.
- Sistem harus menyimpan waktu transaksi secara akurat.

## 12.5 Scalability

- Struktur aplikasi mendukung multi-outlet di masa depan.
- API dibuat modular.
- Database dirancang agar dapat dikembangkan ke model SaaS.
- Modul pembayaran dapat diintegrasikan dengan payment gateway di masa depan.

---

## 13. Rekomendasi Teknologi

## 13.1 Backend

- Node.js.
- Express.js atau NestJS.
- REST API.
- JWT authentication.
- MySQL database.
- Prisma ORM atau Sequelize.
- Multer untuk upload file.
- Bcrypt untuk hash password.
- Zod/Joi untuk validasi input.

### Rekomendasi

Untuk aplikasi yang ingin rapi, scalable, dan mudah dikembangkan, NestJS cocok digunakan karena memiliki struktur modular yang jelas. Namun, jika ingin pengembangan lebih cepat dan sederhana, Express.js juga sangat cukup untuk MVP.

## 13.2 Frontend

- React.
- Vite.
- React Router.
- Axios/Fetch API.
- TanStack Query untuk data fetching.
- Zustand/Redux Toolkit untuk state management.
- React Hook Form untuk form.
- Zod/Yup untuk validasi form.
- Recharts untuk grafik dashboard.
- Tailwind CSS untuk UI styling.

## 13.3 Database

- MySQL.
- Gunakan indexing pada field yang sering dicari:
  - barcode.
  - SKU.
  - product_name.
  - transaction_number.
  - created_at.

## 13.4 Barcode

Untuk barcode scanner USB/Bluetooth, tidak wajib menggunakan library khusus karena scanner biasanya bertindak seperti keyboard input.

Untuk scan barcode menggunakan kamera browser, dapat menggunakan library frontend seperti:

- ZXing browser library.
- html5-qrcode.

## 13.5 Cetak Struk

Pilihan implementasi:

1. Browser print menggunakan template HTML/CSS.
2. Thermal printer via driver sistem operasi.
3. ESC/POS printing untuk integrasi lebih lanjut.
4. QZ Tray untuk kebutuhan direct print dari browser ke printer tertentu.

Untuk MVP, browser print lebih sederhana dan cukup.

---

## 14. Arsitektur Sistem

### 14.1 Gambaran Umum

Frontend React berkomunikasi dengan backend Node.js melalui REST API. Backend mengelola autentikasi, validasi, proses bisnis, dan koneksi ke database MySQL. Database menyimpan data user, produk, transaksi, stok, pelanggan, supplier, dan laporan.

### 14.2 Struktur Arsitektur

```text
User Browser
   ↓
React Frontend
   ↓ REST API
Node.js Backend
   ↓
MySQL Database
   ↓
Backup & Reporting
```

### 14.3 Modul Backend

- Auth Module.
- User Module.
- Product Module.
- Category Module.
- Inventory Module.
- POS/Sales Module.
- Payment Module.
- Customer Module.
- Supplier Module.
- Report Module.
- Setting Module.
- Audit Log Module.

---

## 15. Rancangan Database Awal

## 15.1 Tabel users

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID user. |
| name | VARCHAR | Nama user. |
| email | VARCHAR UNIQUE | Email login. |
| username | VARCHAR UNIQUE | Username login. |
| password_hash | VARCHAR | Password terenkripsi. |
| role_id | BIGINT FK | Role user. |
| phone | VARCHAR | Nomor kontak. |
| status | ENUM | active/inactive. |
| created_at | DATETIME | Waktu dibuat. |
| updated_at | DATETIME | Waktu diubah. |

## 15.2 Tabel roles

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID role. |
| name | VARCHAR | Owner/Admin/Kasir/dll. |
| description | TEXT | Deskripsi role. |
| created_at | DATETIME | Waktu dibuat. |

## 15.3 Tabel permissions

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID permission. |
| code | VARCHAR | Kode permission. |
| name | VARCHAR | Nama permission. |
| module | VARCHAR | Modul terkait. |

## 15.4 Tabel role_permissions

| Field | Type | Keterangan |
|---|---|---|
| role_id | BIGINT FK | ID role. |
| permission_id | BIGINT FK | ID permission. |

## 15.5 Tabel stores

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID toko. |
| name | VARCHAR | Nama toko. |
| address | TEXT | Alamat toko. |
| phone | VARCHAR | Nomor toko. |
| email | VARCHAR | Email toko. |
| logo | VARCHAR | File logo. |
| currency | VARCHAR | IDR. |
| tax_rate | DECIMAL | Pajak default. |
| receipt_footer | TEXT | Footer struk. |
| created_at | DATETIME | Waktu dibuat. |

## 15.6 Tabel categories

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID kategori. |
| name | VARCHAR | Nama kategori. |
| color | VARCHAR | Warna chart. |
| status | ENUM | active/inactive. |
| created_at | DATETIME | Waktu dibuat. |

## 15.7 Tabel products

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID produk. |
| category_id | BIGINT FK | Kategori produk. |
| sku | VARCHAR UNIQUE | Kode SKU. |
| barcode | VARCHAR UNIQUE | Barcode produk. |
| name | VARCHAR | Nama produk. |
| description | TEXT | Deskripsi produk. |
| unit | VARCHAR | Satuan. |
| purchase_price | DECIMAL | Harga beli. |
| selling_price | DECIMAL | Harga jual. |
| stock | INT | Stok saat ini. |
| minimum_stock | INT | Batas stok minimum. |
| image | VARCHAR | Foto produk. |
| status | ENUM | active/inactive. |
| created_at | DATETIME | Waktu dibuat. |
| updated_at | DATETIME | Waktu diubah. |

## 15.8 Tabel customers

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID pelanggan. |
| name | VARCHAR | Nama pelanggan. |
| phone | VARCHAR | Nomor WhatsApp. |
| email | VARCHAR | Email. |
| address | TEXT | Alamat. |
| notes | TEXT | Catatan. |
| created_at | DATETIME | Waktu dibuat. |

## 15.9 Tabel suppliers

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID supplier. |
| name | VARCHAR | Nama supplier. |
| phone | VARCHAR | Nomor kontak. |
| email | VARCHAR | Email. |
| address | TEXT | Alamat. |
| notes | TEXT | Catatan. |

## 15.10 Tabel sales

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID transaksi. |
| transaction_number | VARCHAR UNIQUE | Nomor transaksi. |
| customer_id | BIGINT FK NULL | Pelanggan. |
| cashier_id | BIGINT FK | Kasir. |
| subtotal | DECIMAL | Subtotal. |
| discount_amount | DECIMAL | Total diskon. |
| tax_amount | DECIMAL | Pajak. |
| grand_total | DECIMAL | Total akhir. |
| paid_amount | DECIMAL | Uang diterima. |
| change_amount | DECIMAL | Kembalian. |
| payment_method | VARCHAR | Metode pembayaran. |
| status | ENUM | completed/cancelled/refunded. |
| notes | TEXT | Catatan. |
| created_at | DATETIME | Waktu transaksi. |

## 15.11 Tabel sale_items

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID item transaksi. |
| sale_id | BIGINT FK | ID transaksi. |
| product_id | BIGINT FK | ID produk. |
| product_name | VARCHAR | Snapshot nama produk. |
| qty | INT | Jumlah. |
| price | DECIMAL | Harga jual saat transaksi. |
| discount_amount | DECIMAL | Diskon item. |
| subtotal | DECIMAL | Subtotal item. |

## 15.12 Tabel stock_movements

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID pergerakan stok. |
| product_id | BIGINT FK | ID produk. |
| type | ENUM | IN/OUT/ADJUSTMENT/RETURN/DAMAGE. |
| qty | INT | Jumlah stok. |
| before_stock | INT | Stok sebelum. |
| after_stock | INT | Stok sesudah. |
| reference_type | VARCHAR | sales/manual/purchase/return. |
| reference_id | BIGINT | ID referensi. |
| notes | TEXT | Catatan. |
| created_by | BIGINT FK | User pembuat. |
| created_at | DATETIME | Waktu dibuat. |

## 15.13 Tabel returns

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID retur. |
| sale_id | BIGINT FK | Transaksi asal. |
| return_number | VARCHAR UNIQUE | Nomor retur. |
| total_return | DECIMAL | Total retur. |
| reason | TEXT | Alasan retur. |
| created_by | BIGINT FK | User. |
| created_at | DATETIME | Waktu retur. |

## 15.14 Tabel return_items

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID item retur. |
| return_id | BIGINT FK | ID retur. |
| product_id | BIGINT FK | Produk. |
| qty | INT | Jumlah retur. |
| price | DECIMAL | Harga. |
| subtotal | DECIMAL | Subtotal. |
| restock | BOOLEAN | Apakah masuk stok lagi. |

## 15.15 Tabel audit_logs

| Field | Type | Keterangan |
|---|---|---|
| id | BIGINT PK | ID log. |
| user_id | BIGINT FK | User. |
| action | VARCHAR | Aktivitas. |
| module | VARCHAR | Modul. |
| old_data | JSON | Data sebelum. |
| new_data | JSON | Data sesudah. |
| ip_address | VARCHAR | IP. |
| created_at | DATETIME | Waktu. |

---

## 16. Rancangan API Endpoint

## 16.1 Auth

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | /api/auth/login | Login user. |
| POST | /api/auth/logout | Logout user. |
| POST | /api/auth/forgot-password | Request reset password. |
| POST | /api/auth/reset-password | Reset password. |
| GET | /api/auth/me | Ambil profil user login. |

## 16.2 Products

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | /api/products | List produk. |
| GET | /api/products/:id | Detail produk. |
| POST | /api/products | Tambah produk. |
| PUT | /api/products/:id | Update produk. |
| DELETE | /api/products/:id | Hapus/nonaktifkan produk. |
| GET | /api/products/barcode/:barcode | Cari produk berdasarkan barcode. |
| POST | /api/products/import | Import produk. |
| GET | /api/products/export | Export produk. |

## 16.3 POS/Sales

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | /api/sales | Buat transaksi. |
| GET | /api/sales | Riwayat transaksi. |
| GET | /api/sales/:id | Detail transaksi. |
| POST | /api/sales/:id/cancel | Batalkan transaksi. |
| GET | /api/sales/:id/receipt | Data cetak struk. |

## 16.4 Inventory

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | /api/inventory/stocks | Daftar stok. |
| POST | /api/inventory/stock-in | Stok masuk. |
| POST | /api/inventory/stock-out | Stok keluar manual. |
| POST | /api/inventory/adjustment | Koreksi stok. |
| GET | /api/inventory/movements | Riwayat stok. |
| GET | /api/inventory/low-stock | Stok menipis. |

## 16.5 Reports

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | /api/reports/dashboard | Ringkasan dashboard. |
| GET | /api/reports/sales | Laporan penjualan. |
| GET | /api/reports/products | Laporan produk. |
| GET | /api/reports/inventory | Laporan stok. |
| GET | /api/reports/cashiers | Laporan kasir. |
| GET | /api/reports/export/pdf | Export PDF. |
| GET | /api/reports/export/excel | Export Excel. |

---

## 17. Business Rules Penting

1. Nomor transaksi harus unik.
2. Stok produk berkurang hanya jika transaksi berhasil.
3. Harga produk di transaksi harus disimpan sebagai snapshot agar laporan historis tidak berubah saat harga produk diubah.
4. Barcode tidak boleh duplikat.
5. Produk nonaktif tidak muncul di POS.
6. Pembatalan transaksi hanya boleh dilakukan oleh role tertentu.
7. Retur harus terhubung ke transaksi asal.
8. Koreksi stok wajib memiliki alasan.
9. User nonaktif tidak boleh login.
10. Laporan hanya menghitung transaksi dengan status completed.
11. Export laporan harus mengikuti filter yang aktif.
12. Semua aktivitas sensitif harus masuk audit log.

---

## 18. Desain UI/UX

## 18.1 Gaya Visual

Berdasarkan referensi desain, aplikasi menggunakan gaya modern, bersih, dan profesional dengan karakteristik:

- Warna utama biru.
- Background terang.
- Card statistik dengan shadow lembut.
- Sidebar menu di kiri.
- Icon sederhana untuk setiap menu.
- Chart visual untuk laporan.
- Tabel transaksi bersih dan mudah dibaca.
- Komponen stok menipis dengan indikator merah.
- Area POS dibuat fokus untuk transaksi cepat.

## 18.2 Menu Utama

- Dashboard.
- Penjualan/POS.
- Produk.
- Stok.
- Pelanggan.
- Laporan.
- Kasir/User.
- Pengaturan.

## 18.3 Prinsip UX POS

- Kasir bisa transaksi tanpa banyak klik.
- Scan barcode langsung masuk cart.
- Shortcut keyboard tersedia.
- Tombol bayar harus jelas.
- Total belanja selalu terlihat.
- Error harus ditampilkan dengan bahasa sederhana.
- Struk bisa dicetak ulang.

## 18.4 Responsiveness

- Desktop: full dashboard dan POS optimal.
- Tablet: POS tetap nyaman digunakan.
- Mobile: fokus untuk monitoring, laporan ringan, dan manajemen data sederhana.

---

## 19. Integrasi Perangkat

## 19.1 Barcode Scanner

- Mendukung scanner USB/Bluetooth.
- Scanner bekerja sebagai keyboard input.
- Tidak memerlukan instalasi khusus di browser.
- Untuk scan kamera, gunakan library tambahan.

## 19.2 Printer Struk

- Mendukung printer thermal 58mm/80mm.
- Cetak via browser print untuk MVP.
- Direct print dapat dikembangkan di fase lanjutan.

## 19.3 Cash Drawer Opsional

- Bisa dikembangkan dengan printer thermal yang mendukung port cash drawer.
- Trigger buka laci dapat mengikuti perintah cetak struk melalui ESC/POS pada fase lanjutan.

## 19.4 Customer Display Opsional

- Tampilan layar pelanggan untuk melihat total belanja.
- Dapat dibuat sebagai halaman web terpisah.

---

## 20. MVP dan Roadmap

## 20.1 MVP Phase 1

Target: sistem siap digunakan untuk transaksi dasar toko.

- Login.
- Dashboard sederhana.
- CRUD produk.
- CRUD kategori.
- Tambah produk dengan barcode scanner.
- POS transaksi.
- Cetak struk.
- Stok otomatis berkurang.
- Riwayat transaksi.
- Laporan penjualan dasar.
- Pengaturan toko.

## 20.2 Phase 2

Target: memperkuat operasional toko.

- Manajemen pelanggan.
- Manajemen supplier.
- Stok masuk/keluar.
- Koreksi stok.
- Retur transaksi.
- Laporan produk terlaris.
- Laporan stok menipis.
- Export PDF/Excel.
- Audit log.

## 20.3 Phase 3

Target: fitur bisnis lanjutan.

- Multi-outlet.
- Loyalty point.
- Membership.
- QRIS/payment gateway.
- WhatsApp receipt.
- PWA mode.
- Backup otomatis.
- Role permission custom.
- Direct thermal printer integration.

---

## 21. Estimasi Timeline Pengembangan

| Fase | Durasi | Output |
|---|---:|---|
| Analisis & Finalisasi Requirement | 3–5 hari | PRD final, scope, flow aplikasi. |
| UI/UX Design | 5–10 hari | Wireframe dan desain halaman utama. |
| Setup Project & Database | 2–3 hari | Struktur React, Node.js, MySQL. |
| Backend Core API | 7–14 hari | Auth, produk, stok, transaksi. |
| Frontend Core | 10–18 hari | Dashboard, produk, POS, transaksi. |
| Laporan & Export | 5–10 hari | Report dashboard, PDF/Excel. |
| Testing & Bug Fixing | 5–10 hari | Stabilitas aplikasi. |
| Deployment | 1–3 hari | Aplikasi online dan siap demo. |

Estimasi total MVP: 4–8 minggu tergantung jumlah developer, detail UI, dan kompleksitas fitur.

---

## 22. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Data stok tidak sinkron | Tinggi | Gunakan database transaction saat penjualan. |
| Barcode duplikat | Sedang | Validasi unique barcode. |
| Printer tidak kompatibel | Sedang | Mulai dari browser print, dokumentasikan printer rekomendasi. |
| Kasir salah membatalkan transaksi | Tinggi | Batasi akses void hanya untuk supervisor/admin. |
| Laporan lambat | Sedang | Gunakan index dan query optimization. |
| User lupa password | Rendah | Sediakan reset password. |
| Kesalahan input harga | Sedang | Validasi form dan audit log perubahan harga. |

---

## 23. Testing Plan

## 23.1 Functional Testing

- Login berhasil/gagal.
- Tambah produk manual.
- Tambah produk dengan scan barcode.
- Validasi barcode duplikat.
- Transaksi dengan satu produk.
- Transaksi dengan banyak produk.
- Diskon transaksi.
- Pembayaran tunai dan kembalian.
- Stok otomatis berkurang.
- Cetak struk.
- Retur transaksi.
- Laporan penjualan.

## 23.2 Edge Case Testing

- Transaksi saat stok kosong.
- Scan barcode tidak terdaftar.
- Produk nonaktif discan.
- Pembayaran kurang dari total.
- Koneksi putus saat transaksi.
- Harga produk berubah setelah transaksi.
- User tidak memiliki permission membuka halaman tertentu.

## 23.3 Security Testing

- Akses API tanpa token.
- Akses fitur admin dengan role kasir.
- Input script pada form produk.
- Upload file selain gambar.
- Brute force login dasar.

---

## 24. Success Metrics

- Kasir dapat menyelesaikan transaksi dalam waktu kurang dari 1 menit untuk transaksi sederhana.
- 100% transaksi yang berhasil tersimpan mengurangi stok dengan benar.
- Owner dapat melihat omzet harian dari dashboard.
- Produk dapat ditemukan melalui barcode scanner.
- Laporan penjualan dapat difilter berdasarkan tanggal.
- Struk dapat dicetak ulang dari riwayat transaksi.
- Tidak ada duplikasi barcode pada produk aktif.

---

## 25. Saran Pengembangan Tambahan

Agar Kasir Lite POS lebih menarik dan siap bersaing, beberapa fitur tambahan yang dapat dipertimbangkan:

1. **Mode PWA**  
   Aplikasi bisa dipasang seperti aplikasi desktop/mobile dari browser.

2. **Shortcut Keyboard POS**  
   Contoh: F2 cari produk, F4 bayar, Esc batal, Ctrl+P cetak.

3. **Quick Product Button**  
   Produk populer ditampilkan sebagai tombol cepat di halaman POS.

4. **Hold Transaction**  
   Kasir dapat menahan transaksi sementara jika pelanggan ingin menambah barang.

5. **Shift Kasir**  
   Mencatat modal awal, total penjualan shift, uang kas, dan selisih kas.

6. **Cash Management**  
   Catat uang masuk/keluar di laci kasir.

7. **Produk Bundling**  
   Contoh paket promo: beli 2 lebih murah.

8. **Multi Harga**  
   Harga retail, harga grosir, dan harga member.

9. **Loyalty Customer**  
   Point pelanggan berdasarkan total belanja.

10. **Backup Otomatis**  
   Backup database berkala untuk keamanan data.

---

## 26. Kesimpulan

Kasir Lite POS adalah aplikasi POS berbasis website yang dirancang untuk membantu UMKM mengelola penjualan, produk, stok, pelanggan, dan laporan secara lebih mudah dan profesional.

Dengan backend Node.js, frontend React, dan database MySQL, aplikasi ini dapat dibangun secara modular, cepat, dan scalable. Fitur scan barcode, cetak struk, dashboard penjualan, stok menipis, dan laporan bisnis menjadi komponen utama yang membuat aplikasi ini relevan untuk kebutuhan toko modern.

Fokus MVP sebaiknya dimulai dari fitur inti: produk, barcode, POS, transaksi, stok, struk, dan laporan dasar. Setelah sistem stabil, aplikasi dapat dikembangkan ke fitur lanjutan seperti multi-outlet, loyalty point, QRIS/payment gateway, PWA, dan integrasi printer thermal yang lebih canggih.

