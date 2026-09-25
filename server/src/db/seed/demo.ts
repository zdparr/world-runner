import { eq, sql } from 'drizzle-orm';
import type { Db } from '../client';
import {
  campaigns,
  inventoryItems,
  locations,
  loreEntries,
  missions,
  npcs,
  playerCharacter,
  relationships,
  skills,
} from '../schema';
import { normalizeObjectives } from '../../game/missions';

export const DEMO_CAMPAIGN_NAME = 'Brinecross: The Lantern and the Tide';

const WORLD_BIBLE = `# Brinecross

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
`;

const NARRATOR_STYLE = `- Second person, present tense ("You step onto the pier...").
- Grounded, sensory, a little wry. Salt, tar, gulls, wet stone. Let the city feel lived-in.
- 120 to 300 words per turn. Shorter for quick exchanges, longer for new scenes.
- NPCs speak in distinct voices. Mara is dry and clipped. Oskar is pompous and oily. Sister Ilse is warm but blunt. Rook talks fast and never finishes a threat.
- Danger is real but fair. Telegraph threats before they land.
- End on something the player can act on: a question, a choice, a sound behind a door.
`;

/** Creates the demo campaign. Returns its id, or null if it exists and `reset` is false. */
export async function seedDemoCampaign(db: Db, { reset = false } = {}): Promise<string | null> {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(eq(campaigns.name, DEMO_CAMPAIGN_NAME));
    if (existing.length > 0) {
      if (!reset) return null;
      // Every campaign-scoped table cascades from campaigns.
      await tx.delete(campaigns).where(eq(campaigns.name, DEMO_CAMPAIGN_NAME));
    }

    const [campaign] = await tx
      .insert(campaigns)
      .values({ name: DEMO_CAMPAIGN_NAME, worldBible: WORLD_BIBLE, narratorStyle: NARRATOR_STYLE, currencyName: 'crowns' })
      .returning({ id: campaigns.id });
    const campaignId = campaign!.id;

    // -------------------------------------------------------- locations (3)
    const locs = await tx
      .insert(locations)
      .values([
        {
          campaignId,
          name: 'Dockside Market',
          description:
            'A roaring square of stalls between the fish piers and the customs house. Canvas awnings snap in the wind, hawkers shout prices in five languages, and Harbor Authority officers in faded blue coats drift through looking for bribes. Alleys lead east toward the Saltworks.',
          tags: ['dockside', 'market', 'public', 'crowded'],
        },
        {
          campaignId,
          name: 'The Drowned Lantern',
          description:
            'A low-beamed tavern built into the hull of a beached carrack, just off the market. Green glass floats hang from the ceiling and catch the lamplight. It smells of ale, pipe smoke, and the sea. The back room is for people Mara trusts.',
          tags: ['dockside', 'tavern', 'safe', 'information'],
        },
        {
          campaignId,
          name: 'The Saltworks',
          description:
            'Collapsed warehouses and flooded evaporation pans crusted white with salt. Planks laid across the water make paths only the Gutter Gulls know well. Somewhere below, stairwells descend into the tunnels of Old Brinecross.',
          tags: ['saltworks', 'dangerous', 'gang-territory', 'ruins'],
        },
      ])
      .returning({ id: locations.id, name: locations.name });
    const locId = (name: string) => locs.find((l) => l.name === name)!.id;

    // -------------------------------------------------------- NPCs (4)
    const people = await tx
      .insert(npcs)
      .values([
        {
          campaignId,
          name: 'Mara Vell',
          shortDescription:
            'Owner of the Drowned Lantern. Fifties, iron-grey braid, a smuggler\'s scar across one palm. Buys and sells information; never gives it away.',
          faction: 'Independent',
          locationId: locId('The Drowned Lantern'),
          notes: 'Former sunstone runner. Has quietly restarted the trade since the ban. Owes the Gutter Gulls a favor she resents.',
        },
        {
          campaignId,
          name: 'Harbormaster Oskar Thane',
          shortDescription:
            'Senior Harbor Authority officer. Portly, perfumed, fond of the sound of his own voice. Enforces the sunstone ban with suspicious selectivity.',
          faction: 'Harbor Authority',
          locationId: locId('Dockside Market'),
          notes: 'Takes bribes from a rival importer, Castellan & Sons, to seize their competitors\' sunstone. Secretly behind the theft of Mara\'s crate.',
        },
        {
          campaignId,
          name: 'Sister Ilse',
          shortDescription:
            'Priestess of the Tide Mother who runs a mercy stall in the market. Broad-shouldered, salt-bleached robes, a laugh that carries.',
          faction: 'Chapel of the Tide Mother',
          locationId: locId('Dockside Market'),
          notes: 'Heals for free and asks questions after. Knows the Gulls\' children by name. Despises the Tithe.',
        },
        {
          campaignId,
          name: 'Rook',
          shortDescription:
            'A wiry teenage lieutenant of the Gutter Gulls with a crow feather in her cap. Quick hands, quicker mouth.',
          faction: 'Gutter Gulls',
          locationId: locId('The Saltworks'),
          notes: 'The Gulls moved Mara\'s crate for Thane\'s men without knowing whose it was. Rook knows where it is stored in the tunnels.',
        },
      ])
      .returning({ id: npcs.id, name: npcs.name });
    const npcId = (name: string) => people.find((p) => p.name === name)!.id;

    await tx.insert(relationships).values([
      {
        campaignId,
        npcId: npcId('Mara Vell'),
        affinity: 20,
        trust: 10,
        status: 'acquaintance',
        historyNotes: '- A regular at the Lantern for the past month.\n- Mara has seen you pay your tab on time. That counts for something.',
      },
      {
        campaignId,
        npcId: npcId('Rook'),
        affinity: -10,
        trust: -15,
        status: 'rival',
        historyNotes: '- You once lifted a purse Rook had marked first. She has not forgotten.',
      },
    ]);

    // -------------------------------------------------------- lore (5)
    await tx.insert(loreEntries).values([
      {
        campaignId,
        title: 'The Tide Mother',
        keywords: ['tide mother', 'chapel', 'priest', 'priestess', 'blessing', 'faith'],
        body: 'The patron goddess of Brinecross sailors. She gives and takes by the tides; her priests keep tide tables, heal the sick, and bless hulls before a voyage. Stealing from her Chapel is the one crime every thief in the city agrees is unlucky. Her sign is a spiral shell.',
      },
      {
        campaignId,
        title: 'The Harbor Authority and the Tithe',
        keywords: ['harbor authority', 'tithe', 'customs', 'officer', 'blue coat', 'thane'],
        body: 'The Authority levies a tenth of every cargo\'s declared value. Its officers wear faded blue coats and carry brass tallies as badges. Undeclared cargo is seized and, officially, burned. In practice most of it is resold through Authority warehouses on the north pier.',
      },
      {
        campaignId,
        title: 'The Gutter Gulls',
        keywords: ['gutter gulls', 'gulls', 'gang', 'fence', 'saltworks', 'rook'],
        body: 'A gang of orphans, runaways, and ex-deckhands who rule the Saltworks. They fence stolen goods, run messages, and guard tunnel routes for a fee. Their code: no killing, no stealing from the Chapel, and a debt to the Gulls is always collected. Members mark themselves with a feather.',
      },
      {
        campaignId,
        title: 'Sunstone Oil',
        keywords: ['sunstone', 'oil', 'lamp', 'contraband', 'smuggling', 'crate'],
        body: 'A lamp fuel pressed from a southern mineral. It burns with a steady gold light and no smoke. The Authority banned it two months ago, citing warehouse fires; the price has tripled since. A single crate of twelve flasks now sells for around 300 crowns on the black market.',
      },
      {
        campaignId,
        title: 'The Drowning of Old Brinecross',
        keywords: ['old brinecross', 'tunnels', 'drowned', 'sea wall', 'flood', 'undercity'],
        body: 'Eighty years ago the sea wall failed in a winter storm and the old lower city was lost overnight. The new city was built on top. The drowned streets survive as a maze of half-flooded tunnels reached through cellars in Dockside and stairwells in the Saltworks. The tides flood some passages twice a day.',
      },
    ]);

    // -------------------------------------------------------- mission (1, offered)
    await tx.insert(missions).values({
      campaignId,
      title: "The Lantern's Missing Cargo",
      giverNpcId: npcId('Mara Vell'),
      status: 'offered',
      description:
        'A crate of contraband sunstone oil, bound for Mara\'s back room, vanished from the fish piers two nights ago. The dockhands saw nothing, which means someone paid them to see nothing. Mara wants it back, quietly, and wants to know who took it.',
      objectives: normalizeObjectives([
        { text: 'Ask around Dockside Market about the missing crate' },
        { text: 'Find out where the crate was taken' },
        { text: 'Recover the crate or learn who ordered the theft' },
        { text: 'Report back to Mara at the Drowned Lantern' },
      ]),
      rewards: {
        money: 250,
        xp: 150,
        skillXp: [{ skill: 'Streetwise', amount: 40 }],
        relationships: [{ npc: 'Mara Vell', affinity: 10, trust: 20 }],
      },
    });

    // -------------------------------------------------------- player character
    await tx.insert(playerCharacter).values({
      campaignId,
      name: 'Kael',
      archetype: 'rogue',
      bio: 'Twenty-four, born on a Grey Sound fishing boat, washed up in Brinecross at fourteen. Has picked locks, pockets, and fights, mostly successfully. Lives in a rented loft above a net-mender\'s shop and is behind on rent.',
      currentLocationId: locId('Dockside Market'),
      money: 40,
      level: 2,
      xp: 120,
      hp: 16,
      maxHp: 18,
      statusEffects: [],
    });

    await tx.insert(skills).values([
      { campaignId, name: 'Lockpicking', level: 3, xp: 40, description: 'Opening locks without the key.' },
      { campaignId, name: 'Stealth', level: 2, xp: 15, description: 'Moving unseen and unheard.' },
      { campaignId, name: 'Streetwise', level: 2, xp: 60, description: 'Knowing who to ask, what it costs, and when to leave.' },
      { campaignId, name: 'Knife Fighting', level: 1, xp: 20, description: 'Close, ugly, fast.' },
      { campaignId, name: 'Persuasion', level: 1, xp: 5, description: 'Talking people into things.' },
    ]);

    await tx.insert(inventoryItems).values([
      {
        campaignId,
        name: 'Balanced knife',
        description: 'A plain, well-kept blade with a cord-wrapped grip.',
        tags: ['weapon', 'blade'],
        equipped: true,
        properties: { damage: 'd4' },
      },
      {
        campaignId,
        name: 'Oilcloth coat',
        description: 'Long, patched, and waterproof. Has an inside pocket the Authority never checks.',
        tags: ['armor', 'clothing'],
        equipped: true,
      },
      { campaignId, name: 'Lockpick roll', description: 'Six picks and a tension wrench in a leather roll.', tags: ['tool', 'thieves-tools'] },
      { campaignId, name: 'Hard bread', description: 'Ship\'s biscuit. Keeps forever, tastes like it.', quantity: 3, tags: ['food'] },
      { campaignId, name: 'Waterskin', description: 'Half full.', tags: ['container', 'drink'] },
      {
        campaignId,
        name: 'Brass compass',
        description: "Your father's. The needle sticks when it's wet. You have never sold it, however broke you've been.",
        tags: ['keepsake', 'navigation'],
      },
    ]);

    // Make the new campaign sort first in the picker.
    await tx.update(campaigns).set({ updatedAt: sql`now()` }).where(eq(campaigns.id, campaignId));
    return campaignId;
  });
}
