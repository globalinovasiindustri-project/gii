-- Add Midtrans order ID and Snap token fields to orders table
-- These fields support payment retry functionality by tracking Midtrans-specific identifiers

ALTER TABLE "orders" ADD COLUMN "midtrans_order_id" text;
ALTER TABLE "orders" ADD COLUMN "snap_token" text;

-- Create index on midtrans_order_id for fast webhook lookups
CREATE INDEX IF NOT EXISTS "order_midtrans_order_id_idx" ON "orders" ("midtrans_order_id");
