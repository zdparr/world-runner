CREATE TYPE "public"."message_role" AS ENUM('player', 'narrator');--> statement-breakpoint
CREATE TYPE "public"."mission_status" AS ENUM('offered', 'active', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"world_bible" text DEFAULT '' NOT NULL,
	"narrator_style" text DEFAULT '' NOT NULL,
	"rolling_summary" text DEFAULT '' NOT NULL,
	"currency_name" text DEFAULT 'gold' NOT NULL,
	"turn_count" integer DEFAULT 0 NOT NULL,
	"history_window" integer DEFAULT 8 NOT NULL,
	"summary_interval" integer DEFAULT 10 NOT NULL,
	"rng_seed" integer DEFAULT floor(random() * 2147483647)::int NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"equipped" boolean DEFAULT false NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_quantity_positive" CHECK (quantity > 0)
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"parent_location_id" uuid,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lore_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"keywords" text[] DEFAULT '{}'::text[] NOT NULL,
	"always_include" boolean DEFAULT false NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(body, '')), 'B')) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"campaign_id" uuid NOT NULL,
	"turn_number" integer NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"summarized" boolean DEFAULT false NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"giver_npc_id" uuid,
	"status" "mission_status" DEFAULT 'offered' NOT NULL,
	"objectives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rewards" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"rewards_granted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "npcs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"name" text NOT NULL,
	"short_description" text DEFAULT '' NOT NULL,
	"faction" text DEFAULT '' NOT NULL,
	"location_id" uuid,
	"alive" boolean DEFAULT true NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_character" (
	"campaign_id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"archetype" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"current_location_id" uuid,
	"money" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"hp" integer DEFAULT 10 NOT NULL,
	"max_hp" integer DEFAULT 10 NOT NULL,
	"status_effects" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_money_nonnegative" CHECK (money >= 0),
	CONSTRAINT "player_level_positive" CHECK (level >= 1),
	CONSTRAINT "player_xp_nonnegative" CHECK (xp >= 0),
	CONSTRAINT "player_hp_range" CHECK (hp >= 0 AND max_hp > 0 AND hp <= max_hp)
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"npc_id" uuid NOT NULL,
	"affinity" integer DEFAULT 0 NOT NULL,
	"trust" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'stranger' NOT NULL,
	"history_notes" text DEFAULT '' NOT NULL,
	"notes_since_condense" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "relationships_npcId_unique" UNIQUE("npc_id"),
	CONSTRAINT "relationships_affinity_range" CHECK (affinity BETWEEN -100 AND 100),
	CONSTRAINT "relationships_trust_range" CHECK (trust BETWEEN -100 AND 100)
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"name" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_level_nonnegative" CHECK (level >= 0),
	CONSTRAINT "skills_xp_nonnegative" CHECK (xp >= 0)
);
--> statement-breakpoint
CREATE TABLE "state_events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "state_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"campaign_id" uuid NOT NULL,
	"turn_number" integer NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"human_readable" text NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', human_readable)) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "turn_debug" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "turn_debug_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"campaign_id" uuid NOT NULL,
	"turn_number" integer NOT NULL,
	"model" text DEFAULT '' NOT NULL,
	"context_manifest" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tool_calls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cache_read_tokens" integer DEFAULT 0 NOT NULL,
	"cache_creation_tokens" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_parent_location_id_locations_id_fk" FOREIGN KEY ("parent_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lore_entries" ADD CONSTRAINT "lore_entries_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_giver_npc_id_npcs_id_fk" FOREIGN KEY ("giver_npc_id") REFERENCES "public"."npcs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npcs" ADD CONSTRAINT "npcs_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npcs" ADD CONSTRAINT "npcs_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_character" ADD CONSTRAINT "player_character_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_character" ADD CONSTRAINT "player_character_current_location_id_locations_id_fk" FOREIGN KEY ("current_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_npc_id_npcs_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."npcs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "state_events" ADD CONSTRAINT "state_events_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turn_debug" ADD CONSTRAINT "turn_debug_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_campaign_name_uq" ON "inventory_items" USING btree ("campaign_id",lower(name));--> statement-breakpoint
CREATE INDEX "inventory_tags_gin" ON "inventory_items" USING gin ("tags");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_campaign_name_uq" ON "locations" USING btree ("campaign_id",lower(name));--> statement-breakpoint
CREATE INDEX "lore_campaign_idx" ON "lore_entries" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "lore_keywords_gin" ON "lore_entries" USING gin ("keywords");--> statement-breakpoint
CREATE INDEX "lore_search_gin" ON "lore_entries" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "messages_campaign_turn_idx" ON "messages" USING btree ("campaign_id","turn_number");--> statement-breakpoint
CREATE INDEX "messages_search_gin" ON "messages" USING gin ("search_vector");--> statement-breakpoint
CREATE UNIQUE INDEX "missions_campaign_title_uq" ON "missions" USING btree ("campaign_id",lower(title));--> statement-breakpoint
CREATE UNIQUE INDEX "npcs_campaign_name_uq" ON "npcs" USING btree ("campaign_id",lower(name));--> statement-breakpoint
CREATE INDEX "relationships_campaign_idx" ON "relationships" USING btree ("campaign_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_campaign_name_uq" ON "skills" USING btree ("campaign_id",lower(name));--> statement-breakpoint
CREATE INDEX "state_events_campaign_turn_idx" ON "state_events" USING btree ("campaign_id","turn_number");--> statement-breakpoint
CREATE INDEX "state_events_search_gin" ON "state_events" USING gin ("search_vector");--> statement-breakpoint
CREATE UNIQUE INDEX "turn_debug_campaign_turn_uq" ON "turn_debug" USING btree ("campaign_id","turn_number");