const express = require("express");
const { ApiError, notFound, badRequest } = require("../errors");
const db = require("../db");

const router = express.Router();

// Kolom eksplisit — jangan SELECT * di kode aplikasi.
const COLUMNS =
  "id, name, slug, description, category, badge, price_idr, image_url, is_available, created_at, updated_at";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Validasi di tepi (edge): tolak sebelum menyentuh database.
function parseProductBody(body) {
  if (typeof body !== "object" || body === null) {
    throw badRequest("Body request wajib berupa JSON objek");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const category =
    typeof body.category === "string" ? body.category.trim() : "";
  const badge = typeof body.badge === "string" ? body.badge.trim() : null;
  const imageUrl =
    typeof body.image_url === "string" ? body.image_url.trim() : "";

  const price = Number(body.price_idr);

  if (!name || name.length > 120) throw badRequest("'name' wajib diisi (maks 120 karakter)");
  if (!description || description.length > 500)
    throw badRequest("'description' wajib diisi (maks 500 karakter)");
  if (!category || category.length > 60)
    throw badRequest("'category' wajib diisi (maks 60 karakter)");
  if (!Number.isInteger(price) || price <= 0)
    throw badRequest("'price_idr' wajib berupa bilangan bulat positif (rupiah)");
  if (!imageUrl || imageUrl.length > 500)
    throw badRequest("'image_url' wajib diisi (maks 500 karakter)");

  return {
    name,
    slug: slugify(name),
    description,
    category,
    badge,
    price_idr: price,
    image_url: imageUrl,
  };
}

// GET /api/products?category=&available=
router.get("/", async (req, res) => {
  const conditions = [];
  const params = [];

  if (req.query.category) {
    conditions.push("category = ?");
    params.push(String(req.query.category));
  }
  if (req.query.available !== undefined) {
    conditions.push("is_available = ?");
    params.push(req.query.available === "true" ? 1 : 0);
  }

  const where = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await db.query(`SELECT ${COLUMNS} FROM products${where} ORDER BY id`, params);
  res.json({ data: rows });
});

// GET /api/products/categories — daftar kategori unik beserta jumlah produknya
router.get("/categories", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT category, COUNT(*) AS product_count FROM products WHERE is_available = 1 GROUP BY category ORDER BY category"
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw badRequest("'id' wajib berupa angka positif");
    }

    const [rows] = await db.query(`SELECT ${COLUMNS} FROM products WHERE id = ?`, [id]);
    if (rows.length === 0) throw notFound("Product", id);

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/products
router.post("/", async (req, res, next) => {
  try {
    const p = parseProductBody(req.body);

    const [result] = await db.query(
      `INSERT INTO products (name, slug, description, category, badge, price_idr, image_url, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [p.name, p.slug, p.description, p.category, p.badge, p.price_idr, p.image_url]
    );

    const [rows] = await db.query(`SELECT ${COLUMNS} FROM products WHERE id = ?`, [
      result.insertId,
    ]);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id — update penuh
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw badRequest("'id' wajib berupa angka positif");
    }

    const p = parseProductBody(req.body);
    const [result] = await db.query(
      `UPDATE products
       SET name = ?, slug = ?, description = ?, category = ?, badge = ?, price_idr = ?, image_url = ?
       WHERE id = ?`,
      [p.name, p.slug, p.description, p.category, p.badge, p.price_idr, p.image_url, id]
    );
    if (result.affectedRows === 0) throw notFound("Product", id);

    const [rows] = await db.query(`SELECT ${COLUMNS} FROM products WHERE id = ?`, [id]);
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/availability — ganti status tersedia/habis
router.patch("/:id/availability", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw badRequest("'id' wajib berupa angka positif");
    }
    if (typeof req.body?.is_available !== "boolean") {
      throw badRequest("'is_available' wajib berupa boolean");
    }

    const [result] = await db.query("UPDATE products SET is_available = ? WHERE id = ?", [
      req.body.is_available ? 1 : 0,
      id,
    ]);
    if (result.affectedRows === 0) throw notFound("Product", id);

    const [rows] = await db.query(`SELECT ${COLUMNS} FROM products WHERE id = ?`, [id]);
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw badRequest("'id' wajib berupa angka positif");
    }

    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
    if (result.affectedRows === 0) throw notFound("Product", id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
