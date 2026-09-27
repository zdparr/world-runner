import type { WorldTemplate } from '../world';

export const brinecross: WorldTemplate = {
  id: 'brinecross',
  name: 'Brinecross',
  description:
    'A smuggler-ridden free port in a low-magic, age-of-sail world. Six locations, four NPCs, five lore entries, and a job: find a stolen crate of contraband lamp oil.',
  demoCampaignName: 'Brinecross: The Lantern and the Tide',
  currencyName: 'crowns',

  worldBible: `# Brinecross

A free port city built on the bones of an older one. Brinecross sits where the Saltmere river meets the Grey Sound, and every ship heading north stops here to pay the Tithe, take on water, and lose a little of its cargo to someone clever.

## The shape of the city
- **Upper Brinecross**: stone terraces on the cliffs. Merchant houses, the Harbor Authority, the Chapel of the Tide Mother.
- **Dockside**: the working heart. Piers, warehouses, markets, taverns, and too many people.
- **The Saltworks**: a flooded district of abandoned evaporation pans and warehouses on the eastern shore. Officially condemned. Unofficially, the Gutter Gulls' territory.
- **Old Brinecross**: the original city, drowned eighty years ago when the sea wall failed. Its streets survive as tunnels under Dockside and the Saltworks. Few who go down know all the ways back up.

## Tone and technology
Low magic, age of sail. Pistols exist but are rare, expensive, and unreliable in the damp; knives and cudgels are common. Magic is quiet: tide-blessings, lucky charms, the occasional hedge-witch. Anything bigger is a rumor or a lie.

## Money
The coin of the city is the **gold crown**. A hot meal costs 1 crown, a night in a decent room 3, a good knife 15, a month's dock wages about 40.

## Powers
- **The Harbor Authority** collects the Tithe (a tenth of every cargo's value) and keeps the peace, for a given value of peace. Its officers are underpaid and bribable.
- **The Chapel of the Tide Mother** tends the sick and blesses ships. It is respected by sailors and quietly at odds with the Authority over the Tithe.
- **The Gutter Gulls** are a gang of orphans and runaways who fence stolen goods out of the Saltworks. They are dangerous in numbers but have a code: no killing, no stealing from the Chapel.

## Current tensions
Sunstone oil, a glowing lamp fuel from the south, has been declared contraband by the Authority "for fire safety". Prices have tripled, and every smuggler in the city wants a piece.
`,

  narratorStyle: `- Second person, present tense ("You step onto the pier...").
- Grounded, sensory, a little wry. Salt, tar, gulls, wet stone. Let the city feel lived-in.
- 120 to 300 words per turn. Shorter for quick exchanges, longer for new scenes.
- NPCs speak in distinct voices. Mara is dry and clipped. Oskar is pompous and oily. Sister Ilse is warm but blunt. Rook talks fast and never finishes a threat.
- Danger is real but fair. Telegraph threats before they land.
- End on something the player can act on: a question, a choice, a sound behind a door.
`,

  locations: [
    {
      name: 'Dockside Market',
      description:
        'A roaring square of stalls between the fish piers and the customs house. Canvas awnings snap in the wind, hawkers shout prices in five languages, and Harbor Authority officers in faded blue coats drift through looking for bribes. Alleys lead east toward the Saltworks.',
      purpose:
        "The opening crossroads and rumor mill (objective 1: ask around about the crate). Harbormaster Thane and Sister Ilse both work this square, so the player meets the corrupt official and the honest priestess in the same scene. The dockhands were paid to see nothing; one of them, pressed or bribed, remembers men in Authority blue wheeling a crate east toward the Saltworks at night. The customs house here is the Authority's public face, and Thane's weak point is his vanity in front of a crowd.",
      tags: ['dockside', 'market', 'public', 'crowded'],
    },
    {
      name: 'The Drowned Lantern',
      description:
        'A low-beamed tavern built into the hull of a beached carrack, just off the market. Green glass floats hang from the ceiling and catch the lamplight. It smells of ale, pipe smoke, and the sea. The back room is for people Mara trusts.',
      purpose:
        "Home base and mission hub: Mara gives the job and takes the report here (objectives 1 and 4). The back room is the safest place in the city to plan, heal, or lie low. It also holds Mara's own secret: she has quietly restarted the sunstone trade, and a sharp-eyed player can spot empty straw nests waiting for the stolen flasks. The cellar has a bricked-up door to the Drowned Streets that Mara swears she never uses; it is a back way into the tunnels if the player earns her trust.",
      tags: ['dockside', 'tavern', 'safe', 'information'],
    },
    {
      name: 'The Saltworks',
      description:
        'Collapsed warehouses and flooded evaporation pans crusted white with salt. Planks laid across the water make paths only the Gutter Gulls know well. Somewhere below, stairwells descend into the tunnels of Old Brinecross.',
      purpose:
        "Gutter Gull territory and the way down (objective 2: find where the crate went). Rook is here and knows exactly where it is stored, because the Gulls moved it for Thane's men without knowing whose it was. Getting her help means dealing with the Gulls' code (no killing, no stealing from the Chapel, every debt collected) and possibly with the favor Mara owes them, which they may call in through the player. The stairwells here are the main entrance to the Drowned Streets.",
      tags: ['saltworks', 'dangerous', 'gang-territory', 'ruins'],
    },
    {
      name: 'The Drowned Streets',
      description:
        'The streets of Old Brinecross, drowned eighty years ago and roofed over by the new city. Barnacled shopfronts line half-flooded lanes, and street signs point to squares that no longer exist. Water slaps against the vaults overhead. Twice a day the tide comes in fast. Gull chalk marks on the walls show the safe ways; everything else is a guess.',
      purpose:
        "Where the stolen crate is hidden (objective 3): in a dry chapel crypt the Gulls use as a warehouse, watched by two of Thane's hired dockhands waiting to move it to the North Pier. The tide is the ticking clock: passages flood twice a day, and without Sister Ilse's tide tables or a Gull guide the player risks being trapped. The tunnels connect to Mara's bricked-up cellar and to a grate beneath the North Pier Warehouses, so exploring them opens back ways into both.",
      tags: ['old-brinecross', 'tunnels', 'dangerous', 'flooding'],
    },
    {
      name: 'The North Pier Warehouses',
      description:
        'A row of Harbor Authority bonded warehouses on the north pier, where seized cargo is supposed to be burned. The chimneys rarely smoke. Blue-coated guards play dice by the gate, wagons come and go after dark, and the merchant house of Castellan & Sons keeps an office suspiciously close by.',
      purpose:
        "Proof of who ordered the theft (the other half of objective 3). Seized contraband is not burned here; it is resold through Castellan & Sons, who pay Thane to seize their rivals' sunstone. The seizure ledger in the pier office lists Mara's crate by its markings, dated the day before it was stolen. This is where the crate ends up if the player is slow. Exposing the ledger makes Thane a dangerous enemy, Castellan & Sons a new one, and the Chapel a willing ally.",
      tags: ['north-pier', 'harbor-authority', 'guarded', 'evidence'],
    },
    {
      name: 'The Chapel of the Tide Mother',
      description:
        'A white stone chapel on the cliffs of Upper Brinecross, its doors carved with spiral shells. Tide tables are chalked on slate boards beside the altar, votive boats hang from the rafters, and the sick lie on cots in the side aisles. The bells ring every turning of the tide.',
      purpose:
        "Refuge and neutral ground. Even the Gulls will not steal here, so it is a place to hide, heal, or meet a Gull safely. Sister Ilse's tide tables are what make the Drowned Streets survivable; she will share them, but she will ask what the player wants down there, and she will not help anyone hurt the Gulls' children. The Chapel is quietly at odds with the Authority over the Tithe: evidence against Thane has a powerful ally here, and a sermon from its steps could turn the docks against him.",
      tags: ['upper-brinecross', 'chapel', 'safe', 'healing'],
    },
  ],

  npcs: [
    {
      name: 'Mara Vell',
      shortDescription:
        "Owner of the Drowned Lantern. Fifties, iron-grey braid, a smuggler's scar across one palm. Buys and sells information; never gives it away.",
      faction: 'Independent',
      location: 'The Drowned Lantern',
      notes: 'Former sunstone runner. Has quietly restarted the trade since the ban. Owes the Gutter Gulls a favor she resents.',
    },
    {
      name: 'Harbormaster Oskar Thane',
      shortDescription:
        'Senior Harbor Authority officer. Portly, perfumed, fond of the sound of his own voice. Enforces the sunstone ban with suspicious selectivity.',
      faction: 'Harbor Authority',
      location: 'Dockside Market',
      notes: "Takes bribes from a rival importer, Castellan & Sons, to seize their competitors' sunstone. Secretly behind the theft of Mara's crate.",
    },
    {
      name: 'Sister Ilse',
      shortDescription:
        'Priestess of the Tide Mother who runs a mercy stall in the market. Broad-shouldered, salt-bleached robes, a laugh that carries.',
      faction: 'Chapel of the Tide Mother',
      location: 'Dockside Market',
      notes: "Heals for free and asks questions after. Knows the Gulls' children by name. Despises the Tithe.",
    },
    {
      name: 'Rook',
      shortDescription: 'A wiry teenage lieutenant of the Gutter Gulls with a crow feather in her cap. Quick hands, quicker mouth.',
      faction: 'Gutter Gulls',
      location: 'The Saltworks',
      notes: "The Gulls moved Mara's crate for Thane's men without knowing whose it was. Rook knows where it is stored in the tunnels.",
    },
  ],

  lore: [
    {
      title: 'The Tide Mother',
      keywords: ['tide mother', 'chapel', 'priest', 'priestess', 'blessing', 'faith'],
      body: 'The patron goddess of Brinecross sailors. She gives and takes by the tides; her priests keep tide tables, heal the sick, and bless hulls before a voyage. Stealing from her Chapel is the one crime every thief in the city agrees is unlucky. Her sign is a spiral shell.',
    },
    {
      title: 'The Harbor Authority and the Tithe',
      keywords: ['harbor authority', 'tithe', 'customs', 'officer', 'blue coat', 'thane'],
      body: "The Authority levies a tenth of every cargo's declared value. Its officers wear faded blue coats and carry brass tallies as badges. Undeclared cargo is seized and, officially, burned. In practice most of it is resold through Authority warehouses on the north pier.",
    },
    {
      title: 'The Gutter Gulls',
      keywords: ['gutter gulls', 'gulls', 'gang', 'fence', 'saltworks', 'rook'],
      body: 'A gang of orphans, runaways, and ex-deckhands who rule the Saltworks. They fence stolen goods, run messages, and guard tunnel routes for a fee. Their code: no killing, no stealing from the Chapel, and a debt to the Gulls is always collected. Members mark themselves with a feather.',
    },
    {
      title: 'Sunstone Oil',
      keywords: ['sunstone', 'oil', 'lamp', 'contraband', 'smuggling', 'crate'],
      body: 'A lamp fuel pressed from a southern mineral. It burns with a steady gold light and no smoke. The Authority banned it two months ago, citing warehouse fires; the price has tripled since. A single crate of twelve flasks now sells for around 300 crowns on the black market.',
    },
    {
      title: 'The Drowning of Old Brinecross',
      keywords: ['old brinecross', 'tunnels', 'drowned', 'sea wall', 'flood', 'undercity'],
      body: 'Eighty years ago the sea wall failed in a winter storm and the old lower city was lost overnight. The new city was built on top. The drowned streets survive as a maze of half-flooded tunnels reached through cellars in Dockside and stairwells in the Saltworks. The tides flood some passages twice a day.',
    },
  ],

  missions: [
    {
      title: "The Lantern's Missing Cargo",
      giver: 'Mara Vell',
      description:
        "A crate of contraband sunstone oil, bound for Mara's back room, vanished from the fish piers two nights ago. The dockhands saw nothing, which means someone paid them to see nothing. Mara wants it back, quietly, and wants to know who took it.",
      objectives: [
        'Ask around Dockside Market about the missing crate',
        'Find out where the crate was taken',
        'Recover the crate or learn who ordered the theft',
        'Report back to Mara at the Drowned Lantern',
      ],
      rewards: {
        money: 250,
        xp: 150,
        skillXp: [{ skill: 'Streetwise', amount: 40 }],
        relationships: [{ npc: 'Mara Vell', affinity: 10, trust: 20 }],
      },
    },
  ],

  character: {
    name: 'Kael',
    archetype: 'rogue',
    bio: "Twenty-four, born on a Grey Sound fishing boat, washed up in Brinecross at fourteen. Has picked locks, pockets, and fights, mostly successfully. Lives in a rented loft above a net-mender's shop and is behind on rent.",
    location: 'Dockside Market',
    money: 40,
    level: 2,
    xp: 120,
    hp: 16,
    maxHp: 18,
    skills: [
      { name: 'Lockpicking', level: 3, xp: 40, description: 'Opening locks without the key.' },
      { name: 'Stealth', level: 2, xp: 15, description: 'Moving unseen and unheard.' },
      { name: 'Streetwise', level: 2, xp: 60, description: 'Knowing who to ask, what it costs, and when to leave.' },
      { name: 'Knife Fighting', level: 1, xp: 20, description: 'Close, ugly, fast.' },
      { name: 'Persuasion', level: 1, xp: 5, description: 'Talking people into things.' },
    ],
    items: [
      { name: 'Balanced knife', description: 'A plain, well-kept blade with a cord-wrapped grip.', tags: ['weapon', 'blade'], equipped: true, properties: { damage: 'd4' } },
      { name: 'Oilcloth coat', description: 'Long, patched, and waterproof. Has an inside pocket the Authority never checks.', tags: ['armor', 'clothing'], equipped: true },
      { name: 'Lockpick roll', description: 'Six picks and a tension wrench in a leather roll.', tags: ['tool', 'thieves-tools'] },
      { name: 'Hard bread', description: "Ship's biscuit. Keeps forever, tastes like it.", quantity: 3, tags: ['food'] },
      { name: 'Waterskin', description: 'Half full.', tags: ['container', 'drink'] },
      { name: 'Brass compass', description: "Your father's. The needle sticks when it's wet. You have never sold it, however broke you've been.", tags: ['keepsake', 'navigation'] },
    ],
    relationships: [
      {
        npc: 'Mara Vell',
        affinity: 20,
        trust: 10,
        status: 'acquaintance',
        historyNotes: '- A regular at the Lantern for the past month.\n- Mara has seen you pay your tab on time. That counts for something.',
      },
      { npc: 'Rook', affinity: -10, trust: -15, status: 'rival', historyNotes: '- You once lifted a purse Rook had marked first. She has not forgotten.' },
    ],
  },
};
