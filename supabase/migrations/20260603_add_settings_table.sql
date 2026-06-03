-- Settings-Tabelle für Admin-Konfiguration
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Standard-Wert für Benachrichtigungs-E-Mail
INSERT INTO settings (key, value)
VALUES ('notification_email', '')
ON CONFLICT (key) DO NOTHING;

-- RLS: Nur Service-Role darf lesen/schreiben
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only" ON settings
  USING (auth.role() = 'service_role');
