ALTER TABLE "campaigns" ADD COLUMN "map_art" text;--> statement-breakpoint
-- Campaigns already started from The Empty Crown get its drawn map of the Reach and the kingdoms around it.
UPDATE "campaigns" SET "map_art" = 'empty-crown' WHERE "map_art" IS NULL AND "world_bible" LIKE '# The Empty Crown%';
