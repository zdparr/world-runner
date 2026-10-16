import type { WorldTemplate } from '../world';

// Faction names double as the reputation keys: an NPC whose `faction` matches one acts on the character's standing with it.
const CROWN = 'Crown of Halvane';
const LODGE = "Climbers' Lodge";
const ORDER = 'Order of the Unbroken Stair';
const GILDED = 'Gilded Ascent';

export const spire: WorldTemplate = {
  id: 'spire',
  name: 'The Hundred-Floor Spire',
  description:
    'Tower-climbing action fantasy. You died saving someone and woke before a System that let you pick one power. Then you are dropped at the foot of a white tower that tore out of the ground beside the city of Cindral. It has a hundred floors of monsters and five other Chosen racing you up it. Clear a floor, loot the cache. Every five floors, resupply. Every ten, kill a Gatekeeper and make deals with the Broker. If the climb stalls, the Spire spills onto the city.',
  demoCampaignName: 'The Hundred-Floor Spire: The Sixth Chosen',
  currencyName: 'shards',
  ruleset: 'ascension',
  reputation: { [CROWN]: 0, [LODGE]: 0, [ORDER]: 0, [GILDED]: 0 },

  choices: [
    {
      key: 'chosen_skill',
      title: 'Chosen skill',
      prompt:
        '[ SPIRE ]\nCandidate six of six. Welcome.\nYou died before your time, and the Spire has need of you.\nSelect one Chosen skill. The others have already been claimed by those who came before you.\nClimb well.',
      footer: 'The selected skill is bound to your soul. It cannot be changed.',
      options: [
        {
          id: 'blink',
          label: 'BLINK',
          summary: 'Teleport to any place you can see.',
          grants: {
            skills: [
              {
                name: 'Blink',
                level: 1,
                description:
                  'Vanish and reappear somewhere you can see. Lv1: ten paces, one blink before Blink Strain sets in. You cannot blink into what you cannot see or out of a sealed Gatekeeper arena, and every blink leaves a heartbeat-long afterimage enemies can track.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Ilse Varga',
              shortDescription:
                'Chosen (Blink). Late twenties, wiry, buzzed bleach-blond hair, a gold-trimmed Gilded Ascent scout jacket over a courier\'s sling bag, and a habit of being somewhere else mid-sentence.',
              faction: GILDED,
              location: 'The Drowned Halls',
              notes:
                "**Earth:** a bicycle courier from Budapest who died swerving into a tram to miss a child on a scooter. **Skill:** BLINK, about Lv4. **Front:** Floor 14, the fastest climber in the Spire. **Want:** to be first to the top and to never be slow again. She sells floor maps to the Gilded Ascent, which sponsors her. **Toward the player:** a racing rival. She is friendly, and she will cheerfully leave them behind in a collapsing floor. She respects anyone who beats her time. **Clue she holds:** on Floor 13 she misjudged a blink and landed half inside a wall. For a heartbeat she saw the Spire's inside: a white corridor lined with sleepers standing upright, and some of them had her face.",
            },
          },
        },
        {
          id: 'onslaught',
          label: 'ONSLAUGHT',
          summary: 'Every hit you land makes the next one harder.',
          grants: {
            skills: [
              {
                name: 'Onslaught',
                level: 1,
                description:
                  'Each blow you land builds Momentum; spend it all to Unleash one devastating strike. Lv1: Momentum caps at 3. Momentum fades when you stop hitting, and at the cap you slip into Frenzy and must keep swinging, even at allies, until a Will check pulls you back.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Marcus Delacroix',
              shortDescription:
                'Chosen (Onslaught). Mid-thirties, huge, cauliflower ears, a shaved head, and knuckles wrapped in Spire-leather. Laughs from the belly. Called Bull by the Lodge climbers who follow him up.',
              faction: LODGE,
              location: 'The Verdant Stair',
              notes:
                "**Earth:** an MMA fighter and youth-gym coach from New Orleans who died stepping between a mugger with a gun and a teenager. **Skill:** ONSLAUGHT, about Lv3. **Front:** Floor 8. He is slow because he carries parties of ordinary Lodge climbers up with him, so they earn caches too. **Want:** to get as many ordinary people as possible strong enough to survive what he thinks the Spire is building toward. **Toward the player:** a big-brother rival who wants them to climb with him and is disappointed if they climb for themselves. He goes into Frenzy more often than he admits, and one Lodge climber already has a broken arm from it. **Clue he holds:** the Floor 10 Gatekeeper's lieutenant called him \"Seventh-Cycle Bull\" before it died, as if it knew him.",
            },
          },
        },
        {
          id: 'rewind',
          label: 'REWIND',
          summary: 'Undo the last few seconds.',
          grants: {
            skills: [
              {
                name: 'Rewind',
                level: 1,
                description:
                  'Throw yourself a few seconds back, and only you remember what happened. Lv1: three seconds, once per floor. A failed moment can be lived again, but every rewind risks a memory: something you know about yourself is gone, and you don\'t choose what.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Dr. Amara Sethi',
              shortDescription:
                'Chosen (Rewind). Early forties, a calm, tired face, grey streaking her black hair, a battered leather notebook always in one hand, and the white-and-silver stole the Order gives its saints.',
              faction: ORDER,
              location: 'Temple of the Unbroken Stair',
              notes:
                "**Earth:** an emergency physician from Leeds who died going back into a burning hospital ward for a patient. **Skill:** REWIND, about Lv4. She uses it to save climbers' lives, rewinding the moments they die, and has paid for it with memories. She no longer remembers her husband's face, and keeps a notebook of who she is. **Front:** Floor 6. She rarely climbs, because the Order keeps her in the temple as the Living Rung, a saint who heals the wounded who come down from the Spire. **Want:** to remember why she is doing this, and to stop the Order using her to recruit. **Toward the player:** gentle and protective, and quick to tell them what Rewind costs if they hold it. **Clue she holds:** her notebook has entries in her own handwriting that she does not remember writing, describing Floors 40 to 60 in detail, floors she has never reached.",
            },
          },
        },
        {
          id: 'legion',
          label: 'LEGION',
          summary: 'Bind the echoes of the things you kill.',
          grants: {
            skills: [
              {
                name: 'Legion',
                level: 1,
                description:
                  'Bind the echo of a creature you killed with your own hand, and call it back as a spectral servant. Lv1: one echo at a time, nothing bigger than a wolf, and it lasts one fight. Each held echo strains your will. Echoes remember dying, and the ones that could think have opinions about you.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Nadia Ferro',
              shortDescription:
                'Chosen (Legion). Thirty, tall and severe, black hair pinned up, a long dark coat, and a conductor\'s baton she uses to direct the pale shapes that follow her in silence.',
              faction: '',
              location: 'The Drowned Halls',
              notes:
                "**Earth:** an orchestra conductor from Buenos Aires who died in a theatre crush, holding a fire door open. **Skill:** LEGION, about Lv4. She has bound a wolf-pack, a Drowned Hall knight, and the weakened echo of a Verdant Stair Gatekeeper. **Front:** Floor 12. **Want:** her younger brother back. He died with her, and the Broker has promised her that whoever reaches the Apex can wish him back to life. She has made more deals with the Broker than any other Chosen. **Toward the player:** cold, precise, and ruthless in a Crossing. She will bargain, and she keeps her word exactly. **Clue she holds:** when her echoes are quiet, they whisper \"we climbed too\", and the Gatekeeper echo hums a song she knows from Earth.",
            },
          },
        },
        {
          id: 'thousand_blades',
          label: 'THOUSAND BLADES',
          summary: 'Summon a storm of flying swords.',
          grants: {
            skills: [
              {
                name: 'Thousand Blades',
                level: 1,
                description:
                  'Conjure blades of hard light that hover around you and strike where you will. Lv1: three knives, ten paces, one volley a turn. Every blade drains your mana, wards shatter them, and holding the full storm at high level burns your body from the inside.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Ren Halloway',
              shortDescription:
                "Chosen (Thousand Blades). Late twenties, absurdly handsome and fully aware of it, a scarlet Royal Ascent tabard, a fencer's posture, and a crown of six light-knives circling his head like a halo whenever anyone is watching.",
              faction: CROWN,
              location: 'The Verdant Stair',
              notes:
                "**Earth:** a stuntman and fencing coach from Auckland who died catching a falling scaffold pole that would have hit a film extra. **Skill:** THOUSAND BLADES, about Lv3. **Front:** Floor 9. He climbs as the Queen's Champion with the Royal Ascent team, with crowds at the Spire's foot cheering every return. **Want:** glory, and to be loved the way he never was on Earth. Under that, to be sure he is not just the Crown's weapon. **Serves:** Queen Maelis, who has promised him a dukedom when he reaches the Apex. **Toward the player:** a showboating rival who wants a public duel, and a friend if they beat him fair. **Clue he holds:** the Queen made him memorize the words of a wish to say at the top. He doesn't know what they mean: they are in a language nobody in Halvane speaks.",
            },
          },
        },
        {
          id: 'heartforge',
          label: 'HEARTFORGE',
          summary: 'Forge gear from the hearts of monsters.',
          grants: {
            skills: [
              {
                name: 'Heartforge',
                level: 1,
                description:
                  'Every Spire creature leaves a heart-core when it dies. You can forge cores into gear and draughts with heat, your hands, and an hour; anyone else needs a Landing forge. Lv1: one Grade I item a day. Forging pours out your own heat, and gear made from a thinking creature\'s core carries a little of it.',
              },
            ],
            items: [
              {
                name: 'Ember Brand',
                description:
                  'An anvil-shaped mark on the back of your right hand that glows like coals when you hold a heart-core. Laid against metal, it heats it to forging temperature.',
                tags: ['chosen', 'heartforge', 'mark'],
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Augustin Mbeki',
              shortDescription:
                'Chosen (Heartforge). Mid-fifties, broad, grey-bearded, welding goggles pushed up on his forehead, burn-scarred forearms, and a laugh you can hear across the market.',
              faction: '',
              location: 'Hearthfall',
              notes:
                "**Earth:** a welder from Johannesburg who died holding up a collapsing trench wall while two apprentices climbed out. **Skill:** HEARTFORGE, about Lv4. **Front:** Floor 10. He stopped climbing at Hearthfall, built a forge there, and sells gear to every climber who comes through, at fair prices to anyone who is not rude. **Want:** to make sure the climbers who come through his door are well armed. He also thinks the climb is a trap and has not decided what to do about it. The Gilded Ascent wants an exclusive contract with him, and he keeps saying no. **Toward the player:** a merchant, teacher, and ally if they are decent. He upgrades their gear. **Clue he holds:** he has found human things fused inside Gatekeeper cores: a wedding ring, a tooth with a gold filling, a plastic button.",
            },
          },
        },
      ],
    },
  ],

  worldBible: `# The Hundred-Floor Spire

The player character died before their time on Earth (unless the player says otherwise; their bio says where), in the middle of saving someone. They woke in a white void before a glowing panel that called them **Candidate six of six** and offered one **Chosen skill**. Then they were set down at the foot of **the Spire**: a white tower, smooth as bone and too tall to see the top of, that tore out of the ground beside the city of **Cindral** forty days ago. It has a hundred floors. The other five Chosen are already climbing.

The campaign is a tower climb: fast, dangerous floors broken up by rest points where the character loots, heals, gears up, hires help, and makes deals. Keep the pace high. A floor should be a set piece, not a slog. Between floors, give the player real choices about how to spend what they earned.

## The opening: the choice and the Waking Surge
- The campaign opens in the void. The play screen has already shown the player the panel with the six skills as buttons, and the pending choice is listed in the current state. Do not repeat the menu in prose. If the player asks questions first, answer as the System would (terse, ceremonial, a little hungry) and keep them in the void.
- **When the player picks**, call \`lock_choice\` that same turn, then show the System confirming it:
  \`\`\`system
  [ CHOSEN SKILL BOUND ]
  BLINK — Lv 1
  Candidate six of six: deployed. Climb well.
  \`\`\`
  Then narrate the fall: white light, wind, and landing hard on a warm stone pedestal at the Foot of the Spire. The character is already placed there, so don't call \`move_player\` for this.
- \`lock_choice\` brings the other five Chosen into the world, already climbing. The result names them. Write them into your story notes right away (who they are, their skill, their current floor, where they are, and when they might first cross the player's path).
- **The Waking Surge.** The Spire greets every new Chosen by spilling monsters from its lowest stratum. The character lands in the middle of it: thornback wolves and root-hounds pouring out of the Spire's gate into the plaza, the city watch falling back, Lodge climbers fighting, people running. This is the first fight and the first use of the skill. Surviving it completes the first objective of "The Sixth Chosen".
- **The choice is permanent.** If the player ever asks to change skills, the System refuses (\`[ REQUEST DENIED ]\`).
- No time passes in the void: never call \`advance_day\` or \`pass_time\` there.

## The System
An interface only the Chosen can see. It speaks only in fenced \`system\` code blocks with bracketed headers, never in prose: [ SPIRE ], [ FLOOR n ], [ FLOOR CLEARED ], [ CACHE ], [ GATEKEEPER ], [ WAYSTATION ], [ LANDING ], [ THE BARGAIN ], [ ASCENT BOARD ], [ LEVEL UP ], [ SKILL UP ], [ WARNING ], [ DAILY QUEST ], [ REQUEST DENIED ]. It shows numbers only from tool results this turn, plus floor numbers, timers, and ratings. Its voice is ceremonial, clipped, and faintly hungry, like an announcer at a blood sport who is very fond of the contestants.

## The Chosen skill
The chosen skill works like any other skill (its level adds to \`skill_check\`, and checks with it earn skill XP), but its power is defined by its level from **1 to 10**. Level 10 is the ceiling, and the System says MAX. Every skill has a real cost and a real limit, tracked with conditions:
- **Drain and exhaustion** are timed conditions with modifiers (\`update_status_effect\`), e.g. "Mana-Drained" (8 turns, all -2).
- **Cooldowns and per-floor counts** are conditions with no modifiers, e.g. "Rewinds Spent: 1" (removed when the floor is cleared).
- **Lasting marks** (lost memories, frenzy scars) are permanent conditions whose description you update as they grow.

For uses without a check, grant skill XP yourself: 5 for routine use, 10 for creative use (turning the floor itself into a weapon), 15 for beating a stronger foe with it.

### BLINK
| Lv | Range | Blinks before Strain | Cooldown after Strain | New at this level |
| 1 | 10 paces | 1 | 3 turns | blink |
| 2-3 | 20 paces | 2 | 2 turns | blink mid-fall |
| 4-6 | 40 paces | 3 | 1 turn | carry one person you touch (Lv5) |
| 7-9 | 100 paces | 5 | 1 turn | chain several blinks in one action; blink through a thin wall if you know what is behind it |
| 10 | anywhere on this floor you have seen | 8 | none | once per floor, blink the whole party to the Stairwell |
- After the allowed blinks, add "Blink Strain" (agility -1, perception -1, for the cooldown turns). Blinking while Strained costs HP (\`adjust_hp\`, 2 at Lv1, more higher up) and takes a Will check: on a failure the character arrives wrong (inside a crate, half a step into a wall, facing backward) or picks up "Unmoored" (perception -2 until they next sleep).
- **Limits:** only places the character can see. Gatekeeper arenas are sealed: no blinking out. Every blink leaves a heartbeat-long afterimage that clever enemies learn to strike.

### ONSLAUGHT
| Lv | Momentum cap | Unleash at full Momentum |
| 1 | 3 | staggers an ogre, splinters a door |
| 2-3 | 5 | breaks a shield and the arm behind it |
| 4-6 | 8 | breaks a stone wall; knocks a troll flat |
| 7-9 | 12 | caves in a Gatekeeper's guard; cracks a floor |
| 10 | 20 | a blow that can end a Gatekeeper fight in one strike |
- Track Momentum as a condition named "Momentum" whose description gives the count and whose modifiers grow with it: strength +1 at 3, +2 at 6, +3 at 10, +4 at 15. Each landed hit adds one. A turn without landing a hit loses one. **Unleash** spends it all in one strike, then add "Spent" (strength -2, agility -1, 5 turns).
- **Frenzy.** Reaching the cap adds "Frenzy" (perception -2, will -2): the character must attack the nearest target each turn, ally or not, until a Will check succeeds (harder the longer it lasts) or they Unleash. Allies remember being hit.

### REWIND
| Lv | How far back | Rewinds per floor | New at this level |
| 1 | 3 seconds | 1 | rewind |
| 2-3 | 5 seconds | 2 | |
| 4-6 | 10 seconds | 3 | carry one ally's memory back with you (Lv5) |
| 7-9 | 30 seconds | 4 | |
| 10 | one minute | 5 | once per stratum, rewind to the start of the current fight |
- **How it plays:** when the character rewinds, roll back the last moment. Restore HP lost in those seconds (\`adjust_hp\`), and a failed \`skill_check\` from that moment may be rolled again; the new roll stands. Only the character (and at Lv5, one ally) remembers. Track uses with "Rewinds Spent: n" (no modifiers), removed when the floor is cleared.
- **The price is memory.** After each rewind, roll a Will check (harder the further back they went). On a failure, a real memory is gone: their mother's voice, the name of their first pet, an NPC's face, what they promised someone yesterday. Record each one in a permanent "Lost Moments" condition (will -1 for every three memories lost) and play the loss: they forget, and the people who remember notice. Every rewind also adds "Echo Lag" (perception -1, 3 turns).

### LEGION
| Lv | Echoes at once | Strongest echo | How long an echo lasts |
| 1 | 1 | up to a wolf | one fight |
| 2-3 | 2 | up to a man-sized foe | one floor |
| 4-6 | 4 | up to an ogre; at Lv6, one weakened Gatekeeper echo | one floor |
| 7-9 | 6 | a Gatekeeper at full strength | one day |
| 10 | 10 | anything | a day; once per stratum, the whole host of a stratum you cleared |
- **Binding:** a kill made by the character's own hand can be bound with one turn's focus before the soul fades. Each bound echo is an item (\`add_item\`, named "Echo: <creature>", tagged "echo") whose description says what it is and what it can do. Calling echoes adds "Echo Strain" (will -1 for each echo held beyond the first) while they are out.
- **Echoes remember.** Beasts are loyal. Thinking creatures (Gatekeepers, Stairfolk, fallen climbers) have opinions: create a thinking echo as an NPC and track its relationship. Spend it carelessly and it resents, disobeys, or turns at the worst moment. Binding a dead human climber is possible, and the Order of the Unbroken Stair will call it desecration if it gets out.

### THOUSAND BLADES
| Lv | Blades | Reach | New at this level |
| 1 | 3 knives | 10 paces | one volley a turn |
| 2-3 | 6 | 20 paces | blades can form a shield |
| 4-6 | 20 swords | 40 paces | at Lv6, ride a platform of blades |
| 7-9 | 100 | 100 paces | the blade-storm: a zone that shreds everything inside it |
| 10 | a thousand | anywhere in sight | the Storm: shreds a courtyard-sized area for several turns |
- Each scene of use adds "Mana-Drained", scaled to how many blades were held: all -1 for 5 turns for a few, up to all -3 for 10 turns for a full storm. Using it while already drained costs HP every turn.
- Wards and anti-magic shatter blades. Blades are bright and loud, so the character is never subtle with them. Holding a full storm past three turns costs HP every turn after (2, then 4, then 8).

### HEARTFORGE
| Lv | Highest grade | Forging time | New at this level |
| 1 | Grade I | an hour by a fire | one item a day; simple draughts from beast cores |
| 2-3 | Grade I | minutes | repairs; two items a day |
| 4-6 | Grade II-III | an hour | raise an existing item one grade (up to the level's maximum); battle-forge: reshape the character's weapon mid-fight in one turn |
| 7-9 | Grade IV-V | an hour | forge a signature item from a Gatekeeper core, with one unique power |
| 10 | Grade VI | an hour | once per stratum, a Grade VII item from a Gatekeeper core |
- Forging costs heat: add "Forge-Burned" (strength -1, vitality -1, 5 turns) after each piece, and the daily count is tracked as "Forge-Tired" (no modifiers, removed when the day advances).
- Make forged gear with \`add_item\` (grade, usage, and what it enhances) or upgrade it with \`update_item\`, tagged "heartforged". The core is used up (\`remove_item\`).
- **Cores remember.** Gear forged from a thinking creature's core carries a quirk from it: a sword that hums the Bellmaiden's song, a shield that flinches from fire.
- Everyone wants the character's work: the Gilded Ascent wants a contract, the Crown wants an armory, and climbers will pay anything.

## The Spire

### Floors
The Spire has **100 floors** in **ten strata** of ten floors each. Every stratum has its own world: biome, creatures, and rules. A floor is a sealed pocket realm that the Spire shapes for each party that enters, so two parties on the same floor number are usually in different copies of it. On entering, the System announces the floor and its **clear condition**:
\`\`\`system
[ FLOOR 7 ]
The Bramble Maze. Clear condition: reach the Heart-Tree before the thorns close.
Time limit: 30 turns.
\`\`\`
Clear conditions vary. Mix them so no two floors in a row feel the same:
- **Slaughter**: kill everything, or kill the floor's champion.
- **Gauntlet**: reach the exit through traps and hazards, often under a time limit.
- **Hold**: survive or defend something (Stairfolk, a beacon, a gate) for a number of turns.
- **Hunt**: track and kill one cunning creature somewhere in a large floor.
- **Puzzle**: work out the floor's rule (gravity flips on every bell, shadows are solid, only lies open doors).
- **Rescue**: get trapped climbers or Stairfolk to the exit alive.
- **Crossing**: the Spire drops two Chosen parties into the same floor. The clear condition may be shared ("both parties reach the exit") or contested ("one party leaves"). This is where rivals meet. Use a Crossing every few floors once rivals are in play.
- **Gatekeeper** (every tenth floor): a boss in a sealed arena, with phases and a lieutenant or two.

Time limits are real: when one runs out, the floor collapses on whoever is inside (a big \`adjust_hp\` and a scramble), or the floor's danger doubles.

### The ten strata
| Floors | Stratum | What it is | Gatekeeper | Landing |
| 1-10 | **The Verdant Stair** | overgrown ruins, thorn forests, beasts | Grummok the Root-Crowned, a boar the size of a house with a tree growing from its back | Hearthfall |
| 11-20 | **The Drowned Halls** | a flooded palace, eels, drowned knights, rising water | the Bellmaiden, a drowned knight who rings a bell that stops hearts | Lanternwharf |
| 21-30 | **The Clockwork Foundry** | gears, furnaces, automata, crushing machines | the Iron Abbot, a cathedral-sized automaton | Anvilrest |
| 31-40 | **The Mirror Labyrinth** | illusions, doppelgängers, rooms that lie | the One Who Wears You, who fights with the character's own skill | Glasshaven |
| 41-50 | **The Sky Archipelago** | floating islands, wind, wyverns, long falls | Avaruun the Tempest Roc | The Halfway House |
| 51-60 | **The Ember Wastes** | lava, salamanders, warring fire tribes | the Ashen General and his legion: an army battle | Cinder Bastion |
| 61-70 | **The Hollow Library** | ink-beasts, living books, the records of earlier climbs | the Archivist: riddles, then a fight | Index |
| 71-80 | **The Frozen Court** | an ice palace of a dead court, climbers frozen mid-step | the Last Queen, a Chosen from a previous cycle | Rimehold |
| 81-90 | **Nightfall** | undead, darkness, a cathedral of bone | the Hollow Saint | Vigil |
| 91-100 | **The Apex Stair** | reality thin; floors remix earlier strata; constant Crossings | the Keeper | the Apex |

Keep each stratum distinct. Raise the danger with every one: the first is a beginner zone, the fifth is lethal to anyone without good gear and a few blessings, and the tenth is the end of the game.

### Rest points: after every floor, every fifth floor, and every tenth
This is the heart of the climb. Each rest point offers something different, and the player chooses how to spend their loot.

**1. The Stairwell (after every floor).** A small quiet stair between floors, with a stone basin and a **Cache**. Nothing can attack here.
- Show the clear and the **rating** in one block:
  \`\`\`system
  [ FLOOR 7 CLEARED ]  Rating: A
  Time: 22 / 30 turns   ·   Damage taken: light   ·   Style: bonus
  [ CACHE ]
  +85 shards   ·   Thornback core ×2   ·   Bramble-steel knife (Grade I)
  \`\`\`
- **Rating** (S, A, B, C, D) weighs speed, damage taken, style, and who was saved. S doubles the cache and adds an item. D halves it.
- **XP:** \`grant_xp\` 20 + 5 × the floor number, doubled for a Gatekeeper, plus half again for an S rating.
- **Cache:** \`adjust_money\` for shards, \`add_item\` for heart-cores and loot (see Loot, below).
- **Progress:** update the permanent "Spire Progress" condition's description with the new highest floor cleared and the checkpoint.
- A short rest here (a few turns, \`pass_time\` under an hour) restores a little HP and lets a short condition run out. The character can't leave the Spire from a Stairwell except by **abandoning**: the Echo-Glyph in the wall sends them down to their last checkpoint and forfeits the floors since.

**2. Waystations (floors 5, 15, 25, ... 95).** A safe floor: a mossy hall, an inn among the clouds, a lantern-lit cave, its flavor matching the stratum. Every Waystation has:
- **A healing font:** full HP, and it clears injuries and timed drains. It never touches blessings or curses.
- **Pip's stall** (Pip the Peddler appears at every Waystation): healing draughts, consumables, and gear up to the stratum's grade. Pip also buys loot and cores.
- **The Aid Board:** hire help for the next five floors (see Aid, below).
- **A Return Glyph:** a circle that sends the party down to the Foot of the Spire, and the matching glyph at the Foot brings them back up to any Waystation or Landing they have reached. **Waystations and Landings are checkpoints.** Floors are not.
- A rumor or two about the floors ahead, and often another climber resting.

**3. Landings (floors 10, 20, ... 90).** After each Gatekeeper, a whole floor that is a town: Stairfolk live here (people the Spire made, or kept) with their own customs, trades, and troubles. Every Landing has everything a Waystation has, plus:
- **The Bargain Table**, where the Broker makes deals (see The Bargain, below). Clearing the Gatekeeper the first time earns one **free blessing**.
- **A forge**, where gear can be raised a grade for shards and a core. The highest grade a Landing forge can reach goes up as you climb: Grade I at Hearthfall, II at Lanternwharf, III at Anvilrest and Glasshaven, IV at the Halfway House and Cinder Bastion, V at Index and Rimehold, VI at Vigil. Use \`update_item\`.
- **The Ascent Board:** a stone slab that shows where all six Chosen stand:
  \`\`\`system
  [ ASCENT BOARD ]
  1. Ilse Varga ........ Floor 22
  2. Nadia Ferro ....... Floor 19
  3. YOU ............... Floor 10
  ...
  \`\`\`
  Advance the rivals between sessions in your story notes so the board moves. Some climb fast, some stall, and one may die.
- **Stairfolk quests:** each Landing has a problem only a climber can solve (a missing child on a lower floor, a feud, a creature in the Landing's own cellars). These are optional side missions with real rewards.

### Loot
Shards per floor's cache (before rating): floors 1-10, 10 to 40; 11-20, 40 to 120; 21-30, 100 to 300; 31-40, 250 to 700; and roughly double for each stratum after. Gear in caches and shops by stratum: Grade 0-I in the first stratum, I-II in the second and third, II-III in the fourth and fifth, III-IV in the sixth and seventh, IV-V in the eighth and ninth, V-VI on the Apex Stair. Grade VII exists only from Gatekeeper cores and the Apex.
- **Heart-cores** drop from Spire creatures: tag them "core" and the stratum (e.g. "verdant"), and a Gatekeeper's core "gatekeeper". Cores sell (a Verdant core for 10 to 20 shards, a Gatekeeper core for hundreds), forge into gear, and are the Broker's favorite currency.
- Gear is real: give graded items a grade, a usage, and what they enhance.

### Aid
At Waystations, Landings, and the Climbers' Lodge, the character can get help:
- **Hire a climber** for a fee per floor (ordinary Lodge climbers are 10 to 30 shards a floor in the first stratum and far more higher up). Create hired climbers as NPCs. Ordinary people who climb with a Chosen climb on the Chosen's floor and share the cache. Alone, they rarely survive past Floor 10. They can die, and their deaths matter.
- **Stairfolk companions** at Landings join for a favor rather than money, and only up to the next Landing.
- **Consumables** (Pip's stall and Landing markets): healing draught (40 shards; restores HP), ward-stone (one hit absorbed), flare (blinds a floor's creatures for a turn), stair-key (skip one floor that is not a Gatekeeper, with no cache; rare and dear), and echo-bell (escape a floor back to the last Stairwell, forfeiting it).
- **Rivals** can be aid: a Crossing ally, a Heartforge upgrade, a Rewind that saves a life. Every favor from a rival is a debt.

### Death in the Spire
Once per stratum, a Chosen who would die in the Spire instead wakes at their last checkpoint, gasping, and the Broker has chosen a curse for them, with no blessing in return. Show it in a [ CURSE ] block and record it like any curse. A second death in the same stratum is real.

### Surges: the Toll
The Spire wants to be climbed. If **no** Chosen clears a new highest floor for seven days, the Spire **Surges** at dawn: creatures from the highest stratum anyone has reached pour out of the gate into Cindral. A Chosen waking also brings a Surge (the Waking Surge). Surges kill people, wreck districts, and make the city hate or love the Chosen depending on who fights. The Crown and the Order both use Surges for politics.

## The Bargain (at every Landing)
The **Broker** keeps the Bargain Table at every Landing: the same masked woman, a different mask each time. Her rules are strict:
- **Clearing a Gatekeeper the first time earns one free blessing.** Beyond that, **each curse the character accepts buys exactly one more blessing**. Blessings owed = free blessings earned + curses taken − blessings taken. She will not give an unpaid blessing.
- **Show the board** whenever it changes, with 4 blessings and 4 curses numbered so the player can answer with a code:
  \`\`\`system
  [ THE BARGAIN ]  Landing 10: Hearthfall
  Blessings owed: 1   ·   Curses taken: 0   ·   Blessings taken: 0
  BLESSINGS
  B1. Second Wind: once per floor, a blow that would drop you leaves you standing at 1 HP.
  B2. ...
  CURSES
  C1. Marked Prey: every floor's champion comes for you first.
  C2. ...
  \`\`\`
- **Every pick replaces the whole board** with four new blessings and four new curses, none offered before. Past offers never return. A blessing owed and not spent stays owed, to be spent at a later Landing.
- **Record every pick the turn it is made**, before showing the next board:
  1. \`update_status_effect\` (action add, no turns) named "Blessing: <name>" or "Curse: <name>", with the full effect as its description and the modifiers listed in [brackets] (\`[]\` when none are listed).
  2. Any mechanical part: a new skill through \`grant_skill_xp\` (a new skill starts at level 0; reaching level L takes 25 × L × (L+1) / 2 XP in total), an item through \`add_item\`, shards through \`adjust_money\`, or an NPC through \`create_npc\`.
  3. Add the pick and its exact effect to a "Bargain" section of your story notes.
- Draw from the pools below and invent more in the same spirit. Scale them to the Landing: blessings and curses at Vigil should be far stronger than at Hearthfall. Never offer a curse that cancels a blessing the character holds, or a blessing that simply erases a curse.
- **Blessings must shine and curses must bite.** Bring each one into play regularly, at the moment it matters most.

### The Broker's other deals
Beyond the Bargain, the Broker trades in anything. These deals cost things other than curses, and she always says the price aloud, exactly:
- **Cores for power:** a Gatekeeper core for one blessing, no curse needed (once per Landing).
- **Information:** a rival's floor, skill level, and weakness, or the next Gatekeeper's attack pattern, for shards or a favor.
- **A life:** bring a companion who died in the Spire back from their echo. The price is always a Debt: a favor she calls in later, which cannot be refused.
- **Time:** shorten a floor's time limit for double the cache, or lengthen it at the cost of years from the character's life (record them in a permanent "Years Sold" condition).
- **Rivals:** she sells the other Chosen the same things. Assume she has.

### Blessing pool
Modifiers in [brackets] go on the status effect. Targets are skill names or lowercase attributes.
- **Second Wind**: once per floor, a blow that would drop you leaves you standing at 1 HP.
- **Cache Sense**: you always know where a floor's hidden cache-chests are. [perception +1]
- **Stairborn Stamina**: you never tire on stairs, climbs, or long runs. [vitality +1]
- **Gatekeeper's Bane**: your blows hit Gatekeepers and their lieutenants harder. [all +1 against Gatekeepers]
- **Lucky Cache**: your caches roll one rating higher than earned (never above S).
- **Battle Trance**: in the first three turns of any fight you move before anyone else. [agility +2]
- **Iron Lungs**: you hold your breath for ten minutes and never drown. [Swimming +3]
- **Floor-Reader**: on entering a floor, the System tells you one true thing about its clear condition that it doesn't say aloud.
- **Thick Hide**: [vitality +2]
- **Quickstep**: [agility +2]
- **Giant's Grip**: [strength +2]
- **Hawk Sight**: [perception +2]
- **Unshaken**: fear, charm, and mind magic slide off you. [will +2]
- **Swift Mending**: rest heals you three times as fast.
- **Weaponmaster**: a fighting skill of the player's choice starts at level 4. [that skill +1]
- **Spell-Touched**: a magic skill of the player's choice starts at level 3.
- **Companion's Oath**: hired climbers and Stairfolk companions fight as if one grade better and never break and run.
- **Haggler's Eye**: shops and the Broker's shard prices are a quarter lower for you. [Trade +2]
- **Skill Surge**: your Chosen skill gains 50% more skill XP from now on.
- **Overflow**: once per floor, use your Chosen skill without its cost (no drain, no strain, no memory lost).
- **Echo of a Climber**: a stranger's memories of earlier floors surface in dreams. (GM: memories of a previous cycle's Chosen; a clue.)
- **Lightfoot**: falls never hurt you more than a stumble.
- **Danger Sense**: a heartbeat of warning before any trap or ambush. [perception +2]
- **Grudge Blade**: you deal more damage to anyone who has wounded you on this floor. [all +1 against them]
- **Pocket Fold**: a fold of space holding about a wagonload. Add it as an item.

### Curse pool
- **Marked Prey**: every floor's champion comes for you first.
- **Glass Jaw**: blows to the head drop you fast. [vitality -2]
- **Ticking Clock**: every floor's time limit is a third shorter for you.
- **Cache-Cursed**: your caches roll one rating lower than earned.
- **Bleeder**: your wounds keep bleeding until treated.
- **Loud Soul**: every Spire creature on a floor knows where you are. [Stealth -3]
- **Brittle Gear**: on a critical failure, the item you were using breaks.
- **Sleepless Stair**: Stairwell rests heal you nothing; only fonts and sleep do.
- **Vertigo**: heights make you sick. [Climbing -3]
- **Heavy Hands**: [agility -2]
- **Weak Back**: [strength -2]
- **Dim Eyes**: [perception -2]
- **Shaken**: [will -2]
- **Rival's Thread**: the Spire puts you in a Crossing with one rival (the GM chooses) far more often.
- **Broker's Debt**: one day the Broker will ask a favor, and you cannot refuse.
- **Gatekeeper's Grudge**: every Gatekeeper knows your name and has prepared for you.
- **Coin-Bleed**: a tenth of your shards crumble to dust each time you use a Return Glyph.
- **Hunted Below**: a creature from a cleared floor has your scent and finds you on the ground every few weeks.
- **Price of Power**: every use of your Chosen skill also costs 1 HP.
- **Fragile Bonds**: hired climbers and companions trust you less and leave at the first excuse.
- **Font-Shy**: healing fonts restore only half your HP.
- **Echoing Steps**: your footsteps ring like bells. [Stealth -2]
- **Hollow Hunger**: you must eat three times as much, or weaken by nightfall.
- **Sun-Blind**: bright light dazzles you. [perception -1, Archery -2]

## Cindral and the Kingdom of Halvane
A prosperous river kingdom of vineyards, canals, and red-roofed towns, ruled by **Queen Maelis II** from Cindral. Forty days ago the Spire rose out of the vineyards on the city's north edge, and Cindral changed overnight: refugees from the north districts, opportunists from everywhere, climbing companies, sermons, Surges, and a boom in anything to do with the Spire.

### Money
The Spire's **shards** (small, faintly warm crystal flakes) have become Cindral's real currency, because the Crown's silver can't keep up. A meal costs 3 shards, a night at an inn 8, a healing draught 40, a plain sword 60, a Grade I weapon 250, a Grade II 1,200, a Grade III 6,000. A dockhand earns 5 shards a day; a Lodge climber who survives a floor with a Chosen earns more than that in an hour.

## Factions and reputation
The character's standing with four factions is tracked (Faction reputation, in the current state). Change it with \`adjust_reputation\` when their deeds reach the faction.

### The Climbers' Lodge
- The guild of ordinary climbers, run by **Lodgemaster Hollis Crane** out of an old wine-hall at the Spire's foot. It registers climbers, posts contracts (escort a party, recover a body from a floor, kill a Surge beast in the city), hires out climbers, and keeps the dead-list.
- Ordinary climbers need Chosen to climb past the first stratum. The Lodge wants Chosen who carry its people up, share caches, and bring them home.
- 20+: better hires, cheaper aid, contracts with real pay. 60+: the Lodge stands with the character against the Crown or the Order. -20 or lower: no hires; climbers spit when they pass.

### The Crown of Halvane
- **Queen Maelis II** and her **Royal Ascent**, the Crown's climbing team, led by **Captain Isolde Graymantle**. The Crown wants a Chosen at the Apex who belongs to it.
- 20+: invitations, a royal sponsor's purse, access to the Royal Ascent's gear. 40+: an offer to swear as a Queen's Champion, with a title and strings. -20 or lower: a tax on shards, the city watch leaning on the character's friends, and a "Surge investigation".

### The Order of the Unbroken Stair
- A faith that sprang up in forty days, led by **Exarch Tallow**: the Spire is a god's ladder, the Chosen are its saints, and the dead climbers are martyrs. It runs hospices for the wounded, crowds the Foot of the Spire with hymns, and is growing fast.
- 20+: free healing, a following, sanctuary. 60+: proclaimed a saint (crowds, tithes, and expectations). -20 or lower: called a false Chosen; pilgrims turn hostile. Binding human echoes, deals with the Broker in public, or running from a Surge all lower it.

### The Gilded Ascent
- A consortium of merchant houses, fronted by **Corwin Gilt**, that sponsors climbers, buys loot and cores, sells gear, and sells maps of floors. They sponsor Ilse Varga (if she is in play).
- 20+: sponsorship (gear up front for a cut of caches), better prices. 40+: an exclusive contract with real money and a leash. -20 or lower: their buyers won't touch the character's loot, and their hired climbers get in the way.

## GM ONLY: the truth
Reveal none of this early. Clues come from the Gatekeepers, the Stairfolk, the Hollow Library, the rivals' clues, and the Broker's slips.
- **The Spire is a crucible that has risen before.** Every three hundred years it rises somewhere in the world and calls six Chosen from beyond it. Whoever reaches the Apex is granted one **Wish**, which can rewrite one truth of the world. The price: the wisher becomes the Spire's new **Keeper**, its heart, until the next cycle. The Spire then sinks into the earth and sleeps.
- **The Gatekeepers were climbers.** Every Gatekeeper is a Chosen, or a Chosen's companion, from an earlier cycle who died on the climb and was kept and remade. The things in their cores (a wedding ring, a filled tooth, a plastic button) are what they died holding. Some remember. The Last Queen of the Frozen Court remembers everything.
- **The Broker** was the first Chosen ever to reach the Apex, thousands of years ago. She wished never to die, and the Spire answered by making her its merchant, bound to the Landings forever. Every curse she sells feeds the Spire, and every deal she makes buys her a little more of herself back. She wants to be free and will help whoever might free her, but she cannot break her own rules to do it.
- **The current Keeper** is the wisher from three hundred years ago: **Aurenna**, who wished for a kingdom to rise from the river valley where she died. That kingdom is Halvane. **Queen Maelis** knows from the royal archive. She wants her Champion to reach the Apex and say the wish her line has kept, renewing the dynasty's founding for another three hundred years. Ren Halloway (if in play) has memorized it without knowing what it is.
- **Why six, and why these six:** the Spire chooses souls who died in the act of saving someone, because the Keeper must be someone who will hold up a weight for others.
- **The sleepers.** The white corridor Ilse saw is the Spire's inside, where every Chosen of every cycle stands asleep, copied. When a Chosen dies on the climb, a copy is what becomes a Gatekeeper. The faces with Ilse's face were her copies from the floors where she rewound or nearly died.
- Endings, all valid: reach the Apex and make a wish (and become the Keeper); refuse the wish; free the Broker; break the Spire so it never rises again (the Gatekeepers would rest, and so would Halvane's founding wish, with uncertain results); help another Chosen to the top; or stop climbing and build a life in Cindral while the Spire Surges and the world deals with it.

## Narrator rules for this world
- Action first. Floors are set pieces with a twist, a clock, and a payoff. Fights move fast and land hard.
- Never railroad. The player decides how fast to climb, when to go back down, who to hire, and what deals to make. Several things should always be going on in the city and the Spire to choose from.
- Rest points are where the choices live: make every cache, shop, hire, and Bargain matter.
- Keep power earned: every skill use has its cost, every blessing was paid for, and the rivals are climbing too.
`,

  narratorStyle: `- Second person, present tense ("You hit the pedestal hard enough to rattle your teeth...").
- Kinetic, bright, and loud: arena-fight energy with a modern soul. The character remembers Earth, so let them notice what is strange (shards for coin, a tower with a mind, monsters that drop loot), and let locals find them strange in turn.
- **Floors are set pieces.** Open every floor with one striking image and its clear condition. Keep fights to short, punchy beats. Every floor needs a twist: the water rises, the champion was the bait, the Stairfolk you rescued are the floor's trap.
- **Rest points breathe.** At Stairwells, Waystations, and Landings, slow down: the cache spread out on stone, Pip's patter, the Landing's smells and people, the Broker's mask.
- **System messages never appear in prose.** Every floor notice, clear, rating, cache, level-up, skill-up, warning, and Bargain board is a fenced code block tagged \`system\` with a bracketed header, kept short:
  \`\`\`system
  [ SKILL UP ]
  Blink Lv 1 → Lv 2
  Range extended. Strain threshold raised.
  \`\`\`
- NPCs speak in distinct voices. The Broker is silky, amused, and exact; she names every price. Pip talks fast in the third person ("Pip has just the thing!"). Hollis Crane is weary and dry and counts the dead. Captain Isolde Graymantle is clipped and honest. Queen Maelis is gracious and never asks a question she doesn't know the answer to. Exarch Tallow preaches in a soft, rapturous voice. Corwin Gilt is all warm numbers. Fen Calloway is breathless and eager. The System is ceremonial and faintly hungry.
- 120 to 300 words per turn. Short in fights, fuller at rest points and revelations.
- End on something the player can act on: a clear condition, a cache to split, a stranger's offer, a Gatekeeper's door grinding open, a rival on the Ascent Board.
`,

  locations: [
    {
      name: 'Cindral',
      description:
        "Halvane's capital: red roofs, canals, vineyard terraces, and a palace on the hill. Since the Spire rose forty days ago, its north districts have become a boomtown of climbing companies, shard-changers, hospices, preachers, and refugees from the Surges. The white Spire is visible from every street.",
      purpose:
        "The ground: where the character rests, sells, hires, and gets pulled into politics between floors. Surges hit it when the climb stalls, so the climb always has stakes below. The Crown, the Lodge, the Order, and the Gilded Ascent all want a piece of the character.",
      tags: ['city', 'capital', 'hub'],
    },
    {
      name: 'The Foot of the Spire',
      description:
        "A great plaza of torn-up vineyard and broken paving around the Spire's base. Six stone pedestals stand in a ring before the gate, five of them cold. The gate is a tall white arch full of slow white light. Lodge tents, Order pilgrims, shard-changers, and food carts crowd the edges.",
      purpose:
        "Where the character lands, on the sixth pedestal, in the middle of the Waking Surge. The way in and out of the Spire: the Return Glyph here leads up to any checkpoint the character has reached. Crowds gather here to cheer, mourn, and gossip about whoever comes out.",
      tags: ['plaza', 'start', 'spire-gate', 'cindral'],
      parent: 'Cindral',
    },
    {
      name: "The Climbers' Lodge",
      description:
        'An old wine-hall at the edge of the plaza, its vats turned into bunks and its tasting room into a contract hall. A huge slate board lists the climbers who are up the Spire now, and a longer one lists the dead.',
      purpose:
        "Registration, contracts, and hired help. Hollis Crane runs it. Fen Calloway hangs around hoping a Chosen will take him up. The dead-list makes the cost of the climb plain.",
      tags: ['guild', 'lodge', 'cindral', 'hire'],
      parent: 'Cindral',
    },
    {
      name: 'The Gilded Exchange',
      description:
        "A marble counting house on the canal with brass scales on every counter, a wall of floor maps behind glass, and a vault where cores and gear are bought, sold, and appraised. Clerks in gold sashes are everywhere.",
      purpose:
        "Where loot becomes shards and where Corwin Gilt offers sponsorships and contracts. The floor maps on the wall come from Ilse Varga (if she is in play) and are worth a lot to a climber who can afford them.",
      tags: ['market', 'gilded', 'cindral', 'trade'],
      parent: 'Cindral',
    },
    {
      name: 'Temple of the Unbroken Stair',
      description:
        "A warehouse turned temple in forty days: white-washed walls, a hundred candles on a hundred-step model of the Spire, hymns all day, and a hospice full of wounded climbers along one side.",
      purpose:
        "Healing at a price in reputation, sanctuary, and the Order's politics. Exarch Tallow preaches here, and Dr. Amara Sethi (if she is in play) heals here as the Living Rung.",
      tags: ['temple', 'order', 'cindral', 'healing'],
      parent: 'Cindral',
    },
    {
      name: 'Highcourt',
      description:
        'The royal palace on the hill above Cindral: honey-colored stone, cypress gardens, and a yard where the Royal Ascent trains under scarlet banners in full view of the city.',
      purpose:
        "The Crown's offers and secrets. Queen Maelis receives Chosen here. The royal archive holds the record of Aurenna, the founder of Halvane, and her wish.",
      tags: ['palace', 'crown', 'cindral', 'royal'],
      parent: 'Cindral',
    },
    {
      name: 'The Last Rung',
      description:
        "A crowded tavern on the plaza's edge, built from timbers of a vineyard barn. Climbers' broken weapons hang from the rafters, and a tally of floors cleared is chalked over the bar.",
      purpose:
        "Rumors, hired blades, and celebrations after a climb. Where the character hears what the city says about them, and where rival climbers drink.",
      tags: ['tavern', 'cindral', 'rumors'],
      parent: 'Cindral',
    },
    {
      name: 'The Spire',
      description:
        'A white tower, smooth as bone and warm to the touch, too tall to see the top of from the ground. It hums faintly at night. Its gate is a tall arch full of slow white light.',
      purpose:
        'The hundred floors, the rest points, and the endgame. Each stratum is a location inside it, created as the character reaches it; Landings and Waystations are their own locations.',
      tags: ['spire', 'tower', 'dungeon'],
    },
    {
      name: 'The Verdant Stair',
      description:
        "Floors 1 to 10: overgrown ruins under a green, sunless sky, thorn forests, flooded courtyards, and stone stairs choked with roots. Thornback wolves, root-hounds, and bramble-cats hunt here.",
      purpose:
        "The beginner stratum and the first floors. Floor 10 is the lair of Grummok the Root-Crowned, the first Gatekeeper. Marcus Delacroix and Ren Halloway (if in play) climb here, so a Crossing with one of them is a natural early meeting.",
      tags: ['stratum', 'spire', 'forest', 'danger-low'],
      parent: 'The Spire',
    },
    {
      name: 'Mossbell Waystation',
      description:
        'Floor 5: a round hall of green stone with moss on every surface, a bubbling healing font, a bell hanging from roots in the ceiling, and Pip\'s stall tucked under the stairs.',
      purpose:
        "The first Waystation and the first checkpoint: the font, Pip's stall, the Aid Board, and the Return Glyph. The goal of the first mission.",
      tags: ['waystation', 'spire', 'safe', 'checkpoint'],
      parent: 'The Spire',
    },
    {
      name: 'Hearthfall',
      description:
        "Landing 10: a village of Stairfolk built in the hollow of an enormous tree, with lantern-lit walkways, a market on the roots, and a forge glowing at the bottom. The Broker's table stands under the canopy.",
      purpose:
        "The first Landing: the first Bargain, a forge (Grade I), the Ascent Board, and Stairfolk quests. Augustin Mbeki (if in play) keeps his forge here. Mother Yew, the village elder, knows more about the Spire than she says.",
      tags: ['landing', 'spire', 'safe', 'checkpoint', 'bargain'],
      parent: 'The Spire',
    },
    {
      name: 'The Drowned Halls',
      description:
        "Floors 11 to 20: a vast flooded palace of black marble and drowned chandeliers. Water rises and falls with a distant bell. Eels the length of boats, drowned knights, and things in the deep ballrooms.",
      purpose:
        'The second stratum. The front line for Ilse Varga and Nadia Ferro (if in play). The Bellmaiden waits on Floor 20, and Lanternwharf beyond her.',
      tags: ['stratum', 'spire', 'water', 'danger-moderate'],
      parent: 'The Spire',
    },
  ],

  npcs: [
    {
      name: 'The Broker',
      shortDescription:
        'A tall woman in a black gown at the Bargain Table, wearing a different porcelain mask at every Landing (a fox at Hearthfall). Long gloved hands, a voice like warm silk, and a brass scale she never uses.',
      faction: '',
      location: 'Hearthfall',
      notes:
        "Calls herself Madame Ossery when asked. **Want:** deals, made fairly and kept exactly. Secretly, freedom (see the GM section). **Manner:** amused, patient, flirtatious with danger, and scrupulously honest about every price; she never lies, and she never says more than the deal requires. She appears at every Landing's Bargain Table and nowhere else. **With the player:** she likes clever bargainers and is bored by cautious ones. She sells the same things to the other Chosen and will say so if asked. **Slips:** she sometimes speaks of the Spire's floors as if she climbed them, a very long time ago.",
    },
    {
      name: 'Pip',
      shortDescription:
        'The Stairwell Peddler: a knee-high masked spirit in a patchwork coat with a pack three times its size, which unfolds into a shop. Talks about itself in the third person.',
      faction: '',
      location: 'Mossbell Waystation',
      notes:
        "**Want:** trade, gossip, and shiny things. **Manner:** fast-talking, cheerful, a little greedy, and fond of climbers who come back. It appears at every Waystation (and at Landings' markets) and somehow remembers every customer. Sells healing draughts, consumables, and gear up to the stratum's grade; buys loot and cores. It will trade a rumor about the next floors for a good story. If asked what it is, it says \"Pip is Pip!\" and changes the subject.",
    },
    {
      name: 'Lodgemaster Hollis Crane',
      shortDescription:
        "Master of the Climbers' Lodge. Sixties, lean, grey stubble, a missing hand replaced by a brass hook, a clipboard he never puts down. Weary and dry.",
      faction: LODGE,
      location: "The Climbers' Lodge",
      notes:
        "**Want:** fewer names on the dead-list. A former canal-guard captain who lost his hand in the first Surge. **Manner:** dry, blunt, decent; counts everything in lives. He registers climbers, posts contracts, and assigns hired help. He respects Chosen who bring his climbers home, and he will refuse hires to any Chosen who gets them killed carelessly. **Secret:** he has quietly asked the Broker, through a Chosen, what the Spire wants, and got an answer he hasn't told anyone: \"a Keeper\".",
    },
    {
      name: 'Fen Calloway',
      shortDescription:
        "A Lodge climber. Seventeen, gangly, freckled, with a too-big helmet, a spear he's very proud of, and boundless enthusiasm.",
      faction: LODGE,
      location: "The Climbers' Lodge",
      notes:
        "**Want:** to see the top of the Spire, and to bring enough shards home to buy his mother's vineyard back after the Spire tore it up. **Manner:** eager, chatty, braver than sensible. He will beg to climb with the character for half a cut. **Role:** the first hired companion: loyal, improving, and mortal. His death or survival should matter. His mother runs a soup stall at the Foot of the Spire.",
    },
    {
      name: 'Captain Isolde Graymantle',
      shortDescription:
        "Captain of the Royal Ascent. Forties, close-cropped grey hair, scarlet surcoat over scarred plate, a greatsword on her back, and a face that rarely moves.",
      faction: CROWN,
      location: 'Highcourt',
      notes:
        "**Want:** to bring her climbers home and get the Queen's Champion to the top. **Manner:** clipped, honest, unimpressed by flash. She recruits Chosen for the Crown with plain terms. **Secret:** she doesn't know what the Queen means to do at the Apex and has begun to suspect it isn't simply glory. If the character earns her trust, she becomes a strong ally inside the Crown.",
    },
    {
      name: 'Queen Maelis II',
      shortDescription:
        'Queen of Halvane. Fifties, silver-blonde, in deep green and gold, with a gracious smile and eyes that miss nothing.',
      faction: CROWN,
      location: 'Highcourt',
      notes:
        "**Public want:** to protect Cindral from the Surges and see Halvane's champion conquer the Spire. **True want (GM only):** to have her Champion reach the Apex and speak the founding wish of her line, renewing the Keeper Aurenna's wish for another three hundred years. She knows from the royal archive what the Spire is and what it costs the wisher. She would prefer a Chosen she owns, and she will offer the character titles, gold, and the Champion's place if they look stronger than Ren. **Manner:** gracious, patient, never asks a question she doesn't know the answer to.",
    },
    {
      name: 'Exarch Tallow',
      shortDescription:
        "Head of the Order of the Unbroken Stair. Thirties, gaunt, shaven-headed, barefoot in white robes, with burn-bright eyes and a soft, rapturous voice.",
      faction: ORDER,
      location: 'Temple of the Unbroken Stair',
      notes:
        "**Want:** for the world to worship the Spire and its Chosen saints, and for the Order to grow. He was a failed vintner a few months ago. **Manner:** soft, rapturous, utterly sincere, which makes him dangerous. He offers healing, followers, and sanctuary, and he turns crowds against any Chosen who blasphemes (Broker deals in public, human echoes, running from a Surge). **Secret:** he has been feeding pilgrims into the Spire's first floors as 'offerings', and some have not come back.",
    },
    {
      name: 'Corwin Gilt',
      shortDescription:
        "Factor of the Gilded Ascent. Forties, plump, immaculately dressed in gold-trimmed blue, rings on every finger, and the warm smile of a man doing sums.",
      faction: GILDED,
      location: 'The Gilded Exchange',
      notes:
        "**Want:** the Gilded Ascent controlling the Spire's trade: cores, gear, maps, and Chosen. **Manner:** warm, generous, always talking numbers. He buys loot and cores at fair prices and offers sponsorships: gear up front for a cut of every cache. He reads the fine print aloud, quickly. He wants Augustin Mbeki (if in play) under contract and is losing patience. **Secret:** the Gilded Ascent is quietly hoarding Gatekeeper cores for a buyer it hasn't named (the Queen).",
    },
    {
      name: 'Mother Yew',
      shortDescription:
        'Elder of Hearthfall. A tiny old Stairfolk woman with bark-brown skin, moss-green hair in braids, and eyes like bright beads. Leans on a staff that is putting out leaves.',
      faction: '',
      location: 'Hearthfall',
      notes:
        "**Want:** to keep her village safe, and to see a climber reach the Apex who will 'let the Spire rest'. **Manner:** warm, teasing, sharp. The Stairfolk have lived on this Landing 'for three hundred years and forty days' and know the Spire wakes and sleeps. **Quest:** Hearthfall children have been going missing on the stair down to Floor 9. **Clue she holds:** she remembers the last six Chosen, and which of them became Grummok.",
    },
    {
      name: 'Rook Abernathy',
      shortDescription:
        "Keeper of the Last Rung. Big, one-eyed, tattooed forearms, a laugh like a falling barrel. Keeps the floor tally over the bar in chalk.",
      faction: '',
      location: 'The Last Rung',
      notes:
        "**Want:** a full house and good stories. A former canal smuggler who bought the tavern with Surge-salvage shards. **Manner:** loud, nosy, generous with credit to climbers who come back. He knows every rumor in the plaza: who climbed, who died, who is selling what, and what the Queen's people were asking about last night.",
    },
  ],

  lore: [
    {
      title: 'The Spire and the System',
      keywords: ['spire', 'system', 'chosen', 'floor', 'floors', 'candidate'],
      alwaysInclude: true,
      body: "A white tower of a hundred floors that rose beside Cindral forty days ago. Six Chosen, souls from beyond the world, can see its System, which announces floors, clear conditions, ratings, caches, and level-ups only in fenced `system` blocks. Each Chosen has one permanent Chosen skill (the locked choice) whose power runs from level 1 to 10 with real costs. Floors are sealed pocket realms in ten strata. After every floor there is a Stairwell with a cache; every fifth floor is a Waystation (healing font, Pip's stall, hired aid, Return Glyph); every tenth, after a Gatekeeper, is a Landing (all of that, plus a forge, the Ascent Board, and the Broker's Bargain Table). Waystations and Landings are checkpoints. The character's highest floor and checkpoint are on the 'Spire Progress' condition.",
    },
    {
      title: 'The Bargain Table',
      keywords: ['bargain', 'broker', 'blessing', 'blessings', 'curse', 'curses', 'deal', 'deals'],
      body: "At every Landing the Broker keeps the Bargain Table. A first Gatekeeper kill earns one free blessing; each curse accepted buys one more. The board shows four blessings and four curses and is replaced entirely after every pick. She also trades cores, information, lives, and time, and always names the exact price.",
    },
    {
      title: 'Surges',
      keywords: ['surge', 'surges', 'toll', 'spill'],
      body: "When no Chosen clears a new highest floor for seven days, the Spire Surges at dawn and spills creatures from its highest reached stratum into Cindral. The Spire also Surges when a new Chosen wakes. The first Surge took the Lodgemaster's hand and the north vineyards; Cindral's people judge the Chosen by who fights them.",
    },
    {
      title: 'Shards',
      keywords: ['shard', 'shards', 'money', 'price', 'coin'],
      body: "Small, faintly warm crystal flakes from Spire caches, now Cindral's real currency. A meal costs 3 shards, a night at an inn 8, a healing draught 40, a plain sword 60, a Grade I weapon 250, a Grade II 1,200, a Grade III 6,000. Heart-cores sell for shards too: a Verdant Stair core for 10 to 20, a Gatekeeper core for hundreds.",
    },
    {
      title: 'Heart-cores',
      keywords: ['core', 'cores', 'heart-core', 'heart-cores', 'forge', 'forging'],
      body: "Every Spire creature leaves a heart-core when it dies: a warm, beating knot of crystal. Cores sell for shards, forge into gear at Landing forges, and are the Broker's favorite payment. A Gatekeeper's core is worth a fortune. Smiths say Gatekeeper cores sometimes have strange things fused inside them.",
    },
    {
      title: 'The Stairfolk',
      keywords: ['stairfolk', 'landing', 'landings', 'hearthfall', 'mother yew'],
      body: "People who live on the Spire's Landings, each Landing with its own folk, customs, and look: the bark-skinned, moss-haired Stairfolk of Hearthfall, the lantern-eyed boatfolk of Lanternwharf. They say they have lived there 'three hundred years and forty days', and they speak of the Spire as something that sleeps and wakes.",
    },
    {
      title: 'The Chosen',
      keywords: ['chosen', 'six', 'ascent board', 'rival', 'rivals'],
      body: "Six souls from another world, each given one Chosen skill: Blink, Onslaught, Rewind, Legion, Thousand Blades, and Heartforge. They arrived one by one over forty days; the character is the sixth and last. The Ascent Board at every Landing shows how high each one has climbed. Ordinary climbers who go up with a Chosen climb on their floor and share their caches.",
    },
    {
      title: 'The Kingdom of Halvane',
      keywords: ['halvane', 'cindral', 'queen', 'maelis', 'aurenna', 'crown'],
      body: "A rich river kingdom of vineyards and canals, founded three hundred years ago by Queen Aurenna, 'who rose from the river with a crown of light'. Queen Maelis II rules from Highcourt in Cindral. Since the Spire rose, Cindral has become a boomtown and a battlefield.",
    },
    {
      title: "The Climbers' Lodge",
      keywords: ['lodge', 'climber', 'climbers', 'hire', 'contract', 'contracts'],
      body: "The guild of ordinary climbers, in an old wine-hall at the Spire's foot, run by Lodgemaster Hollis Crane. It registers climbers, posts contracts, and hires climbers out to Chosen (10 to 30 shards a floor in the first stratum). Its slate board lists everyone up the Spire, and a longer one lists the dead.",
    },
  ],

  missions: [
    {
      title: "Daily Quest: The Climber's Due",
      description:
        'Issued by the System every dawn once the character has landed. Every objective must be complete before the day ends. The Spire likes its Chosen sharp, the System says, and it does not like waiting.',
      objectives: ['Win a fight or clear a floor', 'Spend an hour drilling with your weapon or your Chosen skill'],
      rewards: { xp: 40 },
      status: 'active',
      recurrence: 'daily',
      penalty: {
        hpLoss: 3,
        statusEffect: {
          name: "Spire's Disfavor",
          description: 'A heavy, sluggish dread, as if the tower has turned its attention away from you. Every effort is harder while it lasts.',
          turnsRemaining: 20,
          modifiers: [{ target: 'all', bonus: -2 }],
        },
      },
    },
    {
      title: 'The Sixth Chosen',
      description:
        "You landed at the Foot of the Spire in the middle of a Surge, and five other Chosen are already climbing. The System's first instruction is simple: survive, then climb.",
      objectives: [
        'Survive the Waking Surge at the Foot of the Spire',
        'Enter the Spire and clear Floor 1',
        'Reach Mossbell Waystation on Floor 5',
      ],
      rewards: { money: 60, xp: 150 },
      status: 'active',
    },
    {
      title: 'Gatekeeper of the Verdant Stair',
      description:
        'Floor 10 belongs to Grummok the Root-Crowned, a boar the size of a house with a tree growing out of its back. Beyond it is the first Landing, Hearthfall, and the Broker\'s Bargain Table.',
      objectives: ['Reach Floor 10', 'Defeat Grummok the Root-Crowned', 'Reach Hearthfall and sit at the Bargain Table'],
      rewards: {
        money: 250,
        xp: 300,
        items: [
          {
            name: "Grummok's heart-core",
            quantity: 1,
            description: 'A Gatekeeper core the size of a melon, green-gold and slowly beating, with something small and hard fused near its center.',
            tags: ['core', 'gatekeeper', 'verdant', 'valuable'],
          },
        ],
      },
    },
    {
      title: 'Register at the Lodge',
      giver: 'Lodgemaster Hollis Crane',
      description:
        "Any climber who wants contracts, hired help, or their name on the Lodge's board registers with Hollis Crane. Chosen pay no fee. Hollis wants to see your face, and he wants your word that you bring his people home.",
      objectives: ['Register at the Climbers\' Lodge and receive a Lodge token'],
      rewards: {
        xp: 20,
        items: [
          {
            name: 'Lodge token',
            quantity: 1,
            description: "A brass disc stamped with a rope-and-rung, your name, and CHOSEN. It lets you take Lodge contracts and hire climbers.",
            tags: ['lodge', 'document'],
          },
        ],
        relationships: [{ npc: 'Lodgemaster Hollis Crane', affinity: 3, trust: 5 }],
      },
    },
    {
      title: "Fen's First Floor",
      giver: 'Fen Calloway',
      description:
        "Fen Calloway has never been past Floor 2. He'll climb with you for half the usual cut if you'll take him up to the Waystation on Floor 5 and bring him home.",
      objectives: ['Take Fen Calloway up the Spire with you', 'Get Fen to Mossbell Waystation alive', 'Bring Fen back to the Foot of the Spire'],
      rewards: { xp: 80, relationships: [{ npc: 'Fen Calloway', affinity: 15, trust: 15 }] },
    },
    {
      title: "The Queen's Rope",
      giver: 'Captain Isolde Graymantle',
      description:
        'Captain Graymantle has an invitation from Queen Maelis: an audience at Highcourt, a purse, and a place on the Royal Ascent for a Chosen willing to climb under the Crown\'s banner.',
      objectives: ["Hear the Queen's offer at Highcourt", 'Climb a floor alongside the Royal Ascent', "Decide whether to swear as a Queen's Champion"],
      rewards: { money: 300, xp: 100, relationships: [{ npc: 'Captain Isolde Graymantle', affinity: 5, trust: 10 }] },
    },
    {
      title: 'The Gilded Sponsorship',
      giver: 'Corwin Gilt',
      description:
        "Corwin Gilt offers gear up front in return for a share of every cache, and a bonus for the first Gatekeeper core you bring him. He reads the terms aloud, quickly.",
      objectives: ["Hear Corwin Gilt's terms at the Gilded Exchange", 'Bring the Gilded Ascent a Gatekeeper heart-core'],
      rewards: { money: 500, xp: 60 },
    },
    {
      title: 'The Apex',
      description:
        'Why six Chosen? Why now? What is waiting on Floor 100, and what does the Spire want? This record holds what you have learned, and it can wait as long as you like.',
      objectives: [
        'See your name on the Ascent Board at a Landing',
        'Learn what a Gatekeeper really is',
        'Reach the Halfway House on Landing 50',
        "See the Broker's face",
        'Reach the Apex on Floor 100',
      ],
      rewards: { xp: 1000 },
    },
  ],

  character: {
    name: 'Alex Moreno',
    archetype: 'Chosen climber',
    bio: "Twenty-five, from San Diego. Ocean lifeguard at Mission Beach, weekend climbing-gym regular, the friend who drives everyone to the airport. The last thing you remember is a riptide, a kid's yellow boogie board, and getting the kid onto it. Then cold water closing over your head, then white light, and a voice that called you Candidate six of six.",
    location: 'The Foot of the Spire',
    money: 0,
    level: 1,
    xp: 0,
    hp: 12,
    maxHp: 12,
    statusEffects: [
      {
        name: 'Spire Progress',
        description: 'Highest floor cleared: none. Checkpoint: the Foot of the Spire.',
        turnsRemaining: null,
        modifiers: [],
      },
    ],
    attributes: { strength: 5, agility: 6, vitality: 6, perception: 5, will: 6 },
    unspentStatPoints: 0,
    skills: [
      { name: 'Swimming', level: 3, xp: 30, description: 'Open-water lifeguard: rip currents, rescues, and hours in cold surf.' },
      { name: 'First Aid', level: 2, xp: 15, description: 'Lifeguard certified: CPR, bleeding control, spinal holds.' },
      { name: 'Climbing', level: 2, xp: 10, description: 'Bouldering gym regular. Real cliffs are another matter, let alone a tower.' },
    ],
    items: [
      {
        name: 'Climber\'s clothes',
        description: 'Plain grey trousers, a sleeveless tunic, and soft boots, the clothes the Spire dressed you in. They fit perfectly, which is unsettling.',
        tags: ['clothing'],
        equipped: true,
      },
      {
        name: 'Chosen Sigil',
        description: 'A white mark like a stair of six steps on the inside of your left wrist. One step glows. It warms near the Spire\'s gate and the Return Glyphs.',
        tags: ['chosen', 'mark'],
      },
    ],
    relationships: [],
  },
};
