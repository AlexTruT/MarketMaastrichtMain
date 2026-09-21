-- Optional: post-pick settled unit price for ranged order lines.
-- Run in the Supabase SQL editor if your DB was created before this column
-- existed in supabase.sql. Safe to re-run (IF NOT EXISTS).

ALTER TABLE IF EXISTS order_items
  ADD COLUMN IF NOT EXISTS actual_unit_cents int;

-- Enforce non-negative when set (Postgres ignores IF NOT EXISTS on constraints).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_actual_unit_cents_check'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT order_items_actual_unit_cents_check
      CHECK (actual_unit_cents IS NULL OR actual_unit_cents >= 0);
  END IF;
END $$;

COMMENT ON COLUMN order_items.actual_unit_cents IS
  'Settled unit price in cents after picking a ranged item; null until set.';
