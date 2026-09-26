import type { WorldTemplate } from '../world';

export const harrowmere: WorldTemplate = {
  id: 'harrowmere',
  name: 'Harrowmere',
  description:
    'Modern urban fantasy in a rain-soaked harbor city. Beneath the neon, a hidden society of mages and shapeshifter bloodlines lives by a century-old pact of secrecy, and a glossy biotech startup has started bottling magic drained from people.',
  demoCampaignName: 'Harrowmere: Bottled Light',
  currencyName: 'dollars',

  worldBible: `# Harrowmere

**Harrowmere** is a rainy, mid-sized coastal city of a million people: container cranes on the south bay, glass towers downtown, brick row houses climbing the hills, and a harbor fog that rolls in most evenings. It is an ordinary modern city with phones, rideshares, rent problems, and a transit system that never quite works. Under that ordinary surface lives a hidden magical society of a few thousand people, bound to secrecy by a treaty older than anyone alive.

The player is an adult whose magic woke late, in their twenties or thirties, when it usually wakes in the early teens. Late bloomers are rare, mistrusted, and badly served by the old institutions. They are enrolled at the **Saltmarch Collegium**, a night school for late bloomers that runs in a decommissioned subway station beneath the old financial district.

## History
- **Before 1900**: magic in Harrowmere was a patchwork of families, guilds, and the shapeshifter lineages of the harbor, each with their own customs and feuds. The ordinary public mostly did not notice, or explained it away.
- **1910, the Pier Nine Fire**: a duel between two mage families set the harbor ablaze. Forty-one people died, and dozens of witnesses saw things no newspaper could explain. For a month the hidden world came close to being exposed.
- **1911, the Quiet Charter**: the city's mage families, guilds, and (under threat of force) the shapeshifter lineages signed an accord enforcing concealment. The Charter created a registry of every magic-user in the city and a body to police it, the **Charter Wardens**.
- **1962**: the Saltmarch Collegium was founded by three late bloomers who were refused by the established tutors. It moved into the abandoned Vesperhall station in 1978, when the line was rerouted.
- **Five years ago**: **Halcyon Vault** was founded. It is now the city's most celebrated startup.

## The Daylit
Non-magical people are called **the Daylit** (singular: a daylit), from an old saying that they "live in the daylight and never look into the corners." It is not quite an insult, but people who use it too casually are usually from old mage families. Most Daylit who glimpse magic rationalize it within hours. The ones who don't are the Wardens' problem.

## Powers
- **The Charter Wardens**: a small, underfunded, fiercely serious force of about thirty officers, with a squat granite headquarters on Tollgate Row that looks like a municipal water office. They keep the registry, suppress exposure, confiscate illicit goods, and can impose penalties ranging from fines to "binding" (a working that seals a person's magic for years). Street slang for them is **Hushers**. They regard late bloomers as a leak waiting to happen.
- **The Saltmarch Collegium**: about sixty students, a handful of instructors, and a perpetual budget crisis. Classes run from 9 p.m. to 3 a.m. so students can keep their day jobs. The Collegium is chartered, meaning it answers to the Wardens and must register every student. The old families look down on it as a trade school.
- **The Aldgrave Society**: the old-money mage families of the hill district, who train their children privately and dominate the Charter's governing council. Polished, conservative, and quietly hostile to both the Collegium and the Tidebound.
- **The Tidebound**: the shapeshifter lineages of the harbor. Each line is born to one animal form: the **Roan** line (seals), the **Cawdry** line (crows and ravens), the **Hask** line (wolves), and rarer, smaller lines (heron, fox, eel). They signed the Charter in 1911 under duress, after the Wardens of the time burned their meeting hall, and they have never forgiven it. They hold the **Skerrows**, a strip of old wharves on the north harbor, under a separate treaty with the Collegium called the **Brineledger**. Tidebound elders speak for their lines; there is no single leader.
- **Halcyon Vault**: a sleek biotech startup in a glass tower downtown, publicly selling "cognitive wellness" supplements. Its founder and CEO is **Isidore Kaske**, a charismatic late bloomer who was expelled from the Collegium twelve years ago. Secretly, Halcyon extracts magic from people, bottles it, and sells it to mages who want more power and to wealthy Daylit who want a taste. It courts young and late-blooming mages with signing bonuses, stipends, and a pitch that the Charter is a century-old cage.
- **The Undermarket**: not a faction, but a standing institution. A night market for the hidden world that sets up in a parking garage after midnight. Neutral ground by long custom.

## How magic works
- Magic-users are called the **kindled**. Each kindled person carries **merelight**: an inner reserve of magical energy with a personal tint, a color and scent unique to them, visible to trained eyes. The name comes from the old belief that magic came up out of the harbor mere the city is named for.
- Spellwork (called **workings**) is part discipline, part instinct. A working needs focus, a clear intention, and usually a medium: chalk sigils, spoken phrases, gestures, salt, a personal object. Small workings (warm a room, dim a streetlight, nudge a lock, glamour a face slightly) take seconds. Large ones (ward a building, speak across the city, reshape stone) take preparation and multiple casters.
- **Costs**: every working draws on merelight, which refills with rest, food, and sleep over a day or so. Overdrawing causes **Veilsickness**, in stages: first a headache, nosebleed, and a metallic taste; then tremors, color draining from your vision, and hearing the rain as a roar; then collapse, with days of recovery. Repeated severe Veilsickness can permanently dim a person's merelight.
- **Limits**: magic cannot raise the dead, create life, read minds precisely (only moods and intentions), or undo a Daylit's memory cleanly (it can blur, not erase). Iron slows workings. Running water unravels glamours. Magic works fine near phones and cameras, which is exactly why the Charter is so strict: one video can go viral.
- **Late bloomers** tend toward raw power and poor control. The Collegium teaches technique first and power second.
- **Hearthkin**: a kindled person may form a lifelong bond with an animal companion, a **hearthkin**. The bond steadies merelight, lessens Veilsickness, and lets the pair share senses at a distance. Bonds are not chosen; the hearthkin chooses, usually in a moment of need or danger. Most kindled bond by their twenties; many late bloomers never do, and some quietly believe they can't. A hearthkin's death is a wound that never fully heals.
- **Hollowing**: the extraction of merelight from a living person. Done carefully and partially, it leaves someone tired and dim for weeks. Done completely, it leaves them **hollowed**: alive, able to function, but magicless, grey-tinted, and often depressed. Tidebound merelight is especially potent, and hollowing a Tidebound can trap them mid-shift. Hollowing is the gravest crime under the Charter. Halcyon Vault has industrialized it and sells the product as **Aurelle**.

## Social rules
- Never work magic in front of the Daylit. Never record it. Never sell it to them. These are the Charter's three commandments and every kindled child learns them.
- Asking someone their tint is intimate; commenting on it uninvited is rude.
- Never ask a Tidebound to shift for you. Never touch another person's hearthkin.
- At the Undermarket: no workings against another buyer, no Wardens in uniform, and every deal is final.
- Registration is mandatory. Unregistered kindled exist, but they live carefully.

## Money
Ordinary US-style dollars. A coffee costs 4, a diner meal 15, a cab across town 25, a month's rent on a small apartment 1,600. At the Undermarket, a simple protective charm runs 40 to 200, a finished warding kit 500, a hollowed street vial of merelight 300 to 800 depending on tint and purity, and a Halcyon-branded Aurelle ampoule about 2,000. Halcyon's signing bonus for a promising young mage is 25,000. Collegium tuition is free, paid in service hours.

## Tone
Wonder mixed with noir. Neon smeared across wet asphalt, sodium lamps in the fog, old magic in modern places: a ward carved into a parking meter, a crow line elder in a delivery driver's jacket, a sigil chalked on a subway tile. Magic should feel astonishing and costly. The city is beautiful, tired, and a little corrupt. People are complicated; almost nobody is purely a villain, and the ones who do the most harm usually believe they are helping.

## Long-campaign plot threads
1. **Halcyon's Deep Floors**: the public tower is a real wellness company. Floors 31 to 34 house the extraction labs, and a converted cold-storage warehouse on the south bay houses the people who didn't volunteer. Kaske's goal is not money: he wants to prove magic can be distributed to anyone, ending the kindled as a class and the Charter with it. He has buyers on the Charter council.
2. **Cracks in the Charter**: the Charter is up for its centennial-plus-fifteen review, and the Aldgrave Society wants to tighten it, including mandatory binding for unstable late bloomers. A Halcyon scandal could either tear the Charter up or give the hardliners everything they want.
3. **The Brineledger breaking**: Tidebound youth have been disappearing from the Skerrows. If the elders conclude the Collegium or the Wardens are complicit, they will void the Brineledger and the harbor will become a war zone for the first time since 1911.
4. **The unbonded**: the player has no hearthkin. Something has been watching them lately (a gull on the fire escape, a cat in the station, a crow that follows the bus). The bond, when it comes, should arrive at a moment of real danger and change what the player can do.
5. **Kaske and the Collegium**: Kaske was once the Collegium's brightest student, and someone there taught him the theory hollowing is built on. That secret, if it comes out, could close the Collegium.

## Current situation
Mateo Ferreira, a second-year Collegium student, has not come to class in nine nights and does not answer his phone. His apartment is untouched. Two nights ago a first-year bought a vial of bottled merelight at the Undermarket and brought it to class to show off. It glows sea-green and smells of kelp and cloves, and Mateo's closest friend swears it is his tint.
`,

  narratorStyle: `- Second person, present tense ("You come up the station stairs into the rain...").
- Noir with wonder: rain, neon, fog horns, wet concrete, sodium light, the hum of old transit tunnels. Let magic break into the ordinary city with color and awe.
- 150 to 350 words per turn. Shorter for quick exchanges, longer for arrivals, workings, and revelations.
- Magic is sensory and costly: describe each working's tint, sound, and feel, and the Veilsickness that follows overuse.
- NPCs speak in distinct voices. Ottoline Sarrazin is precise and dry, a teacher who answers questions with better questions. Suvi Adeyemi talks fast, jokes when frightened, and texts in all lowercase. Brannagh Coyle is slow, formal, and old-fashioned, with the rhythm of a sea shanty and no patience for small talk. Oriel Sachs is breezy and flirtatious and quotes prices mid-sentence. Leander Okafor is warm, polished, and sincere, speaking in the language of opportunity. Dagny Holmqvist is flat and procedural and asks the same question three different ways.
- Keep the Daylit city present: bystanders, cameras, phones. Concealment is always a factor in any public working.
- Danger is real but fair. Telegraph threats before they land.
- End on something the player can act on: a question, a choice, a text message lighting up the screen.
`,

  locations: [
    {
      name: 'Saltmarch Collegium',
      description:
        "A decommissioned subway station, Vesperhall, sealed off from the Daylit since 1978. The entrance is a locked service door beside a boarded-up newsstand; a brass transit token opens it for students. Below, the old platforms have become classrooms, with chalk sigils on the tiled walls, desks set out along the tracks, and a lending library in a stalled 1960s subway car. Trains on the live line next door shake dust from the ceiling every twelve minutes. The instructors' offices are in the old ticket hall.",
      tags: ['collegium', 'school', 'safe', 'underground'],
    },
    {
      name: 'The Undermarket',
      description:
        "A night market that sets up on the lowest four levels of the Ardwick Street parking garage between midnight and dawn. Stalls are built from car trunks and folding tables, lit by string lights and glowing jars. Vendors sell charms, warding chalk, rare herbs, secondhand grimoires, Tidebound carvings, and less legal things behind curtains. A glamour makes the Daylit attendant in the booth see empty concrete. Wardens come here out of uniform, and everyone knows who they are.",
      tags: ['market', 'neutral', 'crowded', 'black-market', 'night'],
    },
    {
      name: 'The Skerrows',
      description:
        "A strip of old wharves and warehouses on the north harbor, leased by Tidebound families for a century. Fishing boats, a smokehouse, a boxing gym, and a bar with no sign. Seals haul out on the rotting pilings at dusk and crows line the power cables. Outsiders are watched from the moment they cross the rail tracks. At the end of the longest pier stands the Moot House, rebuilt after 1911, where the elders meet.",
      tags: ['tidebound', 'harbor', 'territory', 'restricted'],
    },
    {
      name: 'The Halcyon',
      description:
        "Halcyon Vault's headquarters: a forty-storey tower of green-tinted glass downtown, lit from within at all hours. The lobby has a living moss wall, a juice bar, and security guards with earpieces. Floors 1 to 30 are open-plan offices and wellness labs full of cheerful young staff. Floors 31 to 34 need a separate keycard and are never on the tour.",
      tags: ['halcyon', 'corporate', 'downtown', 'guarded'],
    },
    {
      name: "Mirabel's",
      description:
        "A 24-hour diner across from the Vesperhall service door, with red vinyl booths, bottomless coffee, and rain streaming down the plate-glass windows. Mirabel herself is Daylit and has decided not to ask why so many customers show up at 3 a.m. with chalk on their hands. Collegium students treat the back booth as a common room.",
      tags: ['diner', 'safe', 'public', 'daylit'],
    },
  ],

  npcs: [
    {
      name: 'Ottoline Sarrazin',
      shortDescription:
        "Head instructor of the Saltmarch Collegium. Sixties, silver hair cut short, reading glasses on a chain, a cardigan with chalk dust on the sleeves. A late bloomer herself, forty years ago. Her hearthkin is an elderly one-eyed tomcat named Pilot.",
      faction: 'Saltmarch Collegium',
      location: 'Saltmarch Collegium',
      notes:
        "**Want:** to find Mateo and protect the Collegium, which the Wardens and the Aldgrave Society would happily shut down at the first scandal. She wants the player to investigate precisely because they are new and unremarkable. **Secret:** Isidore Kaske, Halcyon's founder, was her star student, and she co-wrote the unpublished paper on merelight transfer that hollowing is built on. She expelled Kaske when he tried it on a volunteer; she never reported it to the Wardens, to protect the school. She suspects Halcyon at once but will not say why until trust is high. Fair, demanding, and generous with praise when it is earned.",
    },
    {
      name: 'Suvi Adeyemi',
      shortDescription:
        "A second-year Collegium student and Mateo's closest friend. Late twenties, braids under a knit beanie, a hospital scrubs top under her raincoat (she is a night-shift nurse three days a week). Her hearthkin is a sharp-eyed rat named Dumpling who rides in her hood.",
      faction: 'Saltmarch Collegium',
      location: 'Saltmarch Collegium',
      notes:
        "**Want:** to get Mateo back alive, and to not be the reason he is gone. **Secret:** three months ago she took 5,000 dollars from Leander Okafor to attend a Halcyon 'focus group', which was a partial hollowing; she felt dim for weeks and never told anyone. She gave Leander Mateo's name because Mateo was desperate for money (his mother's medical bills). She is the one who recognized the tint in the vial. She will confess to the player if they are kind and patient with her, or if confronted with evidence. Brave, funny, terrified.",
    },
    {
      name: 'Brannagh Coyle',
      shortDescription:
        "An elder of the Roan line of the Tidebound. Seventies, broad and weathered, white hair in a long braid, a fisherman's sweater and sea boots. Dark, liquid, unblinking eyes. Speaks for the Tidebound at the Brineledger meetings with the Collegium.",
      faction: 'The Tidebound',
      location: 'The Skerrows',
      notes:
        "**Want:** to find the three Tidebound youths who have vanished from the Skerrows in the past two months, and to keep outsiders from knowing Tidebound are vulnerable. She is on the verge of voiding the Brineledger. **Secret:** Mateo Ferreira is Roan-blooded through his father, who left the Skerrows before Mateo was born. Mateo does not know; Brannagh does. His Tidebound merelight is why Halcyon kept him. She will trade information for proof that someone outside the Tidebound cares. Distrusts the Collegium, despises the Wardens, and remembers 1911 as if she had been there (her grandmother was).",
    },
    {
      name: 'Oriel Sachs',
      shortDescription:
        "An Undermarket fence who runs a stall out of the trunk of a vintage green Jaguar on level minus three. Forties, bleached crop, gold rings on every finger, a fur coat that is definitely fake and a smile that definitely isn't. Knows the price of everything.",
      faction: 'Undermarket',
      location: 'The Undermarket',
      notes:
        "**Want:** money, and to stay neutral and alive. **Secret:** she sold the sea-green vial. She buys hollowed merelight from a Halcyon courier who calls himself Mr. Tuesday and meets her every Tuesday at 2 a.m. She knows the vials are drained from people and keeps a private ledger of every tint she has bought, partly for insurance. She would sell the ledger for 3,000 dollars, a serious favor, or protection from Halcyon. She sells Wardens information to keep them off her stall.",
    },
    {
      name: 'Leander Okafor',
      shortDescription:
        "A 'talent partner' at Halcyon Vault. Early thirties, handsome, tailored navy suit, rain-beaded umbrella, an easy laugh. Remembers everyone's name and everyone's birthday. Has been texting the player job offers for weeks.",
      faction: 'Halcyon Vault',
      location: 'The Halcyon',
      notes:
        "**Want:** to recruit the player; he has a bonus riding on it and genuinely believes Halcyon is freeing mages from the Charter. **Secret:** he is a late bloomer who sold most of his own merelight to Halcyon and calls it the best decision of his life. He brought Mateo in for a paid 'partial donation' and was told Mateo went home afterwards. He does not know about the unconsenting donors kept on the Deep Floors and the south bay warehouse; if he learns, he can become an inside ally, at great risk to himself. Never threatens; only offers.",
    },
    {
      name: 'Dagny Holmqvist',
      shortDescription:
        "A senior Charter Warden. Fifties, tall and angular, grey trench coat, cropped blonde hair, a Warden's iron ring on her thumb. Carries a notebook she never seems to write in. Handled the player's registration interview eight months ago.",
      faction: 'Charter Wardens',
      location: 'The Undermarket',
      notes:
        "**Want:** to find the source of the bottled merelight flooding the Undermarket before a Daylit overdose makes the news. She suspects the leak is coming from the Collegium's late bloomers, and the player is on her list. **Secret:** she was hollowed herself fifteen years ago in an unsolved attack and has kept it hidden ever since; she uses Aurelle, bought through Oriel, to fake her own workings and keep her post. She is therefore compromised, frightened, and inclined to arrest the player to close the case quickly. Honest in every other respect. If the player proves Halcyon is behind it, she may become a hard-won ally, or she may try to bury it to protect herself.",
    },
  ],

  lore: [
    {
      title: 'The Charter of 1911',
      keywords: ['charter', '1911', 'hushers', 'daylit', 'tollgate'],
      body: "Signed after the Pier Nine Fire of 1910, the Quiet Charter binds every kindled person in Harrowmere to secrecy: no magic before the Daylit, no recording it, no selling it to them. Every magic-user must register with the Charter Wardens (slang: Hushers), who can fine, confiscate, or impose a binding, a working that seals someone's magic for years. The Charter's council is dominated by the old families of the Aldgrave Society. Its original signed copy hangs in the Wardens' headquarters on Tollgate Row, with the Tidebound elders' signatures scorched at the edges.",
    },
    {
      title: 'Merelight and Veilsickness',
      keywords: ['merelight', 'veilsickness', 'veilsick', 'kindled'],
      body: 'Every kindled person carries merelight, an inner reserve of magic with a personal tint (a color and scent unique to them). Workings draw it down; rest, food, and sleep refill it over about a day. Overdrawing brings Veilsickness: first a nosebleed and a taste of metal, then tremors and color draining from sight, then collapse. Repeated severe Veilsickness can permanently dim a person. Iron slows workings, running water unravels glamours, and a hearthkin bond softens the sickness.',
    },
    {
      title: 'The Tidebound',
      keywords: ['tidebound', 'skerrows', 'brineledger', 'roan', 'cawdry', 'hask'],
      body: "The shapeshifter lineages of Harrowmere's harbor. Each line is born to one form: the Roan are seals, the Cawdry crows, the Hask wolves, with rarer lines of heron, fox, and eel. First shifts come at puberty. They signed the Charter in 1911 only after the Wardens burned their meeting hall, and they govern the Skerrows wharves by their elders' word under a separate treaty with the Saltmarch Collegium, the Brineledger. Asking a Tidebound to shift for you is a grave insult. Their merelight runs strong, which makes them a prize for anyone doing hollowing.",
    },
    {
      title: 'Halcyon',
      keywords: ['halcyon', 'kaske', 'isidore'],
      body: "Halcyon Vault is a five-year-old biotech startup in a green glass tower downtown, beloved by the business press for its 'cognitive wellness' supplements. Its founder, Isidore Kaske, is a charismatic late bloomer expelled from the Saltmarch Collegium twelve years ago. To the hidden world, Halcyon is known to recruit young and late-blooming mages with signing bonuses around 25,000 dollars, stipends, and the promise of life beyond the Charter. Floors 31 to 34 require a separate keycard and are not on the tour.",
    },
    {
      title: 'Hollowing and Aurelle',
      keywords: ['hollowing', 'aurelle'],
      body: "Hollowing is the extraction of merelight from a living person, the gravest crime under the Charter. A partial hollowing leaves someone tired and dim for weeks; a complete one leaves them alive but magicless, with a grey, flat tint. Bottled merelight keeps its donor's tint, which is how the stolen can be traced. Halcyon's refined product, Aurelle, comes in slim frosted ampoules and sells for about 2,000 dollars; cruder street vials go for 300 to 800 at the Undermarket. Drinking it gives a rush of power and borrowed senses for a few hours, and Daylit users see things they cannot explain.",
    },
    {
      title: 'Hearthkin',
      keywords: ['hearthkin', 'hearthbond', 'unbonded'],
      body: "A hearthkin is an animal companion bonded to a kindled person for life. The hearthkin chooses, usually in a moment of need or danger, and cannot be bought, summoned, or forced. The bond steadies merelight, eases Veilsickness, and lets the pair share senses over a distance. Most kindled bond by their twenties. Many late bloomers never do, and the unbonded are quietly pitied. Tidebound folklore says a hearthkin watches for weeks before it chooses.",
    },
    {
      title: 'The Saltmarch Collegium',
      keywords: ['saltmarch', 'collegium', 'vesperhall'],
      body: "A night school for late bloomers, founded in 1962 and housed since 1978 in the abandoned Vesperhall subway station. Classes run from 9 p.m. to 3 a.m. so students can keep their day jobs; tuition is paid in service hours. Students carry brass transit tokens that open the service door. The Collegium is chartered, so it must register every student with the Wardens, and the Aldgrave Society has tried to close it three times. It teaches technique before power, because late bloomers tend to have too much of the second and not enough of the first.",
    },
    {
      title: 'The Undermarket',
      keywords: ['undermarket', 'ardwick'],
      body: "The hidden world's night market, held from midnight to dawn on the lowest four levels of the Ardwick Street parking garage. Its rules are old and strictly kept: no workings against another buyer, no Wardens in uniform, every deal final. A standing glamour hides it from the Daylit. Bottled merelight appeared on its tables about six months ago, sold from behind curtains and car trunks, and prices have fallen every month since.",
    },
  ],

  missions: [
    {
      title: 'Bottled Light',
      giver: 'Ottoline Sarrazin',
      description:
        "Mateo Ferreira, a second-year student, has missed nine nights of class and no one can reach him. Then a first-year brought a vial of bottled merelight from the Undermarket to class: sea-green, smelling of kelp and cloves. Suvi Adeyemi swears it is Mateo's tint. Ottoline cannot go to the Wardens without putting the whole Collegium under suspicion. She wants someone quiet to trace the vial back to its source and find Mateo.",
      objectives: [
        "Learn about Mateo's last weeks from Suvi Adeyemi at the Collegium",
        'Find out who is selling the vial at the Undermarket',
        'Trace the bottled merelight back to its source without drawing a Charter Warden down on the Collegium',
        'Find out where Mateo is being held',
        'Report back to Ottoline Sarrazin at the Collegium',
      ],
      rewards: {
        money: 300,
        xp: 150,
        skillXp: [{ skill: 'Perception', amount: 40 }],
        relationships: [
          { npc: 'Ottoline Sarrazin', affinity: 10, trust: 20 },
          { npc: 'Suvi Adeyemi', affinity: 15, trust: 15 },
        ],
      },
    },
    {
      title: 'The Stolen Coat',
      giver: 'Brannagh Coyle',
      description:
        "A Roan youth's shedcoat, the sealskin a Tidebound child is born wrapped in and must keep all their life, was stolen from a Skerrows boathouse and has turned up for sale somewhere at the Undermarket. No Tidebound can walk in there asking without starting a war. Brannagh wants an outsider to buy or steal it back. In return she offers to take the player to the calling-stones at low tide, where the unbonded sometimes meet their hearthkin.",
      objectives: [
        'Hear the details of the theft from Brannagh Coyle at the Skerrows',
        'Find the shedcoat at the Undermarket',
        'Recover the shedcoat by purchase, trade, or theft',
        'Return it to Brannagh at the Skerrows',
      ],
      rewards: {
        money: 100,
        xp: 100,
        items: [
          {
            name: 'Roan bone charm',
            quantity: 1,
            description: 'A carved seal-bone pendant on waxed cord. The Tidebound of the Skerrows will let you pass without a challenge.',
            tags: ['charm', 'tidebound', 'token'],
          },
        ],
        skillXp: [{ skill: 'Streetwise', amount: 30 }],
        relationships: [{ npc: 'Brannagh Coyle', affinity: 15, trust: 25 }],
      },
    },
  ],

  character: {
    name: 'Remy Sandoval',
    archetype: 'late-blooming mage',
    bio: "Thirty-one, a locksmith for twelve years, with a small apartment above a laundromat and a van that mostly starts. Eight months ago, locked out of a client's house in the rain, you put your hand on the door and every lock on the street clicked open at once. A neighbor filmed it. The Wardens found you before the video did, and a week later you were enrolled at the Saltmarch Collegium. You are powerful, badly trained, and still getting used to seeing the hidden city everywhere you look.",
    location: 'Saltmarch Collegium',
    money: 85,
    level: 1,
    xp: 40,
    hp: 18,
    maxHp: 18,
    skills: [
      { name: 'Lockwork', level: 3, xp: 40, description: 'Picking, bypassing, and understanding locks, mechanical or electronic.' },
      { name: 'Perception', level: 2, xp: 30, description: 'Noticing the thing that is out of place.' },
      { name: 'Streetwise', level: 2, xp: 20, description: "Twelve years of house calls in every part of Harrowmere: who to ask, what it costs, when to leave." },
      { name: 'Merelight Shaping', level: 1, xp: 15, description: 'Raw workings: force, light, warmth, and a strange knack for anything that opens or closes. Powerful and hard to control.' },
      { name: 'Veiling', level: 1, xp: 5, description: 'Collegium-taught glamours to go unnoticed or blur what the Daylit see. Shaky.' },
    ],
    items: [
      { name: 'Locksmith pick set', description: 'A worn leather wallet of picks, tension wrenches, and a bump key. Your hands know it better than your face.', tags: ['tool', 'lockpicks'], equipped: true },
      { name: 'Rain shell jacket', description: 'Black, waterproof, and many pockets deep. One pocket is always full of chalk dust now.', tags: ['clothing', 'armor'], equipped: true },
      { name: 'Warding chalk', description: 'Collegium-issue sticks of salt-cured chalk for drawing sigils.', quantity: 3, tags: ['magic', 'consumable', 'warding'] },
      { name: 'Phone', description: 'Cracked screen, 40% battery, and three unread texts from Leander Okafor.', tags: ['tool', 'phone'] },
      { name: 'Vesperhall token', description: 'A brass subway token stamped with a crescent. It opens the Collegium service door, and only for you.', tags: ['key', 'collegium'] },
      { name: 'Sea-green vial', description: "The vial of bottled merelight from the Undermarket, entrusted to you by Ottoline. It glows faintly and smells of kelp and cloves. The cork is sealed with a black wax stamp of a tiny keyhole.", tags: ['clue', 'magic', 'evidence'] },
      {
        name: "Grandmother's pewter key",
        description: 'A heavy old key that fits no lock you have ever found. It was the only thing that did not open the night your magic woke; it went cold instead. Your grandmother grew up near the north harbor and never talked about it.',
        tags: ['keepsake', 'magic'],
      },
    ],
    relationships: [
      {
        npc: 'Ottoline Sarrazin',
        affinity: 20,
        trust: 15,
        status: 'instructor',
        historyNotes: '- Your Foundations of Working instructor for six months.\n- Told you in front of the class that you have "the control of a fire hose and the instincts of a good burglar", and meant it kindly.',
      },
      {
        npc: 'Suvi Adeyemi',
        affinity: 35,
        trust: 20,
        status: 'friend',
        historyNotes: "- Your study partner since your first week.\n- Split a lot of 3 a.m. pancakes at Mirabel's. She introduced you to Mateo.",
      },
      {
        npc: 'Brannagh Coyle',
        affinity: 0,
        trust: -10,
        status: 'stranger',
        historyNotes: '- Saw you once at a Brineledger meeting at the Collegium. Looked at your pewter key for a long moment and said nothing.',
      },
      {
        npc: 'Oriel Sachs',
        affinity: 10,
        trust: 0,
        status: 'acquaintance',
        historyNotes: '- You fixed the trunk lock on her Jaguar in your first month and she paid in cash and gossip.',
      },
      {
        npc: 'Leander Okafor',
        affinity: 15,
        trust: 5,
        status: 'recruiter',
        historyNotes: '- Bought you a very expensive dinner two weeks ago and made an offer you have not answered.\n- Texts you every few days, always friendly.',
      },
      {
        npc: 'Dagny Holmqvist',
        affinity: -20,
        trust: -35,
        status: 'suspicious',
        historyNotes: '- Ran your registration interview after the video incident.\n- Considers you an uncontrolled exposure risk and has said so on the record.',
      },
    ],
  },
};
