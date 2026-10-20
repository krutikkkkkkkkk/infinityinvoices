-- Add financial_year_start to profiles table
-- Stores the month number (1-12) when the financial year starts
-- Default: 4 (April) — common for India
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS financial_year_start integer NOT NULL DEFAULT 4
    CHECK (financial_year_start BETWEEN 1 AND 12);
