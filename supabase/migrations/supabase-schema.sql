-- ============================================================
-- ALUFEFA Downloadcenter — Supabase Datenbankschema
-- Dieses SQL in Supabase unter SQL Editor ausführen
-- ============================================================

-- 1. Hersteller
CREATE TABLE IF NOT EXISTS manufacturers (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Produktarten
CREATE TABLE IF NOT EXISTS product_types (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturer_id   UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL,
  image_url         TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manufacturer_id, slug)
);

-- 3. Downloads
CREATE TABLE IF NOT EXISTS downloads (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_type_id  UUID NOT NULL REFERENCES product_types(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  file_url         TEXT NOT NULL,
  file_type        TEXT NOT NULL DEFAULT 'PDF',
  file_size        TEXT NOT NULL DEFAULT '0 MB',
  version          TEXT NOT NULL DEFAULT '1.0',
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 4. Download-Protokoll (Audit-Log)
CREATE TABLE IF NOT EXISTS download_logs (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           TEXT NOT NULL,
  user_email        TEXT NOT NULL DEFAULT '',
  download_id       UUID REFERENCES downloads(id) ON DELETE SET NULL,
  download_name     TEXT NOT NULL,
  manufacturer_name TEXT NOT NULL DEFAULT '',
  product_name      TEXT NOT NULL DEFAULT '',
  downloaded_at     TIMESTAMPTZ DEFAULT now()
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_product_types_manufacturer_id ON product_types(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_downloads_product_type_id ON downloads(product_type_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_user_id ON download_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_downloaded_at ON download_logs(downloaded_at DESC);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE manufacturers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types    ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs    ENABLE ROW LEVEL SECURITY;

-- Öffentlicher Lesezugriff auf Katalogdaten
CREATE POLICY "Public read manufacturers"
  ON manufacturers FOR SELECT USING (true);

CREATE POLICY "Public read product_types"
  ON product_types FOR SELECT USING (true);

CREATE POLICY "Public read downloads"
  ON downloads FOR SELECT USING (true);

-- Download-Logs: nur Lesen über Service-Role (kein öffentlicher Zugriff)
-- Alle Schreiboperationen laufen über Service-Role-Key im Server

-- ============================================================
-- Fertig! Jetzt .env.local ausfüllen und die App starten.
-- ============================================================
