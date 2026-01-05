ALTER TABLE "addresses" DROP COLUMN IF EXISTS "province_id";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN IF EXISTS "city_id";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN IF EXISTS "district_id";--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "province_code" text;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "regency_code" text;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "district_code" text;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "village_code" text;
