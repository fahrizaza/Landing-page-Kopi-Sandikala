// Titik masuk: `node src/server.js` atau `npm start`
const { app, PORT } = require("./app");
const db = require("./db");

let server;

(async () => {
  // Verifikasi koneksi database saat boot supaya salah konfigurasi
  // ketahuan di menit pertama, bukan saat request pertama masuk.
  try {
    await db.query("SELECT 1");
    console.log("[db] Koneksi MySQL siap");
  } catch (err) {
    console.error(`[db] Gagal terhubung ke MySQL: ${err.message}`);
    console.error("[db] Cek environment DB_USER/DB_PASSWORD/DB_NAME dan jalankan npm run setup-db");
    process.exit(1);
  }

  server = app.listen(PORT, () => {
    console.log(`API berjalan di http://localhost:${PORT}`);
  });
})();

async function shutdown(signal) {
  console.log(`[server] Menerima ${signal}, menutup server...`);
  if (server) {
    // Stop menerima koneksi baru, tunggu request berjalan selesai...
    server.close(async () => {
      // ...lalu tutup pool database.
      await db.end();
      process.exit(0);
    });
    // Batas keras kalau ada request yang menggantung.
    setTimeout(() => process.exit(0), 5000);
  } else {
    await db.end().catch(() => {});
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
