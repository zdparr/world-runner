ALTER TABLE "inventory_items" ADD COLUMN "grade" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "usage" text DEFAULT 'worn' NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "enhances" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_grade_range" CHECK (grade BETWEEN 0 AND 7);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_usage_valid" CHECK (usage IN ('worn', 'wielded'));