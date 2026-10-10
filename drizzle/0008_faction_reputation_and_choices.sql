ALTER TABLE "campaigns" ADD COLUMN "reputation" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "choices" jsonb DEFAULT '[]'::jsonb NOT NULL;