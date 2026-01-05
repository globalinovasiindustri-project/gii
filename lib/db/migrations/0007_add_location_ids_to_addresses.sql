-- Add RajaOngkir location ID columns to addresses table
-- These columns are nullable for backward compatibility with existing addresses

ALTER TABLE "addresses" ADD COLUMN "province_id" integer;
ALTER TABLE "addresses" ADD COLUMN "city_id" integer;
ALTER TABLE "addresses" ADD COLUMN "district_id" integer;
