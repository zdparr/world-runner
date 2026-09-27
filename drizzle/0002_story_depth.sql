ALTER TABLE "campaigns" ADD COLUMN "story_notes" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "narration_length" text DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_narration_length_valid" CHECK (narration_length IN ('brief', 'standard', 'rich'));