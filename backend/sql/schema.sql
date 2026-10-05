-- ============================================================
-- Skema database Kopi Sandikala
-- Harga disimpan sebagai bilangan bulat rupiah (bukan float).
-- ============================================================

CREATE DATABASE IF NOT EXISTS sandikala
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sandikala;

CREATE TABLE IF NOT EXISTS products (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120)  NOT NULL,
  slug         VARCHAR(140)  NOT NULL,
  description  VARCHAR(500)  NOT NULL,
  category     VARCHAR(60)   NOT NULL,
  badge        VARCHAR(40)   NULL,
  price_idr    INT UNSIGNED  NOT NULL,
  image_url    VARCHAR(500)  NOT NULL,
  is_available TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_products_slug (slug),
  KEY ix_products_category (category, is_available)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS testimonials (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(80)   NOT NULL,
  role         VARCHAR(60)   NOT NULL,
  quote        VARCHAR(500)  NOT NULL,
  rating       TINYINT UNSIGNED NOT NULL,
  is_published TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT ck_testimonials_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE = InnoDB;

-- ============================================================
-- Data awal diambil dari konten statis landing page
-- ============================================================

INSERT INTO products (name, slug, description, category, badge, price_idr, image_url, is_available)
VALUES
  ('Kenangan Mantan', 'kenangan-mantan',
   'Kopi susu dengan rasa khas yang selalu bikin kangen.',
   'Signature', 'Best Seller', 18000,
   'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=85&w=700&auto=format&fit=crop', 1),
  ('Avocado Coffee', 'avocado-coffee',
   'Perpaduan alpukat segar dan kopi yang creamy.',
   'Creamy', NULL, 22000,
   'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=85&w=700&auto=format&fit=crop', 1),
  ('Americano', 'americano',
   'Kopi hitam dengan rasa bold yang autentik.',
   'Classic', NULL, 15000,
   'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=85&w=700&auto=format&fit=crop', 1),
  ('Choco Creamy', 'choco-creamy',
   'Cokelat premium dengan tekstur lembut dan creamy.',
   'Non Coffee', NULL, 20000,
   'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=85&w=700&auto=format&fit=crop', 1)
AS new
ON DUPLICATE KEY UPDATE
  description = new.description,
  category    = new.category,
  badge       = new.badge,
  price_idr   = new.price_idr,
  image_url   = new.image_url,
  is_available = new.is_available;

INSERT INTO testimonials (name, role, quote, rating, is_published)
VALUES
  ('Sarah A.', 'Coffee Lover',
   'Rasanya selalu konsisten. Kopi Kenangan jadi teman yang pas buat mulai hari.', 5, 1),
  ('Rizky R.', 'Customer',
   'Pilihan menunya banyak, rasanya enak dan harganya masih cocok di kantong.', 5, 1),
  ('Nabila S.', 'Customer',
   'Tempatnya nyaman, kopinya enak, cocok buat kerja atau santai.', 5, 1)
AS new
ON DUPLICATE KEY UPDATE
  role   = new.role,
  quote  = new.quote,
  rating = new.rating,
  is_published = new.is_published;
