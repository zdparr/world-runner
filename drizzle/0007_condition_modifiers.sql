-- Conditions now carry dice modifiers. Give the seeded ones theirs in existing campaigns; the narrator
-- is asked to review any other condition that predates modifiers.
UPDATE "player_character" SET "status_effects" = (
  SELECT jsonb_agg(
    CASE
      WHEN e ? 'modifiers' THEN e
      WHEN e->>'name' = 'Cracked Ribs' THEN e || '{"modifiers":[{"target":"strength","bonus":-2},{"target":"agility","bonus":-1}]}'::jsonb
      WHEN e->>'name' = 'Protocol Deficit' THEN e || '{"modifiers":[{"target":"strength","bonus":-2},{"target":"agility","bonus":-2},{"target":"vitality","bonus":-2}]}'::jsonb
      WHEN e->>'name' = 'Goddess''s Disfavor' THEN e || '{"modifiers":[{"target":"all","bonus":-2}]}'::jsonb
      ELSE e
    END
    ORDER BY ord
  )
  FROM jsonb_array_elements("status_effects") WITH ORDINALITY AS t(e, ord)
)
WHERE "status_effects" @> '[{"name":"Cracked Ribs"}]'
   OR "status_effects" @> '[{"name":"Protocol Deficit"}]'
   OR "status_effects" @> '[{"name":"Goddess''s Disfavor"}]';
--> statement-breakpoint
UPDATE "missions"
SET "penalty" = jsonb_set("penalty", '{statusEffect,modifiers}', '[{"target":"strength","bonus":-2},{"target":"agility","bonus":-2},{"target":"vitality","bonus":-2}]'::jsonb)
WHERE "penalty"->'statusEffect'->>'name' = 'Protocol Deficit' AND NOT ("penalty"->'statusEffect' ? 'modifiers');
--> statement-breakpoint
UPDATE "missions"
SET "penalty" = jsonb_set("penalty", '{statusEffect,modifiers}', '[{"target":"all","bonus":-2}]'::jsonb)
WHERE "penalty"->'statusEffect'->>'name' = 'Goddess''s Disfavor' AND NOT ("penalty"->'statusEffect' ? 'modifiers');
