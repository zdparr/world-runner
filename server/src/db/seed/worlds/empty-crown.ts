import type { CampaignChoiceInput, RankLadderInput } from '@narrator/shared';
import type { WorldTemplate } from '../world';

// Faction names double as the reputation keys: an NPC whose `faction` matches one acts on the character's standing with it.
const KESTRANY = 'Crown of Kestrany';
const ULVHAL = 'Kingdom of Ulvhal';
const CARTHEN = 'Kingdom of Carthen';
/** Serves no crown: trades and lends in all three kingdoms from its free port of Corsal. */
const LEAGUE = 'Corsal League';
/** Serves no crown: the Sun Lamp faith, preached in all three kingdoms from its holy mountain of Ysmere. */
const YSMERE = 'Hallowed See of Ysmere';
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
            "**Path:** conquest. Commands the Black Hounds, eighty seasoned mercenaries, and has taken three woodland villages on the southern edge of the Reach by 'protecting' them. **Want:** to make his company a dynasty before his knees give out. **Method:** take land, fortify it, marry his son to the local gentry, and dare the three crowns to break the Treaty to stop him. **Toward the player:** sizes them up as a recruit, a rival, or a meal. Respects strength and kept bargains. **Weakness:** he cannot pay eighty men through a winter on three villages; he must expand by spring or go bankrupt, and he is eyeing Thornwick.",
        },
      },
    },
    {
      id: 'merchant',
      label: "MERCHANT'S HEIR",
      summary: 'The disinherited child of a Corsal trading house. Ledgers, contacts, and a letter of credit nobody has cancelled yet.',
      grants: {
        skills: [
          { name: 'Haggling', level: 3, description: 'Buying low, selling high, and knowing what a thing is worth to the person across the table.' },
          { name: 'Reckoning', level: 2, description: 'Numbers, ledgers, weights, measures, and spotting a forged tally. Corsal counting-house training.' },
        ],
        items: [
          {
            name: 'Letter of credit',
            description:
              "Sealed by your late father on the Lantern Bank of Corsal, good for 400 stags to the bearer in Corsal or from any League factor who trusts it. Your uncle, who now runs House Tessaro, would very much like it back.",
            tags: ['document', 'money', 'corsal'],
          },
          { name: 'Merchant scales', description: 'A folding brass balance with a set of honest weights and one dishonest one.', tags: ['tool', 'trade'] },
          { name: 'Good wool cloak', description: 'Dyed Corsal blue, lined with rabbit fur. It says money even when you have none.', tags: ['clothing'] },
        ],
        statusEffects: [
          {
            name: 'Trade Connections',
            description:
              'You know League factors in every port and royal city of the three kingdoms, and which of them owe House Tessaro favors. You can buy and sell at fair prices anywhere the League trades, and hear market rumors first. Your uncle Benedetto Tessaro wants you discredited before you can contest his inheritance.',
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
          faction: LEAGUE,
          location: "Gull's Rest",
          notes:
            "**Path:** purchase. Buying the Reach one charter, debt, and harbor at a time. She has bought the debts of half the fishing families in Gull's Rest and means to own the bay by midsummer. **Want:** a merchant kingdom, Corsal's rules without Corsal's council. **Method:** loans, grain sold cheap in a famine, bribes, and patience. **Toward the player:** charming, generous, and always writing down what they owe her. **Danger to the player's inventions:** she buys anything clever and sells it to the highest bidder; anything she sees in use she will try to buy from the workers who build it.",
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
            "**Path:** iron. Has opened a bloomery in the Iron Hills and sells spearheads to every side, and the hill miners are starting to call her 'lady'. **Want:** a mountain kingdom of smiths and miners. **She cannot invent anything new** (only the player can), but she is the fastest copier in the world: given an example she can handle and a week, she will reproduce any simple or moderate invention, and she will sell it to Queen Asvor of Ulvhal, her own queen. **Toward the player:** fascinated by them the moment she sees anything new; she will offer partnership, buy secrets, bribe workers, or steal. Honest about all of it.",
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
              'You fled the temple school at Lumen on the holy mountain with the Book of Measures. The Lamplighters, the See\'s inquisitors, want the book back and you burned. The faithful of all three kingdoms who learn who you are must report you. Your learning gives you a head start on working out how new things could work.',
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
            "**Path:** faith. Founded the Ploughmen's Covenant, a commune in the fens where all land is shared and no lord rules but 'the Light in every heart'. Three hundred followers and growing. **Want:** a holy kingdom of the poor; privately, he has begun to believe he is a prophet. **Method:** sermons, charity, and an army of fervent peasants. **Toward the player:** welcomes them as a brother or sister in the Light, then demands they kneel. The See's Lamplighters want him dead. He calls every invention either a miracle or a devil's work, depending on who made it.",
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

/** The main story's progress, shown to the player as the Dominion panel. Details live in the 'Your Realm' condition. */
export const DOMINION: RankLadderInput = {
  title: 'Dominion',
  unranked: 'No realm yet',
  condition: 'Your Realm',
  stages: [
    { name: 'Holding', summary: 'One place that is yours (a hall, a village, a keep, or a harbor) and people who follow you.' },
    { name: 'Lordship', summary: 'Several settlements, a steady food supply, armed defenders, and laws you enforce, and it has survived a winter.' },
    { name: 'Domain', summary: 'A real territory across much of the Reach, a seat, a banner, and a claim others must answer.' },
    { name: 'Kingdom', summary: 'Recognized as a crown by two of the three crowns (or one crown and the See), or held so firmly that no one can deny it.' },
    { name: 'High Kingdom', summary: 'The Reach and all three crowns united under you, by conquest, marriage, inheritance, or oath, and held for a year.' },
  ],
};

export const emptyCrown: WorldTemplate = {
  id: 'empty-crown',
  name: 'The Empty Crown',
  description:
    'Sword-and-sail low fantasy with no magic. Three rival kingdoms, a merchant League, and a holy See surround the Reach, open land that no crown may annex. Build a kingdom of your own by sword, coin, faith, or cunning. Every new technology in the world must be invented by you, and you decide who else gets it.',
  demoCampaignName: 'The Empty Crown: A Banner of Your Own',
  currencyName: 'stags',
  reputation: { [KESTRANY]: 0, [ULVHAL]: 0, [CARTHEN]: 0, [LEAGUE]: 0, [YSMERE]: 0, [FREE_FOLK]: 0 },
  choices: [origin],
  ladder: DOMINION,
  mapArt: 'empty-crown',

  worldBible: `# The Empty Crown

There is no magic in this world. There are swords, arrows, oared ships with a single square sail, and people. Everything that happens is done by human hands, and every new idea must come from somewhere. In this campaign it comes from the player.

## The Reach
The **Reach** is a broad country of river valleys, fens, forest, and iron-rich hills in the middle of the continent, open to the sea on its western coast. It was once the **Kingdom of Calder**. Thirty-one years ago the last Calder king, **Aldred the Unready**, died childless in the plague year, and the three neighboring kingdoms went to war over his country in the **Sundering War**. Eight years of burned harvests later, none of them had won. They signed the **Treaty of the Empty Crown** at Thornwick, blessed by the See and underwritten by the League: no existing crown may annex the Reach, garrison it, or tax it. Any that does, the other two will fight, the See will preach against, and the League will lend nothing to.

The Reach has been open land ever since. Its free towns and villages govern themselves through village moots. Bandit lords, mercenaries, and preachers prey on them, and all three crowns, the League, and the See meddle through envoys, factors, priests, and bribes. The Treaty forbids an *existing* crown from taking the Reach. It says nothing about a **new** one. Whoever founds a kingdom in the Reach breaks the balance of the continent, and every crown will try to own, use, or destroy them.

## The three crowns
Three proper kingdoms, each with a royal line, great lords sworn to the crown, royal law, and armies raised by those oaths. Each is loyal to itself first, and each wants the Reach.
- **Kestrany** (east, river country): the oldest and richest kingdom, a breadbasket of grain, oxen, and proud nobility. **King Osric II** is sixty, shrewd, and has three quarrelsome sons; a dozen great earls hold their land of him and bring their levies when he calls. Kestrany would love a puppet on a Reach throne and is grooming one. Coin: the silver **stag**, used everywhere.
- **Ulvhal** (north, fjords): a hard kingdom of fishermen, shipwrights, and seafighters under the war-queen **Asvor Ironwake**, whose jarls swear to her on the oath-ring at Skarnhavn and owe her ships and crews. The best ships on the continent, longships of oak and tar. In lean years Ulvhal raids; this has been a lean year. They respect strength and plain dealing.
- **Carthen** (south, hill and vine country): a kingdom of castles, vineyards, and armored horsemen, the finest horse-breeders on the continent, under the young **King Brannoc**, crowned at twenty-two by the See's own hand. His barons hold the hill castles and ride to war at his summons. Carthen and Kestrany fought the longest campaigns of the Sundering War and have hated each other since. Brannoc wants a war worth fighting, and the old men of his council cannot hold him much longer.

## The League and the See
Two powers with no crown, serving none of the three and working inside all of them. Each holds one piece of ground outside every kingdom.
- **The Corsal League**: a council of seven merchant houses ruling **Corsal**, a free island port off the southwestern coast that bought its freedom from Carthen's crown three generations ago. They trade tin, copper, dye, wine, and silk from beyond the sea, lend to kings, and want a monopoly on anything new. Their sway differs by kingdom: in **Kestrany** they hold King Osric's war debts and the grain trade, and his treasurer answers to their factors almost as much as to him; in **Ulvhal** they buy the whole amber and fish catch and sell grain in lean years, so the jarls need them and resent them; in **Carthen** King Brannoc despises merchants and taxes them hard, but his barons borrow from the League in secret. Their head is the **First Factor, Cassia Marovin**.
- **The Hallowed See of Ysmere**: the **Sun Lamp** faith, ruled by **High Lector Yvaine Solis** from the holy city of **Lumen** on **Mount Ysmere**, a sacred mountain in the high passes between Carthen and Kestrany that all three crowns swore never to take. Its temple schools hold most of the continent's writing, mathematics, and medicine, and guard them. Its inquisitors, the **Lamplighters**, judge new crafts: what the See blesses is 'hallowed craft', what it condemns is 'unhallowed' and burned along with its maker. Its sway differs by kingdom: in **Carthen** it crowned the king, Lamplighters sit on the royal council, and its word is close to law; in **Kestrany** its abbeys hold a third of the land and the nobility is devout, but King Osric keeps the Lectors at arm's length; in **Ulvhal** the old sea-gods still rule the coast, and the See has only missions, a few converted jarls, and the queen's tolerance. Most of the Reach's common folk keep the Sun Lamp faith.

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
5. **The Lamplighters**: the See watches every new craft and decides whether it is holy, and in Carthen its judgment is enforced by the king's knights. Its scholars would also give anything to understand them.
6. **The young king**: Brannoc of Carthen wants a war with Kestrany. Whoever arms Carthen's knights with something new changes the map.
7. **The race of knowledge**: every invention the player keeps secret is a clock; every one they share is a gift that can be turned against them.
8. **Masters without crowns**: the League and the See owe nothing to any king, and each can make a new crown possible: the League with money, the See with an anointing. Each will want something for it.
9. **One crown over all**: after Kingdom comes High Kingdom: the Reach and Kestrany, Ulvhal, and Carthen under one ruler, whether by conquest, marriage, inheritance, or oath.

## The far shore (GM-only: the secret of the later phase)
Across the Western Sea lies **Avandre**, a continent far larger and more populous than the known world, which does not know the known world exists. Only the Corsal League's oldest secret touches it: once a year the League meets foreign traders at the **Hearthstone Isles**, far out in the Western Sea, and buys the tin, copper, and silk it claims come "from the south." Beyond the isles lies the **Stillwater**, a vast belt of dead calm that no oared or sailing ship from the known world can cross.
**Never reveal Avandre, name it, or put it on the map until BOTH are true:** the Dominion stands at **High Kingdom**, and the player has a **working ship driven by an engine** of their own invention. Until then, only foreshadow. When both are true, the later phase begins. Read the lore entries 'Beyond the Western Sea', 'Avandre: Its Powers', and 'Avandre: Places and the Map' (search_lore) before revealing anything.
`,

  narratorStyle: `- Second person, present tense ("Rain drips from the thatch as you cross Thornwick's square...").
- Grounded and tactile: mud, smoke, rope, iron, wet wool, cold hands. No magic, no miracles; luck, skill, and work.
- 150 to 350 words per turn. Shorter for quick exchanges, longer for arrivals, battles, councils, and first demonstrations of inventions.
- Invention is the heart of the campaign. Say yes to the player's ideas: take what they want to build and what it should do, skip the technical how, and get to a working prototype quickly (see The Rules of Invention). Make the first success feel enormous. Then show the world noticing.
- When an invention first works, always put the choice to the player: keep it secret, share it (with whom?), or sell it. Never decide for them.
- Kingdom-building is concrete: count people, fields, spears, stores, and days to winter. Make logistics matter and let the player feel their realm grow.
- NPCs speak in distinct voices. Mother Hester Vane is blunt, warm, and calls everyone "love." Lady Corisande Aubrel is silky, precise, and never says no directly. Garrick Dunn grunts, swears at iron, and lights up talking about how things are made. Ottavio Brask speaks in prices and compliments. Brother Anselm Corr is gentle, curious, and frightened of his own questions. Red Oswin is jovial and menacing in the same breath. Ulvhal folk talk plainly; Carthen knights are courtly, proud, quick to take offense, and swear by the Lamp.
- Combat is fast and deadly: a spear in the gut ends a story. Numbers, ground, armor, and surprise matter more than heroics. Telegraph threats.
- End on something the player can act on: a choice, an offer, a problem, a rider on the road.
`,

  locations: [
    {
      name: 'Thornwick',
      description:
        "A free market town of timber and thatch at the crossroads of the Reach, ringed by a ditch and a rotten palisade. The square holds the Treaty Stone, a grey slab cut with the three crowns' seals (and the Lamp and the League's ship beneath them) where the Treaty of the Empty Crown was signed, and every crown's envoy keeps a house within sight of it. Market days bring Kestran grain carts, Carthen horse-strings, League factors, and Ulvhal amber-sellers. The moot meets in the tithe barn.",
      purpose:
        "Where the story starts, and the political crossroads of the campaign. Every faction's envoy is here, so any invention used openly in Thornwick is seen by all three crowns, the League, and the See within a day. The Treaty Stone is where a new kingdom's recognition would be sworn. Thornwick itself could become the player's seat if the moot chooses them, and Red Oswin's tithe demand (The Ashen Tithe) threatens it first.",
      tags: ['reach', 'town', 'market', 'crossroads', 'politics', 'free'],
      map: { x: 0, y: 0 },
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
      map: { x: 0, y: 16 },
    },
    {
      name: 'The Iron Hills',
      description:
        "Rough heather-and-scree hills in the north of the Reach, scarred with old mine pits. Hill families dig iron ore and burn charcoal. In the valleys, seams of black stone crop out of the banks; it burns hot but smokes and stinks, so nobody wants it. At the Stinking Springs, hot water steams from yellow-crusted rock that smells of rotten eggs.",
      purpose:
        "The Reach's metal and chemistry: iron ore, coal, and brimstone (sulfur), all of it raw material for future inventions. Whoever controls the hills controls the Reach's iron. Nessa Coalbrook speaks for the miners. A rival forgewright may already be working here.",
      tags: ['reach', 'hills', 'mines', 'iron', 'coal', 'sulfur', 'resources'],
      map: { x: 4, y: 28 },
    },
    {
      name: 'Greywater Fens',
      description:
        'Flat grey marshland of reeds, peat bogs, and channels where herons stand still as posts. Fen-folk cut peat, catch eels, and rake rust-red bog iron from the shallows. Mist most mornings. Paths shift with the season, and strangers drown.',
      purpose:
        'Bog iron and peat (fuel and ore), a hiding place for outlaws and heretics, and the way to the Owlcrag Caves. Old Ysolt the fen-witch (no witch, only old and clever) knows the paths. A preacher may be gathering followers here.',
      tags: ['reach', 'marsh', 'fens', 'bog iron', 'peat', 'resources', 'dangerous'],
      map: { x: 14, y: -4 },
    },
    {
      name: 'Owlcrag Caves',
      description:
        'Limestone caves in a crag at the edge of the fens, home to thousands of bats. The floors are deep in dung, and the walls are crusted with a white, bitter salt that crackles in a fire. The fen-folk call it devil-salt and stay out.',
      purpose:
        'The Reach\'s one rich source of saltpeter, needed for gunpowder (with Iron Hills sulfur and charcoal), but only if the player works that out. Nobody in the world knows what cave-salt is good for.',
      tags: ['reach', 'caves', 'saltpeter', 'resources', 'bats'],
      parent: 'Greywater Fens',
      map: { x: 18, y: 0 },
    },
    {
      name: "Gull's Rest",
      description:
        "A fishing village of turf-roofed houses on Saltmere Bay, the only deep, sheltered harbor on the Reach's coast. Boats are drawn up on white sand; salt pans shine on the flats. Half the houses are burned shells from an Ulvhal raid in high summer. A League trading post stands on the jetty.",
      purpose:
        "The Reach's door to the sea: ships, trade, fish, salt, and sand fit for glass. Whoever holds the bay holds the coast, which is why Ulvhal raids it and the League buys it. Mara Feld gives Wreckers of Gull's Rest here. Any naval invention is built and tested here.",
      tags: ['reach', 'coast', 'harbor', 'village', 'fishing', 'ships', 'sand', 'salt'],
      map: { x: -24, y: 6 },
    },
    {
      name: 'The Wending Wood',
      description:
        'Old forest south of Thornwick: oak and ash along the river, black pine on the ridges, and groves of ancient yew. Charcoal burners, woodcutters, and outlaws live under the trees. The king\'s road through it is a mud track.',
      purpose:
        "Timber for ships, machines, and walls; yew for bows; pine for pitch and tar. Also an outlaw refuge and a place for ambushes. A mercenary captain may be taking its villages.",
      tags: ['reach', 'forest', 'timber', 'outlaws', 'resources'],
      map: { x: 0, y: -10 },
    },
    {
      name: "Hob's Ford",
      description:
        "A farming village of about ninety souls where the old road fords the Thorn river, a day west of Thornwick. Forty strip fields, a common, oxen, a timber chapel to the Sun Lamp, and grain ground by hand on stone querns, an hour of drudgery every day for every household. It drove off Red Oswin's tithe-men last autumn and has been waiting for his revenge since.",
      purpose:
        "The heart of the free villages and a likely first seat for a realm: people who want protection and fairness. The river is perfect for a mill, if anyone invents one. Red Oswin's revenge is coming.",
      tags: ['reach', 'village', 'farming', 'river', 'free'],
      map: { x: -8, y: 0 },
    },
    {
      name: 'Aubrel',
      description:
        "Kestrany's capital on the broad Aubre river: a walled city of white stone and red tile, the castle of King Osric on its rock, grain barges thick at the quays. Rich, proud, and full of courtiers, envoys, and debt.",
      purpose:
        'The seat of the most powerful crown, where any Calder claimant would be courted and leashed. Kestrany\'s recognition or enmity decides much. A good market for anything that helps farms or armies.',
      tags: ['kestrany', 'capital', 'city', 'court', 'foreign'],
      map: { x: 64, y: 4 },
    },
    {
      name: 'Skarnhavn',
      description:
        "Ulvhal's capital at the head of a deep fjord: longhouses of black-tarred timber, shipyards where keels lie on the slips like whale ribs, and Queen Asvor's hall carved with sea serpents. Cold, loud, and smelling of tar and fish.",
      purpose:
        'Home of the best shipwrights and seafighters in the world. Queen Asvor will deal with anyone strong. Sharing (or losing) a naval invention to Ulvhal makes them masters of every coast.',
      tags: ['ulvhal', 'capital', 'port', 'shipyards', 'foreign'],
      map: { x: -14, y: 76 },
    },
    {
      name: 'Corsal',
      description:
        'A free island port off the southwestern coast, belonging to no crown: canals, stone counting-houses, and a harbor bristling with masts from every sea. Each of the seven houses flies its own flag; the League council meets in the Lantern Hall above the bank. Anything can be bought here.',
      purpose:
        "The League's seat and its one piece of ground outside every kingdom. Money, trade, and the market for inventions: the League will pay a fortune for exclusive rights and steal what it can't buy. Copper and tin from overseas (for bronze) are sold here. The Lantern Bank honors letters of credit. First Factor Cassia Marovin can open or close a kingdom's purse.",
      tags: ['league', 'free port', 'island', 'trade', 'bank', 'foreign'],
      map: { x: -44, y: -48 },
    },
    {
      name: 'Lumen',
      description:
        'The holy city on Mount Ysmere, in the high passes between Carthen and Kestrany, climbing the terraced slopes: white temples, the great Sun Lamp burning in its glass-domed tower, temple schools, scriptoria, and libraries. Lamplighters in yellow robes walk the streets. Pilgrims everywhere.',
      purpose:
        "The See's seat and its one piece of ground outside every kingdom, sworn untouchable by all three crowns. Where learning lives, guarded. The See's scholars could spread any shared invention through all three kingdoms, or the Lamplighters could declare it unhallowed. The only glassworks on the continent are in its temples, making lamp-glass and beads.",
      tags: ['ysmere', 'holy city', 'temple', 'scholars', 'neutral', 'foreign'],
      map: { x: 36, y: -44 },
    },
    {
      name: 'Castel Varre',
      description:
        "Carthen's capital on a crag above the wine country of the south: a tiered fortress-city of honey-colored stone, the royal castle at its crown, a great temple of the Sun Lamp beside it, and royal horse-studs spreading across the valley below. Knights everywhere, and banners on every tower.",
      purpose:
        "The seat of the youngest and most warlike crown. King Brannoc holds court here with his barons and the Lamplighters on his council. The best warhorses in the world are bred in the valley, and anything that changes how a horse is ridden or how a knight fights will be wanted here at any price.",
      tags: ['carthen', 'capital', 'city', 'court', 'castle', 'horses', 'foreign'],
      map: { x: 4, y: -72 },
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
      shortDescription: 'Corsal League factor at Thornwick and Gull\'s Rest. Fifty, plump and perfumed, in a blue velvet coat with silver buttons, rings on every finger, and a sweet smile that never reaches his eyes.',
      faction: LEAGUE,
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
        "**Want:** to understand how the world works, which the See forbids outside the temple schools. **Secret:** he writes to a circle of quiet scholars in Lumen who would give anything for a new idea. **Duty:** he must report any new craft to the Lamplighters, who will judge it hallowed or unhallowed. **Toward the player:** fascinated and frightened. With his help an invention can be presented to the See as a holy gift (hallowed), which makes it safe wherever the faith holds; without it, the Lamplighters may brand the player a heretic. He can read, write, and teach.",
    },
    {
      name: 'High Lector Yvaine Solis',
      shortDescription: 'High Lector of the Hallowed See, at Lumen on Mount Ysmere. Seventy, tiny and white-haired, in robes of cloth-of-gold, with eyes like a hawk and a soft, terrible voice.',
      faction: YSMERE,
      location: 'Lumen',
      notes:
        "Head of the See, which serves no crown. She anointed King Brannoc of Carthen and counts him her son in the faith; she tolerates King Osric of Kestrany and he tolerates her; she has sent missions to Ulvhal for twenty years with little to show. **Want:** the See to remain the keeper of all knowledge. **Belief:** new knowledge unguided by faith brings ruin; knowledge guided by the See is holy. **Toward the player:** she can bless an invention (it spreads through Ysmere's schools and the See's goodwill grows) or condemn it (Lamplighters hunt it and its maker). She would very much like the player's inventions to belong to the See. Her anointing can make a new crown lawful in the eyes of the faithful.",
    },
    {
      name: 'King Brannoc',
      shortDescription: 'King of Carthen. Twenty-five, golden-haired and broad-shouldered, in burnished mail under a white surcoat with the Carthen sun-and-lance, a champion of tourneys who has never fought a real war.',
      faction: CARTHEN,
      location: 'Castel Varre',
      notes:
        "Crowned at twenty-two by High Lector Solis, and devout. **Want:** a war with Kestrany to prove himself to the barons who still think him a boy, and the border valleys his grandfather lost. **Problem:** his treasury is empty and his barons owe the League. **Toward the player:** generous to the bold, cold to the merely clever, and unable to refuse a challenge. Give Carthen's knights stirrups or a better lance and he will ride to war within the season, possibly as the player's ally, possibly not. He will not recognize any crown the See has condemned.",
    },
    {
      name: 'Ser Edric Montaine',
      shortDescription: "Carthen's envoy to Thornwick. Fifty-five, bow-legged and leathery, a scarred old knight with a grey moustache, a faded white surcoat, and a string of Carthen horses he sells on market days.",
      faction: CARTHEN,
      location: 'Thornwick',
      notes:
        "Honest by a knight's lights: he will drive a hard bargain on a horse but never break his word or lie to a guest. **Role:** the player's way to King Brannoc, and Carthen's eyes in the Reach. Anything that changes how a horse is ridden or a knight fights, he will notice at once and send word to Castel Varre. **Toward the player:** courteous, curious, and quietly afraid his young king will start a war he cannot finish.",
    },
    {
      name: 'Cassia Marovin',
      shortDescription: 'First Factor of the Corsal League. Fifty, silver-haired and sharp-boned, in plain black wool with a single gold chain of office; speaks quietly and never repeats herself.',
      faction: LEAGUE,
      location: 'Corsal',
      notes:
        "Head of the League, which serves no crown. **Holds:** King Osric's war debts, the Ulvhal amber trade, and the secret loans of half Carthen's barons. **Want:** every kingdom in the League's debt, and none strong enough to stop paying. A new crown in the Reach is a new borrower, or a new rival. **Toward the player:** distant until they are worth money, then very interested. League money can raise an army or end one; she will lend it for a share of whatever the player builds.",
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
      body: "ONLY THE PLAYER INVENTS. No NPC, kingdom, or ruin ever introduces new technology; others can only copy, buy, steal, or be given what the player creates. Anything absent from 'The World's Technology' baseline does not exist until the player invents it. KEEP INVENTING FAST AND FUN: it should feel like the character's gift, not homework. HOW: (1) Idea: the player names what they want and what it should do. That is enough. Never ask them to explain the science or the steps; the character's own know-how fills that in. Narrate the work at story level (the sketches, the first failed trial, the moment it works), never as real-world formulas, quantities, or build instructions; use the world's own names (cave-salt, black stone, brimstone). Prerequisites apply only where they are obvious in the story (a cannon needs powder and a forge hot enough to cast it); name the missing piece as the next project, never as a refusal. (2) Materials and hands: say roughly what it needs and where that comes from; if the character already has the materials or a workshop, skip straight to the prototype. (3) Prototype: one pass_time (simple: a day; moderate: a few days; deep: one to two weeks) and one skill_check (Engineering, Smithing, Philosophy, or whatever fits): easy for simple things, medium for moderate ones, hard for deep ones; never extreme. A failure costs time, materials, or a minor accident and teaches the fix: the next attempt succeeds. A partial works with a flaw that can be fixed later. Never chain failures or make the player re-explain an idea. (4) Production: workshop, workers, money, and time, settled in a line or two of narration. RECORD: when a prototype works, add_item the invention itself (graded from the fiction, with what it enhances) and add_item 'Plans: <name>' tagged ['invention','secret'] with a one-line story description of what it does and who knows the secret, then ASK: keep secret, share (with whom), or sell? On sharing or selling, update_item tags to ['invention','shared'] and name the recipients; adjust_reputation. SECRECY is a clock, tracked in story notes: SIMPLE things (stirrups, horse collar, wheelbarrow) are copied within days of being seen. MODERATE things (crossbow, stern rudder, water mill, trebuchet) are copied in weeks from a captured example, a bribed worker, or close study. DEEP things (gunpowder, blast-furnace steel, paper, printing, compass) need the secret or a defector, and take months. Shared inventions spread through the recipient's lands over a season and change how they act. Use them against the player if that is what the recipient would do.",
    },
    {
      title: "The World's Technology",
      keywords: ['technology', 'baseline', 'iron', 'steel', 'bow', 'crossbow', 'stirrup', 'plow', 'mill', 'ship', 'sail', 'rudder', 'compass', 'paper', 'glass', 'gunpowder', 'medicine', 'numbers'],
      alwaysInclude: true,
      body: "EXISTS: bloomery iron (soft, worked by forge-welding; good steel is luck), bronze from imported tin and copper, swords, spears, axes, round and kite shields, mail (expensive), padded and scale armor, self bows of yew or ash, slings, javelins, rams, ladders, palisades, stone walls and lime mortar; riding without stirrups, ox-drawn scratch plows, sickles and scythes, two-field farming, hand querns, wheeled carts, simple pulleys and levers; oared galleys and longships with a single square sail, a steering oar on the side, coast-hugging navigation by landmark and sun; wool, linen, leather, natural dyes; parchment, wax tablets, ink, Ysmeran script and numerals with no zero (sums are slow, done on fingers and counting-boards); temple medicine of herbs, setting bones, cautery, and bloodletting; the See's temple glass (beads and lamp glass, no clear lenses). DOES NOT EXIST (until the player invents it): steel on purpose, blast furnaces, using coal, crossbows, composite or recurved bows, longbow drill, stirrups, horseshoes, the horse collar, heavy wheeled plows, crop rotation with clover or beans, water mills, windmills, the spinning wheel, the wheelbarrow, cranes and treadwheels, torsion and counterweight siege engines, gunpowder, stern rudders, lateen sails, the compass, charts and lighthouses, paper, printing, place-value numbers and zero, double-entry bookkeeping, eyeglasses and lenses, clocks, distillation, soap that cleans well, the idea that boiling water and clean hands prevent disease, and anything more advanced. Coal, sulfur, and cave-salt exist but no one knows their uses.",
    },
    {
      title: 'Founding a Kingdom',
      keywords: ['kingdom', 'realm', 'crown', 'king', 'queen', 'found', 'founding', 'recognition', 'claim', 'land', 'holding', 'people', 'subjects', 'banner', 'legitimacy'],
      alwaysInclude: true,
      body: "The main story. The stage is the Dominion rank (set_rank), shown to the player; the details go in the 'Your Realm' condition (update_status_effect): seat, lands, people, fighters, stores, laws, claim, and who recognizes it. Any means are valid: conquest, purchase, marriage, a moot's election, a holy blessing, a league of villages, settling empty land, or invention-driven wealth. STAGES: (1) Holding: one place that is yours (a hall, a village, a keep, a harbor) and people who follow you. (2) Lordship: several settlements, a steady food supply, armed defenders, and laws you enforce. It must survive a winter. (3) Domain: a real territory (a large part of the Reach), a seat, a banner, and a claim (Calder blood, a moot's election, the See's blessing, a treaty, or conquest held for a year). (4) Kingdom: recognized as a crown by two of the three crowns, or by one crown and anointed by the See, sworn at the Treaty Stone in Thornwick; or held so firmly no one can deny it. (5) High Kingdom: the Reach and all three crowns (Kestrany, Ulvhal, Carthen) united under the player, each crown conquered, married into, inherited, or sworn to them as High King, and the whole held together for a year. This is a long road; each crown falls or bends in its own way, and the others will league against whoever is winning. When the player reaches Kingdom, create_mission 'One Crown Over All' (objectives: bring each of the three crowns under your rule or oath; hold the union for a year). League money can make any of these easier but cannot replace them. Each stage brings stronger enemies: the crowns grow alarmed as the player rises, and the Treaty means any crown that moves openly against a new realm must answer to the other two. Keep counts honest: people eat, soldiers want pay, and winter comes on day 60 (snow closes the passes, and the fishing stops).",
    },
    {
      title: 'The Treaty of the Empty Crown',
      keywords: ['treaty', 'empty crown', 'annex', 'sundering war', 'treaty stone', 'thornwick', 'recognition'],
      body: "Signed at Thornwick twenty-three years ago after the eight-year Sundering War by Kestrany, Ulvhal, and Carthen, blessed by the See and underwritten by the League. Terms: no existing crown may annex, garrison, or tax the Reach; any that does faces the other two, the See's preaching, and the League's closed purse; envoys may reside in Thornwick; trade is free. It says nothing about a new crown arising in the Reach. Lawyers in every court have noticed this, and each crown means to make sure the new crown, when it comes, is its own. A new kingdom recognized at the Treaty Stone by two of the three crowns, or by one crown with the See's anointing, would be lawful under the Treaty.",
    },
    {
      title: 'The Fall of Calder',
      keywords: ['calder', 'aldred', 'plague', 'royal line', 'stag', 'ashen keep', 'heir'],
      body: "Calder ruled the Reach for three hundred years from Ashen Keep. Its banner was a white stag beneath a tower. King Aldred the Unready died childless in the plague year thirty-one years ago; his cousins died in the war that followed, and the keep burned. Calder blood survives thinly through daughters and younger sons, and any claimant must prove descent with records (the See's temple registers or Calder heraldry). Many Reach folk remember Calder fondly, as people remember better days. A Calder claim makes a new crown more acceptable to them.",
    },
    {
      title: 'The See and Unhallowed Craft',
      keywords: ['ysmere', 'see', 'sun lamp', 'lamplighters', 'hallowed', 'unhallowed', 'heresy', 'faith', 'temple', 'lumen', 'scholars', 'anoint', 'anointing'],
      body: "The Hallowed See serves no crown; it rules only Lumen on Mount Ysmere, and preaches in all three kingdoms with very different weight: near-law in Carthen, rich and resented in Kestrany, a small mission in Ulvhal. The Sun Lamp faith holds that knowledge is light and must be kept by those who tend the Lamp. The Lamplighters judge any new craft: presented through the See (by a lector, with humility and a gift), it is usually judged hallowed, credited to the Light, and spread through the temple schools; the See's goodwill rises. Discovered on its own, especially if it is a weapon or challenges a temple monopoly (writing, medicine, glass), it may be judged unhallowed: its makers are hunted, its works burned, and the faithful told to shun them. A condemned invention is hunted by the king's own knights in Carthen, by abbey lords in Kestrany, and barely at all in Ulvhal. Most Reach folk keep the faith. The See's scholars secretly crave new knowledge, and some can be won as allies. The High Lector's anointing can make a new crown lawful.",
    },
    {
      title: 'Ships and the Sea',
      keywords: ['ship', 'ships', 'sea', 'longship', 'galley', 'cog', 'sail', 'navy', 'harbor', 'voyage', 'navigation', 'boat'],
      body: "Ships are oared galleys and longships with one square sail, steered with a side oar. They hug the coast, sail by day, beach at night, and cannot sail well against the wind. No charts, no compass; sailors navigate by landmarks, sun, and stars. Winter storms close the sea from about day 60 until spring. Ulvhal builds the best longships; the Corsal League has the most ships, broad merchant galleys. Gull's Rest has fishing boats and a beach for building. Naval inventions (stern rudder, better sails, keels, compass, charts) change who rules the sea. GM-only: what lies out in the Western Sea is a secret; see 'Beyond the Western Sea'. Sailors' lore says the sea west of the last skerries goes flat and windless and then ends; no one who has sailed far enough to check has come back to say otherwise.",
    },
    {
      title: 'Beyond the Western Sea',
      keywords: ['beyond the sea', 'overseas', 'westward', 'far shore', 'hearthstone', 'hearthstone isles', 'stillwater', 'the thread', 'avandre', 'engine', 'steam', 'steamship', 'crossing', 'tin trade', 'silk'],
      body: "GM-ONLY. THE GATE: Avandre, the continent across the Western Sea, stays secret, unnamed, and off the map until BOTH: (1) the Dominion rank is High Kingdom, and (2) the player owns a working ship driven by an engine they invented (an invention item recorded with add_item; a steam engine in a hull, or whatever engine they built). Check both before revealing anything. BEFORE THE GATE, foreshadow only, at most once every few sessions: silk and tin no one can trace past Corsal; League factors who change the subject; a League pilot with a tattoo of an island no chart shows; an Ulvhal saga of a longship blown west for a month that came back with three dying men and a bronze knife of strange make; a drift-log of a wood that grows nowhere in the known world. The League's story is that tin and silk come 'from the far south'. Never confirm a western land. THE HEARTHSTONE ISLES can be learned of and even reached before the gate (spying on the League, bribing a pilot, following the midsummer galleys): a few bare volcanic islands far out in the Western Sea, where each midsummer the League's galleys meet foreign traders, the Sallow men, who sail in from the west on a narrow seasonal wind lane called the Thread, which only their pilots know, losing one ship in four. The League thinks the Sallow men come from some islands; the Sallow pilots will die before giving away the Thread. Place it with create_location 'The Hearthstone Isles', position from Corsal, direction W, 170 hours. West of the isles lies the STILLWATER: weeks of dead calm. Oared ships run out of water; sails hang dead. Before the gate, any attempt to cross turns back (coal or water runs short, the crew mutinies, a storm on the edge of the calm) and never glimpses the far shore; say in story terms what is missing: a ship that can drive itself for weeks, and the coal, colliers, crews, and harbors of a whole united realm to keep it fed. THE CROSSING (after the gate): an engine ship ignores the calm. Gull's Rest to the far shore is about 420 hours on foot as the map measures it: roughly eight to ten days under steam, with a stop at the Hearthstone Isles to take on coal (which someone must first ship there and stockpile). Fuel is the real problem: the return voyage needs coal bought, mined, or carried on the far side. STARTING THE PHASE: when both conditions are met, begin within a few game days, at a natural moment, with one of these (whichever fits the story): (a) First Factor Cassia Marovin (or whoever now leads the League) comes in person: the engine ship has made the League's oldest monopoly worthless, so she reveals Hearthstone and the Sallow trade and offers a League pilot and the Hearthstone anchorage for a share of whatever lies beyond; or (b) if the League is broken or hostile, a storm-wrecked Sallow trading ship drifts into Saltmere Bay with one survivor, the pilot Sefa Renn, and a chart of the Thread scratched on a whale-ivory board. Then create_mission 'Beyond the Stillwater' (objectives: reach the Hearthstone Isles and stockpile coal; cross the Stillwater under engine power; make landfall on the far shore and learn who rules it; decide what your crown will be to the new world: trader, ally, teacher, or conqueror) with rewards { xp: 1500 }. Read 'Avandre: Its Powers' and 'Avandre: Places and the Map' before landfall. AFTER THE REVEAL: the old world reacts. The See wants missions to a continent of unlit souls and fears a rival faith; Ulvhal's jarls want a new coast to raid; Carthen's knights talk of a holy war; Kestrany's grain lords want markets; the League wants the trade it has lost. And Avandre is the largest market and the largest nest of copiers the player's inventions have ever faced.",
    },
    {
      title: 'Avandre: Its Powers',
      keywords: ['avandre', 'sallow', 'sallow coast', 'ammerine', 'tide council', 'amaranth', 'amaranth empire', 'ilun teshar', 'empress', 'vermilion hall', 'tarsh', 'ochre steppe', 'khagan', 'nhal', 'veiled moon', 'hierophant'],
      body: "GM-ONLY, secret until the gate in 'Beyond the Western Sea'. Avandre is a continent several times the size of the known world, with more people in its empire alone than in all three crowns together. It shares the known world's technology baseline exactly ('The World's Technology'): bloomery iron, self bows, no stirrups, oars and square sails, parchment, no gunpowder, nothing the player has invented. ONLY THE PLAYER INVENTS still holds on both shores: Avandre has bigger armies, older cities, and different crafts and customs, never better technology. What it has is scale and resources: silk, tin, copper, vast forests, coal in the Sootfells that no one uses, and rock-oil seeping from the ground at the Black Seeps that no one understands. No one in Avandre knows the known world exists, except the Sallow pilots, who know only of Hearthstone and 'the Corsal men'. THE POWERS: (1) THE SALLOW COAST: a dozen free harbor cities on the east coast, facing the Stillwater, ruled from Ammerine by the Tide Council of shipowners. Middlemen of a double secret: they sell the empire's tin and silk to the Corsal men at Hearthstone, and tell the empire the foreign goods come from 'islands at the end of the world'. Head: Syndic Maelis Corve (fifty-five, iron-grey, soft-spoken, ruthless about the Thread; sees an engine ship as the end of her city's fortune or the start of a far larger one). The Sallow cities are the player's natural first contact and door to Avandre. (2) THE AMARANTH EMPIRE: an ancient river empire across the whole south, ruled from Ilun Teshar on the great river Ilu by the aged Empress Tiramet IV, through the Vermilion Hall, a bureaucracy of examined scribes. Millions of farmers, canals, granaries, and conscript armies of tens of thousands. It believes itself the center of the world and all others barbarians owing tribute. The empress is dying; her heir is a twelve-year-old grandson, Prince Kesh, and Chancellor Ishe Amaru (scholar, patient, schemer) and Marshal Daro Vant (commander of the river armies, popular, impatient) are each preparing to rule through him. Whoever the player backs may decide the succession. (3) NHAL: a mountain realm in the Pale Spine, between the coast and the steppe, ruled from the holy city of Nhal Amar by the Veiled Hierophant, whose face no one sees. The Veiled Moon faith teaches that truth is hidden and must be earned, and that the sun shows only surfaces: a natural rival to Ysmere's Sun Lamp. Its moonwardens judge new things much as the Lamplighters do. The See will want missions here; Nhal will call them heretics. (4) THE TARSH: twelve horse clans of the Ochre Steppe in the north, united in five years under Khagan Irsa (thirty-four, scarred, clever, ambitious), who means to take the empire's northern granaries. Her riders have no stirrups. Anything that changes how a horse is ridden turns her into a conqueror of the whole continent; she will pay any price for it and will turn it on whoever gave it to her if that suits her. HOW AVANDRE MEETS THE PLAYER: an engine ship is a wonder no one there can explain; the Sallow cities see profit and ruin, the empire sees a tribute-bearer or a threat, Nhal sees a sign to be read, the Tarsh see weapons. Create these NPCs with create_npc as they are met (faction may be left as the empire's or city's name; they are not tracked factions).",
    },
    {
      title: 'Avandre: Places and the Map',
      keywords: ['avandre', 'ammerine', 'tinward downs', 'sootfells', 'nhal amar', 'pale spine', 'hundred fires', 'ilun teshar', 'sethra', 'black seeps', 'greenmaw', 'ilu'],
      body: "GM-ONLY, secret until the gate in 'Beyond the Western Sea'. The world map already shows Avandre's land, unseen until a place there is created. Create each place with create_location when the story first reaches or names it, using exactly these positions so it lands on the drawn coast (measure in this order; each needs the place it is measured from to exist first). The Hearthstone Isles: from Corsal, W, 170 (bare volcanic islands, the League's midsummer anchorage). Ammerine: from Gull's Rest, W, 420 (chief of the Sallow cities, on a deep bay of the east coast: white towers, ropewalks, the Tide Council's hall, harbor chains; landfall). The Tinward Downs: from Ammerine, SW, 40 (rolling hills of tin and copper mines worked for the Sallow cities). The Sootfells: from Ammerine, NW, 70 (dark hills where black burning stone crops out of every stream bank, unused; coal for the return voyage; disputed between Sallow and Nhal). Nhal Amar: from Ammerine, NW, 130 (the Veiled Hierophant's holy city of grey stone in the Pale Spine mountains, under the peak the faithful call the Veil). The Hundred Fires: from Nhal Amar, NW, 120 (Khagan Irsa's great moving camp of felt tents and horse herds on the Ochre river). Ilun Teshar: from Ammerine, SW, 220 (the Amaranth capital on the river Ilu: vermilion walls, a palace city within the city, granaries like hills, a million people). Sethra: from Ammerine, S, 160 (the empire's great port among the canals and reed islands of the Ilu delta, where imperial tribute fleets gather). The Black Seeps: from Ilun Teshar, SW, 80 (a poisoned valley at the empire's southwestern edge where black rock-oil oozes from the ground and burns; no one knows a use for it). The Greenmaw, a great southern forest, lies along the south coast between Sethra and the Black Seeps. The Stillwater is the sea between Hearthstone and Ammerine. Avandre goes on far to the west beyond the mapped land: more peoples, deserts, and seas that no one in this story has seen.",
    },
    {
      title: 'Resources of the Reach',
      keywords: ['resources', 'ore', 'iron', 'coal', 'sulfur', 'brimstone', 'saltpeter', 'cave-salt', 'timber', 'yew', 'pitch', 'sand', 'salt', 'peat', 'bog iron', 'copper', 'tin', 'horn', 'sinew'],
      body: "Iron Hills: iron ore, charcoal, coal (black burning stone), sulfur at the Stinking Springs. Greywater Fens: bog iron, peat, reeds, eels. Owlcrag Caves: saltpeter (cave-salt). Gull's Rest: salt, fish, white sand (glass), harbor. Wending Wood: oak, ash, pine pitch and tar, yew for bows, charcoal. Hob's Ford and the river valleys: grain, oxen, wool, flax, fast streams. Imported: copper and tin (the League, from overseas through Corsal), horses, horn, sinew, and wine (Carthen), timber and tar and amber (Ulvhal), glass and parchment (the See), grain and cloth (Kestrany).",
    },
  ],

  missions: [
    {
      title: 'A Banner of Your Own',
      description:
        'The Reach belongs to no one. The Treaty forbids the three crowns from taking it, but not a new crown from rising. Make it yours, by sword, coin, faith, cunning, or invention.',
      objectives: [
        'Win a holding in the Reach: a place that is yours, and people who follow you',
        'Grow it into a lordship that can feed and defend itself through a winter',
        'Raise a banner and a claim over a real domain',
        'Be recognized as a crown by two of the three crowns (or one crown and the See), or hold your kingdom so firmly no one can deny it',
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
