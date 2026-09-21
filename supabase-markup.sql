-- Online / service markup on grocery subtotals (15%), separate from fulfilment fee.
-- Run in the Supabase SQL editor if your DB was created before these columns
-- existed in supabase.sql. Safe to re-run (IF NOT EXISTS).

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS markup_min_cents int not null default 0;

ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS markup_max_cents int not null default 0;

COMMENT ON COLUMN orders.markup_min_cents IS
  '15% online markup in cents on subtotal_min at order time; separate from fee_cents.';
COMMENT ON COLUMN orders.markup_max_cents IS
  '15% online markup in cents on subtotal_max at order time; separate from fee_cents.';

-- Backfill markup from stored substotals (nearest cent, same as Math.round).
UPDATE orders SET
  markup_min_cents = round(subtotal_min_cents * 0.15)::int,
  markup_max_cents = round(subtotal_max_cents * 0.15)::int
WHERE markup_min_cents = 0
  AND markup_max_cents = 0
  AND (subtotal_min_cents > 0 OR subtotal_max_cents > 0);

-- Align demo fulfilment fees with current pricing (home €4.50 / pickup free).
-- Only touches the known seed fee amounts; leave other rows alone.
UPDATE orders SET fee_cents = 450 WHERE fee_cents = 595 AND fulfilment = 'home';
UPDATE orders SET fee_cents = 0 WHERE fee_cents = 195 AND fulfilment = 'pickup';
