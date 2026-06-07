-- ============================================================
-- Migration: Bereiche und Gruppen für Downloads
-- ============================================================

-- Bereiche (Überschriften/Areas)
CREATE TABLE IF NOT EXISTS download_sections (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_type_id UUID NOT NULL REFERENCES product_types(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_download_sections_product ON download_sections(product_type_id);

-- Gruppen (eingeklappte Ordner)
CREATE TABLE IF NOT EXISTS download_groups (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_type_id UUID NOT NULL REFERENCES product_types(id) ON DELETE CASCADE,
  section_id      UUID REFERENCES download_sections(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_download_groups_product ON download_groups(product_type_id);
CREATE INDEX IF NOT EXISTS idx_download_groups_section ON download_groups(section_id);

-- Downloads erweitern
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES download_groups(id) ON DELETE SET NULL;
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_downloads_group ON downloads(group_id);

-- Sort-Order für bestehende Downloads setzen
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY product_type_id ORDER BY created_at, name) - 1 AS rn
  FROM downloads
)
UPDATE downloads d SET sort_order = r.rn FROM ranked r WHERE d.id = r.id;

-- RLS
ALTER TABLE download_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_groups   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read download_sections"
  ON download_sections FOR SELECT USING (true);

CREATE POLICY "Public read download_groups"
  ON download_groups FOR SELECT USING (true);
