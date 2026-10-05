// Satu pool koneksi untuk seluruh proses — jangan dibuat per-request.
// Konfigurasi dibaca dari environment variable (lihat README).
require("dotenv").config();
const mysql = require("mysql2/promise");

const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_NAME"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  // Gagal cepat saat boot, bukan saat request pertama masuk.
  console.error(`[config] Environment variable belum diset: ${missing.join(", ")}`);
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // Query yang menggantung jangan menahan proses tanpa batas.
  connectTimeout: 5000,
});

module.exports = pool;
