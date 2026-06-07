-- Dateien können direkt einem Bereich zugeordnet werden (ohne Gruppe)
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES download_sections(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_downloads_section ON downloads(section_id);
