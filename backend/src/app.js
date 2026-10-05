const express = require("express");
const cors = require("cors");
const productsRouter = require("./routes/products");
const testimonialsRouter = require("./routes/testimonials");
const { errorHandler, ApiError } = require("./errors");

const PORT = Number(process.env.PORT || 3000);

const app = express();

app.disable("x-powered-by");

// Landing page berjalan di host berbeda (Live Server / file), jadi CORS dibuka.
// Batasi origin di produksi lewat environment variable CORS_ORIGIN.
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "16kb" }));

// Log ringkas setiap request — cukup untuk menjawab "apa yang terjadi dengan request X".
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start} ms)`);
  });
  next();
});

// Health check tanpa query database — tidak menggantung saat database mati.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productsRouter);
app.use("/api/testimonials", testimonialsRouter);

// Rute tak dikenal
app.use((req, res) => {
  const err = new ApiError(404, "NOT_FOUND", `Rute ${req.method} ${req.originalUrl} tidak ditemukan`);
  res.status(err.status).json({ code: err.code, message: err.message });
});

app.use(errorHandler);

module.exports = { app, PORT };
