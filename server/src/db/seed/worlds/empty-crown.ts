import type { CampaignChoiceInput } from '@narrator/shared';
import type { WorldTemplate } from '../world';

// Faction names double as the reputation keys: an NPC whose `faction` matches one acts on the character's standing with it.
const KESTRANY = 'Crown of Kestrany';
const ULVHAL = 'Kingdom of Ulvhal';
const MERROWGATE = 'Merrowgate League';
const YSMERE = 'Hallowed See of Ysmere';
const TARKHAN = 'Tarkhan Hosts';
const FREE_FOLK = 'Free Folk of the Reach';
/** Untracked: the bandit lord's men. Reputation with them is personal, not a faction score. */
const ASHEN = 'Ashen Company';

/**
 * Who the character was before Thornwick. Skill names are single, distinct words on purpose: skill
 * lookup falls back to matching any shared word, so two-word names would collide.
 * Every passed-over origin brings a rival founder into the Reach who started the same way.
 */
const origin: CampaignChoiceInput = {
  key: 'origin',
  title: 'Origin',
  prompt:
    '[ THE CROOKED OX, THORNWICK ]\nRain drums on the shutters. Someone has scratched a map of the Reach into the tabletop with a knife, and no one owns any of it.\nMother Hester sets down your ale. "Everyone who comes to Thornwick is running from something or toward it. What were you, before?"',
  footer: 'Your past gives you a start, not a road. A crown can be won from any of them, and others with the same start are already in the Reach.',
  options: [
    {
      id: 'heir',
      label: 'EXILED HEIR',
      summary: 'The last thin thread of Calder royal blood, raised in hiding. A claim that opens doors and draws knives.',
      grants: {
        skills: [
          { name: 'Command', level: 2, description: 'Leading people who are not paid to follow you: giving orders that are obeyed, holding a line, settling a quarrel by rank.' },
          { name: 'Courtliness', level: 2, description: 'Court manners, heraldry, precedence, and the language of kings: knowing which fork, which title, and which insult is an insult.' },
          { name: 'Swordplay', level: 1, description: 'Sword and shield, taught by an old Calder knight in a hay barn.' },
        ],
        items: [
          {
            name: 'Signet of Calder',
            description:
              "A heavy gold ring cut with the Calder stag-and-tower. Proof of your claim to anyone who knows heraldry, and a death sentence in the wrong hands. Your mother's last gift.",
            tags: ['jewelry', 'claim', 'keepsake', 'calder'],
          },
          { name: 'Old court sword', description: "A fine but worn arming sword with a Calder crossguard, its edge still keen. A knight's weapon.", tags: ['weapon', 'blade', 'sword'] },
        ],
        statusEffects: [
          {
            name: 'Blood of Calder',
            description:
              "You descend from Calder's royal line through a younger son's daughter. A real claim, but a thin one: it must be proven, backed, and defended. It counts toward legitimacy (see Founding a Kingdom). Every crown would rather own a Calder heir than face one.",
            turnsRemaining: null,
            modifiers: [{ target: 'Courtliness', bonus: 1 }],
          },
        ],
      },
      ifNotChosen: {
        npc: {
          name: 'Lady Rowena Calder-Ashby',
          shortDescription:
            'Rival founder (EXILED HEIR). Twenty-eight, poised and cold-eyed, in Kestran velvet sewn with a Calder stag she has every right to wear. Speaks of the Reach as "my father\'s country."',
          faction: KESTRANY,
          location: 'Aubrel',
          notes:
            "**Path:** a Calder claim, the stronger one, through a legitimate granddaughter of the last king. **Backer:** King Osric of Kestrany shelters her as a puppet; he plans to marry her to his nephew and rule the Reach through her, which the Treaty of the Empty Crown cannot forbid. **Want:** the crown without the leash; she knows exactly what Osric intends. **Method:** letters to every Calder family in the Reach, a promise of old charters restored, and a Kestran escort of forty lances waiting for spring. **Toward the player:** a potential bride, ally, or rival; she will test whether the player is useful or merely in the way. **She cannot invent**; but she will ask Osric for anything the player shows her.",
        },
      },
    },
    {
      id: 'sellsword',
      label: 'SELLSWORD CAPTAIN',
      summary: 'Captain of a small, hungry free company. Steel you can count on for exactly as long as you can pay it.',
      grants: {
        skills: [
          { name: 'Swordplay', level: 3, description: "Sword and shield, learned in other people's wars: cut, bind, shove, and stay alive." },
          { name: 'Tactics', level: 2, description: 'Small-unit warfare: ground, ambush, march, watch, and when to run. Rolled for planning a fight, not swinging in one.' },
        ],
        items: [
          { name: 'Notched arming sword', description: 'A plain soldier\'s sword with a leather grip worn black. It has been sharpened so many times the blade has narrowed.', tags: ['weapon', 'blade', 'sword'] },
          { name: 'Patched mail shirt', description: 'Riveted iron mail to the hip, patched with mismatched rings. Worth more than everything else you own.', tags: ['armor', 'mail'] },
          { name: 'Company roll', description: 'A wax tablet with twelve names scratched on it, and a column of what you owe each of them. The column is long.', tags: ['record', 'company'] },
        ],
        statusEffects: [
          {
            name: 'Captain of the Rust Company',
            description:
              'Twelve sellswords (spears, two archers, a surgeon) camped outside Thornwick. Pay is 15 stags each per month; you owe them two months. Unpaid past a month more, they desert or sell themselves to someone else. Loyal to coin first and to you second, but that second can grow.',
            turnsRemaining: null,
            modifiers: [{ target: 'Tactics', bonus: 1 }],
          },
        ],
      },
      ifNotChosen: {
        npc: {
          name: 'Captain Hollis Grane',
          shortDescription:
            'Rival founder (SELLSWORD CAPTAIN). Forty, lean and grey-bearded, a black hound painted on his shield. Laughs easily, pays on time, and hangs thieves the same afternoon.',
          faction: '',
          location: 'The Wending Wood',
          notes:
            "**Path:** conquest. Commands the Black Hounds, eighty seasoned mercenaries, and has taken three woodland villages on the southern edge of the Reach by 'protecting' them. **Want:** to make his company a dynasty before his knees give out. **Method:** take land, fortify it, marry his son to the local gentry, and dare the five crowns to break the Treaty to stop him. **Toward the player:** sizes them up as a recruit, a rival, or a meal. Respects strength and kept bargains. **Weakness:** he cannot pay eighty men through a winter on three villages; he must expand by spring or go bankrupt, and he is eyeing Thornwick.",
        },
      },
    },
    {
      id: 'merchant',
      label: "MERCHANT'S HEIR",
      summary: 'The disinherited child of a Merrowgate trading house. Ledgers, contacts, and a letter of credit nobody has cancelled yet.',
      grants: {
        skills: [
          { name: 'Haggling', level: 3, description: 'Buying low, selling high, and knowing what a thing is worth to the person across the table.' },
          { name: 'Reckoning', level: 2, description: 'Numbers, ledgers, weights, measures, and spotting a forged tally. Merrowgate counting-house training.' },
        ],
        items: [
          {
            name: 'Letter of credit',
            description:
              "Sealed by your late father on the Lantern Bank of Merrowgate, good for 400 stags to the bearer in Merrowgate or from any League factor who trusts it. Your uncle, who now runs House Tessaro, would very much like it back.",
            tags: ['document', 'money', 'merrowgate'],
          },
          { name: 'Merchant scales', description: 'A folding brass balance with a set of honest weights and one dishonest one.', tags: ['tool', 'trade'] },
          { name: 'Good wool cloak', description: 'Dyed Merrowgate blue, lined with rabbit fur. It says money even when you have none.', tags: ['clothing'] },
        ],
        statusEffects: [
          {
            name: 'Trade Connections',
            description:
              'You know League factors in every port and which of them owe House Tessaro favors. You can buy and sell at fair prices anywhere the League trades, and hear market rumors first. Your uncle Benedetto Tessaro wants you discredited before you can contest his inheritance.',
            turnsRemaining: null,
            modifiers: [{ target: 'Haggling', bonus: 1 }],
          },
        ],
      },
      ifNotChosen: {
        npc: {
          name: 'Ilsabet Quill',
          shortDescription:
            'Rival founder (MERCHANT\'S HEIR). Thirty-two, sharp-featured and always smiling, ringed fingers stained with ink, a League factor\'s chain worn like a necklace.',
          faction: MERROWGATE,
          location: "Gull's Rest",
          notes:
            "**Path:** purchase. Buying the Reach one charter, debt, and harbor at a time. She has bought the debts of half the fishing families in Gull's Rest and means to own the bay by midsummer. **Want:** a merchant kingdom, Merrowgate's rules without Merrowgate's council. **Method:** loans, grain sold cheap in a famine, bribes, and patience. **Toward the player:** charming, generous, and always writing down what they owe her. **Danger to the player's inventions:** she buys anything clever and sells it to the highest bidder; anything she sees in use she will try to buy from the workers who build it.",
        },
      },
    },
    {
      id: 'forgewright',
      label: 'FORGEWRIGHT',
      summary: 'A journeyman smith and tinkerer with more ideas than iron. The forge is where kingdoms are really made.',
      grants: {
        skills: [
          { name: 'Smithing', level: 3, description: 'Bloomery iron, forge-welding, tools, nails, blades, and fittings. Rolled for working metal and judging it.' },
          { name: 'Engineering', level: 2, description: 'Making mechanisms work: levers, frames, gears, ropes, wheels, and the rest. Rolled for designing and building prototypes.' },
        ],
        items: [
          { name: "Smith's roll of tools", description: 'Tongs, two hammers, punches, files, and a small anvil horn wrapped in oiled leather. Heavy, and worth it.', tags: ['tool', 'smithing'] },
          { name: 'Forge hammer', description: 'A cross-peen hammer that has seen ten thousand nails. Also, in a pinch, a weapon.', tags: ['tool', 'weapon', 'blunt'] },
          {
            name: 'Book of notions',
            description:
              'A bundle of scraped wax tablets and charcoal sketches of ideas no one wanted to pay for: wheels inside wheels, a bellows worked by a stream, a bow on a stock. None built. Yet.',
            tags: ['notes', 'ideas', 'invention'],
          },
        ],
        statusEffects: [
          {
            name: "Inventor's Eye",
            description:
              "You see how things work and how they could work better. You have not built your ideas because no master would give you the iron or the time. Now no one can stop you. (Applies to designing and building prototypes; see The Rules of Invention.) Every craftsman you teach learns your secret too.",
            turnsRemaining: null,
            modifiers: [{ target: 'Engineering', bonus: 1 }],
          },
        ],
      },
      ifNotChosen: {
        npc: {
          name: 'Dagny Hammerhand',
          shortDescription:
            'Rival founder (FORGEWRIGHT). Twenty-nine, a broad Ulvhal smith with burn-scarred forearms, braided red hair singed short at the ends, and quick grey eyes that never stop looking at how things are made.',
          faction: ULVHAL,
          location: 'The Iron Hills',
          notes:
            "**Path:** iron. Has opened a bloomery in the Iron Hills and sells spearheads to every side, and the hill miners are starting to call her 'lady'. **Want:** a mountain kingdom of smiths and miners. **She cannot invent anything new** (only the player can), but she is the fastest copier in the world: given an example she can handle and a week, she will reproduce any simple or moderate invention, and she will sell it to Queen Asvor of Ulvhal. **Toward the player:** fascinated by them the moment she sees anything new; she will offer partnership, buy secrets, bribe workers, or steal. Honest about all of it.",
        },
      },
    },
    {
      id: 'scholar',
      label: 'HEDGE SCHOLAR',
      summary: 'A runaway from the temple schools of Ysmere, carrying a forbidden book. Letters, numbers, and dangerous questions.',
      grants: {
        skills: [
          { name: 'Letters', level: 3, description: 'Reading and writing the common tongue and the old Ysmeran script, copying documents, and drafting charters. Rare and valuable.' },
          { name: 'Physic', level: 2, description: 'Temple medicine: setting bones, cleaning wounds, herbs, fevers, and childbirth. Better than a barber; still no miracle.' },
          { name: 'Philosophy', level: 1, description: 'Natural philosophy: measuring, observing, and reasoning about why things happen. Rolled for working out principles and testing ideas.' },
        ],
        items: [
          {
            name: 'The Book of Measures',
            description:
              "A stolen Ysmeran codex of geometry, astronomy, and old engineers' notes (levers, pulleys, the weights of metals, the angles of the stars). Copying it outside the See is heresy. Knowing it gives you the principles; it does not give you inventions.",
            tags: ['book', 'knowledge', 'forbidden', 'ysmere'],
          },
          { name: 'Wax tablets and stylus', description: 'For notes, sums, and drawings. Scrape and reuse.', tags: ['tool', 'writing'] },
          { name: 'Grey novice robe', description: 'Patched and too long. The Ysmeran sun has been unpicked from the breast.', tags: ['clothing'] },
        ],
        statusEffects: [
          {
            name: 'Apostate of Ysmere',
            description:
              'You fled the temple school at Lumen with the Book of Measures. The Lamplighters, the See\'s inquisitors, want the book back and you burned. Ysmerans who learn who you are must report you. Your learning gives you a head start on working out how new things could work.',
            turnsRemaining: null,
            modifiers: [{ target: 'Philosophy', bonus: 1 }],
          },
        ],
      },
      ifNotChosen: {
        npc: {
          name: 'Caius Morrow',
          shortDescription:
            'Rival founder (HEDGE SCHOLAR). Thirty-five, gaunt and burning-eyed, a runaway lector in a mud-stained robe, who preaches barefoot and is followed everywhere by a crowd of hungry, hopeful people.',
          faction: '',
          location: 'Greywater Fens',
          notes:
            "**Path:** faith. Founded the Ploughmen's Covenant, a commune in the fens where all land is shared and no lord rules but 'the Light in every heart'. Three hundred followers and growing. **Want:** a holy kingdom of the poor; privately, he has begun to believe he is a prophet. **Method:** sermons, charity, and an army of fervent peasants. **Toward the player:** welcomes them as a brother or sister in the Light, then demands they kneel. Ysmere's Lamplighters want him dead. He calls every invention either a miracle or a devil's work, depending on who made it.",
        },
      },
    },
    {
      id: 'champion',
      label: "FREEHOLDERS' CHAMPION",
      summary: 'A farmer who stood up to bandits and won. A village that will follow you, and nothing else.',
      grants: {
        skills: [
          { name: 'Oratory', level: 3, description: 'Speaking to crowds: rousing, calming, and convincing ordinary people to do hard things together.' },
          { name: 'Husbandry', level: 2, description: 'Farming, herding, seasons, soil, and knowing how many mouths a field can feed.' },
          { name: 'Spearwork', level: 1, description: 'The boar spear and the shield wall: the farmer\'s way of war.' },
        ],
        items: [
          { name: "Father's boar spear", description: 'An ash-hafted spear with a broad leaf blade and a crossbar to stop a charging boar. It stopped a bandit last autumn.', tags: ['weapon', 'spear', 'keepsake'] },
          { name: 'Hob\'s Ford token', description: 'A carved wooden ox on a cord. Every household in Hob\'s Ford gave you one sliver of wood for it, which means they will follow you.', tags: ['keepsake', 'token', 'free folk'] },
        ],
        statusEffects: [
          {
            name: "Champion of Hob's Ford",
            description:
              "Last autumn you led the farmers of Hob's Ford (about ninety souls, forty fields, one mill-less stream) to drive off Red Oswin's tithe-men. They will follow you anywhere reasonable. Red Oswin has not forgotten. Hob's Ford is the obvious first seat of a realm, and the obvious first target.",
            turnsRemaining: null,
            modifiers: [{ target: 'Oratory', bonus: 1 }],
          },
        ],
      },
      ifNotChosen: {
        npc: {
          name: 'Ada Thatcher',
          shortDescription:
            "Rival founder (FREEHOLDERS' CHAMPION). Twenty-six, sunburned and sharp-tongued, with a pitchfork scar through one eyebrow and a habit of standing on carts to be heard.",
          faction: FREE_FOLK,
          location: "Hob's Ford",
          notes:
            "**Path:** a free league. Led Hob's Ford against Red Oswin's tithe-men last autumn, and is now riding village to village to bind the free villages of the Reach into a sworn league with no king at all. **Want:** that no lord ever takes a tithe from Hob's Ford again. **Method:** speeches, oaths, and shared defense. **Toward the player:** deeply suspicious of anyone who wants a crown; can be won as an ally by anyone who gives the villages real rights and protection. If the player shares an invention with the free villages, she becomes their champion.",
        },
      },
    },
  ],
};

export const emptyCrown: WorldTemplate = {
  id: 'empty-crown',
  name: 'The Empty Crown',
  description:
    'Sword-and-sail low fantasy with no magic. Five kingdoms surround the Reach, open land that no crown may annex. Build a kingdom of your own by sword, coin, faith, or cunning. Every new technology in the world must be invented by you, and you decide who else gets it.',
  demoCampaignName: 'The Empty Crown: A Banner of Your Own',
  currencyName: 'stags',
  reputation: { [KESTRANY]: 0, [ULVHAL]: 0, [MERROWGATE]: 0, [YSMERE]: 0, [TARKHAN]: 0, [FREE_FOLK]: 0 },
  choices: [origin],

  worldBible: `# The Empty Crown

There is no magic in this world. There are swords, arrows, oared ships with a single square sail, and people. Everything that happens is done by human hands, and every new idea must come from somewhere. In this campaign it comes from the player.

## The Reach
The **Reach** is a broad country of river valleys, fens, forest, and iron-rich hills in the middle of the continent, open to the sea on its western coast. It was once the **Kingdom of Calder**. Thirty-one years ago the last Calder king, **Aldred the Unready**, died childless in the plague year, and the five neighboring powers went to war over his country in the **Sundering War**. Eight years of burned harvests later, none of them had won. They signed the **Treaty of the Empty Crown** at Thornwick: no existing crown may annex the Reach, garrison it, or tax it. Any that does, the other four will fight.

The Reach has been open land ever since. Its free towns and villages govern themselves through village moots. Bandit lords, mercenaries, and preachers prey on them, and all five crowns meddle through envoys, merchants, and bribes. The Treaty forbids an *existing* crown from taking the Reach. It says nothing about a **new** one. Whoever founds a kingdom in the Reach breaks the balance of the continent, and every crown will try to own, use, or destroy them.

## The five powers
- **Kestrany** (east, river country): the oldest and richest kingdom, a breadbasket of grain, oxen, and proud nobility. **King Osric II** is sixty, shrewd, and has three quarrelsome sons. Kestrany would love a puppet on a Reach throne and is grooming one. Coin: the silver **stag**, used everywhere.
- **Ulvhal** (north, fjords): a hard kingdom of fishermen, shipwrights, and raiders under the war-queen **Asvor Ironwake**. The best ships on the continent, longships of oak and tar. In lean years they raid; this has been a lean year. They respect strength and plain dealing.
- **The Merrowgate League** (southwest coast): a council of merchant houses ruling a great port city and its trading posts, not a kingdom but richer than any. They trade tin, copper, dye, wine, and silk from beyond the sea. Everything has a price, and they want a monopoly on anything new.
- **The Hallowed See of Ysmere** (south, hills): a priest-kingdom of the **Sun Lamp** faith, ruled by **High Lector Yvaine Solis** from the holy city of **Lumen**. Its temple schools hold most of the continent's writing, mathematics, and medicine, and guard them. Its inquisitors, the **Lamplighters**, judge new crafts: what the See blesses is 'hallowed craft', what it condemns is 'unhallowed' and burned along with its maker. Most of the Reach's common folk keep the Sun Lamp faith.
- **The Tarkhan Hosts** (east, beyond Kestrany, the Sea of Grass): horse-clans under **Khagan Altan Sorgh**. Superb riders and archers who fight without stirrups, as everyone does. They trade horses, hides, and felt, they despise walls, and their young khagan is looking for a war worth fighting.

## The open lands of the Reach
- **Thornwick**: a free market town at the crossroads of the Reach, where the Treaty was signed. Ruled by its moot and its speaker, Mother Hester Vane. Every crown keeps an envoy here. Where the story starts.
- **Ashen Keep**: the burned royal castle of Calder on its hill, now held by the bandit lord **Red Oswin Marl**, who calls himself Lord Protector of the Reach and tithes the villages around him. Whoever holds the Keep holds a symbol.
- **The Iron Hills**: rugged northern hills with iron ore, seams of **black stone that burns** (coal; nobody uses it, it smokes and stinks), and the hot **Stinking Springs**, crusted with yellow brimstone.
- **Greywater Fens**: marshes and peat bogs with **bog iron** in the reed beds. The **Owlcrag Caves** on their edge are thick with bat dung that leaves a white, bitter **cave-salt** crust on the walls (saltpeter; its use is unknown).
- **Gull's Rest**: a fishing village on Saltmere Bay, the Reach's one good natural harbor, with salt pans and white sand. Raided by Ulvhal this summer.
- **The Wending Wood**: old forest of oak, yew, and pine, with timber, pitch, and outlaws.
- **Hob's Ford**: a farming village of about ninety souls on the Thorn river, which drove off Red Oswin's tithe-men last autumn.

## Technology: the baseline
The narrator must hold this line. See the lore entries 'The World's Technology' and 'The Rules of Invention'.
Short version: iron, not steel; self bows, not crossbows or composite bows; riders without stirrups; ox-plows, not horse collars; oars and one square sail, not stern rudders or compasses; parchment and wax, not paper or print; hand querns, not mills. **Nothing new appears in this world unless the player invents it.**

## Money
The Kestran silver **stag** is the common coin; twelve copper **bits** make a stag. A hot meal costs 1 stag, a night at an inn 2, a spear 6, a self bow 8, a sword 60, a mail shirt 250, a riding horse 120, a warhorse 500, a fishing boat 300, an Ulvhal longship 3,000. A sellsword earns 15 a month, a master smith 30. A village of a hundred souls might yield 300 a year in rent.

## Tone
Grounded, earthy, political, and full of possibility. Mud, rain, woodsmoke, hunger, and the thrill of building something. Lords are people, peasants are people, and every faction is rational from where it stands. War is fast and ugly; a winter can kill more than a battle. Show the world changing because of what the player builds: a mill turning where there was none, a village that eats in a lean year, a rival's spies watching the forge.

## Long-campaign threads
1. **A banner of your own**: the main story. Land, people, food, defense, a claim, and recognition (see 'Founding a Kingdom').
2. **The Ashen Keep**: Red Oswin's tithes grow heavier, and a crown is quietly paying him.
3. **The puppet throne**: Kestrany wants a ruler of the Reach on its leash, ideally one with Calder blood.
4. **Raiders from the north**: Ulvhal's lean year sends longships to Gull's Rest, and Queen Asvor wants a harbor in the Reach.
5. **The Lamplighters**: Ysmere watches every new craft and decides whether it is holy. Its scholars would also give anything to understand them.
6. **The young khagan**: Altan Sorgh wants a war. Whoever arms the Tarkhan Hosts with something new changes the map.
7. **The race of knowledge**: every invention the player keeps secret is a clock; every one they share is a gift that can be turned against them.
`,

  narratorStyle: `- Second person, present tense ("Rain drips from the thatch as you cross Thornwick's square...").
- Grounded and tactile: mud, smoke, rope, iron, wet wool, cold hands. No magic, no miracles; luck, skill, and work.
- 150 to 350 words per turn. Shorter for quick exchanges, longer for arrivals, battles, councils, and first demonstrations of inventions.
- Invention is the heart of the campaign. Treat the player's ideas seriously: ask what they want to build and how they think it works, show prototypes failing in instructive ways, and make the first success feel enormous. Then show the world noticing.
- When an invention first works, always put the choice to the player: keep it secret, share it (with whom?), or sell it. Never decide for them.
- Kingdom-building is concrete: count people, fields, spears, stores, and days to winter. Make logistics matter and let the player feel their realm grow.
- NPCs speak in distinct voices. Mother Hester Vane is blunt, warm, and calls everyone "love." Lady Corisande Aubrel is silky, precise, and never says no directly. Garrick Dunn grunts, swears at iron, and lights up talking about how things are made. Ottavio Brask speaks in prices and compliments. Brother Anselm Corr is gentle, curious, and frightened of his own questions. Red Oswin is jovial and menacing in the same breath. Ulvhal folk talk plainly; Tarkhan riders speak in proverbs about horses and grass.
- Combat is fast and deadly: a spear in the gut ends a story. Numbers, ground, armor, and surprise matter more than heroics. Telegraph threats.
- End on something the player can act on: a choice, an offer, a problem, a rider on the road.
`,

  locations: [
    {
      name: 'Thornwick',
      description:
        "A free market town of timber and thatch at the crossroads of the Reach, ringed by a ditch and a rotten palisade. The square holds the Treaty Stone, a grey slab cut with the five crowns' seals where the Treaty of the Empty Crown was signed, and every crown's envoy keeps a house within sight of it. Market days bring Kestran grain carts, Tarkhan horse-strings, League factors, and Ulvhal amber-sellers. The moot meets in the tithe barn.",
      purpose:
        "Where the story starts, and the political crossroads of the campaign. Every faction's envoy is here, so any invention used openly in Thornwick is seen by all five crowns within a day. The Treaty Stone is where a new kingdom's recognition would be sworn. Thornwick itself could become the player's seat if the moot chooses them, and Red Oswin's tithe demand (The Ashen Tithe) threatens it first.",
      tags: ['reach', 'town', 'market', 'crossroads', 'politics', 'free'],
    },
    {
      name: 'The Crooked Ox',
      description:
        "Thornwick's busiest alehouse: a long smoky hall with a fire pit, benches worn smooth, and a map of the Reach carved into the main table by a generation of knives. Mother Hester Vane runs it and the town moot from the same chair. Rooms upstairs for 2 stags a night.",
      purpose:
        "The player's first base and where the origin choice is made. Rumors, recruits, and envoys pass through. Hester gives The Ashen Tithe here, and the carved table map is a reminder that the Reach belongs to no one.",
      tags: ['reach', 'inn', 'tavern', 'rumors', 'safe'],
      parent: 'Thornwick',
    },
    {
      name: "Garrick's Forge",
      description:
        "A smoky smithy on Thornwick's east lane, with a clay bloomery out back, a cracked anvil, and walls hung with spearheads, hinges, and half-finished experiments that never worked. Garrick Dunn sleeps in the loft.",
      purpose:
        "The obvious first workshop for prototypes. Garrick can build almost anything the player can explain. That makes him the first craftsman who knows each secret, and so the first person a rival will try to bribe. Thornwick's envoys can see the smoke from their windows.",
      tags: ['reach', 'smithy', 'workshop', 'invention', 'crafting'],
      parent: 'Thornwick',
    },
    {
      name: 'Ashen Keep',
      description:
        "Calder's old royal castle on a bald hill two days north of Thornwick. The great hall's roof burned in the Sundering War, but the curtain wall and the round keep still stand, patched with timber. Red Oswin's banner (a red fist on grey) flies over it. Sixty bandits live inside with their women, goats, and loot. A well in the courtyard never runs dry.",
      purpose:
        "The symbol of the old kingdom and the strongest fortress in the Reach. Taking it, by siege, treachery, bargain, or a new engine of war, would give the player a seat and a claim. Red Oswin is secretly paid by Lady Corisande for Kestrany, who wants the Reach kept weak until a Kestran puppet is ready to rule it.",
      tags: ['reach', 'castle', 'fortress', 'bandits', 'ruins', 'calder'],
    },
    {
      name: 'The Iron Hills',
      description:
        "Rough heather-and-scree hills in the north of the Reach, scarred with old mine pits. Hill families dig iron ore and burn charcoal. In the valleys, seams of black stone crop out of the banks; it burns hot but smokes and stinks, so nobody wants it. At the Stinking Springs, hot water steams from yellow-crusted rock that smells of rotten eggs.",
      purpose:
        "The Reach's metal and chemistry: iron ore, coal, and brimstone (sulfur), all of it raw material for future inventions. Whoever controls the hills controls the Reach's iron. Nessa Coalbrook speaks for the miners. A rival forgewright may already be working here.",
      tags: ['reach', 'hills', 'mines', 'iron', 'coal', 'sulfur', 'resources'],
    },
    {
      name: 'Greywater Fens',
      description:
        'Flat grey marshland of reeds, peat bogs, and channels where herons stand still as posts. Fen-folk cut peat, catch eels, and rake rust-red bog iron from the shallows. Mist most mornings. Paths shift with the season, and strangers drown.',
      purpose:
        'Bog iron and peat (fuel and ore), a hiding place for outlaws and heretics, and the way to the Owlcrag Caves. Old Ysolt the fen-witch (no witch, only old and clever) knows the paths. A preacher may be gathering followers here.',
      tags: ['reach', 'marsh', 'fens', 'bog iron', 'peat', 'resources', 'dangerous'],
    },
    {
      name: 'Owlcrag Caves',
      description:
        'Limestone caves in a crag at the edge of the fens, home to thousands of bats. The floors are deep in dung, and the walls are crusted with a white, bitter salt that crackles in a fire. The fen-folk call it devil-salt and stay out.',
      purpose:
        'The Reach\'s one rich source of saltpeter, needed for gunpowder (with Iron Hills sulfur and charcoal), but only if the player works that out. Nobody in the world knows what cave-salt is good for.',
      tags: ['reach', 'caves', 'saltpeter', 'resources', 'bats'],
      parent: 'Greywater Fens',
    },
    {
      name: "Gull's Rest",
      description:
        "A fishing village of turf-roofed houses on Saltmere Bay, the only deep, sheltered harbor on the Reach's coast. Boats are drawn up on white sand; salt pans shine on the flats. Half the houses are burned shells from an Ulvhal raid in high summer. A League trading post stands on the jetty.",
      purpose:
        "The Reach's door to the sea: ships, trade, fish, salt, and sand fit for glass. Whoever holds the bay holds the coast, which is why Ulvhal raids it and the League buys it. Mara Feld gives Wreckers of Gull's Rest here. Any naval invention is built and tested here.",
      tags: ['reach', 'coast', 'harbor', 'village', 'fishing', 'ships', 'sand', 'salt'],
    },
    {
      name: 'The Wending Wood',
      description:
        'Old forest south of Thornwick: oak and ash along the river, black pine on the ridges, and groves of ancient yew. Charcoal burners, woodcutters, and outlaws live under the trees. The king\'s road through it is a mud track.',
      purpose:
        "Timber for ships, machines, and walls; yew for bows; pine for pitch and tar. Also an outlaw refuge and a place for ambushes. A mercenary captain may be taking its villages.",
      tags: ['reach', 'forest', 'timber', 'outlaws', 'resources'],
    },
    {
      name: "Hob's Ford",
      description:
        "A farming village of about ninety souls where the old road fords the Thorn river, a day west of Thornwick. Forty strip fields, a common, oxen, a timber chapel to the Sun Lamp, and grain ground by hand on stone querns, an hour of drudgery every day for every household. It drove off Red Oswin's tithe-men last autumn and has been waiting for his revenge since.",
      purpose:
        "The heart of the free villages and a likely first seat for a realm: people who want protection and fairness. The river is perfect for a mill, if anyone invents one. Red Oswin's revenge is coming.",
      tags: ['reach', 'village', 'farming', 'river', 'free'],
    },
    {
      name: 'Aubrel',
      description:
        "Kestrany's capital on the broad Aubre river: a walled city of white stone and red tile, the castle of King Osric on its rock, grain barges thick at the quays. Rich, proud, and full of courtiers, envoys, and debt.",
      purpose:
        'The seat of the most powerful crown, where any Calder claimant would be courted and leashed. Kestrany\'s recognition or enmity decides much. A good market for anything that helps farms or armies.',
      tags: ['kestrany', 'capital', 'city', 'court', 'foreign'],
    },
    {
      name: 'Skarnhavn',
      description:
        "Ulvhal's capital at the head of a deep fjord: longhouses of black-tarred timber, shipyards where keels lie on the slips like whale ribs, and Queen Asvor's hall carved with sea serpents. Cold, loud, and smelling of tar and fish.",
      purpose:
        'Home of the best shipwrights and seafighters in the world. Queen Asvor will deal with anyone strong. Sharing (or losing) a naval invention to Ulvhal makes them masters of every coast.',
      tags: ['ulvhal', 'capital', 'port', 'shipyards', 'foreign'],
    },
    {
      name: 'Merrowgate',
      description:
        'A crowded port city of canals and stone counting-houses on the southwestern coast, its harbor bristling with masts. Merchant houses fly their own flags; the League council meets in the Lantern Hall above the bank. Anything can be bought here.',
      purpose:
        "Money, trade, and the market for inventions: the League will pay a fortune for exclusive rights and steal what it can't buy. Copper and tin from overseas (for bronze) are sold here. The Lantern Bank honors letters of credit.",
      tags: ['merrowgate', 'city', 'port', 'trade', 'bank', 'foreign'],
    },
    {
      name: 'Lumen',
      description:
        'The holy city of Ysmere on terraced hills: white temples, the great Sun Lamp burning in its glass-domed tower, temple schools, scriptoria, and libraries. Lamplighters in yellow robes walk the streets. Pilgrims everywhere.',
      purpose:
        "Where learning lives, guarded. Ysmere's scholars could spread any shared invention across the continent, or the Lamplighters could declare it unhallowed. The only glassworks on the continent are in its temples, making lamp-glass and beads.",
      tags: ['ysmere', 'holy city', 'temple', 'scholars', 'foreign'],
    },
    {
      name: 'Khar Toru',
      description:
        "The great moving camp of the Tarkhan Hosts on the Sea of Grass: a city of felt tents that travels with the seasons, a hundred thousand horses on the plain around it, and the Khagan's white pavilion at its center.",
      purpose:
        'The strongest cavalry in the world, and the most dangerous place to share a military invention. The Tarkhan trade horses, hides, horn, and sinew. They respect gifts, courage, and hospitality.',
      tags: ['tarkhan', 'camp', 'steppe', 'horses', 'foreign'],
    },
  ],

  npcs: [
    {
      name: 'Mother Hester Vane',
      shortDescription:
        "Speaker of the Thornwick moot and keeper of the Crooked Ox. A big grey-haired woman of sixty with forearms like hams, a leather apron, and a voice that carries across a market. Calls everyone 'love.'",
      faction: FREE_FOLK,
      location: 'The Crooked Ox',
      notes:
        "**Want:** Thornwick fed, free, and not burned. She has kept the town alive for twenty years by playing the envoys off each other. **Secret:** she is tired, and she is looking for someone worth backing as lord of the Reach, so long as they will give the moot a charter of rights. **Toward the player:** friendly and testing. If the player helps Thornwick against Red Oswin, she can swing the moot behind them, which would make Thornwick the player's first town. She knows everyone and every rumor.",
    },
    {
      name: 'Garrick Dunn',
      shortDescription:
        'Thornwick\'s smith. A stooped, soot-black man of fifty with one milky eye from a forge spark, enormous scarred hands, and a vocabulary of curses for every kind of iron.',
      faction: FREE_FOLK,
      location: "Garrick's Forge",
      notes:
        "Thrown out of the Aubrel smiths' guild for 'meddling' with things nobody asked for; he cannot invent anything new himself, but he can build almost anything the player can explain, and he loves trying. **Want:** to make something that matters before he dies. **Weakness:** debt; he owes Ottavio Brask 40 stags, which makes him bribable. **Toward the player:** gruff, then devoted to anyone who brings him real ideas. Whatever he builds, he knows how to build again. He is the first leak risk of every secret.",
    },
    {
      name: 'Lady Corisande Aubrel',
      shortDescription:
        "Kestrany's envoy to Thornwick. Forty, elegant in dove-grey silk, with a jeweled pen-case at her belt, a soft voice, and the kind of attention that misses nothing.",
      faction: KESTRANY,
      location: 'Thornwick',
      notes:
        "King Osric's cousin and his spymaster in the Reach. **Want:** the Reach kept weak and divided until Kestrany's puppet can take it: a Calder heir if one is in the world (and if the player has Calder blood, the player), otherwise a Kestran-backed lord. **Secret:** she pays Red Oswin 200 stags a season to keep the villages afraid, and she has an informant in every household of note in Thornwick. **Toward the player:** courteous, interested, generous with small favors. She offers patronage to anyone who could be a useful Kestran tool, and destroys those who cannot. She reports every new thing she sees to Aubrel within three days.",
    },
    {
      name: 'King Osric II',
      shortDescription: 'King of Kestrany. Sixty, heavy, with a white beard, a gouty foot, and the patience of a man who has outlived two wars and three enemies.',
      faction: KESTRANY,
      location: 'Aubrel',
      notes:
        "**Want:** the Reach in Kestrany's hand without breaking the Treaty, and a quiet succession. **Problem:** his three sons each want the crown and each has a faction. **Toward the player:** pragmatic: a strong Reach ruler is either a son-in-law or an enemy. He will trade grain, recognition, and a daughter for a useful invention, and break the bargain if a better one comes along.",
    },
    {
      name: 'Queen Asvor Ironwake',
      shortDescription: 'War-queen of Ulvhal. Forty-five, tall and weathered, a sea-grey braid to her waist, missing two fingers on her left hand, and a laugh like a breaking wave.',
      faction: ULVHAL,
      location: 'Skarnhavn',
      notes:
        "**Want:** to feed her people through a third bad fishing year, and a warm-water harbor in the south: Gull's Rest. **Method:** raids if she must, trade if she can. **Toward the player:** respects strength, plain speech, and a good fight; despises flattery. An Ulvhal alliance is the strongest navy in the world. Give her a naval invention and she will love you, and then rule the sea.",
    },
    {
      name: 'Thrand Ketilsson',
      shortDescription: 'Ulvhal raider captain. Thirty, red-bearded, grinning, with a sealskin cloak, an axe through his belt, and two longships beached somewhere up the coast.',
      faction: ULVHAL,
      location: "Gull's Rest",
      notes:
        "Raided Gull's Rest this summer and will come back before the winter storms (around day 20) for salt, grain, and slaves. **Want:** loot and fame enough to be a jarl. **Toward the player:** an enemy who can be bought, beaten, or recruited; Ulvhal raiders change sides for a better offer and a good story. He reports anything unusual he sees to Queen Asvor.",
    },
    {
      name: 'Ottavio Brask',
      shortDescription: 'Merrowgate League factor at Thornwick and Gull\'s Rest. Fifty, plump and perfumed, in a blue velvet coat with silver buttons, rings on every finger, and a sweet smile that never reaches his eyes.',
      faction: MERROWGATE,
      location: 'Thornwick',
      notes:
        "**Want:** for the League to own every new thing in the Reach. **Offer:** he will buy exclusive rights to any invention for real money (hundreds or thousands of stags, depending on its value), and loan the player money at interest. **Method:** he buys debts and workers; he holds Garrick Dunn's debt. **Toward the player:** delighted, flattering, and always calculating. He keeps his written bargains to the letter and not one inch beyond.",
    },
    {
      name: 'Brother Anselm Corr',
      shortDescription: 'Lector of the Sun Lamp chapel in Thornwick. Thirty-eight, thin and stooped, with ink-stained fingers, a yellow stole over a grey robe, and a squint from years of copying by candlelight.',
      faction: YSMERE,
      location: 'Thornwick',
      notes:
        "**Want:** to understand how the world works, which Ysmere forbids outside the temple schools. **Secret:** he writes to a circle of quiet scholars in Lumen who would give anything for a new idea. **Duty:** he must report any new craft to the Lamplighters, who will judge it hallowed or unhallowed. **Toward the player:** fascinated and frightened. With his help an invention can be presented to Ysmere as a holy gift (hallowed), which makes it safe in the Sun Lamp lands; without it, the Lamplighters may brand the player a heretic. He can read, write, and teach.",
    },
    {
      name: 'High Lector Yvaine Solis',
      shortDescription: 'Ruler of the Hallowed See of Ysmere. Seventy, tiny and white-haired, in robes of cloth-of-gold, with eyes like a hawk and a soft, terrible voice.',
      faction: YSMERE,
      location: 'Lumen',
      notes:
        "**Want:** the See to remain the keeper of all knowledge. **Belief:** new knowledge unguided by faith brings ruin; knowledge guided by the See is holy. **Toward the player:** she can bless an invention (it spreads through Ysmere's schools and the See's goodwill grows) or condemn it (Lamplighters hunt it and its maker). She would very much like the player's inventions to belong to Ysmere.",
    },
    {
      name: 'Khagan Altan Sorgh',
      shortDescription: 'Khagan of the Tarkhan Hosts. Twenty-two, lean and handsome, with a shaved head and a long black topknot, a wolfskin over lacquered leather, and a bow he never puts down.',
      faction: TARKHAN,
      location: 'Khar Toru',
      notes:
        "**Want:** a great war to prove himself to the clan elders, who chose him young. Kestrany is the obvious target. **Toward the player:** generous to guests and gifts, brutal to enemies. Give the Tarkhan stirrups or a better bow and he will conquer half the continent, possibly with the player as ally, possibly not. He trades horses beyond price.",
    },
    {
      name: 'Ganzorig',
      shortDescription: 'A Tarkhan horse-trader at the Thornwick market. Fifty, bow-legged and leathery, with a wispy beard, a fox-fur hat, and a string of twenty steppe ponies.',
      faction: TARKHAN,
      location: 'Thornwick',
      notes:
        "Honest by Tarkhan standards: he will cheat you on a horse but never lie to a guest. **Role:** the player's way to the Khagan, and the Tarkhan's eyes in the Reach. He speaks in horse proverbs. Anything that changes how a horse is ridden, he will notice at once and send word to Khar Toru.",
    },
    {
      name: 'Red Oswin Marl',
      shortDescription: 'Bandit lord of Ashen Keep. Forty-five, huge and red-faced, a laughing man with a broken nose, a fur-trimmed coat stolen from a Kestran lord, and a war hammer.',
      faction: ASHEN,
      location: 'Ashen Keep',
      notes:
        "Calls himself Lord Protector of the Reach and tithes every village within three days' ride. **Secret:** paid by Lady Corisande for Kestrany to keep the Reach afraid; he does not know she plans to discard him. **Want:** to be a real lord, recognized. **Method:** sixty bandits, terror, and occasional generosity. **Toward the player:** a threat, a bargain, or a prize. He can be beaten, bribed, recruited, or betrayed; he is not stupid. He demands a tithe from Thornwick by the new moon (day 10).",
    },
    {
      name: 'Mara Feld',
      shortDescription: "Reeve of Gull's Rest. Thirty-five, weather-burned and hard, with a fishing knife on her belt, salt-white streaks in her black hair, and a husband buried in the summer raid.",
      faction: FREE_FOLK,
      location: "Gull's Rest",
      notes:
        "**Want:** Gull's Rest never burned again. **Problem:** the raiders return before the winter storms, and the League factor holds the village's debts. **Toward the player:** will give the village's loyalty and its harbor to anyone who defends it. Knows boats, the coast, the tides, and every fisher family.",
    },
    {
      name: 'Nessa Coalbrook',
      shortDescription: 'Headwoman of the Iron Hills miners. Fifty-five, short and broad, black dust in every line of her face, a pick-haft for a walking stick.',
      faction: FREE_FOLK,
      location: 'The Iron Hills',
      notes:
        "**Want:** a fair price for ore and no more men lost in collapses. **Knows:** every pit and seam in the hills, the black burning stone, the Stinking Springs. **Toward the player:** wary of anyone who wants the hills; loyal to anyone who makes the mines safer or the work less deadly.",
    },
    {
      name: 'Old Ysolt',
      shortDescription: 'A fen-woman of great age, bent and brown as a root, with eel-skin boots, a heron feather in her cap, and bright, mocking eyes.',
      faction: FREE_FOLK,
      location: 'Greywater Fens',
      notes:
        "Called a witch; she is only old and clever, and lets people think otherwise. **Knows:** the fen paths, bog iron, peat, and the Owlcrag Caves and their devil-salt, which she once saw make a fire spit and flare. **Toward the player:** charges a price for everything, in odd coin: a story, a favor, a promise. Keeps her bargains exactly.",
    },
  ],

  lore: [
    {
      title: 'The Rules of Invention',
      keywords: ['invent', 'invention', 'inventions', 'prototype', 'build', 'design', 'technology', 'secret', 'share', 'sell', 'plans', 'copy', 'leak', 'spread'],
      alwaysInclude: true,
      body: "ONLY THE PLAYER INVENTS. No NPC, kingdom, or ruin ever introduces new technology; others can only copy, buy, steal, or be given what the player creates. Anything absent from 'The World's Technology' baseline does not exist until the player invents it. HOW: (1) Idea: the player says what they want and how they think it works. A specific, sound idea goes quickly; a vague one needs many trials (days, money, accidents). Never block a sound idea, and never let hand-waving skip real prerequisites (cannon need gunpowder and cast bronze or iron first). (2) Materials and hands: real materials from real places, and craftsmen who learn the secret. (3) Prototype: pass_time, then a skill_check (Engineering, Smithing, or whichever fits; easy for simple, hard for deep). Failures teach something specific. (4) Production: workshop, workers, money, time. RECORD: when a prototype works, add_item 'Plans: <name>' tagged ['invention','secret'] with a description of how it works and who knows it, then ASK: keep secret, share (with whom), or sell? On sharing or selling, update_item tags to ['invention','shared'] and name the recipients; adjust_reputation. SECRECY is a clock, tracked in story notes: SIMPLE things (stirrups, horse collar, wheelbarrow) are copied within days of being seen. MODERATE things (crossbow, stern rudder, water mill, trebuchet) are copied in weeks from a captured example, a bribed worker, or close study. DEEP things (gunpowder, blast-furnace steel, paper, printing, compass) need the recipe or a defector, and take months. Shared inventions spread through the recipient's lands over a season and change how they act. Use them against the player if that is what the recipient would do.",
    },
    {
      title: "The World's Technology",
      keywords: ['technology', 'baseline', 'iron', 'steel', 'bow', 'crossbow', 'stirrup', 'plow', 'mill', 'ship', 'sail', 'rudder', 'compass', 'paper', 'glass', 'gunpowder', 'medicine', 'numbers'],
      alwaysInclude: true,
      body: "EXISTS: bloomery iron (soft, worked by forge-welding; good steel is luck), bronze from imported tin and copper, swords, spears, axes, round and kite shields, mail (expensive), padded and scale armor, self bows of yew or ash, slings, javelins, rams, ladders, palisades, stone walls and lime mortar; riding without stirrups, ox-drawn scratch plows, sickles and scythes, two-field farming, hand querns, wheeled carts, simple pulleys and levers; oared galleys and longships with a single square sail, a steering oar on the side, coast-hugging navigation by landmark and sun; wool, linen, leather, natural dyes; parchment, wax tablets, ink, Ysmeran script and numerals with no zero (sums are slow, done on fingers and counting-boards); temple medicine of herbs, setting bones, cautery, and bloodletting; Ysmeran temple glass (beads and lamp glass, no clear lenses). DOES NOT EXIST (until the player invents it): steel on purpose, blast furnaces, using coal, crossbows, composite or recurved bows, longbow drill, stirrups, horseshoes, the horse collar, heavy wheeled plows, crop rotation with clover or beans, water mills, windmills, the spinning wheel, the wheelbarrow, cranes and treadwheels, torsion and counterweight siege engines, gunpowder, stern rudders, lateen sails, the compass, charts and lighthouses, paper, printing, place-value numbers and zero, double-entry bookkeeping, eyeglasses and lenses, clocks, distillation, soap that cleans well, the idea that boiling water and clean hands prevent disease, and anything more advanced. Coal, sulfur, and cave-salt exist but no one knows their uses.",
    },
    {
      title: 'Founding a Kingdom',
      keywords: ['kingdom', 'realm', 'crown', 'king', 'queen', 'found', 'founding', 'recognition', 'claim', 'land', 'holding', 'people', 'subjects', 'banner', 'legitimacy'],
      alwaysInclude: true,
      body: "The main story. Track it in the 'Your Realm' condition (update_status_effect): seat, lands, people, fighters, stores, laws, claim, and who recognizes it. Any means are valid: conquest, purchase, marriage, a moot's election, a holy blessing, a league of villages, settling empty land, or invention-driven wealth. STAGES: (1) Holding: one place that is yours (a hall, a village, a keep, a harbor) and people who follow you. (2) Lordship: several settlements, a steady food supply, armed defenders, and laws you enforce. It must survive a winter. (3) Domain: a real territory (a large part of the Reach), a seat, a banner, and a claim (Calder blood, a moot's election, the See's blessing, a treaty, or conquest held for a year). (4) Kingdom: recognized as a crown by at least two of the five powers, sworn at the Treaty Stone in Thornwick, or held so firmly no one can deny it. Each stage brings stronger enemies: the crowns grow alarmed as the player rises, and the Treaty means any crown that moves openly against a new realm must answer to the other four. Keep counts honest: people eat, soldiers want pay, and winter comes on day 60 (snow closes the passes, and the fishing stops).",
    },
    {
      title: 'The Treaty of the Empty Crown',
      keywords: ['treaty', 'empty crown', 'annex', 'sundering war', 'treaty stone', 'thornwick'],
      body: "Signed at Thornwick twenty-three years ago after the eight-year Sundering War. Terms: no existing crown may annex, garrison, or tax the Reach; any that does faces the other four; envoys may reside in Thornwick; trade is free. It says nothing about a new crown arising in the Reach. Lawyers in every court have noticed this, and each crown means to make sure the new crown, when it comes, is its own. A new kingdom recognized at the Treaty Stone by two or more of the five powers would be lawful under the Treaty.",
    },
    {
      title: 'The Fall of Calder',
      keywords: ['calder', 'aldred', 'plague', 'royal line', 'stag', 'ashen keep', 'heir'],
      body: "Calder ruled the Reach for three hundred years from Ashen Keep. Its banner was a white stag beneath a tower. King Aldred the Unready died childless in the plague year thirty-one years ago; his cousins died in the war that followed, and the keep burned. Calder blood survives thinly through daughters and younger sons, and any claimant must prove descent with records (Ysmeran temple registers or Calder heraldry). Many Reach folk remember Calder fondly, as people remember better days. A Calder claim makes a new crown more acceptable to them.",
    },
    {
      title: 'Ysmere and Unhallowed Craft',
      keywords: ['ysmere', 'sun lamp', 'lamplighters', 'hallowed', 'unhallowed', 'heresy', 'faith', 'temple', 'lumen', 'scholars'],
      body: "The Sun Lamp faith holds that knowledge is light and must be kept by those who tend the Lamp. The Lamplighters judge any new craft: presented through the See (by a lector, with humility and a gift), it is usually judged hallowed, credited to the Light, and spread through the temple schools; the See's goodwill rises. Discovered on its own, especially if it is a weapon or challenges a temple monopoly (writing, medicine, glass), it may be judged unhallowed: its makers are hunted, its works burned, and the faithful told to shun them. Most Reach folk keep the faith. The See's scholars secretly crave new knowledge, and some can be won as allies.",
    },
    {
      title: 'Ships and the Sea',
      keywords: ['ship', 'ships', 'sea', 'longship', 'galley', 'cog', 'sail', 'navy', 'harbor', 'voyage', 'navigation', 'boat'],
      body: "Ships are oared galleys and longships with one square sail, steered with a side oar. They hug the coast, sail by day, beach at night, and cannot sail well against the wind. No charts, no compass; sailors navigate by landmarks, sun, and stars. Winter storms close the sea from about day 60 until spring. Ulvhal builds the best longships; the League has the most ships, broad merchant galleys. Gull's Rest has fishing boats and a beach for building. Naval inventions (stern rudder, better sails, keels, compass, charts) change who rules the sea.",
    },
    {
      title: 'Resources of the Reach',
      keywords: ['resources', 'ore', 'iron', 'coal', 'sulfur', 'brimstone', 'saltpeter', 'cave-salt', 'timber', 'yew', 'pitch', 'sand', 'salt', 'peat', 'bog iron', 'copper', 'tin', 'horn', 'sinew'],
      body: "Iron Hills: iron ore, charcoal, coal (black burning stone), sulfur at the Stinking Springs. Greywater Fens: bog iron, peat, reeds, eels. Owlcrag Caves: saltpeter (cave-salt). Gull's Rest: salt, fish, white sand (glass), harbor. Wending Wood: oak, ash, pine pitch and tar, yew for bows, charcoal. Hob's Ford and the river valleys: grain, oxen, wool, flax, fast streams. Imported: copper and tin (Merrowgate), horn and sinew and horses (Tarkhan), timber and tar and amber (Ulvhal), glass and parchment (Ysmere), grain and cloth (Kestrany).",
    },
  ],

  missions: [
    {
      title: 'A Banner of Your Own',
      description:
        'The Reach belongs to no one. The Treaty forbids the five crowns from taking it, but not a new crown from rising. Make it yours, by sword, coin, faith, cunning, or invention.',
      objectives: [
        'Win a holding in the Reach: a place that is yours, and people who follow you',
        'Grow it into a lordship that can feed and defend itself through a winter',
        'Raise a banner and a claim over a real domain',
        'Be recognized as a crown by at least two of the five powers, or hold your kingdom so firmly no one can deny it',
      ],
      status: 'active',
      rewards: { xp: 2000 },
    },
    {
      title: 'The Ashen Tithe',
      giver: 'Mother Hester Vane',
      description:
        "Red Oswin of Ashen Keep demands Thornwick pay him a tithe of 300 stags and twenty sacks of grain by the new moon (day 10), or he will 'protect' the town the way he protected the villages he burned. The moot cannot pay it and cannot fight him. Hester wants someone who can do one or the other.",
      objectives: ["Learn Red Oswin's strength and why he grows bolder", 'Decide how to answer the tithe: pay, bargain, trick, or fight', 'Keep Thornwick from being burned'],
      rewards: { money: 50, xp: 200, relationships: [{ npc: 'Mother Hester Vane', affinity: 20, trust: 25 }] },
    },
    {
      title: 'Iron for the Forge',
      giver: 'Garrick Dunn',
      description:
        "Garrick has a dozen half-built ideas and no iron to build them with. The Iron Hills miners will not sell to Thornwick since Red Oswin started taxing the road. Bring back good ore, and Garrick will build whatever you can explain.",
      objectives: ['Travel to the Iron Hills', 'Win over Nessa Coalbrook and the miners', 'Bring a load of ore back to Garrick\'s Forge'],
      rewards: { xp: 120, relationships: [{ npc: 'Garrick Dunn', affinity: 20, trust: 20 }, { npc: 'Nessa Coalbrook', affinity: 10, trust: 10 }] },
    },
    {
      title: "Wreckers of Gull's Rest",
      giver: 'Mara Feld',
      description:
        "Ulvhal raiders burned half of Gull's Rest in high summer, and their captain, Thrand Ketilsson, swore to return before the winter storms (around day 20). The village has thirty fishermen, no walls, and no money. Whoever saves it would have the Reach's only harbor.",
      objectives: ["Reach Gull's Rest and learn when the raiders will come", 'Prepare the village: walls, fighters, a trap, or a bargain', "Drive off, defeat, buy off, or recruit Thrand's raiders"],
      rewards: { xp: 250, relationships: [{ npc: 'Mara Feld', affinity: 25, trust: 30 }] },
    },
    {
      title: 'A Map of the Keep',
      giver: 'Lady Corisande Aubrel',
      description:
        "Kestrany's envoy will pay 100 stags for a sketch of Ashen Keep's defenses and a count of Red Oswin's men. She calls it 'concern for the peace.'",
      objectives: ['Scout Ashen Keep without being caught', 'Count its defenders and map its walls', 'Decide what to tell Lady Corisande, and what to keep for yourself'],
      rewards: { money: 100, xp: 100, relationships: [{ npc: 'Lady Corisande Aubrel', affinity: 10, trust: 15 }] },
    },
    {
      title: "The Factor's Offer",
      giver: 'Ottavio Brask',
      description:
        "The League factor has heard you have ideas. He offers a standing bargain: bring him anything new and useful, and the League will pay handsomely for the sole right to make and sell it. He has a contract ready.",
      objectives: ['Hear out the League\'s terms', 'Decide whether any invention is worth selling, and on what terms'],
      rewards: { xp: 50 },
    },
  ],

  character: {
    name: 'Wynn Carrow',
    archetype: 'Would-be founder',
    bio: "Twenty-five, newly arrived in Thornwick with a pack, a knife, and an idea that will not leave you alone: the Reach belongs to no one, and it could belong to you. What you were before, and what you bring with you, is still yours to say. You have seen how the world works, and you have a nagging feeling it could work a great deal better.",
    location: 'The Crooked Ox',
    money: 20,
    level: 1,
    xp: 0,
    hp: 14,
    maxHp: 14,
    statusEffects: [
      {
        name: 'Your Realm',
        description: 'No land, no people, no banner. Yet. (See Founding a Kingdom. Update this as the realm grows: seat, lands, people, fighters, stores, laws, claim, recognition.)',
        turnsRemaining: null,
        modifiers: [],
      },
    ],
    skills: [
      { name: 'Perception', level: 1, xp: 10, description: 'Noticing what is out of place: an ambush, a lie, a watcher, a weakness in a wall.' },
      { name: 'Survival', level: 1, xp: 10, description: 'Living rough: tracking, foraging, weather, fire, and finding the road.' },
    ],
    items: [
      { name: 'Belt knife', description: 'A plain iron knife with an antler handle. Eats, cuts, and argues.', tags: ['weapon', 'blade', 'tool'], equipped: true },
      { name: 'Traveler\'s pack', description: 'A canvas pack with a blanket, flint and steel, a waterskin, and two days of hard bread and cheese.', tags: ['container', 'supplies'], equipped: true },
      { name: 'Charcoal and scraps', description: 'A stub of charcoal and a few smooth scraps of birch bark for sketching. Your hands draw machines when you are not paying attention.', tags: ['tool', 'writing', 'ideas'] },
    ],
    relationships: [
      {
        npc: 'Mother Hester Vane',
        affinity: 10,
        trust: 0,
        status: 'host',
        historyNotes: '- Gave you a room at the Crooked Ox on credit because you helped unload her ale cart in the rain.',
      },
    ],
  },
};
