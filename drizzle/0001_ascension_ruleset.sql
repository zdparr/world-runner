ALTER TABLE "campaigns" ADD COLUMN "ruleset" text DEFAULT 'classic' NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "game_day" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "missions" ADD COLUMN "recurrence" text;--> statement-breakpoint
ALTER TABLE "missions" ADD COLUMN "penalty" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "player_character" ADD COLUMN "attributes" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "player_character" ADD COLUMN "unspent_stat_points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_ruleset_valid" CHECK (ruleset IN ('classic', 'ascension'));--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_game_day_positive" CHECK (game_day >= 1);--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_recurrence_valid" CHECK (recurrence IS NULL OR recurrence IN ('daily'));--> statement-breakpoint
ALTER TABLE "player_character" ADD CONSTRAINT "player_stat_points_nonnegative" CHECK (unspent_stat_points >= 0);