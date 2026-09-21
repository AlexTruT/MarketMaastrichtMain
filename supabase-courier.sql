-- ====================================================================
-- Merret (Market Maastricht): Courier Service Schema Extensions
-- Run this in Supabase SQL editor to enable courier features.
-- ====================================================================

-- 1. Extend orders table with courier assignment, clustering and proof-of-drop
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS assigned_courier_id TEXT,
  ADD COLUMN IF NOT EXISTS cluster_zone TEXT DEFAULT 'centrum_wyck',
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS proof_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS proof_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS proof_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS proof_captured_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS doorstep_notes TEXT;

-- 2. Courier Shifts & Earnings table for Student Couriers
CREATE TABLE IF NOT EXISTS courier_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id TEXT NOT NULL,
  courier_name TEXT NOT NULL,
  clock_in TIMESTAMPTZ NOT NULL DEFAULT now(),
  clock_out TIMESTAMPTZ,
  completed_drops INT DEFAULT 0,
  base_hourly_cents INT DEFAULT 1500, -- €15.00/hour
  drop_bonus_cents INT DEFAULT 400,   -- €4.00/drop
  total_earned_cents INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast courier polling and cluster batch queries
CREATE INDEX IF NOT EXISTS idx_orders_courier_status ON orders (status, cluster_zone);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_courier ON orders (assigned_courier_id, status);

