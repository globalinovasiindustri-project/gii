CREATE TABLE "app_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hero_images" text,
	"contact_phone" text NOT NULL,
	"contact_email" text NOT NULL,
	"social_twitter" text,
	"social_facebook" text,
	"social_instagram" text,
	"social_tiktok" text,
	"social_whatsapp" text,
	"shipping_origin_address" text NOT NULL,
	"shipping_origin_city" text NOT NULL,
	"shipping_origin_province" text NOT NULL,
	"shipping_origin_postal_code" text NOT NULL,
	"tax_enabled" boolean DEFAULT false NOT NULL,
	"tax_percentage" integer DEFAULT 11 NOT NULL,
	"pending_order_time_limit_hours" integer DEFAULT 24 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "midtrans_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "snap_token" text;--> statement-breakpoint
CREATE INDEX "order_midtrans_order_id_idx" ON "orders" USING btree ("midtrans_order_id");