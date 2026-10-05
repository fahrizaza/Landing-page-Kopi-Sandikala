const express = require("express");
const { notFound, badRequest } = require("../errors");
const db = require("../db");

const router = express.Router();

const COLUMNS = "id, name, role, quote, rating, is_published, created_at, updated_at";

function parseTestimonialBody(body) {
  if (typeof body !== "object" || body === null) {
    throw badRequest("Body request wajib berupa JSON objek");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const quote = typeof body.quote === "string" ? body.quote.trim() : "";
  const rating = Number(body.rating);

  if (!name || name.length > 80) throw badRequest("'name' wajib diisi (maks 80 karakter)");
  if (!role || role.length > 60) throw badRequest("'role' wajib diisi (maks 60 karakter)");
  if (!quote || quote.length > 500)
    throw badRequest("'quote' wajib diisi (maks 500 karakter)");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    throw badRequest("'rating' wajib bilangan bulat 1 sampai 5");

  return { name, role, quote, rating };
}

// GET /api/testimonials — hanya yang published (untuk landing page)
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT ${COLUMNS} FROM testimonials WHERE is_published = 1 ORDER BY id`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/testimonials — testimoni baru masuk sebagai draft (is_published = 0)
router.post("/", async (req, res, next) => {
  try {
    const t = parseTestimonialBody(req.body);

    const [result] = await db.query(
      "INSERT INTO testimonials (name, role, quote, rating, is_published) VALUES (?, ?, ?, ?, 0)",
      [t.name, t.role, t.quote, t.rating]
    );

    const [rows] = await db.query(`SELECT ${COLUMNS} FROM testimonials WHERE id = ?`, [
      result.insertId,
    ]);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/testimonials/:id/publish — terbitkan atau sembunyikan
router.patch("/:id/publish", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw badRequest("'id' wajib berupa angka positif");
    }
    if (typeof req.body?.is_published !== "boolean") {
      throw badRequest("'is_published' wajib berupa boolean");
    }

    const [result] = await db.query(
      "UPDATE testimonials SET is_published = ? WHERE id = ?",
      [req.body.is_published ? 1 : 0, id]
    );
    if (result.affectedRows === 0) throw notFound("Testimonial", id);

    const [rows] = await db.query(`SELECT ${COLUMNS} FROM testimonials WHERE id = ?`, [id]);
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/testimonials/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw badRequest("'id' wajib berupa angka positif");
    }

    const [result] = await db.query("DELETE FROM testimonials WHERE id = ?", [id]);
    if (result.affectedRows === 0) throw notFound("Testimonial", id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
