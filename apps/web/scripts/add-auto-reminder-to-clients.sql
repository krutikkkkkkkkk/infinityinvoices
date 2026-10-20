-- Add auto_reminder column to clients table
-- Default is FALSE so reminders are opt-in per client

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS auto_reminder BOOLEAN NOT NULL DEFAULT FALSE;
