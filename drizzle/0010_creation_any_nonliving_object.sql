-- Creation can now make any non-living object, coin included, and nothing it makes fades or needs
-- anchoring; only living things stay prohibited. Campaigns copy the world bible, skill descriptions,
-- NPC notes, and the pending choice when they are created, so rewrite the old rules in existing
-- Aldermere saves. Exact matches only: anything already updated or edited by hand is left alone.
UPDATE "campaigns"
SET "world_bible" = replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    "world_bible",
    '| Lv | What can be made | Lasts |',
    '| Lv | Small (a nail, a cup, a coin) | Large (a sword, a lock, a cart, a purse of crowns) | Huge (a house, a bridge, a ship) |'
  ),
    '| 1 | small, simple, single-material objects: a nail, a cup, a dagger blade | about an hour |',
    '| 1 | a minute; Mana-Drained (all -1, 3 turns) | an hour of focus; Mana-Drained (all -3, 10 turns) and some HP | days, built in stages, each one draining |'
  ),
    '| 2-3 | hand tools, a plain sword, a rope | a few hours |',
    '| 2-3 | seconds; no drain | ten minutes; Mana-Drained (all -2, 8 turns) | a day of stages |'
  ),
    '| 4-6 | anything with a few parts the character truly understands: a lock, a crossbow | a day |',
    '| 4-6 | a breath | a minute; Mana-Drained (all -1, 5 turns) | hours; Mana-Drained (all -3, 10 turns) |'
  ),
    '| 7-9 | complex mechanisms, a wagon, a small bridge | days |',
    '| 7-9 | instant | seconds; no drain | minutes; Mana-Drained (all -2, 8 turns) |'
  ),
    '| 10 | a building''s worth of material, or one masterwork | a week |',
    '| 10 | instant | instant | a minute; Mana-Drained (all -1, 5 turns) |'
  ),
    '- Limits are mass, complexity, and **understanding**. The character must know how a thing is made; something they only half-understand comes out flawed (a sword that shatters, a lock that sticks). Earth knowledge counts.',
    '- **Anything non-living, at any level.** Any object of any size or complexity, coin included. The level sets how fast it comes and how hard it drains, never what is possible. Casting while already Mana-Drained costs HP (`adjust_hp`) and may knock the character out.'
  ),
    '- Created objects are added with `add_item` tagged "created", with how long they last in the description, and removed with `remove_item` when they fade. **Anchoring** one makes it permanent at a heavy mana cost ("Mana-Drained", all -2 or worse); tag it "anchored".',
    '- **Real and permanent.** Created objects never fade and need no anchoring: add them with `add_item` tagged "created". Created coin is real money (`adjust_money`) and passes for crown-minted, but a flood of it draws the same attention as vault gold: House Marrow''s factors, then the Crown''s tax collectors, then worse.'
  ),
    '- **Living things and currency cannot be created.** Attempting either produces a System warning and nothing else:',
    '- **Living things cannot be created.** Attempting it produces a System warning and nothing else:'
  ),
    '  Prohibited creation: CURRENCY.',
    '  Prohibited creation: LIVING ORGANISM.'
  )
WHERE position('| Lv | What can be made | Lasts |' in "world_bible") > 0
   OR position('| 1 | small, simple, single-material objects: a nail, a cup, a dagger blade | about an hour |' in "world_bible") > 0
   OR position('| 2-3 | hand tools, a plain sword, a rope | a few hours |' in "world_bible") > 0
   OR position('| 4-6 | anything with a few parts the character truly understands: a lock, a crossbow | a day |' in "world_bible") > 0
   OR position('| 7-9 | complex mechanisms, a wagon, a small bridge | days |' in "world_bible") > 0
   OR position('| 10 | a building''s worth of material, or one masterwork | a week |' in "world_bible") > 0
   OR position('- Limits are mass, complexity, and **understanding**. The character must know how a thing is made; something they only half-understand comes out flawed (a sword that shatters, a lock that sticks). Earth knowledge counts.' in "world_bible") > 0
   OR position('- Created objects are added with `add_item` tagged "created", with how long they last in the description, and removed with `remove_item` when they fade. **Anchoring** one makes it permanent at a heavy mana cost ("Mana-Drained", all -2 or worse); tag it "anchored".' in "world_bible") > 0
   OR position('- **Living things and currency cannot be created.** Attempting either produces a System warning and nothing else:' in "world_bible") > 0
   OR position('  Prohibited creation: CURRENCY.' in "world_bible") > 0;
--> statement-breakpoint
UPDATE "campaigns"
SET "choices" = (replace(
    replace(
    replace(
    "choices"::text,
    'Make objects out of mana. Lv1: small, simple things (a nail, a cup, a dagger blade). Limited by mass, complexity, and how well you understand what you make. Creations fade after a while unless anchored at a higher mana cost. Living things and currency cannot be created; trying draws a System warning.',
    'Make any non-living object out of mana, coin included, and it lasts for good. The bigger and more intricate the thing, the harder it drains you; your level decides how fast it comes and how much it costs, not what is possible. Living things cannot be created; trying draws a System warning.'
  ),
    'through the Saltmarsh smugglers who sell his anchored goods.',
    'through the Saltmarsh smugglers who sell his creations.'
  ),
    'he tried to create a coin once; the System warning he got ended',
    'he tried to create a sparrow once; the System warning he got ended'
  ))::jsonb
WHERE position('Make objects out of mana. Lv1: small, simple things (a nail, a cup, a dagger blade). Limited by mass, complexity, and how well you understand what you make. Creations fade after a while unless anchored at a higher mana cost. Living things and currency cannot be created; trying draws a System warning.' in "choices"::text) > 0
   OR position('through the Saltmarsh smugglers who sell his anchored goods.' in "choices"::text) > 0
   OR position('he tried to create a coin once; the System warning he got ended' in "choices"::text) > 0;
--> statement-breakpoint
UPDATE "skills"
SET "description" = replace(
    "description",
    'Make objects out of mana. Lv1: small, simple things (a nail, a cup, a dagger blade). Limited by mass, complexity, and how well you understand what you make. Creations fade after a while unless anchored at a higher mana cost. Living things and currency cannot be created; trying draws a System warning.',
    'Make any non-living object out of mana, coin included, and it lasts for good. The bigger and more intricate the thing, the harder it drains you; your level decides how fast it comes and how much it costs, not what is possible. Living things cannot be created; trying draws a System warning.'
  )
WHERE lower("name") = 'creation' AND (position('Make objects out of mana. Lv1: small, simple things (a nail, a cup, a dagger blade). Limited by mass, complexity, and how well you understand what you make. Creations fade after a while unless anchored at a higher mana cost. Living things and currency cannot be created; trying draws a System warning.' in "description") > 0);
--> statement-breakpoint
UPDATE "npcs"
SET "notes" = replace(
    replace(
    "notes",
    'through the Saltmarsh smugglers who sell his anchored goods.',
    'through the Saltmarsh smugglers who sell his creations.'
  ),
    'he tried to create a coin once; the System warning he got ended',
    'he tried to create a sparrow once; the System warning he got ended'
  )
WHERE "name" = 'Isidore Quill' AND (position('through the Saltmarsh smugglers who sell his anchored goods.' in "notes") > 0
   OR position('he tried to create a coin once; the System warning he got ended' in "notes") > 0);
--> statement-breakpoint
UPDATE "locations"
SET "purpose" = replace(
    "purpose",
    'sells his anchored creations through the Saltmarsh syndicates.',
    'sells his creations through the Saltmarsh syndicates.'
  )
WHERE "name" = 'The Saltmarsh Coast' AND (position('sells his anchored creations through the Saltmarsh syndicates.' in "purpose") > 0);
