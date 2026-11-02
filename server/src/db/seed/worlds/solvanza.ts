import type { WorldTemplate } from '../world';

// Faction names double as the reputation keys: an NPC whose `faction` matches one acts on the character's standing with it.
const CROWN = 'The Crown';
const HOUSES = 'The Golden Houses';
const CONCORD = 'The Concord of Guilds';
const HAND = 'The Velvet Hand';

export const solvanza: WorldTemplate = {
  id: 'solvanza',
  name: 'Solvanza',
  description:
    'A rags-to-riches climb through a glittering merchant capital. You step off a ship from a fallen northern kingdom with a few ducats and a foreigner\'s tally. Buy taverns, warehouses, ships, and palazzos, fight in the Pit and on the dueling ground, and climb from Outlander to the seat beside the throne before the Spice Charter goes to auction at Midsummer.',
  demoCampaignName: "Solvanza: The Outlander's Fortune",
  currencyName: 'ducats',
  reputation: { [CROWN]: 0, [HOUSES]: 0, [CONCORD]: 0, [HAND]: 0 },

  choices: [
    {
      key: 'origin',
      title: 'What you were in Vaskar',
      prompt:
        "[ THE CUSTOMS QUAY, SOLVANZA ]\nThe Sea-Wren ties up in the gold of late afternoon. Six Vaskari come down her gangplank with what they saved from the fall of the north.\nThe customs clerk dips his pen. \"Name. Origin. Trade.\"\nWhat were you, back home?",
      footer: 'You can be anything here, in time. But what you were in Vaskar is what you carried off the ship, and the other five will be climbing the same ladder.',
      options: [
        {
          id: 'exiled_heir',
          label: 'EXILED HEIR',
          summary: 'The youngest child of a fallen noble house. A name worth nothing here yet, and manners worth a great deal.',
          grants: {
            skills: [
              {
                name: 'Courtly Graces',
                level: 2,
                description:
                  'Etiquette, precedence, heraldry, dance, and the art of the compliment that is also a threat. Opens salons, wins patrons, and keeps a duel from being called over the wrong bow. Grows into reading a court like a ledger and steering one.',
              },
            ],
            items: [
              {
                name: 'Family signet',
                description:
                  'A heavy gold signet: a bear rampant under three stars, the arms of a Vaskari house the usurper declared extinct. Melted, it is worth 150 ducats. Shown to the right herald, it says you are somebody.',
                tags: ['jewelry', 'heraldry', 'keepsake'],
              },
              {
                name: 'Court doublet',
                description: 'Midnight wool slashed with silver, a season out of fashion in Solvanza and still the best-cut coat on the quay. Good enough for a salon; not yet for the Mirror Court.',
                tags: ['clothing', 'fine'],
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Lord Emeric Halbrand',
              shortDescription:
                'Sea-Wren exile (EXILED HEIR). Thirty, golden-haired and lean, a borrowed velvet coat, a laugh that carries across a ballroom, and a Vaskari title he uses as if it still meant something. It is starting to.',
              faction: HOUSES,
              location: 'The Aureate',
              notes:
                "**Path:** the Exiled Heir the player did not claim. Took a room he cannot afford on the Aureate the first night and is courting **Livia Varro** within a week. **Want:** to marry into the Golden Book and buy back his house's lands with Solvanzan money. **Method:** charm, debt, and other people's money; he owes Banco Sabellin 900 ducats by the second week. **Toward the player:** a gracious rival who would happily share a carriage and then cut them at the next salon. Allied, he is the best door-opener in the city. **Clue he holds:** Matteo Varro has quietly asked him whether the usurper's court in Vaskar would pay in silver for 'the names of the exiles who matter'. Emeric laughed it off and has not slept well since.",
            },
          },
        },
        {
          id: 'merchant_factor',
          label: "MERCHANT'S FACTOR",
          summary: 'You kept the books for a Vaskari trading house. You know what things cost, what they sell for, and who is lying in between.',
          grants: {
            skills: [
              {
                name: 'Ledgercraft',
                level: 2,
                description:
                  'Bookkeeping, appraisal, contracts, interest, and spotting a cooked ledger. Used to value property, negotiate prices, run holdings, and find where the money went. Grows into building a trading house and breaking one.',
              },
            ],
            items: [
              {
                name: 'Letter of credit on Banco Sabellin',
                description:
                  'Drawn by your old house on its Solvanzan correspondents before the fall: 1,200 ducats, payable once at Banco Sabellin on the Lantern Exchange. The bank may ask awkward questions about a house that no longer exists.',
                tags: ['document', 'money', 'credit'],
              },
              {
                name: 'Merchant\'s scales',
                description: 'A brass assayer\'s balance in a walnut case, with a touchstone for gold and a loupe. Nobody short-weights you twice.',
                tags: ['tool', 'trade'],
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Vesna Kral',
              shortDescription:
                "Sea-Wren exile (MERCHANT'S FACTOR). Forties, compact and sharp-eyed, ink on her cuffs, a grey traveling dress, and an abacus she flicks while she listens.",
              faction: CONCORD,
              location: 'The Lantern Exchange',
              notes:
                "**Path:** the Merchant's Factor the player did not claim. Cashed a letter of credit on day one and bought a failing chandlery on the Salt Quay by day three. **Want:** a guild seat, then the amber trade from the north, which she means to own outright. **Method:** undercutting, patience, and very good books. **Toward the player:** a competitor who respects competence; she bids against them on any holding they want, and will partner if the numbers are right. **Clue she holds:** the Varro accounts she glimpsed at the Exchange do not add up: the House has sold insurance on a spice fleet that, by her count, sailed four months ago and has not been sighted since.",
            },
          },
        },
        {
          id: 'sellsword',
          label: 'SELLSWORD',
          summary: 'You fought for the old king until there was no king left. Your sword is the most valuable thing you own, and the only thing that never lied to you.',
          grants: {
            skills: [
              {
                name: 'Swordplay',
                level: 2,
                description:
                  'The Vaskari longsword school, plus enough of the Solvanzan rapier to survive a duel: guards, binds, footwork, and killing cleanly. Used in duels, the Pit, brawls with steel, and bodyguard work. Grows into a fighter whose name ends quarrels before they start.',
              },
            ],
            items: [
              {
                name: 'Vaskari longsword',
                description: 'A plain, broad, hand-and-a-half blade with a wolf-tooth pommel and a nick from a usurper\'s halberd. Too heavy for the fashion of Solvanza, and terrifying in the Pit.',
                tags: ['weapon', 'sword'],
              },
              {
                name: 'Brigandine coat',
                description: 'Faded blue canvas over riveted steel plates. Turns a knife, slows a sword, and marks you as a soldier to anyone who looks.',
                tags: ['armor'],
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Bogdan Rusk',
              shortDescription:
                'Sea-Wren exile (SELLSWORD). Thirty-five, a slab of a man with a shaved head, a beard braided with iron rings, three missing fingers, and the gentlest voice on the docks.',
              faction: HAND,
              location: 'The Pit',
              notes:
                "**Path:** the Sellsword the player did not claim. Signed with Gaspare Rocco on the first night and has not lost a bout since. **Want:** enough money to bring his sister and her children out of Vaskar. **Method:** he fights for whoever pays and throws bouts when the Hand tells him to, and hates it. **Toward the player:** honest and brotherly; if they meet in the Pit he will not hold back, and will buy them a drink after. Turned with money for his sister, he becomes the most loyal bodyguard in Solvanza. **Clue he holds:** the Hand hired him once to stand guard at a warehouse on the Salt Quay while men in Varro livery loaded crates of spice that were supposed to be at the bottom of the sea.",
            },
          },
        },
        {
          id: 'smuggler',
          label: 'SMUGGLER',
          summary: 'You ran furs and amber past the king\'s customs for ten years, and then the usurper\'s. There is a false bottom in your sea chest.',
          grants: {
            skills: [
              {
                name: 'Smuggling',
                level: 2,
                description:
                  'Hidden holds, night landings, forged manifests, bribes paid to the right hand at the right price, and knowing which customs man drinks. Used to move goods untaxed, get people in and out, and deal with the Drowned Market. Grows into running a smuggling ring of your own.',
              },
            ],
            items: [
              {
                name: 'Raw Vaskari amber',
                description: 'Lumps of honey-gold northern amber wrapped in oilcloth, hidden in your sea chest\'s false bottom. Worth about 120 ducats apiece to the right buyer; confiscated, with a fine, if customs finds them.',
                quantity: 5,
                tags: ['trade-good', 'contraband', 'valuable'],
              },
              {
                name: 'Sea chest with a false bottom',
                description: 'An iron-bound sailor\'s chest. The false bottom has fooled three customs houses.',
                tags: ['container', 'smuggling'],
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Nika Sorel',
              shortDescription:
                'Sea-Wren exile (SMUGGLER). Late twenties, wiry and sunburned, a red kerchief, a sailor\'s rolling walk, a knife in each boot, and a laugh like a gull\'s.',
              faction: '',
              location: 'The Salt Quay',
              notes:
                "**Path:** the Smuggler the player did not claim. Sold her amber at the Drowned Market for twice what it was worth and bought a share in a fishing smack with a hidden hold. **Want:** to run the northern contraband trade herself, without paying the Velvet Hand its fifth. **Method:** speed, nerve, and undercutting the Hand's prices, which is going to get her killed. **Toward the player:** a fun, reckless friend, and a partner for any night work. If the Hand moves on her (around day 45), she comes to the player for help. **Clue she holds:** she has seen a Vaskari naval cutter, flying no colors, anchored off the Saltmarsh Reach at night, landing men in small boats.",
            },
          },
        },
        {
          id: 'physician',
          label: 'PHYSICIAN',
          summary: 'You trained at the medical college in Vaskar\'s capital before it burned. Everyone in Solvanza gets sick eventually, even the queen.',
          grants: {
            skills: [
              {
                name: 'Physick',
                level: 2,
                description:
                  'Diagnosis, surgery, herbs, and the bedside manner of someone who has seen a war. Used to heal wounds (restores HP), treat fevers and poisons, and earn the gratitude of the powerful. Grows into a physician the great houses send for, and who knows all their secrets.',
              },
            ],
            items: [
              {
                name: "Physician's satchel",
                description: 'Worn black leather: lancets, needles and silk, a bone saw, a mortar, and jars of willow bark, poppy, and feverfew. Enough to set up a practice in any room with a door.',
                tags: ['tool', 'medicine'],
              },
              {
                name: 'Diploma of the Vaskari Medical College',
                description: 'A ribboned parchment with a broken seal. The college no longer exists, but Solvanzan physicians still recognize it, with some envy.',
                tags: ['document', 'credential'],
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Doctor Anselm Pirc',
              shortDescription:
                'Sea-Wren exile (PHYSICIAN). Fifty, stooped, thin as a heron, spectacles on a cord, black gloves he never removes, and a dry, kind voice.',
              faction: HOUSES,
              location: 'The Aureate',
              notes:
                "**Path:** the Physician the player did not claim. Within a fortnight he is physician to House Varro. **Want:** a quiet life, his books, and to never see a war again. **Method:** discretion, which the Golden Houses pay for. **Toward the player:** fatherly and anxious; will patch them up for free and warn them off things he cannot name. **Clue he holds:** Lord Matteo Varro has a wasting illness of the lungs and perhaps a year to live, and has told no one, not even his daughter. Whoever marries Livia Varro inherits House Varro, and its debts, very soon.",
            },
          },
        },
        {
          id: 'intelligencer',
          label: 'INTELLIGENCER',
          summary: 'You were one of the old king\'s spies. The king is dead; the network is scattered; some of it is in Solvanza, and some of it has turned.',
          grants: {
            skills: [
              {
                name: 'Intrigue',
                level: 2,
                description:
                  'Ciphers, dead drops, reading people, lying well, and learning what someone wants before they say it. Used to gather secrets, plant rumors, and find the leverage that moves powerful people. Grows into running a network of your own.',
              },
            ],
            items: [
              {
                name: 'Cipher book',
                description: 'A pocket psalter whose margins hold the old king\'s intelligencer cipher, and on its flyleaf, in invisible ink, four contacts in Solvanza. Some are probably dead. Some have probably turned.',
                tags: ['document', 'secret', 'cipher'],
              },
              {
                name: 'Stiletto',
                description: 'A slender three-sided blade in a sleeve sheath. Made for one quiet thrust.',
                tags: ['weapon', 'dagger', 'concealed'],
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Mirko Zane',
              shortDescription:
                'Sea-Wren exile (INTELLIGENCER). Thirties, forgettable on purpose: brown coat, brown hair, a pleasant face, and a way of being in the corner of every room you remember afterward.',
              faction: CROWN,
              location: 'The Mirror Court',
              notes:
                "**Path:** the Intelligencer the player did not claim. Sold the old king's Solvanzan network to Chancellor Brenn in his first week and is now a clerk of the Chancellor's 'Office of Correspondence'. **Want:** to be on the winning side, whichever that is. **Method:** information, sold twice. **Toward the player:** friendly, helpful, and reporting everything they do to Brenn. Paid more, he reports to the player instead. **Clue he holds:** Brenn has been exchanging letters with the usurper's court in Vaskar through a wine merchant on the Salt Quay called Pavlo Dorn.",
            },
          },
        },
      ],
    },
  ],

  worldBible: `# Solvanza

A rags-to-riches campaign of wealth, rank, and power in a glittering Renaissance-style merchant capital. Swords and gunpowder are both new enough to be fashionable; there is no magic. The character arrives as a foreigner with almost nothing and climbs by any means: trade, property, fighting, marriage, patronage, crime, and politics. Opportunities are everywhere, every rung has a price, and people above them on the ladder like it where they are.

## The character
A Vaskari exile, just off the merchant ship *Sea-Wren* at the Customs Quay. Vaskar, the cold kingdom across the Amber Sea, fell to the usurper **King Radomir** last winter; the old royal family is dead, and the usurper's men have been hunting those who served it. What the character was in Vaskar is the locked choice "What you were in Vaskar" (shown as a System panel): Exiled Heir, Merchant's Factor, Sellsword, Smuggler, Physician, or Intelligencer. Lock it with \`lock_choice\` when the player picks. The five paths passed over came off the same ship as rivals (they appear as NPCs, unmet); each is climbing too, and each holds a clue.

Two permanent conditions track the climb:
- **"Station"**: the character's legal rank (see Station, below). Update its description when they rise or fall.
- **"Ledger"**: their holdings, net weekly income, open ventures and debts, and the next Ledger Day. Update it whenever any of these change.

## Station: the ladder
In Solvanza, rank is law. Each rung has rights, and the rung below is shut out of them. Promotion is never automatic: the character must meet the requirements, find the people, pay the fees, and survive the ceremony. When they rise, update the "Station" condition, \`grant_xp\` (100 × the new rank), and show the city treating them differently: doors, forms of address, prices, enemies.

| Rank | Station | Requirements | What it unlocks |
| 1 | **Outlander** | A Foreigner's Tally from customs (5 ducats, renewed every 30 days) | Lodging, labor, market trading, the Pit. Cannot own or lease property in their own name, carry a sword inside the Aureate, testify against a citizen, or challenge a citizen to a duel. |
| 2 | **Denizen** | A Writ of Residence: a citizen's sponsorship, 200 ducats at the Registry of Deeds, an oath | Lease property, open a business with a guild license, carry a sword anywhere, accept a citizen's challenge. |
| 3 | **Burgher** | Citizenship: 1,500 ducats to the Exchequer, two sponsors (at least one a guild master or a patrician), and property in the city worth 2,000+. Alternatively, a season's service in the Orsk Marches or a Crown grant for a great service to the city. | Own property outright, join a guild, vote in the quarter assemblies, challenge any citizen, bid at the Exchange's property auctions. |
| 4 | **Magnate** | A seat on a guild council (own a licensed business in that guild and win the council's vote, or pay a 3,000 entry gift) and holdings worth 15,000+ | Crown contracts, junior partnership in a Royal Charter bid, a voice in the Concord, a household guard of up to 20. |
| 5 | **Patrician** | Enrollment in the Golden Book: a palazzo on the Aureate, a 25,000 "gift to the Crown", and either marriage into a Golden House, the votes of three Golden Houses, or a royal decree | A seat on the Great Council; may bid on Royal Charters; immunity from the city courts (only the Council can try a patrician). |
| 6 | **Peer** | A Crown title with land: bought from the Chancellor (30,000 and up, while he is selling them) or earned (a war won, the queen's life saved, a treason uncovered) | A seat at the Mirror Court; command of troops; the queen's ear. |
| 7 | **The Hand of the Throne** | Become Lord Chancellor, the queen's consort, or Master of the Spice Charter with a Peer's title | The real power in Teravel. The top of the ladder. |

Falling is possible: a conviction, bankruptcy, or the Crown's displeasure can strip a rung. A ruined Outlander can be deported back to Vaskar, and the usurper.

## Wealth: holdings
Properties and businesses are bought at the **Registry of Deeds** on the Lantern Exchange (from Nella Orsini, the notary), at the Exchange's auctions (Burghers and above), or privately from desperate owners. Each holding is an inventory item tagged \`holding\` and \`property\` or \`business\`; its description lists the price paid, weekly income, upkeep, manager, and condition. Use \`add_item\` when one is bought, \`update_item\` when it changes (a new manager, repairs, a fire), and remove it when it is sold, seized, or burned. Prices are haggled (a Haggling or Ledgercraft check moves them up to 20% either way).

**Outlanders** cannot hold deeds. They can work a market stall on their tally, or buy through a **citizen proxy** (Nella offers the service for 10% of income; a proxy legally owns the holding, which is a risk). Denizens can lease; Burghers can own.

### Holdings for sale (typical; invent others in the same spirit)
| Holding | Price | Net per week | Needs | Notes |
| Market stall, Fishmarket | 60 (lease) | 8 | Tally; you work it, or pay a hand 3/week | First money; hears gossip from the docks. |
| Tenement row, Little Vaskar | 900 | 25 | Proxy or Denizen | Tenants, rent disputes, repairs. A base among the exiles. |
| A run-down tavern (the Crooked Oar, the Tanneries) | 1,800 | 50 | A manager | Rumors, recruits, and fights. Can be raised to 90 with 500 of work. |
| Bathhouse, Lamplight Ward | 2,500 | 60 | A manager | The rich gossip in the steam. Opens doors to the Aureate. |
| Warehouse, Salt Quay | 3,000 | 75 | Denizen | Halves the cost of a trade venture's storage; fire and theft risk; the Hand wants a cut. |
| Gaming house (covert) | 4,000 | 150 | The Velvet Hand's blessing (it takes a fifth) | Raids by the Gonfalon Guard; debtors who pay in secrets. |
| Glassworks, Furnace Lane | 5,000 | 120 | Glassmakers' Guild license | The Concord's favorite trade; a path to a guild seat. |
| Townhouse, Lamplight Ward | 6,000 | -10 (upkeep) | Denizen to lease, Burgher to own | Respectability: required to host anyone who matters. |
| Counting house (moneylending) | 8,000 capital | 4% of the capital lent | Burgher; Ledgercraft | Debtors default; the Sabellins dislike competition. |
| Caravel (ship) | 12,000 | Per voyage | A captain and crew (60/week) | Runs trade ventures at double profit; pirates and storms. |
| Vineyard estate, Saltmarsh Reach | 10,000 | 150 (only after the autumn harvest; 30 before) | Burgher | Country respectability; a place to hide people. |
| Palazzo on the Aureate | 30,000 | -60 (upkeep) | Burgher | Required for the Golden Book. A household of servants comes with it. |

### Managers
A holding needs someone running it. The character can run one themselves (it costs them time). Otherwise hire a steward (10/week, ordinary), a good manager (25/week, +2 on that holding's checks, found by asking around), or put a trusted NPC in charge. Unmanaged holdings earn half and draw trouble.

### Ledger Day: the weekly reckoning
Every seventh day (day 7, 14, 21, ...) the accounts come due. When the day is reached, or passed in a \`pass_time\` skip:
1. Make one \`skill_check\` on the character's **Stewardship** (or Ledgercraft, if higher; add the skill at level 0 if they have neither) at DC 8 for one or two holdings, 12 for three to five, 16 for six or more. Good managers count as gear on that roll.
2. Success: every holding pays its listed net. A critical: one holding does 50% better. Partial or failure: pick one or two holdings for trouble from the list below (more on a failure), and they pay half or nothing.
3. \`adjust_money\` once with the total (weekly net income minus managers' wages and loan interest). Show it as a short ledger in the narration.
4. Update the "Ledger" condition with the new totals and the next Ledger Day.

**Trouble:** a manager skimming; a fire; a guild fine for an unlicensed trade; a rival undercutting prices (often a Sea-Wren rival); a tenant revolt; a Velvet Hand "protection" visit; a Gonfalon Guard inspection that wants a bribe; a ship overdue. Trouble is a story hook first and a cost second: the player can act on it.

### Trade ventures
Back a cargo with a ship's captain at the Salt Quay. Record the stake, cargo, and due day in the "Ledger" condition and your story notes. When it is due, roll a \`skill_check\` (Ledgercraft or Seamanship; DC by risk) and pay out:
| Venture | Days | Return on success | Risk (DC) |
| Wine and glass north to the Free Cities | 10 | 1.5× | 8 |
| Grain from the Orsk Marches | 15 | 1.75× | 12 |
| Furs and amber from Vaskar (the character's countrymen give them an edge, +2) | 20 | 2× | 12 |
| Spice from the Ember Coast (only legal for the Spice Charter holder; smuggled otherwise) | 30 | 3× | 16 |
A partial returns the stake; a failure loses half; a natural 1 loses it all to storm or pirates (a hook: survivors, wreckage, a ransom).

### Loans
- **Banco Sabellin**: up to the value of collateral, 10% interest per month, collected on Ledger Day. Default means the collateral is seized.
- **The Velvet Hand**: no collateral, 5% a week, collected by men who break fingers. Default means a favor you will not like.

## Fighting
Violence is a path to money and rank, and it is never free. Use \`skill_check\` for each exchange (Swordplay, Brawling, or another fitting skill), \`adjust_hp\` for wounds, and conditions for injuries that linger.
- **The Pit** (under the Tanneries, run by Gaspare Rocco for the Velvet Hand): bare-knuckle and blunted-steel bouts every third night. Purses: 20 for an opening bout, 50 for a ranked bout, 150 for a title bout, plus whatever the character bets on themselves. Ranks: Fresh Meat, Bloodied, Contender, Champion. The **Night of Lanterns** at each month's end is a tournament with a 500 purse, and patricians in the gallery. Rocco will ask them to throw a bout eventually.
- **Duels** (the Court of the Sword, at the Swordyard): Solvanza's gentlemen settle insults with rapiers. Name the cause and strike the glove before a witness; the challenged chooses the weapon; it ends at first blood, a yield, or a disarm. Duels to the death are illegal and happen anyway. An Outlander cannot challenge a citizen; a citizen can refuse a challenge from a lower station without shame but not from an equal. A public win earns renown (and the loser's house's grudge). Maestro Ilario Danti teaches the rapier at the Swordyard (15 a lesson).
- **Hired steel**: a bravo for the night costs 3 ducats; a bodyguard, 20 a week; a household guard of ten, 250 a week; Captain Ruslan Ostrov's Free Company of Vaskari veterans, 2,000 a month.
- **Contracts**: caravan escorts to the Free Cities (100 to 300), bounties on Amber Sea pirates (500 a captain), and the Crown's border war in the **Orsk Marches**, where a season's service (about 30 days) buys citizenship and a share of loot.
- **The law**: the Gonfalon Guard keeps order for the Crown. Brawls cost a fine (10 to 50). Killing a citizen outside a duel means the gallows, unless the killer is a patrician, which is one reason people want to be patricians.

## Shops and services
- **Ferro & Sons, Armorers** (Tanneries): rapier 40, fine rapier 150 (Grade I, Swordplay), master blade 600 (Grade II), buckler 15, a brigandine 80, a pair of wheel-lock pistols 300 (loud, slow, frightening).
- **Sartoria Bellandi** (Lamplight Ward): clothes are rank made visible. A good doublet 30; salon dress 120 (Grade I, Courtly Graces); court dress 400 (Grade II). Wearing the wrong clothes for a room is a check penalty.
- **The Registry of Deeds** (Lantern Exchange; Nella Orsini): deeds, leases, writs, proxies, contracts, and notarized secrets.
- **Banco Sabellin** (Lantern Exchange; Lucrezia Sabellin): loans, letters of credit, deposits, and quiet introductions.
- **The Drowned Market** (under the oldest bridge, after midnight): fences, forgers (a forged writ of residence, 300; it will not survive scrutiny), smugglers, poisons, and the Velvet Hand.
- **Physicians**: a barber-surgeon in the Tanneries (5, restores some HP), a court physician on the Aureate (50).

## Money
Ducats. A meal costs 1, a bed in Little Vaskar 1 a night, a decent inn room 3, a horse 150, a laborer's week 4, a clerk's week 10. A reasonable target: a few hundred by the end of the first week, a few thousand in the first month, tens of thousands by Midsummer for a character who plays it well. Make every gain feel earned and every purchase feel real: show the coins counted, the deed sealed, the keys handed over.

## The city and its powers
**Solvanza** is the capital of the **Kingdom of Teravel** and the richest port on the Amber Sea: canals, bridges, bell towers, the gold-domed Mirror Court, and a harbor full of every flag. It is ruled by **Queen Isaura II** (nineteen, crowned last year), her **Lord Chancellor, Duke Ottavio Brenn**, and the **Great Council** of the patrician houses recorded in the Golden Book. Its wealth runs through the guilds and the **Lantern Exchange**, where everything from grain futures to noble titles changes hands. Foreigners are welcome to spend money and not much else.

The character's standing with four factions is tracked (Faction reputation, in the current state). Change it with \`adjust_reputation\` when their deeds reach the faction. Any NPC whose faction matches acts on it.

### The Crown (open)
The queen, the Chancellor, the Exchequer, and the Gonfalon Guard. They grant titles, charters, citizenship by decree, and pardons. Chancellor Brenn has been selling offices and titles to fill a treasury emptied by the Orsk war; Queen Isaura is clever, watched, and looking for people who owe Brenn nothing.
- 20+: a hearing at the Exchequer; contracts; a Guard captain who looks the other way. 40+: an audience with the queen; citizenship or a title by decree is possible. -20: inspections, tax audits, the tally questioned. -50: arrest on a pretext, or deportation.

### The Golden Houses (open)
The patrician families of the Golden Book, who sit on the Great Council: **House Varro** (holders of the Spice Charter for three generations), **House Sabellin** (bankers), **House Morandi** (shipping), and a dozen lesser ones. They despise new money and marry it when they must.
- 20+: salon invitations; a patron; introductions that open the Golden Book. 40+: a marriage offer or the votes of a House. -20: credit refused, doors closed, lawyers. -50: their bravos and their duelists.

### The Concord of Guilds (open)
The seven great guilds (glassmakers, weavers, chandlers, vintners, shipwrights, goldsmiths, apothecaries) and the hundred small ones. Guildmistress **Benedetta Fusari** leads the Concord and wants the guilds to break the patricians' grip on the Council.
- 20+: guild licenses granted; fair prices; workers. 40+: a guild seat (Magnate) and the Concord's vote. -20: licenses delayed, strikes at your holdings. -50: a boycott: no guild will work for or sell to you.

### The Velvet Hand (covert)
The underworld: gaming houses, smuggling, fencing, the Pit, loansharking, and protection. Led by **the Widow**, Serafina Calò, who has outlived three husbands and two rivals. Openly, they are a respectable family of moneylenders; covertly, they own Guard captains, half the docks, and House Varro's debts.
- 20+: fair cuts, fixed bouts in your favor, the Drowned Market open to you. 40+: a partner; the Hand protects your holdings and breaks your rivals'. -20: protection money doubled, accidents at your holdings. -50: a contract on your life.

## The situation: the Midsummer Auction
The **Spice Charter**, the Crown's monopoly on spice from the Ember Coast and the richest license in Teravel, expires at **Midsummer, about 90 days after the campaign begins** (track the countdown in your story notes). It will be auctioned on the floor of the Lantern Exchange. Only a Patrician may bid (others can bid through one, as a partner). House Varro has held it for three generations and expects to again. Everyone with money is maneuvering, and whoever wins it becomes the second power in the kingdom.

### How the season unfolds (if no one changes it)
Show it through gossip, broadsheets, prices, and the street. The player can change any of it.
| Day | Event |
| 3 | Ondrej Malek, a Vaskari exile, is pulled from the Lantern Canal with his throat cut (Drowned in the Lantern Canal). |
| 7 | First Ledger Day. Nella Orsini mentions that a warehouse and a tavern have just come up cheap. |
| 12 | Dockworkers strike after House Varro cuts wages. Cargo rots; a smart buyer can pick up desperate holdings. |
| 20 | Chancellor Brenn announces three titles "for those who serve the Crown's treasury": 30,000 each. |
| 30 | The first Night of Lanterns at the Pit (and every month's end after). The champion gets a patrician's notice. |
| 45 | The Velvet Hand moves against independent smugglers and holdings that do not pay; fires on the Salt Quay. |
| 60 | A Vaskari envoy arrives to negotiate a treaty. Rumor: every exile without citizenship will be handed back. |
| 75 | Word of the lost Varro fleet breaks, or is buried. A run on Banco Sabellin. |
| 90 | The Midsummer Auction of the Spice Charter. |

## GM ONLY: the truth
Reveal none of this early. Clues come from the rivals' clue notes, the missions, ledgers, servants, and careful investigation.
- **House Varro is bankrupt.** Its spice fleet was lost to a storm off the Ember Coast four months ago. Lord Matteo Varro has hidden it by selling insurance on the lost ships, by smuggling (spice bought from the Velvet Hand, landed at a Salt Quay warehouse in Varro livery), and by borrowing 60,000 ducats from the Widow. If House Varro loses the Charter, it falls, and the Widow takes everything. Matteo is also dying (see Doctor Pirc). Whoever marries Livia Varro inherits a great name, a palazzo, and a mountain of debt.
- **The Chancellor is selling the exiles.** Ottavio Brenn has secretly agreed to a treaty with King Radomir of Vaskar: Radomir will pay off Teravel's war debt in silver, and Brenn will hand over every Vaskari exile who is not a citizen, and a list of those who are. His go-between is the "wine merchant" Pavlo Dorn. Brenn intends to use the silver to buy the Spice Charter for himself through a front.
- **The Hound.** Pavlo Dorn is really **Count Pavel Drozd**, the usurper's spymaster, nicknamed the Hound. He killed Ondrej Malek, who had recognized him. He means to find the exiles who could rally a restoration (an heir, the old king's intelligencers, veterans) and send them home in chains, or in a box.
- **Yaro Benesh informs for the Hound.** The friendly innkeeper of the Bear and Lantern sends Dorn the names of every Vaskari who passes through his door, because Drozd holds Yaro's daughter in a prison in Vaskar. He hates himself for it. He did not know Malek would be killed, and he gives the character the mission out of guilt. Discovered, he begs for help freeing his daughter.
- **Queen Isaura knows Brenn is stealing, and cannot prove it.** She needs someone outside the court, owed nothing by Brenn, to find the treaty letters. Whoever brings her proof of the treaty earns her trust and a title.
- **The Widow wants the Charter too**, through House Varro: she plans to let Matteo win it, then take it from him for his debts. If Varro's ruin comes out early, she will bid through another patrician puppet.
- **What each winner does with the Charter:** Varro limps on as the Widow's puppet. Brenn becomes a tyrant behind a young queen, and the exiles go home in chains. The Concord breaks the patricians' monopoly. The Crown (Isaura directly) refills the treasury and frees the queen. The character, if they win it, becomes the second power in the kingdom, and can turn its wealth to anything, even a fleet to retake Vaskar.
- Endings, all valid: win the Charter; marry into House Varro and save or loot it; take over the Velvet Hand; become the queen's Chancellor or consort; build a trading empire without ever touching politics; raise a fleet and sail home to overthrow the usurper; or simply become rich and safe.

## Narrator rules for this world
- Make wealth tangible. Name prices, count coins, show deeds, keys, account books, and the faces of people who suddenly call the character "Signor" or "Signora". Every rise in Station must change how the world treats them.
- Give the player real economic choices with trade-offs: cheap holdings with problems, expensive ones with prestige, legal and illegal paths, loans with teeth. Never make money effortless, and never block a clever plan.
- Keep the Ledger honest: run Ledger Day every seventh day, keep the "Ledger" and "Station" conditions current, and let neglected holdings suffer.
- Fights are fast, physical, and dangerous: one \`skill_check\` per exchange, with wounds that matter. Crowds, wagers, and onlookers make every public fight a social event too.
- The rivals climb on their own. Every week or two, have one of the Sea-Wren exiles reach a new rung, buy something the player wanted, or ask for help.
- Never railroad. The auction comes on schedule; the player chooses how to reach it, or whether to care.
- Only what the scene needs: look things up with the read tools rather than assuming.
`,

  narratorStyle: `- Second person, present tense ("You come down the gangplank into a wall of noise and sun...").
- A sunlit, sharp-edged Renaissance city: bells, canals, silk and fish-guts, gold leaf over rot. Wealth glitters and smells of something underneath.
- Money is concrete: the clink of ducats, the weight of a purse, a ledger column, the wax of a seal. When the character buys, earns, or loses, show it.
- Rank is visible in every scene: who bows to whom, who stands, who is announced and who is not, which door the character is shown to.
- Fights are short, brutal, and loud: footwork on wet stone, the crowd's roar, the ring of a bind, blood on sand.
- 150 to 350 words per turn. Shorter in fights and negotiations, longer for arrivals, purchases of something big, and promotions.
- NPCs speak in distinct voices. Yaro Benesh is warm, sad, and talks with his hands, half in Vaskari. Nella Orsini is brisk, wry, and always names the fee. Lucrezia Sabellin is soft-spoken and never says yes or no, only "perhaps". Lord Matteo Varro is courteous and brittle, and coughs into a silk handkerchief. Livia Varro is direct, impatient with her father, and better at numbers than anyone gives her credit for. Chancellor Brenn is jovial and generous and calls everyone "my friend". Queen Isaura is formal in public and startlingly blunt in private. Benedetta Fusari is loud, profane, and proud of her burn scars. The Widow is gentle, grandmotherly, and terrifying. Gaspare Rocco is a showman who quotes the odds on everything. Maestro Danti speaks only in fencing metaphors. Ruslan Ostrov is curt and Vaskari to the bone.
- End on something the player can act on: an offer, a threat, a deed up for sale, a challenge, a ledger that does not balance.
`,

  locations: [
    {
      name: 'Solvanza',
      description:
        'The capital of the Kingdom of Teravel and the richest port on the Amber Sea: canals and bridges, bell towers and gold domes, a harbor full of every flag, and a hundred thousand people buying and selling everything, including each other.',
      purpose:
        'The campaign\'s world and the board everyone is climbing. Shows the city\'s rank and wealth in every street, and the season building to the Midsummer Auction.',
      tags: ['city', 'capital', 'harbor', 'hub'],
    },
    {
      name: 'The Customs Quay',
      description:
        'A long stone quay under the customs house, crowded with porters, clerks at standing desks, stacked bales, and newly arrived foreigners waiting in the sun to be told what they are allowed to be.',
      purpose:
        'The starting location, where the character steps off the Sea-Wren and locks their origin. Inspector Grisetti issues (and renews) Foreigner\'s Tallies here, and inspects cargo, a problem for a smuggler. Ships, captains, and trade ventures can be found here too.',
      tags: ['harbor', 'customs', 'start'],
      parent: 'Solvanza',
    },
    {
      name: 'The Lantern Exchange',
      description:
        'A vast colonnaded hall of the merchants, lit by a hundred brass lanterns even at noon. Brokers shout prices from the pillars, bankers sit at green-baize tables, and the Registry of Deeds keeps the city\'s property in leather-bound books behind a brass grille.',
      purpose:
        'The heart of the wealth game: buying and selling holdings at the Registry (Nella Orsini), loans and credit at Banco Sabellin (Lucrezia Sabellin), property auctions, and, at Midsummer, the auction of the Spice Charter.',
      tags: ['market', 'bank', 'registry', 'auction'],
      parent: 'Solvanza',
    },
    {
      name: 'The Aureate',
      description:
        'The patrician quarter on its island: palazzos with marble facades and gilded water-gates, private gondolas moored to striped poles, gardens behind high walls, and Gonfalon Guards who ask foreigners their business.',
      purpose:
        'Home of the Golden Houses and the goal of the climb: the Varro palazzo (Matteo and Livia Varro), salons, marriages, and the palazzo a Patrician must own. Outlanders may not carry swords here.',
      tags: ['wealthy', 'patrician', 'district'],
      parent: 'Solvanza',
    },
    {
      name: 'The Mirror Court',
      description:
        'The royal palace under its golden dome: a hall of mirrors where petitioners wait for days, gardens with peacocks, and a warren of offices where the kingdom\'s business is done in whispers and wax.',
      purpose:
        'Seat of the Crown: Queen Isaura, Chancellor Brenn, the Exchequer, citizenship by decree, titles for sale, and the proof of Brenn\'s treaty with the usurper, kept in the Office of Correspondence.',
      tags: ['palace', 'crown', 'court'],
      parent: 'Solvanza',
    },
    {
      name: 'The Hall of the Concord',
      description:
        'A guildhall of red brick and stained glass, each window the arms of a guild. The great hall smells of beeswax and argument; the seven great guilds have their chambers off the gallery.',
      purpose:
        'Seat of the Concord of Guilds (Benedetta Fusari): guild licenses, workers, a guild seat for a Magnate, and the Concord\'s campaign to break the patricians at the auction.',
      tags: ['guild', 'politics'],
      parent: 'Solvanza',
    },
    {
      name: 'Little Vaskar',
      description:
        'A cramped quarter of timber tenements by the north canal where the exiles live: onion-domed chapel, smoked fish, Vaskari songs from the windows, and children who speak two languages in one sentence.',
      purpose:
        'The exile community: cheap lodging, the tenement row for sale, Captain Ostrov\'s Free Company, and the Hound\'s hunting ground. Where the character\'s countrymen help them, and where some of them sell them.',
      tags: ['district', 'poor', 'exiles'],
      parent: 'Solvanza',
    },
    {
      name: 'The Bear and Lantern',
      description:
        'A low, warm Vaskari tavern with a tiled stove, a bear\'s skull over the bar, rye spirit, black bread, and a board of letters and notices from exiles looking for each other.',
      purpose:
        'Yaro Benesh\'s tavern and the first friendly place for the character: a bed for 1 ducat, news from home, and the Drowned in the Lantern Canal mission. Also where Yaro gathers names for the Hound.',
      tags: ['tavern', 'lodging', 'exiles'],
      parent: 'Little Vaskar',
    },
    {
      name: 'The Tanneries',
      description:
        'The stinking working quarter downriver: tanning pits, slaughterhouses, Ferro & Sons the armorers, cheap taverns like the Crooked Oar, and people who work too hard for too little.',
      purpose:
        'Where money is made the hard way: labor, the Crooked Oar for sale, the armorer, the barber-surgeon, and the Pit beneath it all.',
      tags: ['district', 'poor', 'industry'],
      parent: 'Solvanza',
    },
    {
      name: 'The Pit',
      description:
        'A flooded cistern under the Tanneries, drained and floored with sand. Tiered wooden galleries ring it, packed with dockers below and masked patricians above, all shouting odds.',
      purpose:
        'The fighting path: bouts every third night, purses and wagers, the monthly Night of Lanterns, Gaspare Rocco, and the Velvet Hand\'s fixes. A champion here draws patrician notice.',
      tags: ['arena', 'fighting', 'gambling'],
      parent: 'The Tanneries',
    },
    {
      name: 'The Swordyard',
      description:
        'A walled courtyard of worn flagstones behind the old armory, with a fountain at its center and a gallery for witnesses. Maestro Danti\'s fencing salle opens onto it.',
      purpose:
        'Home of the Court of the Sword: duels of honor between citizens, rapier lessons from Maestro Danti, and the place reputations are made or ended.',
      tags: ['dueling', 'training'],
      parent: 'Solvanza',
    },
    {
      name: 'The Salt Quay',
      description:
        'The warehouse district on the south harbor: stone godowns with iron doors, cranes, chandlers, rope walks, and ships loading by torchlight.',
      purpose:
        'Trade ventures, warehouses for sale, ships and captains, the Varro warehouse where smuggled spice is landed, and Pavlo Dorn\'s wine business. The Velvet Hand\'s fires come here around day 45.',
      tags: ['harbor', 'warehouses', 'trade'],
      parent: 'Solvanza',
    },
    {
      name: 'The Drowned Market',
      description:
        'A night market in the vaulted undercroft beneath the oldest bridge, half under water at high tide. Lanterns on poles, stalls on rafts, and hooded buyers.',
      purpose:
        'Seat of the Velvet Hand (the Widow): fences, forgers, smugglers, loans without collateral, and illegal shortcuts up the ladder, all at a price.',
      tags: ['black-market', 'criminal', 'underground'],
      parent: 'Solvanza',
    },
    {
      name: 'The Saltmarsh Reach',
      description:
        'Flat country east of the city walls: vineyards, villas behind cypress hedges, salt pans shining in the sun, and lonely inlets where boats land at night.',
      purpose:
        'Country estates for sale (vineyards), a place to hide people, and the inlet where the usurper\'s cutter lands the Hound\'s men.',
      tags: ['countryside', 'estates', 'coast'],
      parent: 'Solvanza',
    },
  ],

  npcs: [
    {
      name: 'Inspector Paolo Grisetti',
      shortDescription:
        'Customs inspector of the Customs Quay. Fifties, sweating in a black velvet robe of office, a gold chain, an ink-stained ledger, and a palm that is always slightly open.',
      faction: CROWN,
      location: 'The Customs Quay',
      notes:
        '**Duty:** issues and renews Foreigner\'s Tallies (5 ducats, 30 days) and inspects cargo. **Want:** bribes, steadily and without fuss; 5 ducats makes a crate unopened, 50 makes a ship unsearched. **Knows:** every ship that comes and goes, and who pays him; he is on Pavlo Dorn\'s payroll too, and has been told to note every Vaskari who lands. **Toward the player:** bored suspicion; useful once bought.',
    },
    {
      name: 'Yaro Benesh',
      shortDescription:
        'Innkeeper of the Bear and Lantern. Sixty, round and white-bearded, an embroidered Vaskari waistcoat, a booming laugh, and sad eyes that do not match it.',
      faction: '',
      location: 'The Bear and Lantern',
      notes:
        "**Public face:** the heart of Little Vaskar. Writes to exiles before they sail, meets their ships, finds them beds and work. **Secret (GM only):** informs for the Hound (Pavlo Dorn), sending him the name and past of every Vaskari through his door, because the Hound holds Yaro's daughter Katya in a prison in Vaskar. He did not know Ondrej Malek would be killed and is sick with guilt. **Gives:** the Drowned in the Lantern Canal mission. **Toward the player:** truly fond of them, and reporting on them. Discovered, he confesses and begs for help freeing Katya.",
    },
    {
      name: 'Nella Orsini',
      shortDescription:
        'Notary of the Registry of Deeds. Forties, quick and dry, spectacles pushed into dark curls, ink-black sleeves, and a silver seal on a ribbon around her wrist.',
      faction: '',
      location: 'The Lantern Exchange',
      notes:
        '**Offers:** deeds, leases, writs of residence, contracts, and, for Outlanders, her services as a citizen proxy (10% of income). She always names the fee. **Knows:** who owns what in Solvanza, who is selling in a hurry, and which deeds are forged. **Want:** to get rich on fees without ever being on the losing side. **Gives:** A Writ of Residence, and tips about cheap holdings (see the timeline). **Toward the player:** businesslike; warms to clients who pay promptly and bring her interesting problems.',
    },
    {
      name: 'Lucrezia Sabellin',
      shortDescription:
        'Head of Banco Sabellin. Seventy, tiny and upright, black silk and pearls, a cane with a gold knob, and a gaze that weighs you to the ducat.',
      faction: HOUSES,
      location: 'The Lantern Exchange',
      notes:
        "**Offers:** loans (10% a month against collateral), letters of credit, deposits, and introductions to the Golden Houses for clients she rates. **Want:** to know whether House Varro can repay the 40,000 it owes her before the auction, without starting a run on her own bank by asking. **Gives:** The Varro Question. **Toward the player:** courteous interest; she backs promising newcomers the way others back racehorses. She never says yes or no, only 'perhaps'.",
    },
    {
      name: 'Lord Matteo Varro',
      shortDescription:
        'Head of House Varro and holder of the Spice Charter. Sixty, silver-haired and gaunt, impeccable in black and gold, a silk handkerchief always in hand, and the brittle courtesy of a man holding up a ceiling.',
      faction: HOUSES,
      location: 'The Aureate',
      notes:
        "**Secret (GM only):** House Varro is bankrupt (the lost fleet); he owes the Widow 60,000 and Banco Sabellin 40,000; he is landing smuggled spice in Varro livery; and he is dying. **Want:** to win the Spice Charter at Midsummer and marry Livia to money before anyone learns the truth. **Toward the player:** disdain for an Outlander, warmth for a rich Burgher, open arms for anyone who could save his house. Has asked Emeric Halbrand whether the usurper would pay for exiles' names.",
    },
    {
      name: 'Livia Varro',
      shortDescription:
        'Heiress of House Varro. Twenty-four, dark-eyed and restless, ink on her fingers under her rings, plainer gowns than her station demands, and the habit of finishing other people\'s sums for them.',
      faction: HOUSES,
      location: 'The Aureate',
      notes:
        "**Want:** to run House Varro herself instead of being married off to save it. She suspects the House is in trouble but her father keeps the books from her. **Offers:** a marriage alliance (the Patrician path), or a partnership with whoever helps her see the real accounts. **Toward the player:** curious about anyone who earned their money, contemptuous of fortune-hunters. Being courted by Emeric Halbrand if he is in the world, and not impressed.",
    },
    {
      name: 'Chancellor Ottavio Brenn',
      shortDescription:
        "Duke and Lord Chancellor of Teravel. Fifties, broad and ruddy, a booming laugh, rings on every finger, a chain of office, and the habit of calling everyone 'my friend'.",
      faction: CROWN,
      location: 'The Mirror Court',
      notes:
        "**Public face:** the generous, practical minister who keeps the kingdom solvent. Sells offices and titles (30,000 for a barony) to fund the Orsk war. **Secret (GM only):** has agreed a treaty with the usurper King Radomir: Vaskari silver for Teravel's war debt, in exchange for every non-citizen exile and the names of the rest. The letters pass through Pavlo Dorn; copies are in the Office of Correspondence. He plans to buy the Spice Charter through a front. **Toward the player:** delighted to sell them anything; once they matter, he wants to own them.",
    },
    {
      name: 'Queen Isaura II',
      shortDescription:
        'Queen of Teravel. Nineteen, small and very still, a plain gold circlet, mourning grey for her father, and eyes that miss nothing in a hall of mirrors.',
      faction: CROWN,
      location: 'The Mirror Court',
      notes:
        "**Want:** to rule in fact, not just in name, which means breaking Brenn. She knows he is stealing and cannot prove it; she does not yet know about the treaty. **Offers:** to someone who owes Brenn nothing and brings her proof: citizenship, a title, a royal decree into the Golden Book, or a place at her side. **Toward the player:** unreachable at first (an audience needs Crown standing 40+ or a remarkable deed). In private, startlingly blunt.",
    },
    {
      name: 'Benedetta Fusari',
      shortDescription:
        'Guildmistress of the Concord. Fifties, broad-shouldered, cropped grey hair, burn scars up both forearms from forty years at the glass furnace, and a voice built to carry over one.',
      faction: CONCORD,
      location: 'The Hall of the Concord',
      notes:
        "**Want:** to break the patricians' monopoly on the Great Council, and to see the Spice Charter won by a guild-backed bidder. **Offers:** guild licenses (the glassworks, a tavern, a counting house), workers, a path to a guild seat, and the Concord's backing for a Burgher who will stand with the guilds. **Toward the player:** likes self-made people, hates airs. Swears in four languages.",
    },
    {
      name: 'The Widow',
      shortDescription:
        "Serafina Calò, matriarch of the Velvet Hand. Seventies, plump and grandmotherly, black lace, a basket of knitting, peppermints in her pocket, and the softest voice in Solvanza.",
      faction: HAND,
      location: 'The Drowned Market',
      notes:
        '**Public face:** a respectable widow of a moneylending family. **Truth:** runs the Velvet Hand: the Pit, gaming houses, smuggling, protection, and loans. **Secret (GM only):** holds 60,000 of House Varro\'s debt and plans to take the Spice Charter from Matteo after he wins it. **Offers:** loans without collateral (5% a week), the protection of her name, a partnership for anyone useful. **Toward the player:** kindly interest, peppermints, and a ledger of what they owe her. She never threatens; her men do.',
    },
    {
      name: 'Gaspare Rocco',
      shortDescription:
        'Master of the Pit. Forties, a peacock in a slashed crimson doublet, a showman\'s mustache, a gold tooth, and a chalkboard of odds always within reach.',
      faction: HAND,
      location: 'The Pit',
      notes:
        "**Runs:** the Pit for the Velvet Hand: bouts every third night, wagers, the Night of Lanterns. **Want:** a crowd-pleasing new fighter, and bouts that go the way the Hand's money says. **Gives:** Open Night at the Pit. **Toward the player:** a promoter's enthusiasm. After a few wins he asks them to throw a bout for 200 ducats; refusing costs Hand standing, accepting costs pride and the crowd's love.",
    },
    {
      name: 'Maestro Ilario Danti',
      shortDescription:
        'Fencing master of the Swordyard. Sixty, lean as a blade, white mustache waxed to points, a black doublet with one silver button, and a cane he can kill with.',
      faction: '',
      location: 'The Swordyard',
      notes:
        '**Offers:** rapier lessons (15 a lesson; a week of training counts as a teacher for `pass_time`), witnessing duels, and the rules of the Court of the Sword. **Want:** a student worth his time; he has not had one in years. **Knows:** every duel fought in Solvanza for thirty years, and who cheated. **Toward the player:** scornful of brawlers, generous with anyone who listens. Speaks only in fencing metaphors.',
    },
    {
      name: 'Captain Ruslan Ostrov',
      shortDescription:
        'Captain of the Free Company of the Bear. Fifties, scarred and grizzled, a Vaskari wolfskin over a battered breastplate, a pipe, and a gaze like a winter sky.',
      faction: '',
      location: 'Little Vaskar',
      notes:
        "**Runs:** the Free Company of the Bear, eighty Vaskari veterans of the old king's army, out of work and drinking their pay. Hire: 2,000 a month, or a share of a venture. **Want:** a cause, and a way home to fight the usurper. **Knows:** veterans who would follow a leader with a fleet. **Toward the player:** curt and testing; respects courage and money, in that order. Can lead the character to the Orsk Marches (citizenship by service) or, late in the game, to a restoration.",
    },
    {
      name: 'Pavlo Dorn',
      shortDescription:
        'A wine merchant of the Salt Quay. Forties, neat and soft-spoken, a grey beard trimmed close, plain good clothes, and a Vaskari accent he claims comes from the Free Cities.',
      faction: '',
      location: 'The Salt Quay',
      notes:
        "**Secret (GM only):** Count Pavel Drozd, King Radomir's spymaster, 'the Hound'. Killed Ondrej Malek, who recognized him. Carries Brenn's treaty letters to the usurper's cutter at the Saltmarsh Reach. Hunts exiles who could rally a restoration: an heir, intelligencers, veterans. Gets names from Yaro Benesh and Inspector Grisetti. **Want:** the character's name on his list, if their origin makes them dangerous. **Toward the player:** friendly, helpful, a generous buyer of anything Vaskari; offers to fund their first venture so he can watch them.",
    },
  ],

  lore: [
    {
      title: 'Station',
      keywords: ['station', 'rank', 'outlander', 'denizen', 'burgher', 'magnate', 'patrician', 'peer', 'citizenship', 'writ', 'tally'],
      alwaysInclude: true,
      body: "In Solvanza, rank is law. The ladder: Outlander (Foreigner's Tally; cannot own property, carry a sword in the Aureate, or challenge a citizen), Denizen (Writ of Residence: a sponsor and 200 ducats; may lease and carry a sword), Burgher (citizenship: 1,500, two sponsors, property worth 2,000+, or service in the Orsk Marches; may own outright, join a guild, bid at auctions), Magnate (a guild council seat and 15,000 in holdings), Patrician (the Golden Book: a palazzo, 25,000 to the Crown, and a marriage, three Houses' votes, or a decree; may bid on Royal Charters), Peer (a Crown title with land), and the Hand of the Throne (Chancellor, consort, or Master of the Spice Charter). The character's rank is the 'Station' condition.",
    },
    {
      title: 'Holdings and Ledger Day',
      keywords: ['holding', 'holdings', 'property', 'business', 'deed', 'ledger', 'income', 'manager', 'steward', 'venture', 'loan'],
      alwaysInclude: true,
      body: "Properties and businesses are inventory items tagged 'holding', with price, weekly income, upkeep, manager, and condition in the description. They are bought at the Registry of Deeds (Nella Orsini) or privately; Outlanders need a citizen proxy. Every seventh day is Ledger Day: one Stewardship check for the whole portfolio, then income paid (less managers' wages and loan interest) with adjust_money, trouble for some holdings on a poor roll, and the 'Ledger' condition updated. Trade ventures and loans are tracked on the 'Ledger' condition and resolved when due.",
    },
    {
      title: 'Solvanza and Teravel',
      keywords: ['solvanza', 'teravel', 'queen', 'isaura', 'great council', 'golden book', 'gonfalon'],
      body: "Solvanza is the capital of the Kingdom of Teravel and the richest port on the Amber Sea. Queen Isaura II, nineteen, was crowned last year; her Lord Chancellor, Duke Ottavio Brenn, runs the government. The Great Council of the patrician houses listed in the Golden Book holds the city's purse; the Concord of Guilds runs its trades; the Gonfalon Guard keeps order. Teravel has been fighting a border war in the Orsk Marches for three years and the treasury is empty.",
    },
    {
      title: 'Vaskar and the Usurper',
      keywords: ['vaskar', 'vaskari', 'radomir', 'usurper', 'exile', 'exiles', 'sea-wren', 'homeland'],
      body: "Vaskar is the cold northern kingdom across the Amber Sea: forests, amber, furs, and long winters. Last winter General Radomir seized the throne; the old king and his heirs were killed, the capital's college and archives burned, and those who served the old crown fled or were hunted. Thousands of exiles live in Solvanza's Little Vaskar quarter. Teravel has not recognized Radomir. Yet.",
    },
    {
      title: 'The Spice Charter',
      keywords: ['spice', 'charter', 'auction', 'midsummer', 'monopoly', 'ember coast'],
      body: "The Crown's monopoly on spice from the Ember Coast, the richest license in Teravel. House Varro has held it for three generations. It expires at Midsummer (about 90 days into the campaign) and will be auctioned on the floor of the Lantern Exchange. Only a Patrician may bid, though others may partner with one. Whoever holds it is the second power in the kingdom.",
    },
    {
      title: 'The Court of the Sword',
      keywords: ['duel', 'duels', 'dueling', 'swordyard', 'glove', 'challenge', 'rapier', 'honor'],
      body: "Solvanza's gentlemen settle insults with rapiers at the Swordyard. The challenger names the cause and strikes the glove before a witness; the challenged chooses weapons; it ends at first blood, a yield, or a disarm. Duels to the death are illegal and happen anyway. An Outlander cannot challenge a citizen; a citizen may refuse a challenge from a lower station without shame but not from an equal. A public win makes a name.",
    },
    {
      title: 'The Pit',
      keywords: ['pit', 'bout', 'bouts', 'arena', 'fight', 'fighting', 'rocco', 'night of lanterns', 'wager'],
      body: "A drained cistern under the Tanneries where Gaspare Rocco stages bouts every third night for the Velvet Hand: bare-knuckle and blunted steel, with purses of 20, 50, or 150 and open wagering. Ranks run Fresh Meat, Bloodied, Contender, Champion. The Night of Lanterns at each month's end is a tournament with a 500 purse, and masked patricians in the upper gallery. Everyone knows some bouts are fixed.",
    },
    {
      title: 'The Velvet Hand',
      keywords: ['velvet hand', 'hand', 'widow', 'calò', 'drowned market', 'protection', 'smuggling'],
      body: "Solvanza's underworld: gaming houses, smuggling, fencing, the Pit, loansharking, and protection, run from the Drowned Market under the oldest bridge. Its head is the Widow, Serafina Calò, publicly a respectable moneylender. The Hand takes a fifth of every illegal deal in the city and lends without collateral at 5% a week. Its rules: pay your cut, keep your word, never talk to the Guard.",
    },
  ],

  missions: [
    {
      title: 'Landfall',
      description:
        'You are on the Customs Quay of the richest city in the world with a sea chest, a few ducats, and no rights. First things first: get your tally, find a bed, and start making money.',
      objectives: [
        "Get a Foreigner's Tally from customs",
        'Find a bed for the night',
        'Earn, win, or trade your way to your first 100 ducats in Solvanza',
      ],
      status: 'active',
      rewards: { xp: 50 },
    },
    {
      title: 'A Writ of Residence',
      giver: 'Nella Orsini',
      description:
        "An Outlander owns nothing and can be put back on a ship at the Crown's pleasure. A Writ of Residence makes you a Denizen: you can lease property, carry a sword, and stop being a guest. Nella Orsini will draw it up for 200 ducats, once you find a citizen willing to sponsor you.",
      objectives: ['Find a citizen willing to sponsor you', 'Pay the 200-ducat fee at the Registry of Deeds', "Swear the Denizen's oath at the Lantern Exchange"],
      rewards: { xp: 100, relationships: [{ npc: 'Nella Orsini', affinity: 5, trust: 10 }] },
    },
    {
      title: 'Open Night at the Pit',
      giver: 'Gaspare Rocco',
      description:
        "Rocco is always looking for fresh meat. Three bouts, three purses, and if you are still standing, a ranked place on his chalkboard. The crowd likes foreigners. They like it more when foreigners bleed.",
      objectives: ['Win an opening bout at the Pit', 'Win a second bout', 'Win a third, or take the money to lose it'],
      rewards: { money: 150, xp: 80 },
    },
    {
      title: 'Drowned in the Lantern Canal',
      giver: 'Yaro Benesh',
      description:
        "Ondrej Malek, a Vaskari exile who drank at the Bear and Lantern every night, was pulled out of the Lantern Canal with his throat cut. The Gonfalon Guard wrote it down as a robbery and went home. Yaro wants to know who did it. He will not quite meet your eyes when he asks.",
      objectives: ['Learn who Ondrej Malek was before the fall, and what he had seen', 'Find out who killed him', 'Decide what to do about it'],
      rewards: { xp: 150, relationships: [{ npc: 'Captain Ruslan Ostrov', affinity: 10, trust: 15 }] },
    },
    {
      title: 'The Varro Question',
      giver: 'Lucrezia Sabellin',
      description:
        "Banco Sabellin is owed 40,000 ducats by House Varro, and the Spice Charter auction is coming. Lucrezia cannot ask about Varro's finances without starting a panic. She can hire a newcomer nobody watches to find out quietly.",
      objectives: ['Find out how much House Varro owes, and to whom', 'Learn what happened to the Varro spice fleet', 'Bring Lucrezia proof, or sell it to someone else'],
      rewards: { money: 500, xp: 150, relationships: [{ npc: 'Lucrezia Sabellin', affinity: 10, trust: 20 }] },
    },
    {
      title: 'The Midsummer Auction',
      description:
        "At Midsummer, about ninety days from now, the Spice Charter goes to auction on the floor of the Lantern Exchange. Whoever wins it becomes the second power in Teravel. Only a Patrician may bid. You are an Outlander with a sea chest. It is a long way up.",
      objectives: [
        'Learn the terms of the Spice Charter auction',
        'Rise to Patrician, or find a Patrician to bid for you',
        'Raise a bid worth winning',
        'Be on the floor of the Lantern Exchange on Midsummer Day',
      ],
      rewards: { xp: 1000 },
    },
  ],

  character: {
    name: 'Danek Strova',
    archetype: 'Vaskari exile',
    bio: "Twenty-eight, from Vaskar across the Amber Sea, which fell to the usurper Radomir last winter. Everything you had there is gone: the house, the people, the life. You sold what was left for passage on the Sea-Wren and spent eleven days at sea learning the Teravellan you didn't already know. What you were back home is yours to say at the gangplank. What you will be here is yours to make. You have a sea chest, 85 ducats, your mother's amber pendant, and a letter from an innkeeper named Yaro Benesh promising every Vaskari a warm bed at the Bear and Lantern.",
    location: 'The Customs Quay',
    money: 85,
    level: 1,
    xp: 0,
    hp: 16,
    maxHp: 16,
    statusEffects: [
      {
        name: 'Station',
        description: "Outlander (rank 1 of 7). No Foreigner's Tally yet. Cannot own property, carry a sword in the Aureate, or challenge a citizen.",
        turnsRemaining: null,
        modifiers: [],
      },
      {
        name: 'Ledger',
        description: 'Holdings: none. Net weekly income: 0. Ventures: none. Debts: none. Next Ledger Day: day 7.',
        turnsRemaining: null,
        modifiers: [],
      },
    ],
    skills: [
      { name: 'Teravellan Tongue', level: 2, xp: 20, description: "Speaking, reading, and bargaining in Teravellan. Fluent enough to do business, with an accent that tells everyone you're Vaskari." },
      { name: 'Haggling', level: 1, xp: 10, description: 'Getting a better price, buying or selling: from fish in the market to a deed at the Registry.' },
      { name: 'Perception', level: 2, xp: 15, description: 'Noticing the thing that is out of place: a pickpocket, a forged seal, a man following you.' },
      { name: 'Brawling', level: 1, xp: 10, description: 'Fists, elbows, and whatever is to hand. Used in tavern fights and bare-knuckle bouts at the Pit.' },
      { name: 'Stewardship', level: 0, xp: 0, description: 'Running property and people: hiring, accounts, repairs, and keeping managers honest. Rolled on Ledger Day.' },
    ],
    items: [
      { name: 'Sea chest', description: 'A battered pine chest with rope handles: two changes of clothes, a razor, a wool blanket, and a Vaskari prayer book.', tags: ['container'] },
      { name: 'Traveling cloak', description: 'Heavy grey Vaskari wool, far too warm for Solvanza. It marks you as a northerner at fifty paces.', tags: ['clothing'], equipped: true },
      { name: 'Belt knife', description: 'A plain working knife. Every Vaskari carries one.', tags: ['weapon', 'knife', 'tool'], equipped: true },
      { name: "Mother's amber pendant", description: 'A drop of clear northern amber with a tiny fern inside, on a silver chain. Worth about 60 ducats. Worth more than that to you.', tags: ['jewelry', 'keepsake', 'valuable'], equipped: true },
      { name: "Yaro Benesh's letter", description: '"To every son and daughter of Vaskar who reaches Solvanza: there is a warm stove and a bed at the Bear and Lantern in Little Vaskar, and nobody pays the first night. Ask for Yaro."', tags: ['document', 'letter'] },
    ],
    relationships: [
      {
        npc: 'Yaro Benesh',
        affinity: 15,
        trust: 15,
        status: 'acquaintance',
        historyNotes: "- Never met, but his letter reached you in the refugee camp at the Vaskari coast and was the reason you chose Solvanza.",
      },
      {
        npc: 'Inspector Paolo Grisetti',
        affinity: -5,
        trust: -10,
        status: 'stranger',
        historyNotes: "- Watched you come down the gangplank and wrote something in his ledger before you'd said a word.",
      },
    ],
  },
};
