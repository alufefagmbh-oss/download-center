-- ============================================================
-- Migration 2: Kategorien, Dateinamen, erweiterte Log-Felder
-- Dieses SQL in Supabase unter SQL Editor ausführen
-- ============================================================

-- Kategorie-Spalte für Hersteller
ALTER TABLE manufacturers
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'sonstige'
  CHECK (category IN ('alufefa', 'partner', 'sonstige'));

-- Originaler Dateiname für Downloads
ALTER TABLE downloads
  ADD COLUMN IF NOT EXISTS original_filename TEXT NOT NULL DEFAULT '';

-- Erweiterte Benutzerfelder für Download-Logs
ALTER TABLE download_logs
  ADD COLUMN IF NOT EXISTS user_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS user_company TEXT NOT NULL DEFAULT '';

-- Index für Firmen-Filter
CREATE INDEX IF NOT EXISTS idx_download_logs_user_company ON download_logs(user_company);
CREATE INDEX IF NOT EXISTS idx_download_logs_user_email ON download_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_manufacturers_category ON manufacturers(category);
