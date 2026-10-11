-- Time Stop no longer makes frozen beings invulnerable. Campaigns copy the world bible and skill
-- descriptions when they are created, so rewrite the old rule in existing Aldermere saves. Exact
-- matches only: a save already updated (or edited by hand) is left alone.
UPDATE "campaigns"
SET "world_bible" = replace(
  "world_bible",
  '- **Frozen beings are as hard as stone.** The character cannot cut, stab, or move a frozen person or animal, and cannot harm them in any way. They can only move unattended objects and themselves: step out of the way, take the key off the hook, put the knife on the floor, move the rope.',
  '- **Frozen beings can be harmed.** The character can strike, cut, or move a frozen person or animal, and every blow lands at once when time resumes. They can also move objects and themselves: step out of the way, take the key off the hook, put the knife on the floor, move the rope. The limit is the duration and the stamina it burns, so a Lv1 stop buys one or two blows, not a fight.'
)
WHERE position('- **Frozen beings are as hard as stone.**' in "world_bible") > 0;
--> statement-breakpoint
UPDATE "skills"
SET "description" = replace(
  "description",
  'frozen beings are hard as stone and cannot be harmed, only moved around.',
  'frozen beings can be struck, and every blow lands at once when time resumes.'
)
WHERE lower("name") = 'time stop'
  AND position('frozen beings are hard as stone and cannot be harmed, only moved around.' in "description") > 0;
