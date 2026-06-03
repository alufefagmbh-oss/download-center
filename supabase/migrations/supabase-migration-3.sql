-- Migration 3: Telefon und Position in Download-Logs
ALTER TABLE download_logs
  ADD COLUMN IF NOT EXISTS user_phone    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS user_position TEXT NOT NULL DEFAULT '';
