// Setup database: buat database + tabel + seed. Dijalankan sekali: npm run setup-db
// Konfigurasi diambil dari environment variable (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD).
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, "../sql/schema.sql"), "utf8");
    await conn.query(sql);
    console.log("[setup] Database `sandikala`, tabel, dan data awal siap.");
  } finally {
    await conn.end();
  }
})().catch((err) => {
  console.error("[setup] Gagal:", err.message);
  process.exit(1);
});
