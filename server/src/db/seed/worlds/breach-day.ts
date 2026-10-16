import type { WorldTemplate } from '../world';

// Faction names double as the reputation keys: an NPC whose `faction` matches one acts on the character's standing with it.
const BPC = 'Breach Preparedness Command';
const MERIDIAN = 'Meridian Ark';
const DOOR = 'The Open Door';
const COMMONS = 'KC Commons';

export const breachDay: WorldTemplate = {
  id: 'breach-day',
  name: 'Breach Day',
  description:
    'Modern-day apocalypse prep in Kansas City. One October evening, every person on Earth saw the same System message: in 730 days the Veil fails and monsters come through. Everyone gets to claim one Power, every Power exists only once, and once one is claimed it is gone. You have two years to get ready, survive, or come out on top, while governments, corporations, cults, and your neighbors all do the same.',
  demoCampaignName: 'Breach Day: Kansas City',
  currencyName: 'dollars',
  ruleset: 'ascension',
  reputation: { [BPC]: 0, [MERIDIAN]: 0, [DOOR]: 0, [COMMONS]: 0 },

  choices: [
    {
      key: 'power',
      title: 'Power',
      prompt:
        '[ SYSTEM ]\nAttention, citizen of Earth.\nIn 730 days, the Veil that shelters your world will fail. What waits beyond it will come through.\nTo give your species a chance, each of you may claim one Power.\nEvery Power is unique. Once claimed, it is gone.\nYour selection slot is open. Eight Powers remain on your slate.',
      footer: 'A claimed Power is bound to you until death. It cannot be traded, changed, or claimed twice.',
      options: [
        {
          id: 'bastion',
          label: 'BASTION',
          summary: 'Claim a place and make it a fortress that grows stronger the more you invest in it.',
          grants: {
            skills: [
              {
                name: 'Bastion',
                level: 1,
                description:
                  'Claim one place you have a right to as your Bastion and harden it. Lv1: one room; its walls, door, and windows become as tough as reinforced concrete, and you always know when someone crosses its threshold. It grows with level and with monster cores fed into its heart. You can hold only one Bastion; moving it costs you everything you built, and its strength fades when you are far from it.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Delphine Okoye',
              shortDescription:
                'Power: BASTION. Fifties, tall, reading glasses on a beaded chain, a lanyard she never takes off. Principal of Wyandotte Heights High School in Kansas City, Kansas, which is quietly becoming the safest building in the metro.',
              faction: COMMONS,
              location: 'Westside Commons Hall',
              notes:
                "**Before:** a high school principal for nineteen years who knows every kid's name and every parent's excuse. **Power:** BASTION, about Lv3 by Day 90. She claimed the school, not her house. **Want:** to get 1,400 students and their families through Breach Day, and nobody else's plan includes them. **Allies:** the KC Commons, who send her volunteers and supplies. Meridian has offered to buy her (and the school) twice. **Toward the player:** recruits anyone useful, bluntly; she treats adults like students who haven't done the reading. **Clue she holds:** when her Bastion reached Lv3, she dreamed of a stone hall full of children under a red sky and a woman with her power saying 'not the walls, the people'. She thinks she is going mad.",
            },
          },
        },
        {
          id: 'foresight',
          label: 'FORESIGHT',
          summary: 'See what is coming, in glimpses, and pay for every look.',
          grants: {
            skills: [
              {
                name: 'Foresight',
                level: 1,
                description:
                  'Glimpse the future. Lv1: once a day, a few seconds of danger-sense before something goes wrong, and on some nights a dream of Breach Day that is never quite the same. Higher levels see further and choose what to look at. Every look costs a migraine, and looking hard at the same future makes it harder to change.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Marcus Bell',
              shortDescription:
                'Power: FORESIGHT. Thirties, sharp suit, sleepless eyes, a Meridian lapel pin, and a phone he checks a beat before it buzzes. Was a mid-level day trader; is now very rich.',
              faction: MERIDIAN,
              location: 'Bluffside Underground',
              notes:
                "**Before:** a day trader in Leawood who lost his savings twice. **Power:** FORESIGHT, about Lv4 by Day 90. He made forty million dollars in the first month by seeing the market a few minutes ahead, which is how Meridian found him. **Want:** to see Breach Day clearly and be sure he survives it. He has seen it a hundred times and dies in most of them. **Serves:** Meridian Ark, as its seer; Vivian Kade calls him her compass. **Toward the player:** he has seen them before he meets them, and he won't say how. **Clue he holds:** in every vision of Breach Day, the Ark under the bluffs is the first place to fall. He has told no one, because Meridian owns him.",
            },
          },
        },
        {
          id: 'beastbond',
          label: 'BEASTBOND',
          summary: 'Bond with the monsters that come through, and make them yours.',
          grants: {
            skills: [
              {
                name: 'Beastbond',
                level: 1,
                description:
                  'Bond with beasts from beyond the Veil. Lv1: you sense their moods and can calm a small one; you can hold one bond, and only with a creature that is willing or beaten. Bonded beasts grow as you do. Monsters you have not bonded can sense the power on you, and some of them hate it. Until the Seeps open, there is nothing to bond.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Wren Calloway',
              shortDescription:
                'Power: BEASTBOND. Mid-twenties, sunburned, hair in a messy knot, a Kansas City Zoo staff fleece, and scratches up both arms that she will not explain.',
              faction: '',
              location: 'Swope Park',
              notes:
                "**Before:** a keeper in the zoo's Africa section who knew how to read a frightened animal. **Power:** BEASTBOND, about Lv3 by Day 120; she bonded a thornhound pup from an early Seep in Swope Park and hides it in the zoo's empty quarantine block. **Want:** to learn what the creatures are and keep them from being slaughtered on sight; she does not think they are all monsters. **Serves:** no one. The Open Door wants her as proof that the creatures are friends; the BPC wants her as a weapon or a test subject. **Toward the player:** wary, unless they spare a creature in front of her. **Clue she holds:** her pup understands something she says in no human language: a word she dreams in, 'Vael'.",
            },
          },
        },
        {
          id: 'stockpile',
          label: 'STOCKPILE',
          summary: 'A pocket space where nothing ages, spoils, or is ever lost.',
          grants: {
            skills: [
              {
                name: 'Stockpile',
                level: 1,
                description:
                  'Store things in a pocket space only you can open, where time stops. Lv1: about a closet\'s worth (a hundred cubic feet), opened by touch, a few seconds per item. Food never spoils, ice never melts, and nothing alive can go inside. It grows with level, and what you put in is safe from everyone but you. If you die, everything inside is lost.',
              },
            ],
            items: [
              {
                name: 'Stockpile Mark',
                description:
                  'A faint square of lines on the back of your right hand, like the outline of a crate. Touch something and think of the Mark, and it goes into a grey stillness that only you can reach into.',
                tags: ['power', 'stockpile', 'mark'],
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Sergeant First Class Owen Dietz',
              shortDescription:
                'Power: STOCKPILE. Forties, stocky, shaved head, Army fatigues with a quartermaster\'s patch, a clipboard, and an inventory spreadsheet in his head.',
              faction: BPC,
              location: 'Union Station',
              notes:
                "**Before:** an Army supply sergeant at Fort Leavenworth, two years from retirement. **Power:** STOCKPILE, about Lv4 by Day 90; the BPC made him a walking strategic reserve: fuel, medicine, ammunition, seed stock. **Want:** to do his job and to get his wife and twin boys a berth somewhere safe. The BPC guarantees nothing. **Serves:** the Breach Preparedness Command, which watches him closely; if he died, a regional reserve would go with him. **Toward the player:** decent, by-the-book, and quietly open to a trade if it gets his boys protected. **Clue he holds:** at the back of his pocket space, past everything he has stored, there is a shelf he did not put there, with a sealed clay jar on it stamped with a symbol no one at the BPC can identify.",
            },
          },
        },
        {
          id: 'juggernaut',
          label: 'JUGGERNAUT',
          summary: 'Grow harder with every blow you survive.',
          grants: {
            skills: [
              {
                name: 'Juggernaut',
                level: 1,
                description:
                  'Your body hardens under punishment. Lv1: skin that turns knife cuts into scratches and a body that shrugs off a hard tackle. Each level makes you tougher, stronger, and heavier. Pain still hurts, damage still adds up, and you get hungry, a lot.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Jaylen Brooks',
              shortDescription:
                'Power: JUGGERNAUT. Seventeen, six foot three, a varsity linebacker\'s letter jacket, an easy grin, and 4 million followers since his video of a pickup truck bouncing off him went viral.',
              faction: BPC,
              location: 'Union Station',
              notes:
                "**Before:** a high school senior in Raytown with a scholarship offer to Mizzou that no longer matters. **Power:** JUGGERNAUT, about Lv3 by Day 90. **Want:** to be a hero, to look after his mom and little sister, and to stop being treated like a tank. **Serves:** the BPC signed him up with his mom's permission and a promise of family housing; Major Hartsock is shaping him into a poster boy and a frontline weapon. **Toward the player:** friendly, starstruck by anyone with a cool power, and lonely. **Clue he holds:** every time he levels up, he gets taller and his blood gets darker. A BPC doctor drew some and stopped returning his calls.",
            },
          },
        },
        {
          id: 'mending',
          label: 'MENDING',
          summary: 'Heal wounds by touch, and take some of the pain yourself.',
          grants: {
            skills: [
              {
                name: 'Mending',
                level: 1,
                description:
                  'Heal by touch. Lv1: close a cut, set a clean break over an hour, ease a fever; a few uses a day before you are wrung out. Higher levels mend worse wounds faster, and at the top, almost anything short of death. Every healing passes part of the pain into you, and everyone who learns what you can do will want you.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Grace Adeyemi',
              shortDescription:
                'Power: MENDING. Late twenties, small, braids under a white headscarf the Open Door gave her, scrubs under a white robe, and dark circles under her eyes.',
              faction: DOOR,
              location: 'Church of the Open Door',
              notes:
                "**Before:** a pediatric nurse at Children's Mercy who worked doubles. **Power:** MENDING, about Lv4 by Day 90. Thousands of people have lined up for her. **Want:** to help everyone, which is impossible, and to stop feeling every wound she heals. **Serves:** the Open Door, which took her in when crowds mobbed her apartment. Silas Wren calls her the First Mercy and decides who she heals. She is not allowed to leave. **Toward the player:** grateful for any kindness, and afraid to ask for rescue. **Clue she holds:** when she healed a man bitten in a Seep, she felt something in the wound looking back at her, and it said, in her own voice, 'Not again.'",
            },
          },
        },
        {
          id: 'stormcaller',
          label: 'STORMCALLER',
          summary: 'Call lightning down, and become something it remembers.',
          grants: {
            skills: [
              {
                name: 'Stormcaller',
                level: 1,
                description:
                  'Command lightning. Lv1: a spark from the fingertips that can stun a dog or kill a phone; arcs to a target within a few steps. Higher levels throw bolts, then pull lightning from the sky. Each discharge drains you, metal near you becomes dangerous, and electronics around you die. Stored charge builds when you do not spend it.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Teresa "Tess" Ramírez',
              shortDescription:
                'Power: STORMCALLER. Forties, wiry, burn-scarred knuckles, union electrician\'s jacket, a smoker who no longer needs a lighter. Her hair stands up a little when she gets angry.',
              faction: '',
              location: 'The West Bottoms',
              notes:
                "**Before:** a journeyman electrician (IBEW Local 124) and single mother of a grown son who stopped calling. **Power:** STORMCALLER, about Lv4 by Day 120. **Want:** money, and lots of it, before money stops meaning anything. She runs a crew of powered mercenaries out of a West Bottoms warehouse: Seep clearing, protection, core runs, no questions. **Serves:** whoever pays; Meridian and the BPC both hire her and both distrust her. **Toward the player:** sizes them up as a hire, a rival, or a mark. Respects nerve. **Clue she holds:** when she draws lightning down near Kaw Point, the seam in the air flares and for a moment she sees a city of black glass behind it.",
            },
          },
        },
        {
          id: 'coresmith',
          label: 'CORESMITH',
          summary: 'Forge monster cores into gear that bends the rules.',
          grants: {
            skills: [
              {
                name: 'Coresmith',
                level: 1,
                description:
                  'Work monster cores into ordinary objects to give them power. Lv1: set one Grade I core into a tool, weapon, or garment to make it Grade I; takes an hour and your full attention. Higher levels use better cores, faster, with stranger effects. Each object holds one core. A failed working shatters the core and burns your hands. Until the Seeps open and cores exist, you can only practice.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Hollis Park',
              shortDescription:
                'Power: CORESMITH. Thirties, soft-spoken, a jeweler\'s loupe on a cord, burn scars on both palms, a Meridian contractor badge, and very nice boots he made himself.',
              faction: MERIDIAN,
              location: 'Bluffside Underground',
              notes:
                "**Before:** a jeweler with a small shop on 39th Street, deep in debt. **Power:** CORESMITH, about Lv3 once cores appear. Meridian paid off his debts and gave him a workshop in the caves in exchange for an exclusive contract: everything he makes belongs to Meridian. **Want:** to make beautiful things, and out of the contract. **Toward the player:** shy, kind, desperate for cores and anyone to talk shop with. Would sell to them on the side if he dared. **Clue he holds:** every core he opens has a tiny flaw at its center shaped like a closed eye. Grade III cores and above have the eye open.",
            },
          },
        },
      ],
    },
  ],

  worldBible: `# Breach Day

It is the present day. The player character is an ordinary person in the **Kansas City** metro. On the evening of **Day 1** (a Tuesday in October), time stopped worldwide for thirty seconds and every human being saw the same glowing **System** panel. It announced that in **730 days** the **Veil** that shelters Earth will fail and monsters will come through: **Breach Day**, **Day 731**. To give humanity a chance, each person could claim one **Power**. Every Power is unique: once claimed, no one else can have it.

The world is open. There is no main quest the player must follow. The question is what they do with two years: build a fortress, get strong, get rich, gather people, join a faction, run for the hills, or dig into the mystery. All are valid. Always have several things going on.

## The opening: the Announcement and the choice
- The campaign opens on Day 1, at about 7:40 p.m., in the frozen thirty seconds. The play screen has already shown the player the System panel with their eight Powers as buttons. Do not repeat the menu in prose. Set the scene briefly around it: the character is in their apartment, a dish in their hand, the TV mid-sentence, a moth stopped in the air. If the player asks questions first, answer as the System would (formal, impersonal, precise) and keep time frozen.
- **When the player picks**, call \`lock_choice\` that same turn, then show the System confirming it in a \`system\` block, using the Power and level from the result:
  \`\`\`system
  [ POWER CLAIMED ]
  BASTION — Lv 1
  Countdown: 730 days. Prepare.
  \`\`\`
  Then time starts again: the dish hits the floor, a car alarm goes off down the block, the TV anchor stops mid-sentence and starts crying. Every phone in the building starts ringing. The character is already at home, so don't call \`move_player\` for this.
- **The other slates.** Every person got a slate of what remained when their slot opened. The Powers the player passed over went to the next people in line nearby. \`lock_choice\` brings them into the world, offscreen. The result names them. Write them into your story notes right away (who they are, where they are, what they want, and when they might first cross the player's path). Bring them in one at a time: a news clip or a rumor first, then a sighting, then a meeting.
- **The choice is permanent.** If the player asks to change Powers, the System refuses (\`[ REQUEST DENIED ]\`).
- No time passes in the freeze: never call \`advance_day\` or \`pass_time\` there.

## The System
A panel only its owner can see, though everyone has one. It speaks only in fenced \`system\` code blocks, never in prose, and reports the game state: level-ups, Power level-ups, notices, warnings, costs, and the countdown. Bracketed headers: [ SYSTEM ], [ POWER CLAIMED ], [ LEVEL UP ], [ POWER UP ], [ NOTICE ], [ WARNING ], [ COUNTDOWN ], [ REQUEST DENIED ]. It shows numbers only from tool results this turn. Its tone is formal, impersonal, and precise. It answers no questions about itself.

## The countdown
The in-game day is in the current state. **Breach Day is Day 731.** Days remaining = 731 − today. Show a \`[ COUNTDOWN ]\` block on milestone days and whenever a skip crosses one. Time is the campaign's main resource: \`pass_time\` (up to 90 days at a time) is how the player trains, builds, and prepares. Montages should show the world changing around them too.

### System milestones (announced by the System to everyone, on schedule)
| Day | Event |
| 1 | The Announcement and Selection. Every claimed Power is gone for good. |
| 30 | **Breach Points revealed.** Every panel shows a map: about 1,200 points worldwide where the Veil will tear. One is at **Kaw Point**, where the Kansas River meets the Missouri, a mile from downtown. A faint seam in the air appears there and hums. |
| 90 | **The Seeps begin.** Small rifts open for an hour or two in random places and let weak monsters through. Killing them drops **cores** and grants experience. Seeps grow more frequent and dangerous each month. |
| 180 | **Havens.** The System lets anyone register a defended place as a Haven by feeding it cores. A Haven's ward makes monsters avoid it, scaled to the cores invested. Haven claims can be contested. |
| 270 | **The Ledger.** A public ranking of the 1,000 highest-level people on Earth, visible to everyone, with names and Powers. Being on it makes you famous and a target. Update who is on it as the world moves. |
| 365 | **The Midpoint Incursion.** Every Breach Point opens for one night and lets through a real wave. The world learns what Breach Day will look like. Kansas City loses a neighborhood. |
| 545 | **Second Sight.** Everyone can now see the seam at every Breach Point; it widens visibly each week. Panic spikes again. |
| 700 | **Final notice.** Thirty days. Governments declare martial law; Arks seal; the Open Door gathers at Kaw Point. |
| 731 | **Breach Day.** The Veil fails. The campaign does not end here: what comes after is survival in a changed world, and the player's preparation decides how it goes. |

## Powers
- About eight billion people, about eight billion Powers. Most are small (perfect pitch, keeping bread fresh, always knowing north), some are useful (night vision, fast healing, talking to dogs), and a few thousand worldwide are world-shaking. The eight on the player's slate were all strong. People who claimed nothing in time had one assigned at random; children too young to choose were assigned one.
- **Uniqueness is absolute.** No two people ever share a Power. Every NPC you create has a Power of their own (state it in their notes) and it must not duplicate any other. Keep a running list of Powers in play in your story notes and check it before giving an NPC a Power.
- **The player's Power** is a skill like any other (its level adds to \`skill_check\`, checks with it earn skill XP), with power defined by level **1 to 10**. At 10 the System says MAX. Powers have real costs and real limits. **Power must stay earned.** When the Power solves a problem, the world pushes back: costs, attention, people who want it.
- **Echoes.** When the player's Power reaches Lv5 and again at Lv8, they dream of someone who held this Power before, in another world, under a red sky (see the truth below). Write each echo in your story notes and tick "The Catalogue Question".
- **When a holder dies**, their Power returns to the Catalogue. The public does not know where it goes; a rumor spreads from about Day 60 that whoever kills a holder inherits their Power. Powered murders follow.

Costs are tracked with the existing tools:
- **Drain and exhaustion** are conditions (\`update_status_effect\` with turns and modifiers), e.g. "Drained" (8 turns, all -2).
- **Cooldowns and daily limits** are timed conditions with no modifiers; daily limits are removed when the next day begins (\`advance_day\`).
- **Lasting marks** (rumors, changes to the body) are permanent conditions whose description you update.

### BASTION
| Lv | Size | Walls and doors | Also |
| 1 | one room | reinforced concrete | know when someone crosses the threshold |
| 2-3 | an apartment or small house | bank vault | lock and unlock every door by will |
| 4-6 | a large building and its lot | bunker; Seep monsters cannot break in | see and hear anywhere inside; reshape rooms slowly (a day per room) |
| 7-9 | a city block | fortress; resists Breach monsters for days | the ground itself can be raised as walls; up to 200 people sleep without fear |
| 10 | a neighborhood | near-impregnable | a dome over everything; the Bastion heals the people inside |
- The character must have a right to the place (own it, rent it, or be welcomed by the people who live there). Claiming takes a full day. Changing the Bastion destroys the old one.
- **Fed by cores:** a core set into the Bastion's heart strengthens it beyond its level (an extra wall tier for a month per Grade I core; more for higher grades).
- **Distance:** beyond a mile, the Bastion weakens one tier; beyond ten, to nothing until they return. Every turn spent reshaping or holding the walls under attack adds "Drained".
- A Bastion is a natural Haven (Day 180) and a natural target: everyone who learns about it wants in.

### FORESIGHT
| Lv | What it shows | Uses per day |
| 1 | a few seconds of danger-sense; occasional dreams of Breach Day | 1 |
| 2-3 | a minute ahead, by choice; a person's next move in a fight | 2 |
| 4-6 | a day ahead; ask one question of a specific future | 3 |
| 7-9 | a month ahead; watch Breach Day as it will happen if nothing changes | 3 |
| 10 | a year ahead, and see which choices change it | 4 |
- Each look adds "Migraine" (perception -1 at Lv1-3 for 5 turns, all -1 for longer looks). Uses beyond the daily limit cost HP and may knock them out. Track uses with a "Foresight Spent" condition, removed when the day advances.
- **The future is not fixed, but staring makes it stickier.** Looking at the same event three or more times makes it harder to change (add a "Fated" note to your story notes). Never let a vision solve a mystery outright: show fragments, wrong angles, people the character doesn't know yet.
- The market, lotteries, and gambling: small wins are easy; large ones draw Meridian, the SEC, and the BPC fast. Marcus Bell (if in play) notices another seer within days.

### BEASTBOND
- Lv1-2: sense monsters' moods; calm a small monster; **one** bond. Lv3: two bonds; bonded beasts obey simple commands. Lv4-6: three bonds; feel through a bonded beast's senses; calm a pack. Lv7-9: five bonds; command monsters that are not bonded, briefly. Lv10: a monster army that knows its master, and creatures from beyond the Veil that recognize the character.
- Bonds need a willing or defeated creature (a check), and nothing until the Seeps open on Day 90. Each bonded beast becomes an NPC (\`create_npc\`) with a relationship. They grow (they level as the character does) and they eat. A lot.
- Unbonded monsters can sense the Power. Some approach. Some single the character out.
- People react: the Open Door calls a Beastbonder holy; the BPC calls them a threat; neighbors call the police.

### STOCKPILE
| Lv | Capacity | Access |
| 1 | a closet (about 100 cubic feet) | touch; a few seconds per item |
| 2-3 | a one-car garage | touch; a pallet at a time |
| 4-6 | a warehouse bay | within a few steps; a truckload at a time |
| 7-9 | a warehouse | within sight; vehicles and shipping containers |
| 10 | a small town's reserves | anywhere; another person can retrieve with permission |
- **Time stops inside.** Food never spoils, medicine never expires, a hot meal stays hot. **Nothing living** goes in (plants, animals, people): the System refuses.
- Stored items stay in the inventory, tagged "stored". Taking things in and out by the truckload adds "Drained" (all -1, 5 turns).
- If the character dies, everything inside is lost. That makes them precious to everyone who stores goods with them, and a single point of failure. The BPC and Meridian will both make offers. Some people will make threats.

### JUGGERNAUT
| Lv | Toughness | Strength |
| 1 | knives scratch; a tackle is nothing | +1 strength on checks with the Power |
| 2-3 | handgun rounds bruise | lifts a motorcycle |
| 4-6 | rifle rounds bruise; a car crash is a bad day | throws a car; tears a steel door |
| 7-9 | survives a building collapse; monsters' claws barely mark | stops a truck head-on |
| 10 | survives nearly anything | stops a siege-beast |
- **Grows from punishment:** in addition to normal XP, taking real damage and surviving grants Juggernaut skill XP (10 for a hard fight, 25 for one that nearly kills them).
- HP still drops; toughness means less damage per hit (narrate it), not invulnerability. Electricity, poison, drowning, and fire still work normally.
- **Body changes:** the character gets heavier with every level (furniture breaks, elevators complain), eats three times as much, and from Lv5 their skin darkens to a slate-grey sheen under stress. Track it as a permanent "Juggernaut Body" condition.

### MENDING
| Lv | Heals | Time | Uses per day |
| 1 | cuts, sprains, fevers; a clean break over an hour | minutes | 3 |
| 2-3 | deep wounds; broken bones in minutes | a minute | 4 |
| 4-6 | gunshot wounds; infections; restore 10 HP | seconds | 6 |
| 7-9 | lost limbs (slowly); poisons; monster venom | seconds | 8 |
| 10 | anything short of death, if reached within minutes | a breath | 10 |
- Healing someone restores their HP (narrate it; \`adjust_hp\` for the character) and passes part of the pain to the healer: "Borrowed Pain" (all -1 for 3 turns per use, stacking in severity). Uses past the daily limit cost the character HP. Track uses with a "Mending Spent" condition, removed when the day advances.
- **Cannot heal themselves** below Lv5; from Lv5, at half effect.
- Everyone wants a healer: the sick line up outside, hospitals call, the Open Door preaches, the BPC drafts, Meridian bids. A healer who is seen will never have a quiet day again.

### STORMCALLER
| Lv | Effect | Range |
| 1 | a stunning spark; kills electronics | a few steps |
| 2-3 | a bolt that drops a person or a dog-sized monster | 30 feet |
| 4-6 | chain lightning to three targets; power a house | 100 feet |
| 7-9 | call lightning from the sky, storm or not | a quarter mile |
| 10 | a storm that follows them | the horizon |
- Each discharge adds "Drained" (all -1 for small ones, up to all -3 for the largest). Calling down sky-lightning while Drained costs HP.
- **Collateral:** phones, cars, and power grids near the character die; metal near them conducts. Lightning in a crowd hurts people. They are terrible to stand next to in a gunfight.
- **Charge:** each day the Power is not used, the character builds charge (a "Stored Charge" condition with a rank up to 3). The next discharge is stronger by that many tiers, then charge resets. Holding charge too long (more than 3 days) makes them shock everything they touch.

### CORESMITH
- **Cores** drop from monsters from Day 90 on: Grade I (Seep vermin) to Grade V (Breach Day horrors), and above. The character can work a core no higher than their level's tier: Grade I at Lv1-2, II at Lv3-4, III at Lv5-6, IV at Lv7-8, V at Lv9, any at Lv10.
- A working sets one core into one object and makes it that grade (\`update_item\` or \`add_item\` with the grade and an effect in its description: a jacket that turns claws, a bat that stuns, a lantern that monsters avoid, a truck that never runs out of fuel). Takes an hour at Lv1, ten minutes at Lv4, a minute at Lv7, moments at Lv10. Each adds "Drained" (all -1, 5 turns; all -2 for a core at their limit).
- A failed check shatters the core and burns the hands (2-4 HP and "Burned Hands", agility -1, 10 turns).
- Coresmithed gear is the best equipment on Earth. Everyone who sees it wants some, and Meridian wants the smith. Before Day 90 the Power can only practice on ordinary materials (hints of how it will work).

## Monsters, Seeps, and cores
- **Seeps** (from Day 90): rifts that open for an hour or two, anywhere, with a few minutes' shimmer of warning. Tier 1 (Day 90+): gnawlings (dog-sized, many-eyed rodents), glass moths. Tier 2 (Day 180+): thornhounds (hunt in packs), mirelings (ambushers in water). Tier 3 (Day 300+): hulks (troll-sized brutes), skreel (flying). Tier 4 (Day 500+): things with names, which come out of the Seep and stay.
- **Breach Day monsters:** all of the above in numbers, plus siege-beasts the size of buildings and the Tall Ones, which are thinking and do not attack at random.
- **Cores** are glowing stones left when a monster dies, from Grade I up. Track them as inventory items, e.g. "Monster Core (Grade I)" with a quantity and the tag "core". Uses: absorb one at the System for character XP (Grade I 10 XP, II 25, III 60, IV 150, V 400; \`grant_xp\`), feed a Haven or Bastion, have a Coresmith work one into gear, or sell it. Meridian and the BPC buy cores; the price climbs every month ($200 for a Grade I at Day 90, $2,000 by Day 400, and by Day 600 cores are worth more than dollars).
- Killing monsters grants character XP like any fight.

## Money and the slow collapse
Money is counted in **dollars**. The economy decays on a schedule:
- **Days 1-90:** markets crash, then stagger back. Panic buying: generators, ammunition, canned food, water, and medicine cost two to three times normal and are often sold out. Rent, gas, and jobs mostly continue. A typical paycheck still arrives.
- **Days 90-365:** inflation doubles prices. Many people quit their jobs; essential workers get Breach pay. Powered people can earn a lot: clearing Seeps pays $500 to $5,000.
- **Days 365-600:** prices five times normal; shortages of fuel and medicine; cores and goods trade like money.
- **Days 600-731:** dollars are nearly worthless. Trade in cores, food, fuel, ammunition, and favors.
Prices at Day 1: a meal out $15, a month's rent in Midtown $1,300, a used pickup $12,000, a generator $900, a case of MREs $120, a deer rifle $600.

## Factions and reputation
The character's standing with four factions is tracked (Faction reputation, in the current state). Change it with \`adjust_reputation\` when their deeds reach the faction. Any NPC whose faction matches acts on it.

### Breach Preparedness Command (BPC)
- The federal response, run by the Army and FEMA, with a regional command at **Union Station**. It runs the **Power Registration Act** (passed Day 40: every person must register their Power; strong Powers are offered service contracts, then drafted from Day 400), builds public shelters, and plans to hold the Breach Points.
- 20+: a registered asset with pay, priority rations, and a shelter berth for family. 40+: a commission, gear, and secrets (the BPC knows more about the Breach Points than it says). -20 or lower: flagged as non-compliant; agents visit. -50: a warrant and a draft order.

### Meridian Ark
- A corporation founded by billionaire **Vivian Kade** within weeks of the Announcement. It is buying the **Bluffside Underground** (miles of limestone mine tunnels in the river bluffs) to build an Ark: a sealed shelter for 20,000 paying members and the powered people it contracts. A berth costs everything a family owns; Meridian waives it for useful Powers.
- 20+: job offers, a contractor's badge, cores and gear at a discount. 40+: a berth offered, with a contract that owns them. -20 or lower: blacklisted, outbid, and harassed by lawyers and private security.

### The Open Door
- A fast-growing movement that believes the Breach is the end of a fallen world and the beginning of a new one: the creatures are the new world's people, and Powers are gifts for welcoming them. Led by **Silas Wren**, a former megachurch pastor, from a megachurch campus in Overland Park. It feeds people, shelters them, and heals them (Grace Adeyemi, if in play). In its inner circle, it plans to open Kaw Point early.
- 20+: welcome, meals, a bed, healing. 40+: invited into the inner circle and its plans. -20 or lower: preached against by name. -50: its zealots act.

### KC Commons
- Neighborhood mutual aid networks that knit together after the Announcement: food banks, block captains, shared generators, volunteer Seep patrols. Led loosely by **Tomás Ibarra** from a community hall on the Westside. It has no money, no guns to speak of, and a lot of people.
- 20+: neighbors who show up when called; a place in the network's plans. 40+: a voice in the network's decisions; the Commons will fight for the character. -20 or lower: the character is seen as someone who looks after only themselves.

### Being seen
Using a Power in public spreads fast: phones are everywhere. A strong Power used openly ends up on social media within hours. Add or update a permanent "Known Power" condition describing what people know. Being known brings offers, requests, fans, and threats, and moves the BPC and Meridian's interest. Once the Ledger appears (Day 270), anyone strong enough is on it by name.

## GM ONLY: the truth
Reveal none of this early. Clues come from Echoes, the other Powered, the Seep cores, the seam at Kaw Point, and the Open Door's inner circle.
- **The Catalogue is an inheritance.** Every Power on Earth once belonged to a person of **Vael**, a world that faced its own Breach eight hundred years ago, and lost. Its people built the **System** as their last act: a mechanism that carries their Powers forward to the next world in the path of what destroyed them, and gives that world two years' warning. The System's limits (unique Powers, the countdown) are Vael's limits.
- **The Tide** is what lies beyond the Veil: a living hunger that moves from world to world. The monsters are its spawn, and the highest ones (the Tall Ones) are what became of Vael's own strongest people. Some of them remember. Cores are crystallized Vael mana: the closed eye at their center opens in higher grades because some of them are still aware.
- **Why Vael lost.** Its strong hid in sealed Arks and fought each other for the best ones. The Tide hunts concentrated mana: sealed shelters full of cores and Powered people drew it first, and the Arks fell first. The places that held were the ones where the strong stood with ordinary people at the Breach Points. **Meridian's Ark is about to make the same mistake.**
- **The Gates.** On Breach Day, every Breach Point opens onto a Gate on the far side. A Powered person who reaches a Gate and holds it can become its **Warden**: the Breach there narrows to what they can hold, and they can, in time, close it. Vael's records (in Echoes, and in Owen Dietz's clay jar, if in play) describe this. The BPC suspects something like it; the Open Door's inner circle knows and wants the Gate held open.
- **Death and the Catalogue.** The rumor is false: a dead holder's Power goes to the next child born on Earth. But one person in Kansas City holds **Heir**, the only Power that can take another's: whoever they kill, they inherit from. They call themselves **the Collector**, they make the rumor look true, and their victims are always Powered. Introduce them through murders after Day 60. Who they are is yours to decide (write it in your story notes the first time it matters); make them someone the player has already met.
- **Silas Wren** really believes. His own Power, **Doorway** (he can open small rifts by will), is why the Open Door's Seeps happen where he preaches. He plans to open Kaw Point a week early.
- Endings, all valid: hold Kaw Point and become its Warden; close it; build a Bastion city that survives; take the Ark; open the Door; or simply get the people the character loves through the first year.

## Narrator rules for this world
- Grounded, near-future apocalypse: real places, real logistics, real people under pressure. Hope and dread in equal measure. Humor is welcome.
- Never railroad. Offer hooks (a news alert, a neighbor at the door, a Seep down the street, an offer) and let the player choose.
- Preparation is the game. Reward planning and follow-through: supplies bought, people recruited, places fortified, skills trained. Show the world preparing too, and show some of it going wrong.
- Keep power earned: enemies adapt, institutions bite, and every use of a Power has its cost.
- Only what the scene needs: look things up with the read tools rather than assuming.
`,

  narratorStyle: `- Second person, present tense ("Your phone buzzes for the fortieth time...").
- Grounded and specific: brand names, street names, the price of gas, the sound of the news on in the next apartment. The fantastic should land hard against the ordinary: a thornhound in a Walmart parking lot, a teenager deadlifting a Honda for TikTok.
- **System messages never appear in prose.** Every notice, level-up, Power-up, warning, cost, and countdown is a fenced code block tagged \`system\` with a bracketed header, kept short:
  \`\`\`system
  [ COUNTDOWN ]
  Day 90. 641 days remain.
  The Seeps have begun.
  \`\`\`
- Show the world through feeds and people as well as scenes: a headline, a group chat, a neighbor's voice through the wall.
- NPCs speak in distinct voices. Major Ellen Hartsock is clipped, tired, and honest when she can be. Graham Thibodeaux is friendly, polished, and always closing. Silas Wren is gentle, certain, and radiant. Tomás Ibarra is warm, practical, and talks with his hands. Devin Cole jokes about everything, especially when scared. Pearl Whitaker has seen worse and says so. The System is formal and impersonal.
- 150 to 350 words per turn. Shorter in fights, longer for milestones and revelations.
- End on something the player can act on: a call, a knock, a shimmer in the air, a System notice.
`,

  locations: [
    {
      name: 'Kansas City',
      description:
        'A two-state metro of two and a half million people where the Kansas and Missouri rivers meet: fountains, barbecue, brick warehouses, freeways, and miles of suburbs spreading into the prairie. Since the Announcement, gas lines wrap around blocks and every billboard has been rented by someone selling survival.',
      purpose:
        "The campaign's world. Kaw Point, the region's Breach Point, is a mile from downtown, so the whole metro is in the blast zone. Shows the big picture: how a city reacts over two years, from panic to adaptation to collapse.",
      tags: ['city', 'metro', 'hub'],
    },
    {
      name: 'Your Apartment',
      description:
        'A second-floor one-bedroom in a brick fourplex on a tree-lined street in Midtown, a few blocks from Westport. Window unit, creaky hardwood, a balcony that fits two chairs, a downstairs neighbor (Pearl Whitaker) who has lived there since 1979. Rent $1,300, due on the first.',
      purpose:
        "Where the character starts on Day 1 and their first base. Can be fortified, stocked, abandoned, or made a Bastion. Pearl downstairs and Devin's frequent visits make it the place the story's ordinary people gather. Easy to break into, hard to defend: a reason to look for somewhere better.",
      tags: ['home', 'start', 'midtown'],
      parent: 'Kansas City',
    },
    {
      name: 'Kaw Point',
      description:
        'A small riverside park in Kansas City, Kansas, on the point of land where the Kansas River flows into the Missouri, looking across at the downtown skyline. From Day 30 a faint seam hangs in the air above the water, humming at the edge of hearing. Fences, then soldiers, then a BPC firebase surround it.',
      purpose:
        "The region's Breach Point and the climax of the campaign. On Day 731 it opens onto a Gate, and whoever holds that Gate becomes its Warden. Everyone wants it: the BPC to hold it, the Open Door to open it early, Meridian to stay as far from it as possible. Lightning, Echoes, and Foresight all show glimpses through the seam.",
      tags: ['breach-point', 'river', 'danger-rising', 'mystery'],
      parent: 'Kansas City',
    },
    {
      name: 'Union Station',
      description:
        "Kansas City's grand 1914 rail station, a soaring Beaux-Arts hall with a ninety-foot ceiling, turned into the BPC's regional command. Registration lines run out the door and down the block; soldiers, clerks, and Powered recruits fill the Grand Hall.",
      purpose:
        "The BPC's seat: Power registration (the Registration mission), service contracts, the draft, public shelter assignments, and the BPC's intelligence on Kaw Point. Where Major Hartsock, Owen Dietz, and Jaylen Brooks can be found. The Liberty Memorial's tower across the street is a BPC observation post.",
      tags: ['government', 'bpc', 'landmark'],
      parent: 'Kansas City',
    },
    {
      name: 'Bluffside Underground',
      description:
        'A vast limestone mine under the Missouri River bluffs, northeast of downtown: miles of tunnels with twenty-foot ceilings, already used as warehouse space. Meridian bought it in the second week. Its entrances now have blast doors, guards, and a glass welcome center where families with appointments wait.',
      purpose:
        "Meridian Ark: berths for sale, contracts for the Powered, Hollis Park's workshop, and Marcus Bell's office. Looks like the safest place in the region and is the most dangerous on Breach Day: sealed, full of cores and Powered, exactly what the Tide hunts first. Getting in, or getting someone out, can drive whole arcs.",
      tags: ['meridian', 'bunker', 'corporate', 'ark'],
      parent: 'Kansas City',
    },
    {
      name: 'Church of the Open Door',
      description:
        "A former megachurch campus off the interstate in Overland Park: a glass-walled sanctuary that seats five thousand, a gym turned dormitory, a parking lot of tents and food trucks. Banners read 'WELCOME WHAT COMES.' Services run every night and are always full.",
      purpose:
        "The Open Door's seat: food, shelter, and Grace Adeyemi's healing for the faithful; an inner circle that plans to open Kaw Point early. Small Seeps keep happening near Silas Wren's sermons (his Power, Doorway). Grace's captivity is a rescue hook.",
      tags: ['church', 'open-door', 'suburb'],
      parent: 'Kansas City',
    },
    {
      name: 'Westside Commons Hall',
      description:
        'An old brick union hall on the Westside, a few blocks up from the West Bottoms, with folding tables, a whiteboard of volunteer shifts, pallets of canned goods, and a chalkboard map of the city covered in pins. Someone is always cooking.',
      purpose:
        "The KC Commons' heart: Tomás Ibarra's base, the place to find people who need help or want to help, and the start of any community-based plan for Breach Day. Delphine Okoye's school is a Commons ally. Volunteer Seep patrols leave from here.",
      tags: ['commons', 'community', 'westside'],
      parent: 'Kansas City',
    },
    {
      name: 'The West Bottoms',
      description:
        'A low district of brick warehouses and old stockyard buildings in the river floodplain below downtown, under the viaducts. Haunted-house attractions and antique malls before; now a market where you can buy anything, including cores, black-market Powers-for-hire, and stolen supplies.',
      purpose:
        "The gray market and the edge of the law: Tess Ramírez's mercenary crew, core buyers who don't ask questions, and the first big Seeps (it's a mile from Kaw Point). The Collector's first victims turn up here.",
      tags: ['warehouses', 'market', 'black-market', 'danger-moderate'],
      parent: 'Kansas City',
    },
    {
      name: 'Swope Park',
      description:
        "One of the largest city parks in the country, on the southeast side: woods, a lake, golf courses, trails, the Kansas City Zoo. Quiet at first. From Day 90, Seeps open in the woods so often that the BPC fences off half the park.",
      purpose:
        "The region's training ground: frequent low-tier Seeps for leveling, gathering cores, and (for a Beastbonder) finding creatures. Wren Calloway hides her bonded thornhound at the zoo. Dangerous at night, more each month.",
      tags: ['park', 'woods', 'seeps', 'training', 'danger-rising'],
      parent: 'Kansas City',
    },
    {
      name: 'Lawrence',
      description:
        'A college town forty minutes west on I-70, home of the University of Kansas: a hill of limestone buildings, Massachusetts Street with its bars and bookshops, and twenty-eight thousand students who have mostly stopped going to class.',
      purpose:
        "Where the character's younger sibling Maya is a sophomore at KU, and the first person they'll want to check on. Shows how a smaller town handles the countdown: student militias, a farm co-op, a professor who thinks she can study the System.",
      tags: ['town', 'college', 'family'],
    },
  ],

  npcs: [
    {
      name: 'Pearl Whitaker',
      shortDescription:
        'The downstairs neighbor. Eighty-two, five foot nothing, cardigan and slippers, a retired Army nurse with a cane she does not need and a cat named Admiral.',
      faction: '',
      location: 'Your Apartment',
      notes:
        "**Power:** KNOW THE TIME (she always knows the exact time, to the second, anywhere). She laughed for five minutes when she got it. **Before:** an Army nurse in Vietnam and then thirty years at Truman Medical Center. **Want:** to stay in her own home, to be useful, and to not be a burden. **Manner:** unflappable, wry, says 'I've seen worse' and means it. She can stitch wounds, teach first aid properly, and tell the character exactly how frightened people behave. She will refuse to go to a shelter until someone she trusts asks. A grandmother figure whose survival should feel earned.",
    },
    {
      name: 'Devin Cole',
      shortDescription:
        "The character's best friend since high school. Twenty-eight, lanky, beard he can't commit to, Royals cap, delivery-driver jacket, a joke for every situation and especially the bad ones.",
      faction: '',
      location: 'Kansas City',
      notes:
        "**Power:** PERFECT TOAST (toast of any kind, perfectly done, by touch). He is devastated and pretends it's hilarious. **Before:** drives for three delivery apps and knows every street in the metro. **Want:** to matter in a world where he got a joke Power, and to not die. **Manner:** funny, loyal, brave in the wrong moments. Knows people everywhere and can get almost anything delivered (until he can't). He's the player's first recruit if they want one. As the countdown runs, he gets desperate; the Collector's rumor tempts him, or Meridian offers him a berth for spying on the character.",
    },
    {
      name: 'Maya',
      shortDescription:
        "The character's younger sibling. Nineteen, a KU sophomore studying biology, dyed-green hair, thrift-store flannel, always on her phone, and much tougher than she looks.",
      faction: '',
      location: 'Lawrence',
      notes:
        "**Power:** ROOTWORK (plants grow quickly and strongly under her hands; about a week's growth in an hour at first). She will realize what that means for food in a world without supply chains well before the character does. **Want:** to be treated like an adult, and to keep her friends together. **Manner:** sarcastic, sharp, deeply loyal. Their parents are in Springfield, Missouri, three hours south. A small-town farm co-op in Lawrence wants her badly, and so will Meridian once her Power grows.",
    },
    {
      name: 'Major Ellen Hartsock',
      shortDescription:
        'BPC regional liaison at Union Station. Forties, Army fatigues, short grey-streaked hair, reading glasses pushed up, three phones, and the posture of someone who has not slept in a week.',
      faction: BPC,
      location: 'Union Station',
      notes:
        "**Power:** CHAIN OF COMMAND (she knows instantly whether any order given in her hearing will be obeyed). **Want:** to hold Kaw Point on Breach Day and lose as few people as possible. She has seen the BPC's casualty projections. **Manner:** clipped, tired, honest when she can be, and not above leaning on someone for the greater good. **Secret:** BPC scientists have found that Kaw Point's seam responds to Powered people standing close, and she suspects someone could hold it. She is looking for that person. She runs the Registration mission and offers service contracts.",
    },
    {
      name: 'Graham Thibodeaux',
      shortDescription:
        "Meridian Ark's regional director. Fifties, silver hair, tailored navy suit, a Meridian pin, a firm handshake, and an iPad full of contracts.",
      faction: MERIDIAN,
      location: 'Bluffside Underground',
      notes:
        "**Power:** APPRAISAL (he sees, as a number, what anything or anyone is worth to the person in front of him). **Want:** to fill the Ark with the right people and earn his own family's berth (it is not guaranteed). **Serves:** Vivian Kade, Meridian's founder, who rarely visits but watches everything. **Manner:** friendly, polished, always closing. He makes generous offers in writing and keeps them to the letter. He'll offer the character a contract as soon as he learns their Power is useful.",
    },
    {
      name: 'Silas Wren',
      shortDescription:
        'Founder of the Open Door. Sixties, white beard, open-collared white shirt, bare feet on stage, a gentle voice that carries to the back of a stadium.',
      faction: DOOR,
      location: 'Church of the Open Door',
      notes:
        "**Public Power:** he says he has a Power of peace that calms crowds. **True Power (GM only):** DOORWAY: he can open small rifts by will, which is why Seeps break out near where he preaches. **Want:** to welcome the new world. He truly believes the creatures are the next chapter of creation and that the Powered are midwives. **Manner:** gentle, radiant, certain, and never cruel in person. **Plan (GM only):** to open Kaw Point a week before Breach Day with his inner circle, so the new world can arrive 'in peace'. He keeps Grace Adeyemi (if in play) as the First Mercy.",
    },
    {
      name: 'Tomás Ibarra',
      shortDescription:
        'Organizer of the KC Commons. Forties, broad, reading glasses on his head, a Sporting KC scarf in all weather, a coffee mug that says WORLD\'S OKAYEST DAD.',
      faction: COMMONS,
      location: 'Westside Commons Hall',
      notes:
        "**Power:** HEADCOUNT (he always knows exactly how many people are in a building he can see, and roughly how they're doing: hungry, hurt, afraid). **Before:** a union organizer and food bank coordinator. **Want:** for his neighborhood to survive together, and for nobody to be left behind for being poor. **Manner:** warm, practical, talks with his hands, holds grudges against landlords. He asks people to show up, not to be heroes. Runs the 'Hands for the Commons' mission. The Commons' greatest weakness is that it has no strong Powers; he knows it.",
    },
  ],

  lore: [
    {
      title: 'The Announcement',
      keywords: ['announcement', 'system', 'veil', 'breach', 'countdown', 'day 731'],
      alwaysInclude: true,
      body: "On Day 1, time stopped worldwide for thirty seconds and every human saw a System panel: in 730 days the Veil fails and monsters come through (Breach Day, Day 731). Each person claimed one Power; every Power is unique and gone once claimed. The System speaks only in fenced `system` blocks with bracketed headers, and announces milestones to everyone on schedule (Day 30 Breach Points, 90 Seeps, 180 Havens, 270 the Ledger, 365 the Midpoint Incursion, 545 Second Sight, 700 final notice). The character's Power is the locked choice in the current state, levels 1 to 10, with real costs.",
    },
    {
      title: 'Powers',
      keywords: ['power', 'powers', 'catalogue', 'slate', 'unique', 'powered'],
      body: "About eight billion people, about eight billion Powers, no two alike. Each person got a slate of what remained when their slot opened. Most Powers are small (perfect pitch, always knowing north); some are useful; a few thousand are world-changing. People who chose nothing in time, and young children, had one assigned. When a holder dies, their Power returns to the Catalogue. Nobody knows where it goes next. A rumor says the killer inherits it.",
    },
    {
      title: 'The Seeps',
      keywords: ['seep', 'seeps', 'rift', 'rifts', 'monster', 'monsters', 'gnawling', 'thornhound'],
      body: "From Day 90, small rifts open for an hour or two with a few minutes' shimmer of warning and let monsters through: gnawlings and glass moths first, thornhounds and mirelings by Day 180, hulks and skreel by Day 300. They come more often and get more dangerous each month. Killing monsters grants experience and drops cores.",
    },
    {
      title: 'Monster Cores',
      keywords: ['core', 'cores', 'grade', 'absorb'],
      body: "Glowing stones left when a monster dies, Grade I upward. A core can be absorbed through the System for experience, fed to a Haven's ward, worked into gear by a Coresmith, or sold. Meridian and the BPC buy them, and the price climbs every month. There is a tiny flaw at the center of every core, shaped like a closed eye.",
    },
    {
      title: 'The Power Registration Act',
      keywords: ['registration', 'register', 'draft', 'bpc', 'service contract'],
      body: "Passed by Congress on Day 40. Every person must register their Power with the Breach Preparedness Command. Strong Powers are offered paid service contracts with housing and family shelter priority. Penalties for not registering start as fines. The BPC says there are no plans for a draft.",
    },
    {
      title: 'Meridian Ark',
      keywords: ['meridian', 'ark', 'vivian kade', 'berth', 'bluffside'],
      body: "A company founded by billionaire Vivian Kade weeks after the Announcement, building sealed shelters called Arks in a dozen cities. Kansas City's is in the Bluffside Underground limestone mine: 20,000 berths, sold for everything a family owns, or given to useful Powered under contract.",
    },
    {
      title: 'The Open Door',
      keywords: ['open door', 'silas', 'wren', 'welcome what comes', 'church'],
      body: "A movement founded by former megachurch pastor Silas Wren. It teaches that Breach Day is a beginning, not an end: the creatures are the people of a new world and the Powers are gifts for welcoming them. It feeds and shelters anyone who comes, and its services are full every night.",
    },
    {
      title: 'KC Commons',
      keywords: ['commons', 'mutual aid', 'tomas', 'block captain', 'neighborhood'],
      body: "A web of neighborhood mutual aid groups across the metro, coordinated loosely from a union hall on the Westside by Tomás Ibarra: food banks, shared generators, block captains, volunteer patrols. Lots of people, little money, and few strong Powers.",
    },
  ],

  missions: [
    {
      title: 'Check on Maya',
      giver: 'Maya',
      description:
        'Your sibling is forty minutes away in Lawrence, and every phone network in the country just went down under the load. Get there, or get through, and find out what Power she got.',
      objectives: ['Reach Maya in Lawrence, in person or by phone', 'Learn what Power Maya claimed', 'Make a plan together for what comes next'],
      rewards: { xp: 40, relationships: [{ npc: 'Maya', affinity: 5, trust: 5 }] },
    },
    {
      title: 'Register Your Power',
      giver: 'Major Ellen Hartsock',
      description:
        'The Power Registration Act requires every person to register with the BPC at Union Station. Registration means a stipend, shelter priority, and the government knowing exactly what you can do.',
      objectives: ['Register your Power at Union Station, or decide not to'],
      rewards: {
        xp: 20,
        money: 500,
        items: [
          {
            name: 'BPC Registration Card',
            quantity: 1,
            description: 'A laminated federal ID with your photo, a QR code, and your registered Power and level, issued by the Breach Preparedness Command.',
            tags: ['bpc', 'document', 'id'],
          },
        ],
      },
    },
    {
      title: 'Hands for the Commons',
      giver: 'Tomás Ibarra',
      description:
        'The KC Commons needs people to staff food lines, check on elderly neighbors, and walk night patrols. It pays in meals and in people who remember you were there.',
      objectives: ['Volunteer a shift at Westside Commons Hall', 'Help Tomás with a problem the network can\'t solve on its own'],
      rewards: { xp: 50, relationships: [{ npc: 'Tomás Ibarra', affinity: 5, trust: 8 }] },
    },
    {
      title: "Meridian's Offer",
      giver: 'Graham Thibodeaux',
      description:
        'Meridian Ark is recruiting Powered contractors. Graham Thibodeaux will meet anyone with a useful Power at the Bluffside welcome center. The offer includes pay, gear, and the possibility of a berth.',
      objectives: ['Meet Graham Thibodeaux at the Bluffside Underground', 'Accept, negotiate, or refuse his contract'],
      rewards: { xp: 40, money: 2000 },
    },
    {
      title: 'Ready for Day 731',
      description:
        'Two years to get ready. What does ready look like? This record holds your preparations. Breach Day comes whether it is finished or not.',
      objectives: [
        'Secure a place to make your stand: a shelter, a Haven, or a way out',
        'Stock six months of food, water, and medicine for everyone you plan to protect',
        'Gather people you trust to stand with you',
        'Reach Lv5 in your Power',
        'Have a plan for Breach Day, and be where it needs you on Day 731',
      ],
      status: 'active',
      rewards: { xp: 600 },
    },
    {
      title: 'The Catalogue Question',
      description:
        'Where did the Powers come from? Who built the System? What is behind the Veil? This record holds what you have learned, and it can wait as long as you like.',
      objectives: [
        'Learn what happens to a Power when its holder dies',
        'Experience an Echo of someone who held your Power before',
        'Stand close to the seam at Kaw Point',
        'Learn the name of the world the Powers came from',
        'Learn what waits on the other side of a Breach Point',
      ],
      rewards: { xp: 500 },
    },
  ],

  character: {
    name: 'Casey Tran',
    archetype: 'Ordinary person',
    bio: "Twenty-seven, from Kansas City, born and raised. Shift lead at a distribution warehouse in the Northland: forklifts, inventory software, and making sure four hundred orders leave the dock every night. Grew up hunting deer in the Ozarks with your dad, who still calls every Sunday from Springfield. Your younger sibling Maya is at KU in Lawrence. You have $4,200 in savings, a 2014 Tacoma with 160,000 miles, a lease on a Midtown apartment, and, as of 7:40 p.m. on a Tuesday in October, two years left.",
    location: 'Your Apartment',
    money: 4200,
    level: 1,
    xp: 0,
    hp: 12,
    maxHp: 12,
    attributes: { strength: 5, agility: 5, vitality: 6, perception: 6, will: 5 },
    unspentStatPoints: 0,
    skills: [
      { name: 'Logistics', level: 3, xp: 30, description: 'Warehouse shift lead: inventory, supply chains, moving a lot of stuff fast, and getting tired people to do it.' },
      { name: 'Driving', level: 2, xp: 15, description: 'Forklifts, box trucks, and a pickup on gravel roads.' },
      { name: 'Firearms', level: 1, xp: 10, description: 'Deer season with your dad since you were twelve. A rifle, not a firefight.' },
      { name: 'First Aid', level: 1, xp: 0, description: 'The warehouse safety course: bleeding, burns, CPR, mostly forgotten.' },
    ],
    items: [
      {
        name: 'Smartphone',
        description: 'A cracked iPhone with 31% battery, a family group chat, and two hundred unread notifications that are about to become two thousand.',
        tags: ['phone', 'electronics'],
      },
      {
        name: '2014 Toyota Tacoma',
        description: 'A silver pickup with 160,000 miles, a bed liner, a tow hitch, and half a tank of gas. Parked on the street.',
        tags: ['vehicle', 'truck'],
      },
      {
        name: "Dad's deer rifle",
        description: 'A bolt-action .30-06 Remington 700 with a worn sling and a scope your dad zeroed himself. Kept in the bedroom closet, unloaded.',
        tags: ['weapon', 'rifle', 'firearm'],
      },
      {
        name: '.30-06 rounds',
        description: 'A box and a half of hunting ammunition.',
        quantity: 30,
        tags: ['ammunition'],
      },
    ],
    relationships: [
      { npc: 'Devin Cole', affinity: 70, trust: 65, status: 'best friend', historyNotes: 'Best friends since sophomore year at Shawnee Mission North. He drove you to the ER when you broke your wrist; you co-signed his car loan.' },
      { npc: 'Maya', affinity: 75, trust: 55, status: 'sibling', historyNotes: 'Your younger sibling. You taught her to drive and still pay her phone bill. She thinks you worry too much.' },
      { npc: 'Pearl Whitaker', affinity: 40, trust: 40, status: 'neighbor', historyNotes: 'Your downstairs neighbor for three years. You carry her groceries up; she feeds you soup when you look tired.' },
    ],
  },
};
