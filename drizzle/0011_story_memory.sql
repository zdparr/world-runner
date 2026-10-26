CREATE TABLE "extraction_runs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "extraction_runs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"campaign_id" uuid NOT NULL,
	"turn_number" integer NOT NULL,
	"message_id" bigint NOT NULL,
	"status" text NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"model" text DEFAULT '' NOT NULL,
	"output" jsonb,
	"applied" jsonb,
	"error" text DEFAULT '' NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "extraction_runs_status_valid" CHECK (status IN ('applied', 'failed', 'stale'))
);
--> statement-breakpoint
CREATE TABLE "story_event_entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"npc_id" uuid,
	"location_id" uuid,
	CONSTRAINT "story_event_entities_one_target" CHECK (num_nonnulls(npc_id, location_id) = 1)
);
--> statement-breakpoint
CREATE TABLE "story_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"turn_number" integer NOT NULL,
	"type" text NOT NULL,
	"summary" text NOT NULL,
	"importance" integer DEFAULT 2 NOT NULL,
	"immutable" boolean DEFAULT false NOT NULL,
	"superseded_by" uuid,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', summary)) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "story_events_importance_range" CHECK (importance BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "story_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"summary" text NOT NULL,
	"importance" integer DEFAULT 2 NOT NULL,
	"npc_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"opened_turn" integer NOT NULL,
	"resolved_turn" integer,
	"resolution" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "story_threads_importance_range" CHECK (importance BETWEEN 1 AND 5)
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "scene" jsonb;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "current_state" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "npcs" ADD COLUMN "aliases" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "npcs" ADD COLUMN "title" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "npcs" ADD COLUMN "role" text DEFAULT 'minor' NOT NULL;--> statement-breakpoint
ALTER TABLE "npcs" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "npcs" ADD COLUMN "appearance" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "npcs" ADD COLUMN "personality" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "npcs" ADD COLUMN "goals" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "turn_debug" ADD COLUMN "prompt" jsonb;--> statement-breakpoint
ALTER TABLE "extraction_runs" ADD CONSTRAINT "extraction_runs_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_event_entities" ADD CONSTRAINT "story_event_entities_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_event_entities" ADD CONSTRAINT "story_event_entities_event_id_story_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."story_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_event_entities" ADD CONSTRAINT "story_event_entities_npc_id_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_event_entities" ADD CONSTRAINT "story_event_entities_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_events" ADD CONSTRAINT "story_events_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_events" ADD CONSTRAINT "story_events_superseded_by_story_events_id_fk" FOREIGN KEY ("superseded_by") REFERENCES "public"."story_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_threads" ADD CONSTRAINT "story_threads_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "extraction_runs_campaign_turn_uq" ON "extraction_runs" USING btree ("campaign_id","turn_number");--> statement-breakpoint
CREATE INDEX "story_event_entities_event_idx" ON "story_event_entities" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "story_event_entities_npc_idx" ON "story_event_entities" USING btree ("npc_id");--> statement-breakpoint
CREATE INDEX "story_event_entities_location_idx" ON "story_event_entities" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "story_events_campaign_turn_idx" ON "story_events" USING btree ("campaign_id","turn_number");--> statement-breakpoint
CREATE INDEX "story_events_search_gin" ON "story_events" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "story_threads_campaign_idx" ON "story_threads" USING btree ("campaign_id");--> statement-breakpoint
ALTER TABLE "npcs" ADD CONSTRAINT "npcs_role_valid" CHECK (role IN ('major', 'minor'));--> statement-breakpoint
ALTER TABLE "npcs" ADD CONSTRAINT "npcs_status_valid" CHECK (status IN ('active', 'missing', 'imprisoned', 'departed', 'unknown'));