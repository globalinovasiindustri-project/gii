ALTER TABLE "orders" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancellation_reason" text;