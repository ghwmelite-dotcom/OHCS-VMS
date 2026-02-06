-- Migration 002: WhatsApp Bot Integration
-- Adds WhatsApp-specific columns to pre_registrations and message log table

ALTER TABLE pre_registrations ADD COLUMN qr_token TEXT;
ALTER TABLE pre_registrations ADD COLUMN whatsapp_phone TEXT;
ALTER TABLE pre_registrations ADD COLUMN decline_reason TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_prereg_qr_token ON pre_registrations(qr_token) WHERE qr_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prereg_wa_phone ON pre_registrations(whatsapp_phone);

CREATE TABLE IF NOT EXISTS wa_message_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  direction TEXT NOT NULL CHECK(direction IN ('inbound', 'outbound')),
  wa_phone TEXT NOT NULL,
  wa_message_id TEXT,
  message_type TEXT,
  content TEXT,
  pre_registration_id INTEGER REFERENCES pre_registrations(id),
  status TEXT DEFAULT 'sent',
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
