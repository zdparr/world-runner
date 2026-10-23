import type { WorldTemplate } from '../world';

// Faction names double as the reputation keys: an NPC whose `faction` matches one acts on the character's standing with it.
const CHARTER = 'Charter Wardens';
const ALDGRAVE = 'Aldgrave Society';
const TIDEBOUND = 'The Tidebound';
const TALLYMEN = 'The Tallymen';

export const harrowmere: WorldTemplate = {
  id: 'harrowmere',
  name: 'Harrowmere',
  description:
    'Wands, spells, and a hidden war in a rain-soaked harbor city. Your magic woke the night the Archon died. Now you need a wand, every spell you learn has to be bought, begged, stolen, or won, and the old families, the shapeshifter lines, the Wardens, and the syndicates are all reaching for the empty seat of power, some openly and some in the dark.',
  demoCampaignName: 'Harrowmere: The Empty Seat',
  currencyName: 'dollars',
  reputation: { [CHARTER]: 0, [ALDGRAVE]: 0, [TIDEBOUND]: 0, [TALLYMEN]: 0 },

  choices: [
    {
      key: 'wand',
      title: 'Wand',
      prompt:
        "[ MARCHETTI & DAUGHTERS, WANDWRIGHTS ]\nEst. 1888. The wand chooses; we only make the introductions.\nSix wands stirred when you came through the door.\nTake one in hand. The one that answers is yours for life.",
      footer: 'A wand bonds once. The five you leave on the counter will find other hands before the week is out.',
      options: [
        {
          id: 'rowan_stormglass',
          label: 'ROWAN & STORMGLASS',
          summary: 'Quick, bright, and spoiling for a fight. Its spell is Fulmen, the lightning hex.',
          grants: {
            items: [
              {
                name: 'Rowan & Stormglass wand',
                description:
                  'Eleven inches of pale rowan with a sliver of stormglass (lightning-fused harbor sand) at its core. It hums before storms and sparks when you are angry. Its affinity is hexes; it taught you Fulmen the moment you touched it.',
                tags: ['wand', 'focus', 'hexes'],
              },
            ],
            skills: [
              {
                name: 'Fulmen',
                level: 1,
                description:
                  'Second Circle hex, wand-born: a crack of blue-white lightning from the wand tip. Lv1: a spark that stuns a person for a breath or kills a phone, at a few paces. It grows into a bolt that drops a grown man, then chains between targets. Loud, bright, and impossible to hide from the Daylit.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Kit Hask',
              shortDescription:
                'Wandbearer (Rowan & Stormglass). Nineteen, rangy, a buzz cut and a split lip, a Skerrows boxing-gym hoodie, and eyes that go yellow when he is angry. Hask line: born to the wolf.',
              faction: TIDEBOUND,
              location: 'The Skerrows',
              notes:
                "**Wand:** Rowan & Stormglass, the wand the player passed over; he bought it two days later with money from a Tallymen loan. **Signature spell:** Fulmen, about Lv2 and climbing fast. **Want:** revenge for Ewan Hask, his cousin, and a war with the Aldgrave Society that his sister Tamsin is trying to start. Tidebound rarely carry wands; Kit carrying a lightning hex is a statement. **Serves:** his sister and the Hask pack, not the elders. **Toward the player:** hostile if they side with Aldgrave, a brother-in-arms if they stand up for the Skerrows. **Clue he holds:** the Tallymen gave him the loan for the wand without asking for collateral, and the man who arranged it asked him, twice, whether any Tidebound family still kept 'the old pewter keys'.",
            },
          },
        },
        {
          id: 'blackthorn_raven',
          label: 'BLACKTHORN & RAVEN QUILL',
          summary: 'For those who would rather not be seen. Its spell is Velum, the veil.',
          grants: {
            items: [
              {
                name: 'Blackthorn & Raven Quill wand',
                description:
                  'Nine and a half inches of dark, knotted blackthorn around a raven\'s flight quill. Light seems to slide off it. Its affinity is glamours and concealment; it taught you Velum the moment you touched it.',
                tags: ['wand', 'focus', 'glamours'],
              },
            ],
            skills: [
              {
                name: 'Velum',
                level: 1,
                description:
                  'Second Circle glamour, wand-born: draw a veil that makes eyes slide past you. Lv1: unnoticed by a distracted passerby for a minute while you stay still and quiet. It grows into walking unseen through a crowd, then changing the face people remember. Running water strips it away; dogs and Tidebound are hard to fool.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Wick Farrow',
              shortDescription:
                "Wandbearer (Blackthorn & Raven Quill). Twenties, slight, a grin with a chipped tooth, a too-big parka with a dozen pockets, and the habit of appearing at your elbow mid-sentence.",
              faction: TALLYMEN,
              location: 'The Undermarket',
              notes:
                "**Wand:** Blackthorn & Raven Quill, the wand the player passed over. **Signature spell:** Velum, about Lv3; he was a pickpocket before his magic woke and now he is the best thief in the city. **Want:** to get rich and get out from under the Tallymen, who own his debts. **Serves:** Mr. Tuesday, as a courier, burglar, and spy. **Toward the player:** friendly, funny, and stealing from them inside a week. Can be turned with money or kindness. **Clue he holds:** he was hired to break into the late Archon's townhouse the night she died and found the study already searched, her desk drawer open and empty, and a smell of cloves and sea-salt in the room.",
            },
          },
        },
        {
          id: 'hawthorn_seal',
          label: 'HAWTHORN & SEAL WHISKER',
          summary: 'Steady, loyal, slow to strike. Its spell is Murus, the shield.',
          grants: {
            items: [
              {
                name: 'Hawthorn & Seal Whisker wand',
                description:
                  'Ten inches of reddish hawthorn, smooth as river stone, around a single grey seal whisker. It is warm in the hand and heavier than it looks. Its affinity is wards and protection; it taught you Murus the moment you touched it.',
                tags: ['wand', 'focus', 'wards'],
              },
            ],
            skills: [
              {
                name: 'Murus',
                level: 1,
                description:
                  'Second Circle ward, wand-born: a shimmering pane of force. Lv1: a shield the size of a door that turns one hex or blow, then shatters. It grows into a ward that holds through a fight, then a dome over several people, and at last a ward on a building that lasts a season. Holding it costs merelight every moment.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Priya Lindqvist',
              shortDescription:
                "Wandbearer (Hawthorn & Seal Whisker). Twenty-three, tall, a cadet Warden's grey coat a size too large, a tight bun, and a notebook she actually writes in.",
              faction: CHARTER,
              location: 'Tollgate Row',
              notes:
                "**Wand:** Hawthorn & Seal Whisker, the wand the player passed over. **Signature spell:** Murus, about Lv2. **Before:** a public-defender's paralegal; her magic woke the same night as the player's. The Wardens recruited her on the spot because the Charter is short of officers. **Want:** to believe the Charter is worth defending, and to be the kind of Warden who protects people instead of binding them. **Serves:** Acting Archon Dagny Holmqvist, as her aide. **Toward the player:** by-the-book but fair; becomes a friend inside the Wardens if treated as a person. **Clue she holds:** filing the Archon's death report, she saw that the coroner's draft listed 'merelight: none detected'. The final report left that line out.",
            },
          },
        },
        {
          id: 'yew_ember',
          label: 'YEW & PIER NINE EMBER',
          summary: 'Proud, hungry, and burns hot. Its spell is Cinis, the naming fire.',
          grants: {
            items: [
              {
                name: 'Yew & Pier Nine Ember wand',
                description:
                  'Twelve inches of dark yew, scorched black at the tip, around a cinder from the Pier Nine Fire of 1910 that has never fully gone cold. It warms when you are angry and smokes when you lie. Its affinity is fire; it taught you Cinis the moment you touched it.',
                tags: ['wand', 'focus', 'fire'],
              },
            ],
            skills: [
              {
                name: 'Cinis',
                level: 1,
                description:
                  "Third Circle fire, wand-born: fire that burns only what you name. Lv1: a flame the size of a match that lights one thing you name and nothing else. It grows into a fire that eats a door and spares the house, then a blaze that burns one enemy in a crowd. Restricted by the Charter: holding it unlicensed is a crime, and the city has not forgotten the Pier Nine Fire.",
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Augustin Aldgrave-Vane',
              shortDescription:
                'Wandbearer (Yew & Pier Nine Ember). Twenty-five, golden-haired, a camel coat over a dueling-club sweater, signet ring, perfect teeth, and the ease of someone who has never paid for anything himself.',
              faction: ALDGRAVE,
              location: 'Aldgrave Hill',
              notes:
                "**Wand:** Yew & Pier Nine Ember, the wand the player passed over; his mother bought it for him the morning after, at three times the price, because she wanted it out of anyone else's hands. **Signature spell:** Cinis, about Lv3; he is a trained duelist with a dozen other spells. **Want:** to prove to his mother, Lady Cressida, that he can be her heir, and to be feared. **Serves:** the Aldgrave Society. **Toward the player:** contempt for a late bloomer with a better wand than he deserves, or a challenge to a formal duel under the old custom. **Clue he holds:** his mother keeps a pewter key on a chain under her collar and has started sleeping with a ward on her bedroom door since the Archon died.",
            },
          },
        },
        {
          id: 'driftwood_pearl',
          label: 'DRIFTWOOD & HARBOR PEARL',
          summary: 'Patient, and sees further than it should. Its spell is Speculum, the scrying.',
          grants: {
            items: [
              {
                name: 'Driftwood & Harbor Pearl wand',
                description:
                  'Ten and a quarter inches of silver-grey driftwood, worn smooth by the sea, with a black harbor pearl set in the grip. It is always slightly cool and smells of rain. Its affinity is seeing; it taught you Speculum the moment you touched it.',
                tags: ['wand', 'focus', 'seeing'],
              },
            ],
            skills: [
              {
                name: 'Speculum',
                level: 1,
                description:
                  "Second Circle seeing, wand-born: scry through still water. Lv1: in a bowl of water, a few seconds' blurred glimpse of a place you know well. It grows into watching a person you have met, then hearing as well as seeing, and at last a glimpse of what was there yesterday. Every look costs merelight, and other seers can feel a scrying eye on them.",
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Ada Morrow',
              shortDescription:
                "Wandbearer (Driftwood & Harbor Pearl). Thirties, soft-spoken, a cardigan with ink stains, round glasses, a clerk's pencil behind her ear. She works the counter at Kaske's Folios and remembers every customer's name.",
              faction: '',
              location: "Kaske's Folios",
              notes:
                "**Wand:** Driftwood & Harbor Pearl, the wand the player passed over; Isidore Kaske paid for it. **Signature spell:** Speculum, about Lv4: she can watch almost anyone she has met. **Secret (GM only):** she is a sworn member of the Vesper Circle and Kaske's eyes in the city. She watches the candidates, the Wardens, and anyone who buys an unusual spellbook. **Want:** a world where nobody has to hide, which she believes Kaske will build. **Toward the player:** warm, helpful, recommends good books, and reports everything they buy. **Clue she holds:** a bowl of still water on the shelf behind the counter that she glances at constantly. Customers who notice it feel watched.",
            },
          },
        },
        {
          id: 'ironwood_lodestone',
          label: 'IRONWOOD & LODESTONE',
          summary: 'Stubborn. Opens what is shut. Its spell is Reserare, the unsealing.',
          grants: {
            items: [
              {
                name: 'Ironwood & Lodestone wand',
                description:
                  "Nine inches of dense, dark ironwood around a splinter of lodestone. Keys and coins drift toward it on a table. It is the only wand Ilse Marchetti's grandmother made that never sold. Its affinity is opening and unbinding; it taught you Reserare the moment you touched it.",
                tags: ['wand', 'focus', 'unbinding'],
              },
            ],
            skills: [
              {
                name: 'Reserare',
                level: 1,
                description:
                  'Third Circle unsealing, wand-born: open what is shut. Lv1: unlock any simple lock you touch, or loosen a knot or a jammed door. It grows into opening warded doors, then unpicking another mage\'s ward, and at last undoing bindings, curses, and seals. The bigger the seal, the more it costs, and some seals are holding something in.',
              },
            ],
          },
          ifNotChosen: {
            npc: {
              name: 'Felix Brandt',
              shortDescription:
                'Wandbearer (Ironwood & Lodestone). Forties, heavy-set, a beard going grey, a moth-eaten tweed jacket over a Harrowmere Port Authority sweatshirt, and a ring of keys on his belt that do not fit anything.',
              faction: '',
              location: 'Pier Nine',
              notes:
                "**Wand:** Ironwood & Lodestone, the wand the player passed over. **Signature spell:** Reserare, about Lv3. **Before:** a harbor salvage diver who half-believed in magic until his woke. Now he is a freelance curse-breaker who will open anything for a fee. **Want:** money, and to find out what is sealed in the flooded cellars under Pier Nine. **Serves:** no one, and every faction is bidding for him: an unsealer can open the Hushstone vault without a key. The Vesper Circle wants him most. **Toward the player:** gruff, honest, and a good teacher if paid. **Clue he holds:** opening an old door under Pier Nine, he found three keyholes carved around an empty stone socket, and one of them was shaped exactly like a pewter key.",
            },
          },
        },
      ],
    },
  ],

  worldBible: `# Harrowmere

**Harrowmere** is a rainy coastal city of a million people: container cranes on the south bay, glass towers downtown, brick row houses climbing the hills, neon smeared across wet asphalt, and a harbor fog that rolls in most evenings. Under that ordinary surface lives a hidden society of a few thousand **kindled** (magic-users) who carry wands, trade spells, duel under old customs, and are bound to secrecy by the **Quiet Charter of 1911**.

The player character is an adult whose magic woke late, twenty-three nights ago, on the same night the city's Archon died. There is no school for them. There are shops, tutors, rivals, and a city full of people who want something. The story starts with getting a wand. Every spell after that must be found, bought, earned, or won.

The world is open. Offer hooks (a vendor's new stock, a tutor's offer, a faction's request, a rival's challenge, the Archon's mystery) and let the player choose. The faction war moves on whether they engage or not.

## The opening: the wand chooses
- The campaign opens in **Marchetti & Daughters, Wandwrights**, in the Lantern Arcade, at about ten at night. The play screen has already shown the player the shop's panel with six wands as buttons. Do not repeat the menu in prose. Set the scene briefly around it: Ilse Marchetti has laid six long boxes open on the counter, and all six wands are trembling. The shop smells of sawdust, beeswax, and ozone. If the player asks questions first, answer as Ilse (dry, exact, a little in awe) and let them handle the wands.
- **When the player picks**, call \`lock_choice\` that same turn. Then make the wand real gear: \`update_item\` on the wand with grade 1, usage "wielded", and enhances [its signature spell, and Wandwork]; then \`equip_item\`. Narrate the bond: warmth up the arm, the wand's tint flaring, and a word arriving in the character's mind fully formed (the signature spell). The shop's lamps all flicker once.
- **Payment.** A wand like these costs about 1,800 dollars. The character's Charter wand voucher covers 900 (\`remove_item\` it); Ilse lets them owe the rest, 900 dollars, payable within three months. Note the debt in your story notes. She will collect.
- **The other wands.** \`lock_choice\` brings the people who end up with the five passed-over wands into the world, offscreen. The result names them. Write them into your story notes right away (who they are, where they are, what they want, and when they might first cross the player's path). Each serves or is courted by a faction. Bring them in one at a time: a rumor, then a sighting, then a meeting. Rivals with matched wands feel each other's presence in a room.
- **The choice is permanent.** A wand bonds once. If the player tries another wand later, it is dead wood in their hand.

## Wands
- **Every kindled caster needs a wand for real spellwork.** Without one, they can manage only wandless workings (raw sparks, warmth, a push, using Merelight Shaping) at one difficulty step harder and double the Veilsickness, and no spell above the First Circle.
- **Pass the wand as \`using\` on every spell check.** Its grade adds to the spells it enhances. A wand **attunes** as it is used: raise it to Grade II once the character has used it hard in real danger several times, Grade III after a season of mastery, and higher only through legendary deeds or a wandwright's rework. When the character learns a spell that suits the wand's affinity, add it to what the wand enhances (up to four).
- **Losing it.** A wand can be disarmed (a Dimitto hex), stolen, confiscated by the Wardens, or snapped. A snapped wand is a wound: "Wandbroken" (all -1 until replaced or repaired). Ilse can repair most breaks for 300 to 1,500 dollars; a new wand never bonds as well as the first (Grade 0, and it starts attuning again).
- **Wand law.** The Charter requires every wand to be registered at Tollgate Row. Unregistered wands are confiscated, and so are wands bearing restricted signature spells (Cinis, Reserare) without a license.

### The six wands
| Wand | Affinity | Signature spell | If passed over |
| Rowan & Stormglass | hexes | Fulmen (lightning hex) | Kit Hask, Tidebound |
| Blackthorn & Raven Quill | glamours | Velum (veil) | Wick Farrow, the Tallymen |
| Hawthorn & Seal Whisker | wards | Murus (shield) | Priya Lindqvist, the Wardens |
| Yew & Pier Nine Ember | fire | Cinis (naming fire; restricted) | Augustin Aldgrave-Vane, the Aldgrave Society |
| Driftwood & Harbor Pearl | seeing | Speculum (scrying) | Ada Morrow, secretly the Vesper Circle |
| Ironwood & Lodestone | opening | Reserare (unsealing; restricted) | Felix Brandt, freelance, courted by everyone |

## Spells
Every spell is a **skill** named for its incantation (\`skill_check\` on "Murus", "Lucent", and so on). Its level is how well the character knows it. A spell the character doesn't know can't be cast, though a spell scroll can be read once to cast it (below).

### Learning spells
A spell needs a **source**, then practice:
- **Spellbooks (folios)** from Kaske's Folios and other vendors: one spell each, with diagrams and drills. An evening's study, then \`pass_time\` training the spell by name (a new discipline, learned at level 0).
- **Tutors** teach faster: pass the tutor to \`pass_time\` as the teacher. Ottoline Sarrazin charges 60 dollars an hour and knows wards, charms, and hexes up to the Third Circle. Felix Brandt teaches unbinding. Other tutors can be found and hired.
- **Scrolls** from the Scrivenery: a spell written out in charged ink. Reading one aloud casts the spell once, at level 3, wand or no wand, and burns the scroll (\`remove_item\`). Studying a scroll instead of casting it teaches the spell, but slowly (no teacher bonus).
- **Found spells:** grimoires in the flooded cellars of Pier Nine, a dead mage's library, a Tidebound song, an Aldgrave family book stolen off a shelf. Treat as a spellbook.
- **Duel-right:** under the old dueling custom, the winner of a formal duel may claim one spell the loser knows, and the loser must teach it (a week of lessons). Refusing is a disgrace no kindled family survives.
- When the character learns a new spell, add it with \`pass_time\` training as above, and give the spellbook or scroll a "studied" tag. Narrate the first successful cast as a small wonder.

### Proficiency
| Spell level | What it means |
| 0 | learned, unreliable: always at least medium difficulty |
| 1-2 | spoken incantation and a clear gesture; a few seconds to cast |
| 3-4 | reliable and quick; works in a fight |
| 5-6 | **nonverbal**: cast with the wand alone, silently (much easier to hide from the Daylit) |
| 7-9 | stronger, wider, longer: more targets, more range, held effects |
| 10 | mastery: invent variants of the spell |

### Circles (legality and difficulty)
- **First Circle:** everyday charms, sold openly. Difficulty easy at level 1.
- **Second Circle:** dueling, warding, and glamour spells. Sold with a Charter permit (Tollgate Row issues one for 150 dollars and a registration interview), and at the Undermarket without one. Difficulty medium at level 1, easy from level 3.
- **Third Circle:** restricted. Legal only for licensed Wardens and the old families' private libraries; otherwise found, stolen, or bought at the Undermarket for thousands. Difficulty hard at level 1, medium from level 4.
- **Forbidden:** never sold, never taught openly. Casting one is a binding offense. Difficulty extreme until level 5, and each cast leaves a permanent mark (a "Forbidden Mark" condition the Wardens can detect).

### Spell catalogue (common spells; invent more in the same style)
| Spell | Circle | Effect | Where, and price |
| Lucent | First | light from the wand tip | any folio shop, 30 |
| Tersus | First | clean and dry (a coat, a room, a bloodstain) | Kaske's Folios, 40 |
| Calor | First | warmth: a room, a cup, cold hands | Kaske's Folios, 40 |
| Sutura | First | mend a broken object (a cracked phone, a torn coat) | Kaske's Folios, 80 |
| Ferre | First | summon a small object within sight to the hand | Kaske's Folios, 120 |
| Quietus | First | muffle all sound around the caster | Kaske's Folios, 120 |
| Vestigo | First | reveal recent footprints and the faint tint-trail of magic | Kaske's Folios, 150 |
| Clavis | First | open a simple lock | Kaske's Folios, 60 |
| Torpor | Second | stunning hex: a target slumps unconscious for minutes | Kaske's (permit) 600; Undermarket 900 |
| Dimitto | Second | disarming hex: the target's wand or weapon flies from their hand | Kaske's (permit) 700; Undermarket 1,000 |
| Vinculum | Second | ropes of light that bind a person | Kaske's (permit) 800 |
| Murus | Second | shield ward | Kaske's (permit) 900 |
| Velum | Second | veil: go unnoticed | Undermarket only, 1,200 |
| Medela | Second | close wounds, set bones (restores HP) | Thessaly's Apothecary sells the folio, 1,000 |
| Ianua | Second | ward a door so it opens only for the caster | Kaske's (permit) 700 |
| Speculum | Second | scry through still water | Kaske's by order, 1,500 |
| Fulmen | Second | lightning hex | Undermarket, 1,500 |
| Vox Longa | Third | speak into the ear of someone across the city | Aldgrave libraries; Undermarket 3,000 |
| Transmuto | Third | turn one substance into another, briefly (stone to water, iron to wood) | Undermarket 4,000 |
| Nebula | Third | blur a Daylit's memory of the last hour (Wardens only) | Wardens; Undermarket 5,000 |
| Cinis | Third | fire that burns only what is named | never sold; Pier Nine grimoires |
| Reserare | Third | unsealing | Felix Brandt teaches it, at a price |
| Hollowing | Forbidden | draw merelight out of a living person | Vesper Circle |
| Dominus | Forbidden | compel a person's body for a minute | Vesper Circle; the oldest Aldgrave books |
| Sever | Forbidden | cut a hearthkin bond or break a binding by force | Pier Nine's deepest cellar |

Prices drift with the war: Second Circle hexes double at the Undermarket once open fighting starts.

### Casting costs: merelight and Veilsickness
Every spell draws on **merelight**, the caster's inner reserve, which refills with rest, food, and sleep over about a day. Track overdrawing with conditions:
- A few small spells in a scene: free.
- A hard fight's worth of casting, a big working, or any Third Circle spell: "Veilsick" (all -1, 8 turns): a nosebleed and a metallic taste.
- Casting while already Veilsick: make it all -2 (tremors, color draining from sight, the rain as a roar), and costs HP (\`adjust_hp\`).
- Past that: collapse, and days of recovery. Repeated collapses can permanently dim a person's merelight (a lasting condition).
- Iron slows workings (one difficulty step harder inside iron cages or with iron touching the caster). Running water unravels glamours.

## Shops and vendors
The character gets spells, potions, and gear by visiting vendors and paying (\`adjust_money\`, \`add_item\`). Keep stock specific and prices honest, and give each shop a reason to come back: new stock, a sale, a rumor, a favor.
- **Marchetti & Daughters, Wandwrights** (Lantern Arcade; Ilse Marchetti): wands (basic 400, fine 1,500, bespoke 5,000), repairs, holsters (60), wand oil, and attunement advice.
- **Kaske's Folios** (Lantern Arcade; Isidore Kaske and Ada Morrow): spellbooks of the First and Second Circles (see the catalogue), special orders in a week, used theses, and city gossip. Kaske takes an interest in customers who buy unusual books.
- **The Scrivenery** (Lantern Arcade; Agnes Pruitt, ancient and nearly blind): one-use spell scrolls at about twice the folio price for First and Second Circle spells; a Third Circle scroll if she likes you, for a favor rather than money.
- **Thessaly's Apothecary** (Lantern Arcade): draughts. Healing draught 150 (restores HP), clear-head tonic 80 (removes Veilsick), nightsight drops 40, a sleeping draught 30, and ingredients for the clever.
- **Bellweather's Curios** (Lantern Arcade): charms and oddities. A warding charm 120 (Grade I, worn, enhances Murus or any ward), a finding-compass 300, a pocket that holds more than it should 900, and things Bellweather won't explain.
- **The Undermarket** (the Ardwick Street garage, after midnight): restricted spells, scrolls of the Third Circle, unregistered wands (600 and up, no bond guaranteed), stolen grimoires, black-market draughts. Every deal is final. The Tallymen take a cut of everything.
- **Tutors:** Ottoline Sarrazin (Mirabel's back booth, 60 an hour), Felix Brandt (Pier Nine, unbinding), and anyone the character can persuade, bribe, or beat in a duel.

## Money
Ordinary dollars. A coffee costs 4, a diner meal 15, a cab across town 25, a month's rent 1,600. Ways to earn: locksmith work (the character's day job, 80 to 300 a call), jobs for the factions (200 to 2,000), Undermarket errands, curse-breaking, bounties. The factions pay well, and they remember who took their money.

## The hidden city
- **The Daylit**: non-magical people. Most who glimpse magic forget within hours, thanks to **the Hush**: a city-wide working anchored in the **Hushstone**, a block of black harbor basalt in a vault beneath Tollgate Row. The Hush blurs the Daylit's memories of magic. Since the Archon died, it has been failing: Daylit are starting to remember, and videos are starting to stay up. Every public spell is a bigger risk each week.
- **The Charter's three commandments:** never work magic in front of the Daylit, never record it, never sell it to them. Registration of every kindled person and every wand is mandatory.
- **Social customs:** asking someone their tint (the color and scent of their magic) is intimate. Never ask a Tidebound to shift for you. Never touch another person's wand or hearthkin. A formal duel is called by naming the duel-right in front of a witness; refusing a duel is allowed, but costs face.
- **Hearthkin:** a kindled person may be chosen by an animal companion, for life. The bond eases Veilsickness and lets the pair share senses. The character has none yet; something has been watching them (a gull, a cat, a crow). The bond, if it comes, should come at a moment of real danger. The Calling-Stones are where Tidebound lore says the unbonded meet theirs.

## Factions and the war for the empty seat
The character's standing with four factions is tracked (Faction reputation, in the current state). Change it with \`adjust_reputation\` when their deeds reach the faction. Any NPC whose faction matches acts on it.

**The situation.** Twenty-three days ago, **Archon Theodora Vance**, who ruled the Charter for thirty-one years and kept the Hushstone, died at her desk. The official cause is a stroke. Under the Charter, the **Winter Tide Conclave** (about 60 days after the campaign begins; track the countdown in your story notes) will confirm a new Archon, who will hold the Hushstone and the power to bind any kindled in the city. Everyone is reaching for that seat.

### Charter Wardens (open)
The Charter's police: about thirty officers in grey coats with iron rings, at Tollgate Row. **Acting Archon Dagny Holmqvist** holds the city together and is a candidate herself. The Wardens issue permits and licenses, confiscate illegal wands, and can impose a **binding** (sealing someone's magic for years). Underfunded, overstretched, and partly bought by the Tallymen.
- 20+: permits waved through, a Warden contact, warnings before raids. 40+: deputized, with a license for restricted spells. -20: watched, searched, wand checked at every stop. -50: a warrant and a binding hearing.

### Aldgrave Society (open)
The old-money families of the hill district: private tutors, private libraries, and the majority of the Charter council. **Lady Cressida Aldgrave-Vane** is openly campaigning for Archon, promising order: wand licensing for late bloomers, mandatory binding for the unstable, and the Tidebound put back in their place. She buys votes with money and favors, and she is very good at it.
- 20+: invitations to salons, introductions, access to a family library (Third Circle spells, for a price). 40+: patronage, a sponsor's purse, a seat at the table. -20: doors closed, prices raised, lawyers. -50: Aldgrave duelists call the duel-right on the character until one of them wins.

### The Tidebound (open)
The shapeshifter lineages of the harbor: Roan (seals), Cawdry (crows), Hask (wolves), and smaller lines. They signed the Charter in 1911 only after the Wardens burned their meeting hall, and they hold the Skerrows under a separate treaty, the **Brineledger**. They want a Tidebound Archon, or the Charter voided. The elders, led by **Brannagh Coyle**, are negotiating; the Hask youth, led by **Tamsin Hask**, want war now.
- 20+: safe passage in the Skerrows, Tidebound songs (spells of their own), boats. 40+: called kin; the Tidebound will fight for the character. -20: watched from every piling. -50: hunted on the water.

### The Tallymen (covert)
The syndicate that runs the Undermarket, the black spell trade, and half the city's kindled debts. Led by **Mr. Tuesday**, who never wears the same face twice. They act openly as merchants and covertly as kingmakers: bribing Wardens, funding the Hask youth's weapons and Aldgrave's campaign at the same time, because war is good for business and a grateful Archon is better.
- 20+: good prices, credit, jobs that pay. 40+: a partner: introductions to Mr. Tuesday, and Wardens who look away. -20: prices doubled, deals refused. -50: a debt called in with interest, by people who break fingers.

### Being seen
Public spellwork spreads: phones are everywhere and the Hush is failing. Add or update a permanent "Known Kindled" condition with what people know. The Wardens notice first, then the factions, then the Daylit press.

### How the war escalates (if no one stops it)
Show it through news, rumors, and the street. The player can change any of it.
| Day | Event |
| 3 | Ewan Hask, nineteen, is found dead on the Skerrows rail tracks, burned by a fire-hex; there is Aldgrave sigil-ash on the body (The Blood on the Skerrows). |
| 10 | Hask youth burn an Aldgrave boathouse. Cressida demands emergency bindings. |
| 20 | Wardens raid the Undermarket on a Tallymen tip, to remove a rival dealer. Prices spike. |
| 30 | An Aldgrave councilor is hexed in his car on a busy street. A Daylit video stays up for six hours. |
| 40 | The Tidebound void the Brineledger. The harbor closes to outsiders; skirmishes on the water. |
| 50 | An attempt on Dagny Holmqvist's life, or her arrest on planted evidence. |
| 60 | The Winter Tide Conclave, and the Vesper Circle's move on the Hushstone. |

## GM ONLY: the truth
Reveal none of this early. Clues come from the Archon's letter, the rivals' clue notes, Pier Nine, the Hushstone vault, and careful investigation.
- **The Archon was murdered.** The Vesper Circle hollowed her (drew out all her merelight) at her desk; the coroner's draft said "merelight: none detected" and the final report was altered by a bribed Warden. The killers took her pewter key.
- **The Hushstone and the three keys.** In 1911 the Hushstone's vault was sealed with three pewter keys: one for the Archon, one for the head of the Aldgrave Society, and one for the Tidebound. Opening the vault with all three lets the holder reforge the Hush, or break it. The Tidebound key was thought lost in 1911. **It is the character's grandmother's pewter key**: she was a Roan girl who left the Skerrows, and she kept it. It went cold the night the Archon died because the Stone it answers to was wounded. Cressida holds the Aldgrave key. The Vesper Circle holds the Archon's.
- **Why the character woke.** The Archon's life was bound into the Hushstone as its keeper. When she died, the Stone cracked, and dozens of latent kindled across the city woke at once. More will wake as it fails.
- **The Vesper Circle** is the real hand behind the war: a covert society of kindled who believe the Charter's secrecy is a cage and that magic belongs to everyone. Its head is **Isidore Kaske**, the beloved spellbook dealer. It killed Ewan Hask with a stolen Aldgrave signet as its focus to start the war, so the Conclave collapses and the vault is left unguarded. Its plan for the Winter Tide: open the vault (with three keys, or with an unsealer like Reserare) and **break the Hushstone**. The Hush would fail at once: every Daylit in Harrowmere would remember everything, every latent kindled would wake, and the hidden city would end in a single night. Kaske believes it would be freedom. It would also be a riot, a manhunt, and a new Pier Nine Fire.
- **Kaske's books.** The Circle's deeper teachings are hidden in Kaske's Second Circle folios as marginal "drills". A student who practices them for a season learns that their merelight can be lent to the Circle's workings at a distance. Kaske knows every customer who has.
- **What each faction does if it wins:** Dagny keeps the Charter as it is, honestly and weakly. Cressida binds every unstable late bloomer and the Tidebound go to war. A Tidebound Archon voids the Charter and reforges the Hush as a treaty among equals. A Tallymen puppet sells the Hush to the highest bidder. The Circle breaks it.
- Endings, all valid: put a candidate in the seat; take it yourself; reforge the Hush with the three keys; break it with the Circle or stop them; void the Charter with the Tidebound; or make enough money and friends to survive whatever comes.

## Narrator rules for this world
- Wonder and noir in equal measure. Magic is beautiful and costly. People are complicated, and the ones who do the most harm usually believe they are helping.
- Spells are earned. The character starts with one spell (their wand's) and must work for every other. Make shopping, studying, and practicing feel rewarding: the first time a new spell works should land.
- Never railroad. The war moves on schedule; the player chooses where to stand.
- Duels are formal, dramatic, and fair: a bow, a witness, wands raised, the first hex, the counter. Use \`skill_check\` for each exchange.
- Keep the Daylit city present: bystanders, cameras, phones. Concealment is always a factor.
- Only what the scene needs: look things up with the read tools rather than assuming.
`,

  narratorStyle: `- Second person, present tense ("You come up the arcade steps into the rain...").
- Noir with wonder: rain, neon, fog horns, wet concrete, sodium light, wand-light in an alley. Let magic break into the ordinary city with color and awe.
- Every spell has a tint, a sound, and a feel: describe the wand warming, the incantation, the light, and the Veilsickness after.
- Shops are places of delight: the smell of old paper and beeswax, labels in faded copperplate, a vendor who knows exactly what you need and charges for it.
- 150 to 350 words per turn. Shorter in duels and fights, longer for arrivals, first casts, and revelations.
- NPCs speak in distinct voices. Ilse Marchetti is dry, exact, and secretly sentimental about her wands. Isidore Kaske is warm, erudite, and generous, and asks one question too many. Ottoline Sarrazin answers questions with better questions. Suvi Adeyemi talks fast, jokes when frightened, and texts in all lowercase. Dagny Holmqvist is flat and procedural and asks the same question three ways. Lady Cressida is gracious and never once raises her voice. Brannagh Coyle is slow and formal, with the rhythm of a sea shanty. Tamsin Hask is all edges. Oriel Sachs quotes prices mid-sentence. Mr. Tuesday is polite, patient, and wears a different face each time.
- Show the war through the city: a headline the Hush didn't catch, a burned boathouse, a group chat, a Warden checkpoint on the bridge.
- End on something the player can act on: a question, a choice, a text lighting up the screen, a wand warming in the pocket.
`,

  locations: [
    {
      name: 'Harrowmere',
      description:
        'A rainy harbor city of a million people: container cranes on the south bay, glass towers downtown, brick row houses climbing the hills, and fog every evening. The hidden city of the kindled runs through it like a second grain in the wood.',
      purpose:
        'The campaign\'s world and the board the factions are fighting over. Shows the faction war breaking into ordinary life and the Hush failing week by week.',
      tags: ['city', 'harbor', 'hub'],
    },
    {
      name: 'The Lantern Arcade',
      description:
        "A covered Victorian shopping arcade hidden behind a shuttered shoe-repair shop in the Old Market district. Tap the cobbler's bell three times and the back wall opens onto a glass-roofed passage lit by floating lanterns: a wandwright, a spellbook dealer, a scroll-scrivener, an apothecary, a curio shop, and a tea room, all wet with rain dripping through the old glass.",
      purpose:
        'The heart of the spell trade and the place to shop: wands, spellbooks, scrolls, draughts, and charms. Neutral ground where every faction shops and spies. Kaske\'s Folios is here, so the Vesper Circle watches everyone who buys.',
      tags: ['market', 'shops', 'hidden', 'neutral'],
      parent: 'Harrowmere',
    },
    {
      name: 'Marchetti & Daughters, Wandwrights',
      description:
        'A narrow shop of floor-to-ceiling drawers, each holding a wand in a long box. A workbench of lathes and gouges at the back, sawdust underfoot, a cat asleep on the ledger, and a brass bell over the door that rings a moment before anyone touches it.',
      purpose:
        "Where the campaign begins: the wand choice. Ilse Marchetti sells, repairs, and attunes wands, and the character owes her 900 dollars. She knows which hands every wand she ever sold went to, which makes her shop a target in a war.",
      tags: ['shop', 'wands', 'start'],
      parent: 'The Lantern Arcade',
    },
    {
      name: "Kaske's Folios",
      description:
        'A three-storey bookshop of creaking stairs and leaning shelves, smelling of old paper, ink, and cloves. Spellbooks of the First and Second Circles in labeled bays, a reading nook by a coal fire, and a locked case of special orders behind the counter.',
      purpose:
        "The main source of spells, and the Vesper Circle's front. Isidore Kaske is the city's most beloved spell dealer and secretly its most dangerous man. Ada Morrow (if in play) watches every customer through a bowl of still water. Kaske's deeper folios hide the Circle's drills in their margins.",
      tags: ['shop', 'spells', 'books', 'secret'],
      parent: 'The Lantern Arcade',
    },
    {
      name: 'The Undermarket',
      description:
        'A night market on the lowest four levels of the Ardwick Street parking garage, midnight to dawn. Stalls built from car trunks and folding tables, string lights and glowing jars, restricted folios behind curtains, unregistered wands in velvet rolls. A glamour shows the Daylit attendant only empty concrete.',
      purpose:
        "The Tallymen's market: restricted and forbidden spells, Third Circle scrolls, black-market draughts, debts, and jobs. Oriel Sachs deals here. Rules: no workings against another buyer, no Wardens in uniform, every deal final. Raided around Day 20.",
      tags: ['market', 'black-market', 'tallymen', 'night'],
      parent: 'Harrowmere',
    },
    {
      name: "Mirabel's",
      description:
        'A 24-hour diner on a corner near the Old Market, with red vinyl booths, bottomless coffee, and rain streaming down the plate glass. Mirabel is Daylit and has decided not to ask why so many customers have chalk on their hands at 3 a.m.',
      purpose:
        "Neutral, Daylit, and safe: Ottoline tutors in the back booth, Suvi waits for the character after shifts, and nobody from the factions makes a scene in front of Mirabel. A place for quiet character scenes and secret meetings.",
      tags: ['diner', 'safe', 'daylit', 'tutoring'],
      parent: 'Harrowmere',
    },
    {
      name: 'Tollgate Row',
      description:
        "The Charter Wardens' headquarters: a squat granite building with a faded water board sign over the door. Fluorescent lights, file cabinets, a holding cell with iron bars, and the original 1911 Charter in a glass case, the Tidebound signatures scorched at the edges. A locked iron stair goes down.",
      purpose:
        "The law, permits, licenses, wand registration, and binding hearings. Acting Archon Dagny Holmqvist and Priya Lindqvist (if in play) are here. The iron stair leads to the Hushstone vault, sealed with three keyholes. The Conclave meets in the council chamber upstairs.",
      tags: ['wardens', 'charter', 'government', 'hushstone'],
      parent: 'Harrowmere',
    },
    {
      name: 'Aldgrave Hill',
      description:
        'The old district on the hill above the harbor: gaslit streets, iron railings, stone townhouses with warded doors, a private dueling club, and gardens where it somehow rains less. Vane House, at the top, glows in every window.',
      purpose:
        "The Aldgrave Society's seat: salons, vote-buying, private libraries of Third Circle spells, and the dueling club where the duel-right is called. Lady Cressida campaigns from Vane House and keeps the Aldgrave key on a chain under her collar. Augustin (if in play) duels here.",
      tags: ['aldgrave', 'wealthy', 'politics', 'dueling'],
      parent: 'Harrowmere',
    },
    {
      name: 'The Skerrows',
      description:
        'A strip of old wharves and warehouses on the north harbor, held by the Tidebound for a century. Fishing boats, a smokehouse, a boxing gym, a bar with no sign. Seals on the pilings at dusk, crows on the power lines. At the end of the longest pier stands the Moot House, where the elders meet.',
      purpose:
        "Tidebound territory: Brannagh Coyle and the elders negotiate here; Tamsin Hask and the Hask youth gather in the boxing gym. Ewan Hask's body is found on the rail tracks nearby (Day 3). If the Brineledger is voided (Day 40), the Skerrows close to outsiders.",
      tags: ['tidebound', 'harbor', 'territory'],
      parent: 'Harrowmere',
    },
    {
      name: 'Pier Nine',
      description:
        'The blackened ruin of the guildhall pier that burned in 1910: charred pilings, a collapsed roof open to the rain, and below it, flooded cellars full of old guild libraries that no one has fully explored. Daylit kids dare each other to go in; most hear singing and come back out.',
      purpose:
        'The place to find spells: lost grimoires, Third Circle and Forbidden texts, and old guild treasures in the flooded cellars, guarded by old wards and things that live in the dark water. Felix Brandt (if in play) dives here. The Vesper Circle meets in its deepest dry room.',
      tags: ['ruins', 'dungeon', 'spells', 'dangerous'],
      parent: 'Harrowmere',
    },
    {
      name: 'The Calling-Stones',
      description:
        'A line of barnacled standing stones on a mudflat north of the Skerrows, underwater except at the lowest tides. When the water draws back they stand in the fog like patient people, and seals watch from the shallows.',
      purpose:
        "Where the unbonded are said to meet their hearthkin, and where the Tidebound once kept their key in a stone box (empty since 1911). The returning tide limits any scene here.",
      tags: ['tidebound', 'hearthkin', 'tidal', 'mystery'],
      parent: 'Harrowmere',
    },
  ],

  npcs: [
    {
      name: 'Ilse Marchetti',
      shortDescription:
        'The wandwright. Sixties, small and wiry, grey hair pinned up with a pencil, magnifying spectacles pushed up on her forehead, sawdust on her apron, and long scarred fingers that are never still.',
      faction: '',
      location: 'Marchetti & Daughters, Wandwrights',
      notes:
        "**Want:** to keep her shop neutral and her wands out of the war, which is impossible now. She has never seen six wands stir for one customer and is a little afraid of what it means. **Knows:** every wand she has sold and whose hand it went to, which every faction would love to have. The Ironwood & Lodestone wand was her grandmother's, made in 1911 'for the night the stone needs opening'. **Money:** the character owes her 900 dollars, due in three months; she is patient and she does collect. **Offers:** repairs, attunement, an honest opinion, and, if trust is high, a commission for a second wand that does something no wand should.",
    },
    {
      name: 'Isidore Kaske',
      shortDescription:
        "Proprietor of Kaske's Folios. Fifties, tall and stooped, a silver beard, half-moon glasses, a waistcoat with ink stains, and a voice like a favorite teacher's. Recommends exactly the right book every time.",
      faction: '',
      location: "Kaske's Folios",
      notes:
        "**Public face:** the city's most beloved spell dealer, neutral in the war, generous with credit to late bloomers. **Secret (GM only):** head of the Vesper Circle. He hollowed the Archon himself and holds her pewter key. He arranged Ewan Hask's death to start the war. He believes the Hush is a cage and that breaking the Hushstone will free everyone. **Want:** the other two keys, or an unsealer, by the Winter Tide. **Toward the player:** delighted by them, offers credit and rare books, and quietly tests whether they could become one of his. If he learns about the pewter key, he becomes their most patient enemy. **Tell:** he smells of cloves and sea-salt, the same as the Archon's study the night she died.",
    },
    {
      name: 'Ottoline Sarrazin',
      shortDescription:
        "A freelance tutor of spellwork. Sixties, silver hair cut short, reading glasses on a chain, a cardigan with chalk on the sleeves, a one-eyed tomcat named Pilot who sleeps in her bag. Teaches in the back booth at Mirabel's.",
      faction: '',
      location: "Mirabel's",
      notes:
        "**Before:** thirty years as the Wardens' instructor of dueling and wards; retired five years ago. **Offers:** lessons at 60 dollars an hour in wards, charms, and hexes up to the Third Circle. She takes late bloomers when nobody else will. **Want:** the truth about Theodora Vance's death; they were friends for forty years. **Secret:** the day after the Archon died, Ottoline received a letter in Theodora's hand, postmarked that morning: 'If I am dead, it was not my heart. Find the third key before they do.' She gives the Archon's Last Letter mission once she trusts the character. Fair, demanding, and generous with praise when it is earned.",
    },
    {
      name: 'Suvi Adeyemi',
      shortDescription:
        "A late bloomer who woke a year ago and the character's friend. Late twenties, braids under a knit beanie, hospital scrubs under her raincoat (a night-shift nurse), and a sharp-eyed rat named Dumpling, her hearthkin, in her hood.",
      faction: '',
      location: "Mirabel's",
      notes:
        "**Spells:** Lucent, Sutura, and Medela at Lv2; she is saving for Murus. **Want:** to get by, keep her day job, and stay out of the war. **Problem:** she owes the Tallymen 2,000 dollars for the Medela folio, and they have started asking her for favors instead of money (information about patients who come in with burns that aren't burns). **Toward the player:** loyal, funny, and the person who shows them the ropes of the hidden city. Will confess the debt if they are kind or if it goes wrong.",
    },
    {
      name: 'Dagny Holmqvist',
      shortDescription:
        "Acting Archon and Warden-Commander. Fifties, tall and angular, grey trench coat, cropped blonde hair, a Warden's iron ring on her thumb, and the look of someone who has not slept since the funeral.",
      faction: CHARTER,
      location: 'Tollgate Row',
      notes:
        "**Want:** to hold the city together until the Conclave and to be confirmed Archon, because she believes the alternatives are worse. **Problem:** a third of her officers take Tallymen money and she doesn't know which third. **Toward the player:** ran their registration interview after their magic woke; considers them an exposure risk, and says so on the record. Honest, procedural, and immovable. **Secret:** she suspects the Archon was murdered but can't prove it, and she has kept the vault under the building watched every night since.",
    },
    {
      name: 'Lady Cressida Aldgrave-Vane',
      shortDescription:
        'Head of the Aldgrave Society and candidate for Archon. Sixties, silver-blonde, pearls, a dove-grey suit, a gracious smile, and a voice she has never once needed to raise.',
      faction: ALDGRAVE,
      location: 'Aldgrave Hill',
      notes:
        "**Want:** the Archon's seat and an orderly city: wand licensing for late bloomers, mandatory binding for the unstable, the Tidebound kept to their wharves. **Methods:** open and legal: salons, endorsements, money, favors, and the threat of the duel-right. **Secret:** she holds the Aldgrave pewter key and is frightened since the Archon died, because she suspects someone is collecting keys. The Tallymen are funding her campaign; she thinks it is a donation. **Toward the player:** courteous, assessing; a useful late bloomer is someone to sponsor and own.",
    },
    {
      name: 'Brannagh Coyle',
      shortDescription:
        'Eldest of the Roan line of the Tidebound. Seventies, broad and weathered, a long white braid, a fisherman\'s sweater and sea boots, and dark, liquid, unblinking eyes.',
      faction: TIDEBOUND,
      location: 'The Skerrows',
      notes:
        "**Want:** a Tidebound voice in the Charter, or the Charter voided, without a war the Tidebound would lose. She is losing the youth to Tamsin Hask. **Knows:** the Tidebound key went missing in 1911 with a Roan girl, and she has looked at the character's pewter key once before and said nothing. **Gives:** the Blood on the Skerrows mission. **Toward the player:** distrusts outsiders; trades information for proof that someone outside the Tidebound cares. Remembers 1911 as if she had been there (her grandmother was).",
    },
    {
      name: 'Tamsin Hask',
      shortDescription:
        'Leader of the Hask youth. Mid-twenties, lean and scarred, a shaved head with a wolf tattooed behind one ear, a leather jacket, and a stillness that is worse than shouting.',
      faction: TIDEBOUND,
      location: 'The Skerrows',
      notes:
        "**Want:** revenge for her cousin Ewan and an end to the Charter, by force if necessary. She is the open face of the war. **Methods:** arson, ambushes on the water, wolves in the Aldgrave gardens at night. The Tallymen are quietly arming her pack with hex scrolls. **Toward the player:** a test of nerve; respects anyone who stands their ground, and hates being lied to. Could become an ally, or the war's first casualty.",
    },
    {
      name: 'Oriel Sachs',
      shortDescription:
        'An Undermarket dealer who runs her stall out of the trunk of a vintage green Jaguar. Forties, bleached crop, gold rings on every finger, a fake-fur coat, and a smile that definitely isn\'t fake.',
      faction: TALLYMEN,
      location: 'The Undermarket',
      notes:
        "**Sells:** restricted folios and scrolls, unregistered wands, black-market draughts, jobs, and information, all with the Tallymen's cut. **Want:** money, and to stay alive while her bosses play every side. **Gives:** Oriel's Errand, and more jobs if it goes well. **Secret:** she keeps a private ledger of who bought which forbidden spell, as insurance; Kaske's clerk bought Hollowing from her two months ago. She would sell that ledger for 3,000 dollars, a serious favor, or protection. **Toward the player:** they fixed her trunk lock once; she likes them, and she charges them anyway.",
    },
    {
      name: 'Mr. Tuesday',
      shortDescription:
        'The man who runs the Tallymen. Never the same face twice: an old man, a young woman, a delivery driver. Always a grey felt hat, always polite, always on Tuesday.',
      faction: TALLYMEN,
      location: 'The Undermarket',
      notes:
        "**Want:** a grateful Archon, and a war long enough to be profitable. He funds Cressida's campaign and the Hask youth's weapons at the same time and owns a third of the Wardens. **Methods:** debts, favors, bribes, and patience. He never threatens; he reminds. **Secret:** he has heard about the three keys and is buying information on them, which puts him on a collision course with the Vesper Circle. He does not know Kaske runs it. **Toward the player:** a polite offer of credit, a job, or a partnership, always on terms.",
    },
  ],

  lore: [
    {
      title: 'The Quiet Charter',
      keywords: ['charter', '1911', 'hush', 'hushstone', 'daylit', 'wardens', 'archon'],
      alwaysInclude: true,
      body: "After the Pier Nine Fire of 1910, Harrowmere's kindled signed the Quiet Charter: no magic before the Daylit, no recording it, no selling it to them; every kindled person and every wand registered with the Charter Wardens at Tollgate Row. The Charter's Archon keeps the Hushstone, which anchors the Hush that blurs the Daylit's memories of magic. Archon Theodora Vance died twenty-three days before the campaign begins; the Winter Tide Conclave will confirm a successor about sixty days in. Since her death the Hush has been failing.",
    },
    {
      title: 'Wands',
      keywords: ['wand', 'wands', 'wandwright', 'marchetti', 'attune', 'wandless'],
      body: "Every kindled caster needs a wand for real spellwork. A wand is a wood and a core, and it chooses its bearer; a bonded wand is dead wood in anyone else's hand. Each has an affinity and is born knowing one signature spell, which it teaches the bearer at the first touch. Wands attune and grow stronger with use. Without one, a caster manages only crude wandless workings. Every wand must be registered with the Wardens.",
    },
    {
      title: 'Spells and the Circles',
      keywords: ['spell', 'spells', 'incantation', 'circle', 'folio', 'scroll', 'learn'],
      body: "Spells are learned from spellbooks (folios), tutors, scrolls, found grimoires, or the duel-right, then practiced. First Circle charms are sold openly; Second Circle dueling, warding, and glamour spells need a Charter permit; Third Circle spells are restricted to Wardens and the old families; Forbidden spells (Hollowing, Dominus, Sever) are never taught. A master casts silently. Every spell draws on the caster's merelight, and overdrawing brings Veilsickness: nosebleeds, tremors, collapse.",
    },
    {
      title: 'The Lantern Arcade',
      keywords: ['arcade', 'lantern', 'kaske', 'scrivenery', 'apothecary', 'bellweather', 'shop'],
      body: "A glass-roofed Victorian arcade hidden behind a shuttered shoe-repair shop in the Old Market (tap the cobbler's bell three times). Marchetti & Daughters sells wands; Kaske's Folios sells spellbooks; the Scrivenery sells one-use spell scrolls; Thessaly's Apothecary sells draughts; Bellweather's Curios sells charms. Neutral ground, by custom.",
    },
    {
      title: 'The Duel-Right',
      keywords: ['duel', 'duels', 'duel-right', 'dueling'],
      body: "An old custom of Harrowmere's kindled: one caster names the duel-right before a witness, the other accepts or loses face. Wands are raised, a bow, and the duel runs until one yields, is disarmed, or falls. The winner may claim one spell the loser knows, which the loser must teach. Duels to the death have been illegal since 1911, and still happen.",
    },
    {
      title: 'The Tidebound',
      keywords: ['tidebound', 'skerrows', 'brineledger', 'roan', 'cawdry', 'hask'],
      body: "The shapeshifter lineages of the harbor: the Roan are seals, the Cawdry crows, the Hask wolves, with smaller lines of heron, fox, and eel. They signed the Charter in 1911 only after the Wardens burned their meeting hall, and they govern the Skerrows wharves under a separate treaty, the Brineledger. Asking a Tidebound to shift for you is a grave insult. Few carry wands; their magic is in their blood and their songs.",
    },
    {
      title: 'The Undermarket and the Tallymen',
      keywords: ['undermarket', 'ardwick', 'tallymen', 'tuesday'],
      body: "The hidden city's night market, on the lowest levels of the Ardwick Street garage from midnight to dawn: restricted spells, scrolls, unregistered wands, debts. Its rules are old: no workings against another buyer, no Wardens in uniform, every deal final. Everyone knows the Tallymen take a cut. Nobody says Mr. Tuesday's name above a whisper.",
    },
    {
      title: 'Merelight and Hearthkin',
      keywords: ['merelight', 'veilsickness', 'tint', 'hearthkin', 'kindled'],
      body: "Every kindled person carries merelight, an inner reserve of magic with a personal tint, a color and scent unique to them. It refills with rest, food, and sleep. Iron slows spells; running water unravels glamours. A hearthkin is an animal companion that chooses a kindled person for life: the bond eases Veilsickness and lets the pair share senses. It cannot be bought or forced.",
    },
  ],

  missions: [
    {
      title: 'A Wand of Your Own',
      giver: 'Ilse Marchetti',
      description:
        "The Wardens gave you a month to get a wand or face a binding hearing as an unstable late bloomer. You're standing in Marchetti & Daughters with a voucher in your pocket, and six wands are trembling on the counter.",
      objectives: [
        'Choose your wand at Marchetti & Daughters',
        'Register your wand at Tollgate Row, or decide not to',
        'Learn a second spell: from a shop, a tutor, a scroll, or a find',
      ],
      status: 'active',
      rewards: { xp: 60, skillXp: [{ skill: 'Wandwork', amount: 20 }] },
    },
    {
      title: "The Archon's Last Letter",
      giver: 'Ottoline Sarrazin',
      description:
        "The day after Archon Theodora Vance died, Ottoline received a letter in her hand: 'If I am dead, it was not my heart. Find the third key before they do.' Ottoline cannot trust the Wardens with it. She needs someone nobody is watching yet.",
      objectives: [
        'Learn how the Archon really died',
        'Find out what the three keys are',
        "Learn who took the Archon's key",
        'Find the third key',
        'Bring the truth to someone who can act on it before the Winter Tide',
      ],
      rewards: {
        xp: 300,
        money: 500,
        relationships: [{ npc: 'Ottoline Sarrazin', affinity: 15, trust: 25 }],
      },
    },
    {
      title: 'Blood on the Skerrows',
      giver: 'Brannagh Coyle',
      description:
        "Ewan Hask, nineteen, was found burned to death by a fire-hex on the rail tracks behind the Skerrows, with Aldgrave sigil-ash on his coat. Tamsin Hask wants to burn Aldgrave Hill. Brannagh has bought three nights of peace. She wants an outsider, someone no faction owns, to find out who cast the hex.",
      objectives: [
        "Examine the place where Ewan Hask died",
        'Find out who cast the fire-hex',
        'Bring proof to Brannagh before the Hask youth strike',
      ],
      rewards: {
        xp: 150,
        items: [
          {
            name: 'Roan bone charm',
            quantity: 1,
            description: 'A carved seal-bone pendant on waxed cord. The Tidebound of the Skerrows will let you pass without a challenge.',
            tags: ['charm', 'tidebound', 'token'],
          },
        ],
        relationships: [{ npc: 'Brannagh Coyle', affinity: 15, trust: 25 }],
      },
    },
    {
      title: "Oriel's Errand",
      giver: 'Oriel Sachs',
      description:
        "Oriel needs a sealed tin box brought up from a flooded cellar under Pier Nine before someone else finds it. She won't say what's in it. She pays in cash and a Second Circle spell scroll of your choice.",
      objectives: ['Find the tin box in the cellars under Pier Nine', 'Bring it to Oriel at the Undermarket, unopened, or open it'],
      rewards: {
        xp: 80,
        money: 300,
        items: [
          {
            name: 'Scroll of Torpor',
            quantity: 1,
            description: 'A Second Circle spell scroll in charged violet ink. Read aloud, it casts the stunning hex Torpor once; studied, it can teach the spell.',
            tags: ['scroll', 'spell', 'second-circle'],
          },
        ],
      },
    },
    {
      title: 'The Winter Tide Conclave',
      description:
        'In about sixty days the Charter council meets to confirm a new Archon, who will hold the Hushstone and the power to bind any kindled in the city. Every faction is reaching for the seat, some openly, some in the dark. Where will you stand?',
      objectives: [
        'Meet the candidates: Dagny Holmqvist and Lady Cressida Aldgrave-Vane',
        'Learn what the Tidebound and the Tallymen want from the Conclave',
        'Choose a side, or build your own',
        'Be in the council chamber at Tollgate Row when the Conclave convenes',
      ],
      rewards: { xp: 500 },
    },
  ],

  character: {
    name: 'Remy Sandoval',
    archetype: 'late-blooming mage',
    bio: "Thirty-one, a locksmith for twelve years, with a small apartment above a laundromat and a van that mostly starts. Twenty-three nights ago, locked out of a client's house in the rain, you put your hand on the door and every lock on the street clicked open at once. It was the same night the Archon died, though you didn't know what that meant. A neighbor filmed it; the video vanished by morning, and the Wardens came instead. They registered you, gave you a wand voucher, and gave you a month to get a wand or face a binding hearing. Your grandmother's pewter key, the only thing that didn't open that night, has been cold ever since.",
    location: 'Marchetti & Daughters, Wandwrights',
    money: 340,
    level: 1,
    xp: 0,
    hp: 18,
    maxHp: 18,
    skills: [
      { name: 'Lockwork', level: 3, xp: 40, description: 'Picking, bypassing, and understanding locks, mechanical or electronic.' },
      { name: 'Perception', level: 2, xp: 30, description: 'Noticing the thing that is out of place.' },
      { name: 'Streetwise', level: 2, xp: 20, description: 'Twelve years of house calls in every part of Harrowmere: who to ask, what it costs, when to leave.' },
      { name: 'Wandwork', level: 1, xp: 0, description: "Handling a wand: grip, stance, aim, and the Wardens' three-week orientation on not setting yourself on fire. Used for dueling footwork and anything a wand does that isn't a spell." },
      { name: 'Merelight Shaping', level: 1, xp: 15, description: 'Raw wandless workings: a push, a spark, warmth, and a strange knack for anything that opens or closes. Powerful and hard to control.' },
    ],
    items: [
      { name: 'Locksmith pick set', description: 'A worn leather wallet of picks, tension wrenches, and a bump key. Your hands know it better than your face.', tags: ['tool', 'lockpicks'], equipped: true },
      { name: 'Rain shell jacket', description: 'Black, waterproof, and many pockets deep. One inside pocket is long enough for a wand.', tags: ['clothing'], equipped: true },
      { name: 'Phone', description: 'Cracked screen, 40% battery, and a text from Suvi: "did u get it yet?? send pic. DO NOT pick the first one that sparks"', tags: ['tool', 'phone'] },
      { name: 'Charter registration card', description: 'A laminated grey card with your photo, your tint (copper and rain on hot stone), and a stamp: PROVISIONAL. WAND REQUIRED WITHIN 30 DAYS.', tags: ['charter', 'document', 'id'] },
      { name: 'Charter wand voucher', description: 'A Wardens-issued voucher worth 900 dollars toward one wand at a licensed wandwright.', tags: ['charter', 'voucher', 'money'] },
      {
        name: "Grandmother's pewter key",
        description: 'A heavy old pewter key that fits no lock you have ever found. It was the only thing that did not open the night your magic woke; it went cold instead, and has stayed cold. Your grandmother grew up near the north harbor and never talked about it.',
        tags: ['keepsake', 'key', 'magic'],
      },
    ],
    relationships: [
      {
        npc: 'Suvi Adeyemi',
        affinity: 35,
        trust: 25,
        status: 'friend',
        historyNotes: "- Met at the Wardens' orientation, where she was a volunteer helper.\n- Has been showing you the hidden city at 3 a.m. over pancakes at Mirabel's.",
      },
      {
        npc: 'Ottoline Sarrazin',
        affinity: 15,
        trust: 10,
        status: 'acquaintance',
        historyNotes: "- Watched your orientation session and told you that you have \"the control of a fire hose and the instincts of a good burglar\".\n- Left her card: lessons, 60 an hour, back booth at Mirabel's.",
      },
      {
        npc: 'Oriel Sachs',
        affinity: 10,
        trust: 0,
        status: 'acquaintance',
        historyNotes: '- You fixed the trunk lock on her Jaguar years ago, before you knew what she was. She paid in cash and gossip.',
      },
      {
        npc: 'Brannagh Coyle',
        affinity: 0,
        trust: -10,
        status: 'stranger',
        historyNotes: '- Passed you on the street outside Tollgate Row the day you registered. Stopped, stared at the pewter key on your keyring for a long moment, and walked on.',
      },
      {
        npc: 'Dagny Holmqvist',
        affinity: -15,
        trust: -30,
        status: 'suspicious',
        historyNotes: '- Ran your registration interview after the video.\n- Considers you an uncontrolled exposure risk and has said so on the record.',
      },
    ],
  },
};
