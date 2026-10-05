// Seed data awal — dijalankan via npm run seed (lihat README)
const db = require("../src/db");

const products = [
  {
    name: "Kenangan Mantan",
    slug: "kenangan-mantan",
    description: "Kopi susu dengan rasa khas yang selalu bikin kangen.",
    category: "Signature",
    badge: "Best Seller",
    price_idr: 18000,
    image_url:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=85&w=700&auto=format&fit=crop",
  },
  {
    name: "Avocado Coffee",
    slug: "avocado-coffee",
    description: "Perpaduan alpukat segar dan kopi yang creamy.",
    category: "Non Coffee",
    badge: null,
    price_idr: 22000,
    image_url:
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=85&w=700&auto=format&fit=crop",
  },
  {
    name: "Americano",
    slug: "americano",
    description: "Kopi hitam dengan rasa bold yang autentik.",
    category: "Classic",
    badge: null,
    price_idr: 15000,
    image_url:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=85&w=700&auto=format&fit=crop",
  },
  {
    name: "Choco Creamy",
    slug: "choco-creamy",
    description: "Cokelat premium dengan tekstur lembut dan creamy.",
    category: "Non Coffee",
    badge: null,
    price_idr: 20000,
    image_url:
      "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=85&w=700&auto=format&fit=crop",
  },
];

const testimonials = [
  {
    name: "Sarah A.",
    role: "Coffee Lover",
    quote: "Rasanya selalu konsisten. Kopi Kenangan jadi teman yang pas buat mulai hari.",
    rating: 5,
  },
  {
    name: "Rizky R.",
    role: "Customer",
    quote: "Pilihan menunya banyak, rasanya enak dan harganya masih cocok di kantong.",
    rating: 5,
  },
  {
    name: "Nabila S.",
    role: "Customer",
    quote: "Tempatnya nyaman, kopinya enak, cocok buat kerja atau santai.",
    rating: 5,
  },
];

(async () => {
  try {
    for (const p of products) {
      await db.query(
        `INSERT INTO products (name, slug, description, category, badge, price_idr, image_url, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE slug = slug`,
        [p.name, p.slug, p.description, p.category, p.badge, p.price_idr, p.image_url]
      );
    }

    for (const t of testimonials) {
      await db.query(
        `INSERT INTO testimonials (name, role, quote, rating, is_published)
         VALUES (?, ?, ?, ?, 1)`,
        [t.name, t.role, t.quote, t.rating]
      );
    }

    console.log("[seed] Selesai: 4 produk + 3 testimoni dimasukkan.");
    process.exit(0);
  } catch (err) {
    console.error("[seed] Gagal:", err.message);
    process.exit(1);
  }
})();
