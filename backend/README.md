# Backend Kopi Sandikala

REST API Express 5 + MySQL untuk katalog produk dan testimoni landing page.

## Setup

```bash
cd backend
npm install
```

Buat file `.env` di folder `backend/` (jangan di-commit):

```text
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<password-mysql-anda>
DB_NAME=sandikala
```

> Saya tidak bisa membuat file `.env` otomatis — alat keamanan menolak penulisan
> file berisi kredensial. Salin manual dari contoh di atas lalu isi password.

Buat database & tabel, lalu isi data awal:

```bash
mysql -u root -p < sql/schema.sql
npm run seed
```

Atau kalau `mysql` CLI tidak ada di PATH, jalankan SQL di `sql/schema.sql`
lewat phpMyAdmin / MySQL Workbench.

## Menjalankan

```bash
npm run dev    # development, restart otomatis
npm start      # produksi
```

Server berjalan di `http://localhost:3000`.

## Endpoint

### Health

| Method | Path      | Keterangan                          |
| ------ | --------- | ----------------------------------- |
| GET    | `/health` | Cek server hidup (tanpa query DB)   |

### Produk

| Method | Path                              | Keterangan                                    |
| ------ | --------------------------------- | --------------------------------------------- |
| GET    | `/api/products`                   | Daftar produk. Filter: `?category=Signature`, `?available=true` |
| GET    | `/api/products/categories`        | Daftar kategori unik + jumlah produk          |
| GET    | `/api/products/:id`               | Detail satu produk                            |
| POST   | `/api/products`                   | Tambah produk                                 |
| PUT    | `/api/products/:id`               | Update produk (penuh)                         |
| PATCH  | `/api/products/:id/availability`  | Ubah status tersedia/habis                    |
| DELETE | `/api/products/:id`               | Hapus produk                                  |

### Testimoni

| Method | Path                                  | Keterangan                                        |
| ------ | ------------------------------------- | ------------------------------------------------- |
| GET    | `/api/testimonials`                   | Testimoni yang sudah dipublikasikan               |
| POST   | `/api/testimonials`                   | Tambah testimoni (masuk sebagai draft)            |
| PATCH  | `/api/testimonials/:id/publish`       | Publikasikan / sembunyikan                        |
| DELETE | `/api/testimonials/:id`               | Hapus testimoni                                   |

## Contoh body POST `/api/products`

```json
{
  "name": "Latte",
  "description": "Espresso dengan susu segar.",
  "category": "Classic",
  "badge": null,
  "price_idr": 20000,
  "image_url": "https://contoh.com/latte.jpg"
}
```

## Bentuk error

Semua error memakai satu bentuk JSON:

```json
{ "code": "VALIDATION_ERROR", "message": "'price_idr' wajib berupa bilangan bulat positif (rupiah)" }
```

Kode status: 400 validasi · 404 tidak ditemukan · 409 duplikat (mis. slug sama) · 500 kesalahan server.

## Integrasi ke landing page

Untuk mengganti konten statis `index.html` dengan data dari API:

```js
const res = await fetch("http://localhost:3000/api/products?available=true");
const { data: products } = await res.json();
```

`price_idr` berupa bilangan bulat rupiah — format tampilan dengan `toLocaleString("id-ID")`.
