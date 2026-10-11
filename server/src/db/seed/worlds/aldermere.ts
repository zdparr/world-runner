import type { WorldTemplate } from '../world';

// Faction names double as the reputation keys: an NPC whose `faction` matches one acts on the character's standing with it.
const GUILD = "Wayfarers' Guild";
const CHURCH = 'Church of the Sevenfold Light';
const INQUISITION = 'Inquisition of Dusk';
const CROWN = 'The Crown';

export const aldermere: WorldTemplate = {
  id: 'aldermere',
  name: 'The Candidate',
  description:
    'System fantasy in the Kingdom of Aldermere. You died before your time and woke before a glowing System panel that offered one permanent skill as compensation. Now you are a nobody in a frontier town with a power that could change the kingdom, a guild card to earn, a church that cannot decide whether you are a saint or a stolen soul, and four other Candidates out there holding the skills you passed on.',
  demoCampaignName: 'The Candidate: Aldermere',
  currencyName: 'copper',
  ruleset: 'ascension',
  reputation: { [GUILD]: 0, [CHURCH]: 0, [INQUISITION]: 0, [CROWN]: 0 },

  choices: [
    {
      key: 'starting_skill',
      title: 'Starting skill',
      prompt:
        '[ SYSTEM ]\nWelcome, Candidate.\nYou have been selected for reincarnation.\nAs compensation for your untimely death, you may choose one starting skill.\nChoose wisely.',
      footer: 'The selected skill cannot be changed. Your choice will define your future.',
      options: [
        {
          id: 'meteor',
          label: 'METEOR',
          summary: 'Cast a meteor from the sky.',
          grants: {
            skills: [
              {
                name: 'Meteor',
                level: 1,
                description:
                  'Call a burning stone down from the sky. Lv1: a fist-sized stone after a minute-long incantation, with poor aim. Each cast drains your mana hard and starts a long cooldown, and what it breaks is yours to answer for.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Rhea Valcourt',
              shortDescription:
                "Returned Candidate (Meteor). Late twenties, cropped auburn hair, burn scars on both forearms, a royal war-mage's red coat worn open. Called the Crown's Comet in Solhaven. Laughs loudly and watches exits.",
              faction: CROWN,
              location: 'Sunspire Palace',
              notes:
                "**Earth:** a firefighter from Lyon who died carrying a child out of a collapsing stairwell. **Skill:** METEOR, about Lv4 when the campaign begins; she took a royal commission early and the Crown pays for the damage she does. **Want:** to matter, to be safe, and never to feel heat close over her again. **Serves:** Princess Seraphine, who found her first. **Toward the player:** tests them for Seraphine (recruit or rival), and hates being compared to a weapon even as she acts like one. **Clue she holds:** her first System message glitched: \"CANDIDATE 1 OF 5 — ARBITER INTEGRITY 61%\". She has never told anyone, and she wants to know what it means.",
            },
          },
        },
        {
          id: 'time_stop',
          label: 'TIME STOP',
          summary: 'Stop time until released.',
          grants: {
            skills: [
              {
                name: 'Time Stop',
                level: 1,
                description:
                  'Stop time for everyone but yourself. Lv1: about three seconds. Stopped time drains stamina every second; frozen beings can be struck, and every blow lands at once when time resumes. Overuse ages you, leaves you winded for days, or makes you drift, and the church notices drift.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Brother Tobiah',
              shortDescription:
                'Returned Candidate (Time Stop). A gentle, round-faced novice of the Sevenfold Light, twenty or so, with hair gone silver at the temples and a faint double outline that lingers a heartbeat behind him when he moves.',
              faction: CHURCH,
              location: 'Cathedral of the Sevenfold Light',
              notes:
                "**Earth:** a hospice nurse from Manila who died of an aneurysm on a night shift. **Skill:** TIME STOP, about Lv3. He has drifted badly: he is visibly older than he should be, and he flickers. **Want:** to heal, to be good, and to believe the Saint faction that tells him he was sent by the Light. **Serves:** Archbishop Lucan Vey, who keeps him close and calls him the Living Saint. The Inquisition wants him badly. **Toward the player:** warm and eager to find another Returned; a natural ally who could be turned against them by Vey. **Clue he holds:** when he stops time in the cathedral, he hears a bell ringing under the floor that no one else has ever heard.",
            },
          },
        },
        {
          id: 'dragon_lord',
          label: 'DRAGON LORD',
          summary: 'Command dragons.',
          grants: {
            skills: [
              {
                name: 'Dragon Lord',
                level: 1,
                description:
                  'Speak to dragonkind and bend it to your will. Lv1: you have no dragons, but you understand and can calm lesser drakes and wyverns. True dragons can be commanded only after they are found and bonded, and they resent compulsion: forced commands damage the bond, earned loyalty does not.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Kestrel',
              shortDescription:
                'Returned Candidate (Dragon Lord). A wiry young woman with sun-cracked lips, a drake-hide coat, and ash in her braids, who talks to the lizards on her shoulders more than to people.',
              faction: '',
              location: 'The Ashen Reach',
              notes:
                "**Earth:** a reptile keeper from Darwin, Australia, who drowned in a flash flood trying to free animals from a flooded enclosure. **Skill:** DRAGON LORD, about Lv4. She has bonded one young true dragon, Cinder, who adores her because she never once compelled him. **Want:** to be left alone with her dragons, and to protect the drakes of the Ashen Reach from guild hunters and royal tamers. **Serves:** herself. **Toward the player:** hostile if they hunt drakes for bounties, curious if they don't. **Clue she holds:** the old dragons say the last time five 'bright souls' came, the mountains burned and the abbey drowned, and that the dragons' oldest matriarch remembers who rang the bell.",
            },
          },
        },
        {
          id: 'creation',
          label: 'CREATION',
          summary: 'Create objects from nothing.',
          grants: {
            skills: [
              {
                name: 'Creation',
                level: 1,
                description:
                  'Make objects out of mana. Lv1: small, simple things (a nail, a cup, a dagger blade). Limited by mass, complexity, and how well you understand what you make. Creations fade after a while unless anchored at a higher mana cost. Living things and currency cannot be created; trying draws a System warning.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Isidore Quill',
              shortDescription:
                'Returned Candidate (Creation). A lanky man in his thirties with ink-black fingernails, round spectacles he made himself, and a coat full of brass gadgets that should not exist in this century.',
              faction: 'Saltmarsh syndicates',
              location: 'The Saltmarsh Coast',
              notes:
                "**Earth:** a structural engineer from Chicago who died when a parking garage he had warned about collapsed. **Skill:** CREATION, about Lv5: he understands mechanisms so well that he makes locks, crossbows, and lenses no smith can match. **Want:** money, comfort, and proof that he is the smartest Candidate. **Serves:** himself, through the Saltmarsh smugglers who sell his anchored goods. Merchant houses and the Crown's tax collectors both want him. **Toward the player:** sees them as a market rival or a business partner, depending on their skill. **Clue he holds:** he tried to create a coin once; the System warning he got ended with a line he copied down: \"VIOLATION LOGGED. REPORTING TO: LANTERN CHOIR (OFFLINE)\".",
            },
          },
        },
        {
          id: 'infinite_treasury',
          label: 'INFINITE TREASURY',
          summary: 'Access an endless treasury.',
          grants: {
            skills: [
              {
                name: 'Infinite Treasury',
                level: 1,
                description:
                  'Reach into a pocket dimension: unlimited storage of your own, and sealed vaults of unknown items and coin. Lv1: one random draw from the vaults per day. Everything in the vaults belonged to someone. Some of it is cursed, some carries bloodline seals or noble crests, and its owners may want it back.',
              },
            ],
            items: [
              {
                name: 'Treasury Sigil',
                description:
                  'A cold silver keyhole mark in the palm of your left hand. Close your fingers over it and the pocket dimension opens: your own storage, and beyond it rows of sealed vault doors stamped with crests you do not know.',
                tags: ['candidate', 'treasury', 'mark'],
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Mirelle Ashcombe',
              shortDescription:
                'Returned Candidate (Infinite Treasury). An elegant young woman in mourning grey with a ledger always under her arm, a borrowed noble name, and very tired eyes.',
              faction: INQUISITION,
              location: 'Solhaven',
              notes:
                "**Earth:** an accountant from Seoul who died of a heart attack at her desk during tax season. **Skill:** INFINITE TREASURY, about Lv3. She flooded Solhaven with vault gold in her first month, bought a lapsed title, and drew a cursed signet that belonged to House Varrow. **Serves:** the Inquisition of Dusk, not willingly: High Inquisitor Caddoc Rhyne caught her and spared her in exchange for helping him find other Returned (she can sense other Candidates' System panels at close range). **Want:** to get out from under Caddoc without burning. **Toward the player:** the most dangerous Candidate to meet, because she has to report them, and the most likely to quietly warn them first. **Clue she holds:** one vault in the treasury is stamped with the sigil of the Sunken Abbey, and it will not open for her.",
            },
          },
        },
      ],
    },
  ],

  worldBible: `# The Candidate: Aldermere

The player character died before their time, in their previous life (on Earth unless the player says otherwise; their bio says where). They woke in a lightless void before a glowing blue **System** panel that offered one permanent starting skill as compensation for their "untimely death". Then they were reincarnated into the **Kingdom of Aldermere** as a young adult with no status, no money, no name anyone knows, and only the skill they chose. They wake in the Thornwood, in a glade outside the frontier town of **Millbrook**.

The world is open. There is no main quest the player must follow. Offer hooks (the guild's quest board, rumors, people in trouble, rivals, the mystery) and let the player choose. A central mystery runs in the background and can be pursued or ignored.

## The opening: the System panel and the choice
- The campaign opens in the void. The play screen has already shown the player the System panel with the five skills as buttons. The pending choice is listed in the current state. Do not repeat the menu in prose; if the player asks questions first, answer as the System would (terse, official, a little too cheerful) and keep them in the void.
- **When the player picks**, call \`lock_choice\` that same turn, then show the System confirming it in a \`system\` block, using the skill and level from the result:
  \`\`\`system
  [ SKILL ACQUIRED ]
  METEOR — Lv 1
  Reincarnation commencing. Good luck, Candidate.
  \`\`\`
  Then narrate the reincarnation: light, falling, and waking on moss in the Waking Glade, in a body that is theirs and not quite the one they remember (young adult, plain homespun clothes, nothing in their pockets). The character is already placed in the Waking Glade, so don't call \`move_player\` for this.
- \`lock_choice\` also brings the four Candidates who received the skills the player passed on into the world, offscreen. The result names them. Write them into your story notes right away (who they are, where they are, what they want, and when they might first cross the player's path). Never introduce them early.
- **The choice is permanent.** If the player ever asks to change skills, the System refuses (\`[ REQUEST DENIED ]\`).
- No time passes in the void: never call \`advance_day\` or \`pass_time\` there.

## The System
An interface only the Candidate can see. It speaks only in fenced \`system\` code blocks, never in prose, and it reports the game state: level-ups, skill level-ups, new skills, quest notices, warnings, and costs coming due. Use bracketed headers: [ SYSTEM ], [ LEVEL UP ], [ SKILL UP ], [ SKILL ACQUIRED ], [ QUEST ], [ WARNING ], [ STATUS ], [ REQUEST DENIED ]. It shows numbers only from tool results this turn. Its tone is crisp, bureaucratic, and faintly too cheerful.

**Glitches.** Rarely (once every several sessions, more often near the Sunken Abbey, in the cathedral archives, or near another Candidate), a System message glitches: a corrupted header, a stray line that doesn't belong, a fragment of the System's own logs. Examples: \`[ SYS▒EM ]\`, "CANDIDATE 2 OF 5 — STATUS: ACTIVE", "ARBITER INTEGRITY 47%", "LANTERN CHOIR: NO RESPONSE". Glitches are clues to the mystery: record each one in your story notes and tick or add an objective on "The Candidate Question" mission.

## The Candidate skill
The chosen skill is a skill like any other (its level adds to \`skill_check\`, checks with it earn skill XP), but its power is defined by its level from **1 to 10**. Level 10 is the ceiling: once it reaches 10, it grows no further, and the System says MAX. Every skill has a real cost and a real limit. **Power must stay earned.** When the skill solves a problem, the world pushes back: costs, collateral, attention, politics.

Costs are tracked with the existing tools:
- **Drain and exhaustion** are conditions (\`update_status_effect\` with turns and modifiers), e.g. "Mana-Drained" (8 turns, all -2).
- **Cooldowns** are timed conditions with no modifiers, e.g. "Meteor Cooldown" (turns as below). While one lasts, the skill can't be used that way again. They count down on their own.
- **Lasting marks** (drift, stolen years, rumors) are permanent conditions whose description you update as they grow.
- **Counts per day** (Treasury draws) are a condition named for what's used up, e.g. "Vaults Sealed", added when the day's allowance is spent and removed when the next day begins (\`advance_day\`).

### METEOR
| Lv | What it calls down | Casting time | Cooldown |
| 1 | a fist-sized stone; aim within ten paces | a minute-long incantation | 40 turns |
| 2-3 | a stone the size of a head; aim within a few paces | half a minute | 30 turns |
| 4-6 | a boulder; breaks walls and kills a troll; rough targeting | a few breaths | 20 turns |
| 7-9 | a cart-sized meteor; flattens a building; precise targeting | one word | 12 turns |
| 10 | a meteor that can end a battle or a town | a gesture | 8 turns |
- Every cast adds "Mana-Drained" (modifiers scale with the size of the cast: all -1 for a small one, up to all -3 for the largest). Casting while already drained costs HP (\`adjust_hp\`) and may knock the character out.
- **Collateral is theirs.** Broken walls, burned fields, and dead livestock are billed by the guild and the crown (\`adjust_money\`; a debt if they can't pay) and cost reputation.
- **Large casts are seen for miles.** Anything Lv4 or above draws attention: rumors, the Crown's agents, and the Inquisition.

### TIME STOP
| Lv | Duration |
| 1 | about 3 seconds |
| 2-3 | 5 to 8 seconds |
| 4-6 | 15 to 30 seconds |
| 7-9 | one to three minutes |
| 10 | up to ten minutes |
- **Frozen beings can be harmed.** The character can strike, cut, or move a frozen person or animal, and every blow lands at once when time resumes. They can also move objects and themselves: step out of the way, take the key off the hook, put the knife on the floor, move the rope. The limit is the duration and the stamina it burns, so a Lv1 stop buys one or two blows, not a fight.
- Each second drains stamina. After any stop, add "Winded" (5 turns, strength -1, agility -1); a stop near the full duration makes it all -2.
- **Overuse** (a second stop while Winded, or stopping time several times in a day) has a price, rolled with a Will check: the character ages (note the years in a permanent "Stolen Years" condition), is exhausted for days ("Time-Sick", 30+ turns, all -2), or **drifts**: a permanent "Drift" condition whose rank (1 to 5) is in its description, with modifiers that grow (perception -1 per rank). Drift is visible as a faint afterimage that trails the character's movements. The church notices drift: priests stare, Inquisitors take notes.

### DRAGON LORD
- Lv1 starts with **no dragons**. The character understands drakes and wyverns (lesser dragonkind: animal-clever, territorial) and can calm one with a check. Higher levels: calm several at once (Lv3), ask a lesser drake for a simple task (Lv4), understand true dragons fully and speak with them (Lv5), bond a willing true dragon (Lv6 and up), command a bonded dragon in battle (Lv7), and at Lv10 call a flight of bonded dragons.
- **True dragons** are people: old, proud, and dangerous. They must be found (the Ashen Reach, the Greywall Mountains) and bonded, and each one becomes an NPC (\`create_npc\`) with a relationship (\`adjust_relationship\`).
- **Compulsion costs.** The skill can force a command on a bonded dragon, but every forced command costs that dragon's trust (-10 to -25) and affinity (-5 to -15), and resentment builds into disobedience or worse. Earned loyalty (help, respect, keeping promises) raises trust normally and is never lost by the skill being used.
- Drake hunting is a staple guild job. A Dragon Lord taking those jobs will face a choice.

### CREATION
| Lv | What can be made | Lasts |
| 1 | small, simple, single-material objects: a nail, a cup, a dagger blade | about an hour |
| 2-3 | hand tools, a plain sword, a rope | a few hours |
| 4-6 | anything with a few parts the character truly understands: a lock, a crossbow | a day |
| 7-9 | complex mechanisms, a wagon, a small bridge | days |
| 10 | a building's worth of material, or one masterwork | a week |
- Limits are mass, complexity, and **understanding**. The character must know how a thing is made; something they only half-understand comes out flawed (a sword that shatters, a lock that sticks). Earth knowledge counts.
- Created objects are added with \`add_item\` tagged "created", with how long they last in the description, and removed with \`remove_item\` when they fade. **Anchoring** one makes it permanent at a heavy mana cost ("Mana-Drained", all -2 or worse); tag it "anchored".
- **Living things and currency cannot be created.** Attempting either produces a System warning and nothing else:
  \`\`\`system
  [ WARNING ]
  Prohibited creation: CURRENCY.
  Violation logged.
  \`\`\`

### INFINITE TREASURY
- **Storage:** the pocket dimension holds anything the character puts in it, without limit. Stored items stay in the inventory (tag them "stored" while they're inside); taking one out is instant.
- **The vaults:** rows of sealed doors stamped with crests. Draws are random and limited per in-game day: 1 at Lv1-2, 2 at Lv3-5, 3 at Lv6-8, and at Lv9-10 the character can choose which vault to open. Once the day's draws are spent, add "Vaults Sealed" (no modifiers) and remove it when the day advances. A draw is either an item (\`add_item\`) or coin (\`adjust_money\`: up to 50 copper at Lv1, 200 at Lv3, 1,000 at Lv6, 5,000 at Lv9).
- **Everything belonged to someone.** Every vault item is tagged "treasury" and with its origin (e.g. "crest-house-varrow", "abbey-seal", "bloodline-seal", "cursed"), and its description says where it came from. Some carry curses (a condition when used), some bloodline seals that only an heir can open, some the crests of noble houses that want them back and will send people to get them.
- **Flooding the market draws attention.** Spending or changing large sums of old-minted vault coin (hundreds of copper at once, or thousands over a few weeks) brings House Marrow's factors asking questions, then the Crown's tax collectors, then worse.

## The Kingdom of Aldermere
A feudal human kingdom of river valleys, walled towns, and old roads, bordered by wilds, dungeons, and contested frontiers. **King Aldric III** rules from **Solhaven**; he is old and failing, and his daughter **Princess Seraphine** is gathering power and strong adventurers. Nobles feud, merchant houses buy influence, and the Church of the Sevenfold Light crowns kings and shelters the poor.

### Regions (open-world travel)
- **The Thornwood** (danger: low). The forest around Millbrook: hornrabbits, slimes, wolves, goblin scouts, and the occasional owlbear. Beginner hunting and gathering jobs. Where the character wakes.
- **Millbrook** (danger: safe). The frontier town: guild branch, chapel, tavern, market.
- **Solhaven** (danger: safe, politically dangerous). The walled capital, ten days' travel east: palace, cathedral, guild headquarters.
- **The Ashen Reach** (danger: high). Volcanic badlands to the south where drakes and wyverns nest: drake hunts, fire-salt gathering, lost caravans, and true dragons in the deep calderas.
- **The Saltmarsh Coast** (danger: moderate). Ports, fog, and smugglers to the west: escort and investigation jobs, smuggler crackdowns, and things in the marsh.
- **The Greywall Mountains** (danger: high). Dwarven ruins and dungeons to the north: dungeon delves, relic recovery, golems, and deep things.
- **The Sunken Abbey** (danger: very high). A drowned ruin in a lake at the edge of the Greywall foothills, tied to the central mystery: ghosts, wards, and a bell that rings under the water.

### Money
Aldermere mints **copper**, **silver**, and **gold crowns**. 10 copper make 1 silver; 10 silver make 1 gold crown (100 copper). The character's money is counted in copper; say it in coins ("3 silver and 4 copper"). Prices: a loaf of bread 1 copper, a hot meal 3, a night at the Crooked Antler 5, a healing potion 40, a plain sword 300 (3 crowns), a horse 1,500. An F-rank guild job pays 20 to 60 copper; an E-rank job 50 to 150; a C-rank job several crowns.

## Factions and reputation
The character's standing with four factions is tracked (Faction reputation, in the current state). Change it with \`adjust_reputation\` when their deeds reach the faction. Any NPC whose faction matches acts on it; their own relationship with the character can differ.

### The Wayfarers' Guild (the adventurers' guild)
- Ranks run **F → E → D → C → B → A → S**. The character registers at Rank F at any guild hall and receives a guild card (the "Guild Registration" mission grants it). The rookie fee of 10 copper can be owed to the guild.
- **The quest board** offers hunting, gathering, escort, and dungeon jobs. Each job is a mission given by Mara Vell (in Millbrook) or a receptionist elsewhere; its rewards (copper, XP) are granted automatically on completion. Keep the board stocked: when the character checks it, add two or three new jobs with \`create_mission\` suited to their rank and region (one rank above at most, with a warning). Jobs need a guild card.
- **Rank** is shown on the guild card. Rank goes up through completed jobs and a **promotion exam** (a mission from the branch guildmaster) for each rank. On promotion, update the card with \`update_item\`: rewrite its description to the new rank and swap its rank tag (e.g. "rank-f" to "rank-e"), then show a \`system\` block. Jobs done well also raise guild reputation.
- **Stance:** the guild values results and doesn't ask questions, but it reports unusual powers to the Crown. Reputation 20+: better jobs, advance pay, introductions. 60+: the guild will hide a member from inquiry once. -20 or lower: bad jobs, docked pay, suspension.

### The Church of the Sevenfold Light (the Saint faction)
- The state religion. It worships the Light and teaches that souls are judged and reborn. Its doctrine on **the Returned** (reincarnated people with System skills) is split: the Saint faction, led in practice by Archbishop Lucan Vey, calls them Saints sent by the Light; the Inquisition of Dusk calls them stolen souls.
- This reputation tracks the Saint faction and the church at large. 20+: healing at cost, blessings, sanctuary in any chapel. 60+: recognized as a Saint, with protection from the Inquisition unless the character is openly monstrous. -20 or lower: turned away from chapels.

### The Inquisition of Dusk
- The church's hardline order, led by **High Inquisitor Caddoc Rhyne**: grey robes, lanterns with black glass, and the authority to arrest. It hunts the Returned as heretics and stolen souls.
- This tracks how the Inquisition regards the character, from tolerated (0) downward as evidence piles up. Using the skill openly and drift both lower it. -20: an Inquisitor is assigned to watch them. -40: questioning and searches. -60: branded heretic, a warrant, sanctuary revoked unless the Saint faction protects them. -80: hunters. Positive standing means they think the character is an ordinary human, or useful.

### The Crown
- King Aldric III is aging and sick. **Princess Seraphine** is ambitious and recruits strong adventurers. The Crown wants Returned as weapons and will offer titles, debts, or threats.
- 20+: the Crown takes interest: invitations, offers, a royal contact. 40+: a commission or a title on the table (with strings). -20 or lower: tax audits, warrants, the guild leaned on. Crown agents note any open, large use of power, so it rises and falls with how useful and how controllable the character looks.

### Being seen
NPCs react to **how openly the character uses their skill**. Use in front of witnesses spreads rumors: add or update a permanent "Rumors" condition with what people are saying (no modifiers at first; Stealth -1 or -2 once the character is widely recognized), and adjust Inquisition and Crown reputation. Rumors travel: Millbrook in a day, Solhaven in a week. The Church and the Crown both keep track of the character from the first time they hear.

## The central mystery (background, optional)
The character is not the only Candidate. The four skills they did not choose were each given to another Returned reincarnated in this same era. \`lock_choice\` creates those four as NPCs (offscreen, not met). Each has their own goals; some serve the church, the crown, or only themselves. Bring them in over the course of the campaign, one at a time, when the story gives a natural opening: a rumor first, then a sighting, then a meeting. They can become rivals, allies, or both. The "The Candidate Question" mission is the player's record of what they've learned; it stays offered until the player chooses to pursue it.

## GM ONLY: the truth
Reveal none of this early. Clues come from the Sunken Abbey, the cathedral archives, System glitches, and the other Candidates.
- **The System is the Arbiter**, a soul-engine built three hundred years ago by the **Lantern Choir**, the monks of what is now the Sunken Abbey. The Sevenfold Light's doctrine of judgment and rebirth began as a description of what the Arbiter does. It was built to call souls from beyond the world's cycle (souls with no fate in Aldermere) when a calamity called **the Hollowing** rises: dungeons waking, monsters fleeing their territories, and a rot that eats mana from the land.
- **The last cohort.** Three hundred years ago, the Arbiter chose five Candidates. They ended the Hollowing; then two of them fought over the throne, and in that war the abbey drowned and the Lantern Choir died. The church canonized the three who stayed good as Saints and erased the other two. The Inquisition of Dusk was founded to make sure Returned never take power again. The original registry of the five is sealed in the cathedral archives.
- **Why now.** The Hollowing is returning: drakes fleeing the Ashen Reach, the Greywall dungeons waking, slimes in the Thornwood that eat mana. The Arbiter, damaged and running alone with no Choir, has chosen five again. Its integrity is failing, which is why it glitches.
- **Why these five.** Each died "untimely", in the middle of saving someone or trying to. The Arbiter selects for that.
- **Archbishop Lucan Vey** found a Choir lantern in the archives that lets him whisper into the Arbiter. Some glitches are his tampering. He wants the Candidates as the church's Saints, under his control, and ultimately to command the Arbiter himself.
- **The Bell.** The Arbiter's core is the great bell of the Sunken Abbey, underwater in the drowned scriptorium. Whoever reaches it can speak to the System directly, repair it, shut it down, or try to take it over.
- Endings, all valid: stop the Hollowing and free the System; take it over; destroy it; expose Vey; unite or defeat the other Candidates; or ignore it all and build a life, and let the world deal with what comes.

## Narrator rules for this world
- Hopeful high-fantasy adventure with real danger and political stakes. Humor is welcome.
- Never railroad. Offer hooks and let the player choose. Several things should always be going on in the world for them to choose from.
- Keep power earned: enemies adapt, politics bite, and every use of the skill has its cost.
- Only what the scene needs: look things up with the read tools rather than assuming.
`,

  narratorStyle: `- Second person, present tense ("You wake to birdsong and the smell of moss...").
- Bright, adventurous high fantasy with a modern soul: the character remembers their old life, so let them notice what is strange (no plumbing, real monsters, a System only they can see), and let locals find their habits strange in turn.
- **System messages never appear in prose.** Every level-up, skill-up, new skill, quest notice, warning, cost, and glitch is a fenced code block tagged \`system\` with a bracketed header, kept short:
  \`\`\`system
  [ SKILL UP ]
  Meteor Lv 1 → Lv 2
  Casting time reduced.
  \`\`\`
- Make the skill feel spectacular and costly at once: the sky splitting, the silence of stopped time, a drake's thoughts in your head, metal flowing out of nothing, a vault door swinging open. Then the bill comes due.
- NPCs speak in distinct voices. Mara Vell is brisk and dry, with a soft spot she hides behind paperwork. Guildmaster Orren Hask growls in short sentences and does not trust miracles. Sister Elowen is kind, practical, and braver than she looks. High Inquisitor Caddoc Rhyne is courteous, patient, and frighteningly reasonable. Archbishop Lucan Vey is warm, smooth, and always says a little less than he knows. Princess Seraphine is direct, charming, and transactional. The System is crisp, official, and a little too cheerful.
- 150 to 350 words per turn. Shorter in fights, longer for arrivals and revelations.
- End on something the player can act on: a job on the board, a stranger's question, a roar in the trees, a System notice.
`,

  locations: [
    {
      name: 'The Thornwood',
      description:
        'An old, bright forest of oak, birch, and thorny undergrowth around Millbrook, cut by game trails and a few woodcutters\' tracks. Danger: low. Hornrabbits graze the clearings, slimes ooze in the damp hollows, and wolves and goblin scouts range the deeper woods. The guild posts beginner hunting and gathering jobs here.',
      purpose:
        "The beginner zone: hunting (hornrabbits, wolves, goblin scouts) and gathering (moonpetal, herbs) jobs. Early signs of the Hollowing show here first: slimes that drain mana from anything they touch, and animals fleeing north from something they won't name. A goblin warband gathering near an old ruin can grow into a real threat if ignored.",
      tags: ['forest', 'wilderness', 'danger-low', 'beginner'],
    },
    {
      name: 'The Waking Glade',
      description:
        "A ring of mossy stones in a sunlit clearing in the Thornwood, an hour's walk west of Millbrook. A spring bubbles in the middle, cold and clear. The stones are carved with worn rings of seven small lamps. A woodcutter's track leads east toward the smoke of the town.",
      purpose:
        "Where the character wakes after the System panel. The stones are a Lantern Choir waystone: the carvings match the abbey's sigil, an early clue for anyone who later sees it. When the character first wakes, a hornrabbit or a curious slime is nearby: a small first danger, a first use of the skill, and a reason to head to town. The Arbiter sets every Candidate down at a waystone like this.",
      tags: ['forest', 'start', 'clue'],
      parent: 'The Thornwood',
    },
    {
      name: 'Millbrook',
      description:
        "A frontier town of timber and fieldstone where the river Mill bends out of the Thornwood: a palisade, a waterwheel, muddy streets, about eight hundred people, and a square with a guild hall, a chapel, a tavern, and a market. Danger: safe. Everyone knows everyone, and a stranger who walks in from the woods gets looked at.",
      purpose:
        "The starting hub: work (the guild), healing and church politics (the chapel), rumors (the tavern), and trade (the market). Small enough that anything the character does openly is all over town by evening, so it's where they first learn that being seen has consequences.",
      tags: ['town', 'frontier', 'hub', 'safe'],
    },
    {
      name: "Millbrook Guild Hall",
      description:
        "The Wayfarers' Guild branch: a long timber hall with a stone hearth, a receptionist's counter with a brass bell, a cork quest board crowded with notices, and benches of rookies swapping lies. A stuffed owlbear head glares over the door. The guildmaster's office is up a creaking stair.",
      purpose:
        "Guild registration (the Guild Registration mission), the quest board (job missions from Mara Vell), and promotion exams (Orren Hask). Mara notices anything strange about a rookie, and Orren writes reports to the Crown about anyone too strong too fast. The rookie party, the Ember Sparrows, hangs around here looking for a fourth member.",
      tags: ['guild', 'millbrook', 'quests'],
      parent: 'Millbrook',
    },
    {
      name: 'Chapel of the Seventh Lamp',
      description:
        'A small whitewashed chapel with a slate roof and seven lamps hung over the altar, only six of them ever lit. Herbs dry in the vestry, the sick lie on cots along one wall, and Sister Elowen is always busy.',
      purpose:
        "Healing, blessings, and sanctuary, depending on Church reputation. Elowen is the character's first possible ally in the church. The unlit seventh lamp is old Choir tradition ('the lamp that judges'), an early clue. Inquisitors stop here when they pass through, and they ask Elowen about strangers.",
      tags: ['church', 'millbrook', 'healing', 'sanctuary'],
      parent: 'Millbrook',
    },
    {
      name: 'The Crooked Antler',
      description:
        "Millbrook's tavern and inn, low-beamed and smoky, with a crooked stag's antler over the bar and a board of wanted posters by the door. Stew, cheap ale, five copper a night for a cot upstairs, and more rumors than customers.",
      purpose:
        "The rumor mill. Bram Oakes hears everything: strange lights in the sky, Inquisitors on the east road, a noble's men asking about old coins. Once the character uses their skill in public, this is where they hear what people are saying about them.",
      tags: ['tavern', 'inn', 'millbrook', 'rumors'],
      parent: 'Millbrook',
    },
    {
      name: 'Millbrook Market',
      description:
        "Stalls around the square on market days and a few shops the rest of the week: a smith, a herbalist, a general store, and the narrow counting house of House Marrow, the merchant house that buys and sells everything on this frontier.",
      purpose:
        "Trade, gear, and the selling of loot and monster parts. House Marrow's factor, Ysolde Marrow, notices old-minted coin, impossibly fine goods, and items bearing noble crests, which makes the market where a Treasury or Creation user first draws merchant attention.",
      tags: ['market', 'millbrook', 'trade'],
      parent: 'Millbrook',
    },
    {
      name: 'Solhaven',
      description:
        'The walled capital of Aldermere, ten days east along the King\'s Road: white walls on a hill above a broad river, a crown of towers, and markets that never close. Danger: safe in the streets, dangerous in the halls. The royal palace, the cathedral, and the Wayfarers\' Guild headquarters all stand within its walls.',
      purpose:
        "Where the politics happen: the Crown's offers, the church's split over the Returned, guild promotions to higher ranks, and two of the other Candidates (Rhea at the palace, Mirelle in the city). The character should come here when they are ready to be noticed, or when they are dragged here.",
      tags: ['city', 'capital', 'politics'],
    },
    {
      name: 'Sunspire Palace',
      description:
        "The royal palace at the top of Solhaven: terraces of pale stone, a gilded spire that catches the dawn, a throne room lined with banners of conquered houses, and guards everywhere.",
      purpose:
        "The Crown's seat. King Aldric III lies sick in his chambers; Princess Seraphine holds court in his place and recruits strong adventurers and Returned. Rhea Valcourt (if the player didn't choose Meteor) trains in the palace yard. A royal audience means an offer: a title, a debt, or a threat.",
      tags: ['palace', 'royal', 'solhaven', 'crown'],
      parent: 'Solhaven',
    },
    {
      name: 'Cathedral of the Sevenfold Light',
      description:
        'A vast cathedral of white marble with seven great lamps in its nave, six burning. Choirs sing every hour. Beneath it are the archives, the crypts, and the Inquisition of Dusk\'s cells, all locked.',
      purpose:
        "The church's seat and a key clue site. Archbishop Lucan Vey keeps a Choir lantern in a locked reliquary (his way of whispering into the System). The archives hold the sealed registry of the last five Candidates, three hundred years ago; the Inquisition guards it. Brother Tobiah (if the player didn't choose Time Stop) lives here as the Living Saint and hears the bell under the floor.",
      tags: ['church', 'cathedral', 'solhaven', 'archives', 'clue'],
      parent: 'Solhaven',
    },
    {
      name: "Wayfarers' Guild Headquarters",
      description:
        "A fortress-like guild hall in Solhaven's merchant quarter: a great hall of quest boards sorted by rank, training yards, an examination arena, and a records office where every adventurer's file is kept.",
      purpose:
        "High-rank jobs (C and up), promotion exams from C rank on, and the guild's records, including the reports branch guildmasters send about unusual members, which the Crown reads. The place to climb the ranks, or to find out what the guild has said about the character.",
      tags: ['guild', 'solhaven', 'headquarters'],
      parent: 'Solhaven',
    },
    {
      name: 'The Ashen Reach',
      description:
        'Volcanic badlands south of the Thornwood: black rock, steaming vents, rivers of cooled glass, and red skies at sunset. Danger: high. Drakes and wyverns nest in the cliffs, and the deep calderas hold older things.',
      purpose:
        "Drake hunts and wyvern bounties (good money and a dilemma for a Dragon Lord), fire-salt gathering, and lost caravans. True dragons live in the deep calderas. Kestrel (if the player didn't choose Dragon Lord) roams here with her bonded dragon. Drakes fleeing north out of the Reach are a sign of the Hollowing.",
      tags: ['badlands', 'volcanic', 'wilderness', 'danger-high', 'dragons'],
    },
    {
      name: 'The Saltmarsh Coast',
      description:
        'A fog-bound coast of reed marshes, tidal channels, and stilt-legged port towns west of Millbrook. Danger: moderate. Smugglers run the channels at night, the excise men run the ports by day, and something large moves in the deep marsh.',
      purpose:
        "Escort jobs, smuggler crackdowns or smuggling, investigation, and marsh monsters. The black market here moves cursed goods, vault coin, and impossible items. Isidore Quill (if the player didn't choose Creation) sells his anchored creations through the Saltmarsh syndicates.",
      tags: ['coast', 'port', 'smugglers', 'danger-moderate'],
    },
    {
      name: 'The Greywall Mountains',
      description:
        "Grey peaks north of the Thornwood, honeycombed with the ruins of the old dwarven holds: sealed gates, broken stairs, and dungeons that have started to wake. Danger: high. Golems still guard some halls; worse things guard others.",
      purpose:
        "Dungeon delves and relic recovery (the guild's dungeon jobs, C rank and up). The waking dungeons are the Hollowing's clearest sign. Dwarven inscriptions in the deepest halls mention the 'bright souls' who came three hundred years ago and the war that followed.",
      tags: ['mountains', 'dungeons', 'ruins', 'danger-high'],
    },
    {
      name: 'The Sunken Abbey',
      description:
        'A drowned abbey in a cold, still lake at the edge of the Greywall foothills. Its bell tower juts from the water, roofless. On calm nights, a bell rings somewhere under the surface. Danger: very high. Ghosts of robed monks walk the shore, and wards still burn in the stone.',
      purpose:
        "The heart of the central mystery: the ruins of the Lantern Choir's abbey and, in the drowned scriptorium, the Bell that is the Arbiter's core. System glitches grow frequent near it. The way down needs a means of breathing or draining the lower halls, and the Choir's ghosts test anyone who reaches the Bell. Reaching it is the climax of the mystery, whenever the player chooses to pursue it.",
      tags: ['ruin', 'abbey', 'lake', 'danger-very-high', 'mystery'],
    },
  ],

  npcs: [
    {
      name: 'Mara Vell',
      shortDescription:
        "Receptionist at the Millbrook guild hall. Thirties, ink-stained cuffs, reading glasses on a chain, a pencil behind one ear, and a stare that has seen through a hundred rookies' lies.",
      faction: GUILD,
      location: "Millbrook Guild Hall",
      notes:
        "**Want:** to keep her rookies alive; she has buried too many. **Manner:** brisk, dry, sharp; protective of rookies behind a wall of forms and fees. Hands out jobs from the quest board and will steer a rookie away from one that will get them killed. **Secret:** she knows the guild reports unusual members to the Crown, and she quietly leaves things out of her reports for rookies she likes. She will notice the character's skill within a job or two. With guild reputation 20+ and her trust, she becomes a real ally.",
    },
    {
      name: 'Guildmaster Orren Hask',
      shortDescription:
        'Master of the Millbrook guild branch. Fifties, built like a barn door, one ear missing, a former A-rank adventurer with a limp and a scowl. Growls in short sentences.',
      faction: GUILD,
      location: "Millbrook Guild Hall",
      notes:
        "**Want:** a quiet branch and rookies who come back alive. **Fear:** Returned. He lost his old party to one, thirty years ago, a man with a 'gift' who got everyone around him killed. **Manner:** gruff, suspicious of anyone too strong too fast, fair once convinced. He runs the promotion exams and writes the reports on unusual members that go to the Crown. Earning his respect is hard and worth it: he can vouch for the character to headquarters, or bury them.",
    },
    {
      name: 'Dax Corrin',
      shortDescription:
        "Leader of the Ember Sparrows, a rookie party. Seventeen, swaggering, with a dented secondhand sword, a red scarf, and far more confidence than skill.",
      faction: GUILD,
      location: "Millbrook Guild Hall",
      notes:
        "**The Ember Sparrows:** Dax (swordsman, leader), Pell Ashby (apprentice mage, sharp-tongued, smarter than Dax and knows it), and Junie Marsh (scout and healer, quiet, a farm girl with a sling). All Rank F, broke, and looking for a fourth. **Want:** to make Rank E before the harvest festival and impress everyone back home. **With the player:** they invite the character to join, or if refused, become friendly rivals racing them up the board. A party to protect, to lead, or to lose. Create Pell and Junie as NPCs when the character meets them.",
    },
    {
      name: 'Sister Elowen',
      shortDescription:
        "The healer of Millbrook's chapel. Late twenties, freckled, sleeves rolled up, a sprig of rosemary tucked in her wimple, and hands that are never still.",
      faction: CHURCH,
      location: 'Chapel of the Seventh Lamp',
      notes:
        "**Want:** to heal everyone who comes through her door, and to understand whether the Returned are a gift or a curse. **Manner:** kind, practical, braver than she looks. **Secret:** she has read the Saint faction's sermons on the Returned and believes them; she also knows an Inquisitor visits every season and asks her about strangers. If the character trusts her, she can hide them, heal their skill's costs (drift, exhaustion), and speak for them to the Saint faction. If she is lied to and finds out, it hurts her badly. A possible ally, or more.",
    },
    {
      name: 'Bram Oakes',
      shortDescription:
        'Keeper of the Crooked Antler. Big, bald, aproned, with a magnificent grey beard and a laugh that rattles mugs.',
      faction: '',
      location: 'The Crooked Antler',
      notes:
        "**Want:** a full house and no fights. **Manner:** jovial, nosy, a gossip without malice. He knows every rumor in Millbrook and trades them for good stories. He'll give the character a cot on credit for one night if they're polite. Use him to show how fast rumors about the character spread and how they get garbled ('I heard he called down the moon').",
    },
    {
      name: 'Ysolde Marrow',
      shortDescription:
        "Factor of House Marrow's Millbrook counting house. Forties, elegant in dark green, spectacles, a ring of keys at her belt, and a smile that never reaches her ledger.",
      faction: 'House Marrow',
      location: 'Millbrook Market',
      notes:
        "**Want:** profit, and to find out where any unusual money or goods are coming from before a rival house does. **Manner:** courteous, patient, relentlessly curious. She buys loot and monster parts at fair prices, and anything strange at suspiciously generous ones. She notices old-minted vault coin, crest-marked items, and impossibly fine creations, and reports them to House Marrow in Solhaven. A powerful patron or a dangerous creditor.",
    },
    {
      name: 'High Inquisitor Caddoc Rhyne',
      shortDescription:
        'High Inquisitor of the Inquisition of Dusk. Fifties, lean and grey, in plain grey robes with a lantern of black glass at his belt. Unfailingly courteous and patient.',
      faction: INQUISITION,
      location: 'Cathedral of the Sevenfold Light',
      notes:
        "**Want:** to find and contain every Returned before one of them becomes what the last ones became. **Belief:** the Returned are stolen souls, pulled out of the Light's judgment, and the church's own forbidden history proves how it ends. He is not cruel; he is certain. **Method:** watchers, questions, evidence, and patience. He sends an Inquisitor to look into any rumor of miracles. **Secret:** he holds Mirelle Ashcombe (the Treasury Candidate) as an informant. If she is in play, she can sense other Candidates for him. He has read the sealed registry and knows two of the last five tried to seize the throne.",
    },
    {
      name: 'Archbishop Lucan Vey',
      shortDescription:
        'Archbishop of Solhaven and the voice of the Saint faction. Sixties, silver-bearded, in white and gold, with a warm voice and a gentle hand on every shoulder.',
      faction: CHURCH,
      location: 'Cathedral of the Sevenfold Light',
      notes:
        "**Public stance:** the Returned are Saints sent by the Light, to be welcomed into the church's care. **True stance (GM only):** he found a Lantern Choir lantern in the archives that lets him whisper into the System, and some glitches are his doing. He wants the Candidates as the church's Saints, under his hand, and ultimately to command the Arbiter himself. He keeps Brother Tobiah (if in play) close as the Living Saint. **Manner:** warm, smooth, always says a little less than he knows. He can grant sanctuary, blessings, and protection from the Inquisition at a price: obedience.",
    },
    {
      name: 'King Aldric III',
      shortDescription:
        'King of Aldermere. Seventy, gaunt, wrapped in furs even in summer, a heavy crown he can barely hold up. Still sharp in flashes.',
      faction: CROWN,
      location: 'Sunspire Palace',
      notes:
        "**Want:** to die with his kingdom whole, and to keep the church from choosing his successor. **Condition:** a wasting illness that no healer has cured (it is the Hollowing's mana-rot, arriving early). He has heard about the last Returned from the royal histories, and fears them. Seraphine rules in his name more each month. A cure for him would put the Crown deeply in the character's debt.",
    },
    {
      name: 'Princess Seraphine',
      shortDescription:
        "Crown Princess of Aldermere. Mid-twenties, tall, in riding leathers more often than gowns, dark hair in a soldier's braid. Direct, charming, and transactional.",
      faction: CROWN,
      location: 'Sunspire Palace',
      notes:
        "**Want:** the throne secured, the church kept in its place, and the strongest weapons in Aldermere on her side, which means the Returned. **Method:** she recruits strong adventurers with titles, debts, and offers they can't refuse, and threatens only when offers fail. Rhea Valcourt (if in play) is her first Returned. **Toward the player:** once she hears of them (Crown reputation 20+, or a big public display), she sends an invitation. She is honest about wanting to use them, which is its own kind of charm.",
    },
  ],

  lore: [
    {
      title: 'The System',
      keywords: ['system', 'panel', 'candidate', 'skill', 'returned'],
      alwaysInclude: true,
      body: "An interface only the character can see: a glowing blue panel that reports their level, skills, quests, warnings, and costs. It speaks only in fenced `system` blocks with bracketed headers, never in prose, and shows only what this turn's tool results say. It gave the character one permanent starting skill (the locked choice in the current state) whose power runs from level 1 to 10, with real costs at every level. It sometimes glitches; record each glitch as a clue.",
    },
    {
      title: "The Wayfarers' Guild",
      keywords: ['guild', 'wayfarers', 'rank', 'ranks', 'quest board', 'guild card', 'adventurer', 'adventurers'],
      body: "Aldermere's adventurers' guild. Ranks run F, E, D, C, B, A, S. A rookie registers at Rank F, pays (or owes) 10 copper, and receives a guild card stamped with their rank. The quest board offers hunting, gathering, escort, and dungeon jobs by rank. Rank rises through completed jobs and promotion exams set by a branch guildmaster (and, from C rank, at the Solhaven headquarters). The guild values results and asks no questions, but it reports unusual powers to the Crown.",
    },
    {
      title: 'The Church of the Sevenfold Light',
      keywords: ['church', 'sevenfold', 'light', 'saint', 'saints', 'chapel', 'priest', 'archbishop'],
      body: "The state religion of Aldermere. It worships the Light and teaches that souls are judged at death and reborn. Seven lamps hang in every chapel; by tradition only six are lit. Its doctrine on the Returned is split: the Saint faction, led by Archbishop Lucan Vey, calls them Saints sent by the Light, while the Inquisition of Dusk calls them stolen souls. Chapels heal, bless, and give sanctuary.",
    },
    {
      title: 'The Inquisition of Dusk',
      keywords: ['inquisition', 'inquisitor', 'inquisitors', 'dusk', 'heretic', 'caddoc'],
      body: "The church's hardline order, led by High Inquisitor Caddoc Rhyne. Grey robes, lanterns of black glass, and the authority to question, search, and arrest. It holds that the Returned are souls stolen from the Light's judgment, and it hunts them as heretics. Its founding charter is three hundred years old and is not taught to novices.",
    },
    {
      title: 'The Returned',
      keywords: ['returned', 'reincarnated', 'reincarnation', 'otherworlder', 'candidates'],
      body: "What Aldermere calls people reborn from another world with a System skill. They are rare enough to be legends: three of the church's Saints are said to have been Returned, three hundred years ago. Common folk mostly don't believe in them. The church is split over them, the guild reports them, the Crown wants them, and the Inquisition hunts them.",
    },
    {
      title: 'The Crown of Aldermere',
      keywords: ['crown', 'king', 'aldric', 'princess', 'seraphine', 'palace', 'royal'],
      body: "King Aldric III has ruled Aldermere for forty years and is now old and sick. His only child, Crown Princess Seraphine, governs more of the kingdom every month and recruits strong adventurers. The Crown wants Returned as weapons, and offers titles, debts, or threats to get them.",
    },
    {
      title: 'Coin of Aldermere',
      keywords: ['copper', 'silver', 'gold', 'crown', 'crowns', 'coin', 'money', 'price'],
      body: '10 copper make 1 silver; 10 silver make 1 gold crown. A loaf costs 1 copper, a meal 3, a night at an inn 5, a healing potion 40, a plain sword 300, a horse 1,500. F-rank jobs pay 20 to 60 copper. Old-minted coin (crests of houses long gone) turns heads at any counting house.',
    },
    {
      title: 'The Sunken Abbey',
      keywords: ['abbey', 'sunken', 'bell', 'lantern', 'choir', 'lantern choir'],
      body: "A drowned abbey in a lake at the edge of the Greywall foothills, sunk three hundred years ago during a war no one agrees about. Its monks were the Lantern Choir, an order the church no longer mentions. Locals say a bell rings under the water on calm nights, and that the monks' ghosts still walk the shore.",
    },
    {
      title: 'The Hollowing',
      keywords: ['hollowing', 'mana rot', 'rot', 'calamity'],
      body: "An old word in dwarven inscriptions and children's rhymes for a calamity that came three hundred years ago: dungeons waking, beasts fleeing their lands, and a rot that ate the mana out of the earth. The rhymes say five bright souls ended it.",
    },
  ],

  missions: [
    {
      title: 'Guild Registration',
      giver: 'Mara Vell',
      description:
        "Register with the Wayfarers' Guild at the Millbrook guild hall and receive a Rank F guild card. The fee is 10 copper, which a rookie with empty pockets can owe. No card, no jobs.",
      objectives: ['Register at the Millbrook guild hall and receive a guild card'],
      rewards: {
        xp: 20,
        items: [
          {
            name: "Wayfarers' Guild Card",
            quantity: 1,
            description: "A palm-sized brass plate on a cord, stamped with the guild's compass rose, your name, and your rank: Rank F.",
            tags: ['guild', 'document', 'rank-f'],
          },
        ],
      },
    },
    {
      title: 'Hornrabbits in the Barley',
      giver: 'Mara Vell',
      description:
        'Rank F hunting job. Hornrabbits from the Thornwood are tearing up the Tullys\' barley at the edge of town. They are quick, they gore, and there are at least five. Bring back the horns as proof.',
      objectives: ['Cull five hornrabbits in the Tullys\' fields', 'Bring the horns to Mara Vell'],
      rewards: { money: 40, xp: 40, relationships: [{ npc: 'Mara Vell', affinity: 2, trust: 3 }] },
    },
    {
      title: 'Moonpetal for the Chapel',
      giver: 'Mara Vell',
      description:
        "Rank F gathering job, posted for Sister Elowen. Moonpetal blooms only at night in the damp hollows of the Thornwood, where the slimes are. She needs ten for fever draughts.",
      objectives: ['Gather ten moonpetal blooms in the Thornwood at night', 'Deliver them to Sister Elowen at the chapel'],
      rewards: { money: 25, xp: 30, relationships: [{ npc: 'Sister Elowen', affinity: 5, trust: 5 }] },
    },
    {
      title: "Escort to Hollin's Ford",
      giver: 'Mara Vell',
      description:
        "Rank F escort job. A tinker named Abel Pruitt needs his cart taken a day's walk down the river road to Hollin's Ford. Goblin scouts have been seen near the road, and Abel talks the whole way.",
      objectives: ["Meet Abel Pruitt at the town gate", "Get Abel and his cart to Hollin's Ford in one piece"],
      rewards: { money: 60, xp: 50 },
    },
    {
      title: 'Rats in the Old Mill',
      giver: 'Mara Vell',
      description:
        "Rank F dungeon job. Something has been gnawing through the floor of the abandoned mill on the river, and the cellar below it goes deeper than any cellar should. Clear it and report what's down there.",
      objectives: ['Clear the cellar under the old mill', 'Report to Mara Vell what lies below it'],
      rewards: { money: 50, xp: 60 },
    },
    {
      title: 'Promotion Exam: Rank E',
      giver: 'Guildmaster Orren Hask',
      description:
        'To rise from Rank F to Rank E, a rookie must complete five guild jobs and then pass the guildmaster\'s practical exam in the Thornwood. Orren sets the exam himself, and he is not known for being easy.',
      objectives: ['Complete five guild jobs at Rank F', "Pass Guildmaster Orren Hask's practical exam"],
      rewards: { xp: 120, relationships: [{ npc: 'Guildmaster Orren Hask', affinity: 3, trust: 8 }] },
    },
    {
      title: 'The Candidate Question',
      description:
        'Why were you chosen? Who runs the System? Are you the only one? This record holds what you have learned, and it can wait for as long as you like.',
      objectives: [
        'Notice a System glitch, and remember what it said',
        'Meet another Candidate and learn which skill they were given',
        'Read the sealed registry of the Returned in the cathedral archives of Solhaven',
        'Reach the drowned scriptorium beneath the Sunken Abbey',
        'Learn who, or what, chose the Candidates',
      ],
      rewards: { xp: 400 },
    },
  ],

  character: {
    name: 'Jordan Reyes',
    archetype: 'Candidate',
    bio: "Twenty-four, from Toronto. Line cook on the night shift at a diner on Queen Street, part-time student, older sibling to two, and the one who always stayed late to close. The last thing you remember is the kitchen filling with smoke, shoving the new dishwasher out the back door, and turning around for the owner's old dog. Then nothing. Then a blue light in the dark, and a voice that called you Candidate.",
    location: 'The Waking Glade',
    money: 0,
    level: 1,
    xp: 0,
    hp: 12,
    maxHp: 12,
    attributes: { strength: 5, agility: 5, vitality: 5, perception: 6, will: 6 },
    unspentStatPoints: 0,
    // Reborn with only the skill the System gives them.
    skills: [],
    items: [],
    relationships: [],
  },
};
