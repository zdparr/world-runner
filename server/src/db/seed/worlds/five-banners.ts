import type { WorldTemplate } from '../world';

export const fiveBanners: WorldTemplate = {
  id: 'five-banners',
  name: 'The Five Banners',
  description:
    'Epic high fantasy on a continent held together by a three-hundred-year-old treaty. Five peoples trade and scheme in the free city of Dunmarrow, the human throne sits empty, and the undying elves have begun, for the first time, to grow old.',
  demoCampaignName: "The Five Banners: The Envoy's Road",
  currencyName: 'marks',

  worldBible: `# The Five Banners

Three hundred years ago, after a century of wars no one now remembers the causes of, five peoples met at a crossroads and swore the **Quinthane**: a treaty of borders, trade, and mutual defense, bound not with ink but with the hidden names of the five who signed it. Each people raised its banner over the hall where the oath was sworn, and the continent has been called the Five Banners ever since.

The Quinthane was sworn for three hundred years. Its term ends at the midwinter **Bannermoot**, eleven weeks away. It must be renewed by all five peoples, or it lapses. Four of its five founding signatories are dead. The fifth, an elf, is growing old.

## The land
A broad continent of steppe, forest, mountain, and the rich river-country between. It is littered with ruins older than any living nation: rings of black standing stones, roads that go nowhere, drowned cities under still lakes. These were built by the **Ovanth**, a people who vanished so long ago that not even the elves remember them. Ovanth stones hum faintly when a hidden name is spoken near them. Scholars believe the Ovanth invented name-magic, and that something went badly wrong.

## The five peoples
- **Humans of Cendral**: the most numerous people, farming the river-country. Their High King **Ceolmar** died last winter, with rumors of poison and no named heir. Three claimants circle the empty throne at Brevannon: his daughter **Princess Idrienne** (nineteen, clever, backed by the southern lords and the peace faction); his brother **Duke Harlan Roake** (a hero of the Ondrel War, a hardliner beloved by the army); and **Tobiah Ansel** (who claims to be Ceolmar's son by a secret marriage, and whose debts are held by dwarven banks). Whoever holds Cendral's banner seat at the Bannermoot will be half-crowned already.
- **The Lirauni** (elves): an ancient forest people who have never, in all their history, died of age. Now they do. Their forest, **Liraun**, is graying: leaves turn the color of ash and do not fall, bark goes brittle, songbirds leave. Elves who show gray hair withdraw into **stillhouses**, where they wait. The Lirauni call this the **Hesterfall**; humans call it the Long Autumn. It began some forty years ago. No one knows why.
- **The Haddari Khanate** (orcs): horse-clans of the eastern steppe under a Khan chosen by the clan mothers. Proud, disciplined, and bound by the **Zhorun**, an honor code of guest-right, blood-debt, and plain speech. They are not raiders by nature. Forty-one years ago they fought Cendral in the **Ondrel War** over the winter pastures of the Ondrel river, and lost them in the **Ondrel Cession**. A generation of clans has starved in hard winters since. They have a legitimate grievance and they know it.
- **The Karrowdeep** (dwarves): mountain holds of miners, smiths, and above all bankers. Karrow vaults hold the wealth of every nation, and the Karrow **mark** is the only coin trusted everywhere. Their power rests on one thing: a dwarven oath is never broken. Their **oathwrights** witness and seal every binding oath on the continent and keep the ledgers of who swore what.
- **The Pettifold** (goblins): a federation of underground guild-cities of tinkers, engineers, and advocates. Goblins build the best locks, clocks, and siege engines in the world, and they write **quillbinds**, contracts that bind by magic. A goblin considers a spoken promise worthless and a well-drafted clause sacred.

Other peoples live between the banners and belong to none: the hill-giants of the **Brakespine**, the fen-folk called the **Vashk**, and scattered wanderers. These **unbannered** have no seat at the Bannermoot, and some of them want one.

## Dunmarrow
The free city of **Dunmarrow** sits where the five great roads meet, on the neutral ground where the Quinthane was sworn. It belongs to no banner. It is governed by a council of guild-masters and policed by the **Tollward**, wardens in slate-blue coats who swear to no people and carry brass toll-keys as badges. Every people keeps a quarter here. The **Quincunx**, the great market where the roads meet, is the busiest square on the continent. The treaty council meets in the **Vexillary**, commonly called the Hall of Banners. The goblin guild-warren of **Scrivelow** lies beneath the western quarter. The dwarven counting-house of **Grethmoor** sits on the south road. Half a day's ride north, the eaves of Liraun begin.

Dunmarrow law: no blade may be drawn in the Quincunx on market days; any quarrel between peoples goes before a Tollward magistrate; and every people's envoy to the Bannermoot is escorted by a Tollward, so that no banner can be accused of harming another's guests.

## Magic
Magic is old, rare, and costly. There are no wizards' schools and no fireballs. There are names, oaths, and a few dying arts.

- **Hushnames**: every person of the five peoples receives a secret name at birth, whispered by a parent and then never spoken. Most people do not know their own. A hushname spoken aloud with intent, by someone who truly knows it, compels its owner for one breath: to stop, to answer one question truthfully, or to hear. It cannot compel self-harm. It costs the speaker: a nosebleed, a lost memory, sometimes a day of life. Learning someone's hushname is intimate and dangerous; stealing one is among the worst crimes the five peoples share.
- **Oaths**: an oath sworn on one's own hushname, before a sealing oathwright, with a pledged **surety**, becomes binding. The surety is something real: years of life, a sense, a memory, a skill, the luck of one's children. Break the oath and the surety is collected, slowly and inexorably. The oathwright who seals an oath also pledges a small surety that it was sworn honestly. Oaths bind only the one who swears, only in the words they swore, and only if the hushname given was true. An oath sworn on a false name is hollow, and a hollow oath inside a larger oath can crack it.
- **Quillbinds**: goblin contracts written in name-ink, which carries a drop of each signer's blood. A quillbind compels performance: a bound party's body will carry out the clauses whatever the mind wants. Both parties must sign freely and understand the language, which is where most litigation starts. Goblin advocates live on loopholes, and a quillbind is only as fair as its drafter.
- **The Greening**: the Lirauni song-magic that makes trees grow, wounds close, and seasons turn. It is failing with the forest. Few Lirauni can still sing more than a sapling into leaf.
- **Kheregs**: Haddari ancestor-mounds on the steppe, where the clan mothers can hear the dead for one night a year. Testimony given at a khereg under the Zhorun is held sacred.
- **Oath-sense**: a rare gift, found in any people, to feel a cold prickle when a false oath is sworn nearby. It cannot be taught, only sharpened.

## Social rules
- **Haddari**: guest-right is absolute once bread and salt are shared. An insult must be answered, by apology or by challenge. A life saved is a debt owed. Lying to a guest is worse than killing an enemy.
- **Karrowdeep**: a handshake over coin is binding by custom. No dwarf lies inside a counting-house. Braids record one's history; cutting another's braid is a mortal insult.
- **Pettifold**: get it in writing. A goblin who says "I promise" is joking. Advocates are bound by a confidentiality quillbind and cannot name their clients, though they are very good at not saying things loudly.
- **Lirauni**: never speak a gray-haired elf's name in their hearing; they are counted as already departing. It is a grave rudeness to ask an elf's age now.
- **Cendral**: rank matters, and everyone is choosing a claimant. Wearing a lord's colors in Dunmarrow is a declaration.

## Money
The coin of the continent is the Karrow silver **mark**, minted in the dwarven holds and stamped with the mint-run of the vault that issued it. Goblins trade in copper **bits** (twelve to the mark). A hot meal costs 1 mark, a night at a decent inn 3, a healing bitterdraught 25, a Tollward's monthly pay 30, a good horse 120, drafting a simple quillbind 40, and an oathwright's sealing at least 100. A hushname is beyond price.

## Tone
Mythic and melancholy. The world is old and beautiful and something in it is ending. Every people is right about something and wrong about something else; there are no villains by blood, only people making hard choices for their own. Let the ruins feel vast and indifferent, the Lirauni grief feel quiet and enormous, the Haddari pride feel earned, and the politics feel like it matters. Magic is awe and dread in equal measure, and it always takes something.

## Long-campaign threads
1. **The Renewal**: can the Quinthane be renewed at midwinter? New signatories must swear on their hushnames, pledging sureties. Who will each people send, and what will they pledge? If it lapses, every border on the continent is open to question.
2. **The empty throne**: Idrienne, Roake, and Ansel each want Cendral's banner seat and will trade with any people for it. The Bannermoot may effectively choose the next High King.
3. **The Ondrel pastures**: the Haddari want the Cession undone. War or restitution, and at whose cost?
4. **The cause of the Hesterfall**: something is taking the Lirauni's undying years. Theories include plague, curse, Ovanth ruins, and divine judgment. The truth is tied to the Quinthane itself.
5. **The unbannered and the Ovanth**: the Brakespine giants and the Vashk demand a sixth banner, and the Ovanth stones have begun to hum on their own, as if someone were speaking names into them.
`,

  narratorStyle: `- Second person, present tense ("You shoulder through the crowd at the Quincunx...").
- Mythic and melancholy: grand vistas, old stone, the sense that the world is older than anyone in it. Let quiet grief and hard-won dignity sit beside the bustle.
- 150 to 350 words per turn. Shorter for quick exchanges, longer for arrivals, ambushes, ruins, and revelations.
- Recurring textures: five banners snapping over the Vexillary, mingled market smells of horse, spice, forge-smoke, and ink, the gray leaves of Liraun that never fall, the faint hum of Ovanth stone, the scratch of goblin quills.
- Magic is rare and always costs something. Show the price: blood from the nose, a memory gone, a sudden chill.
- NPCs speak in distinct voices. Yeshkara Tulmai is formal, patient, and precise, and never wastes a word. Borukh Tamsagan speaks in short, flat sentences and calls you "Cendrali" instead of your name. Brannoc Uldskar is warm, grandfatherly, and fond of proverbs about coin, and he tilts his head to hear with his good ear. Tizzick Quennell talks fast in nested clauses and qualifications, and cannot resist a technicality. Ismerai Tholle speaks slowly, in the present tense, as if describing a painting. Sabeline Voss is courteous, dry, and always answers a question with a question.
- Honor the peoples' customs: guest-right, braids, get-it-in-writing, the gray-haired unnamed. Consequences for breaking them are real.
- Combat is fast, dangerous, and fair. Telegraph threats before they land, and let terrain, crowds, and law matter.
- End on something the player can act on: a question, a choice, a banner falling, a crossbow glinting on a rooftop.
`,

  locations: [
    {
      name: 'The Quincunx',
      description:
        "Dunmarrow's great market, a five-sided square where the five roads meet. Haddari horse-traders, dwarven money-changers, Lirauni sellers of pale wood and old songs, goblin lock-merchants, and Cendrali grain factors shout over one another beneath striped awnings. An Ovanth standing stone, black and older than the city, stands at the center; children dare each other to touch it. Tollward wardens in slate-blue coats watch from the fountain steps, and no blade may be drawn here on market days.",
      tags: ['dunmarrow', 'market', 'crowded', 'public', 'crossroads'],
    },
    {
      name: 'The Vexillary',
      description:
        "The Hall of Banners: a round domed hall of five colors of stone on the site where the Quinthane was sworn. Five great banners hang from the dome: Cendral's gold wheat-sheaf, the silver tree of Liraun, the Haddari red horse, the Karrow anvil and key, and the Pettifold's ink-black quill. The council floor is ringed by five carved seats; the gold one stands empty with a black ribbon across it. Galleries, clerks' offices, and guest apartments for envoys circle the upper floors.",
      tags: ['dunmarrow', 'council', 'politics', 'treaty', 'guarded'],
    },
    {
      name: 'Verge of Liraun',
      description:
        "The southern edge of the elven forest, half a day north of Dunmarrow. The trees are colossal and silver-barked, but their leaves have gone the color of ash and hang motionless, refusing to fall. The air smells of dry paper. Lirauni stillhouses, graceful halls of living wood, stand among the roots where gray-haired elves wait in silence. Deeper in, a ring of Ovanth stones called the Ommerstones hums under the gray canopy.",
      tags: ['liraun', 'forest', 'elven', 'melancholy', 'ruins'],
    },
    {
      name: 'Scrivelow',
      description:
        'The goblin guild-warren beneath Dunmarrow\'s western quarter. Lamplit tunnels open into a vaulted undercourt stacked with archive shelves, clockwork lifts, and the offices of forty rival advocates. The air tastes of lamp oil, iron gall, and blood-ink. Brass speaking-tubes carry arguments between floors, and every door has a better lock than the one before it. Nothing here is free, and everything is on record.',
      tags: ['pettifold', 'goblin', 'underground', 'law', 'archives'],
    },
    {
      name: 'Grethmoor',
      description:
        'The Karrowdeep counting-house on Dunmarrow\'s south road: a squat fortress of basalt with a bronze door ten feet high. Inside, clerks with braided beards weigh coin on balance-scales under lamplight, and a ledger-hall holds the sealed records of every oath witnessed in Dunmarrow for three centuries. The vault below is said to hold a tenth of the coin on the continent. Nobody lies inside Grethmoor, by custom.',
      tags: ['karrowdeep', 'bank', 'oaths', 'dwarven', 'records'],
    },
  ],

  npcs: [
    {
      name: 'Yeshkara Tulmai',
      shortDescription:
        'Envoy of the Haddari Khanate to the Bannermoot. An orc woman in her sixties, broad and upright, with iron-gray braids strung with bone beads, a scarred lip, and a riding coat of red felt. Veteran of the Ondrel War. Unhurried in everything.',
      faction: 'Haddari Khanate',
      location: 'The Quincunx',
      notes:
        "**Want:** to undo the Ondrel Cession lawfully at the Bannermoot and win back the winter pastures before another hard winter kills more clans, without a war. **Secret:** she carries the Tulmai Testimony in a sealed bone case at her belt: the deathbed confession of the Haddari proxy who signed the Ondrel Cession forty years ago under a false hushname, with the Cendral generals' and the sealing oathwright's knowledge. Testimony given at a khereg under the Zhorun is sacred to her people. It describes the oathwright only as 'a young Karrow with a copper braid'; she does not know it was Brannoc Uldskar. She plans to present it at the council and will not show it to anyone before then. She is also the Khan's aunt; she knows that if she dies in Dunmarrow, blamed on Cendral, the young Khan will ride to war, and she fears that more than dying. She judges people by whether they keep small promises. She will offer the player bread and salt (guest-right) if they earn it.",
    },
    {
      name: 'Borukh Tamsagan',
      shortDescription:
        "Tulmai's sworn guard. A huge orc of forty with a shaved head, a curved horse-sword, and a face like a closed door. Never sits with his back to a crowd. Has not said a civil word to a human since arriving.",
      faction: 'Haddari Khanate',
      location: 'The Quincunx',
      notes:
        "Starts hostile to the player: humans burned his family's yurts in the Ondrel War, and he considers a Cendrali escort an insult. **Want:** to bring Tulmai home alive; privately, to see Cendral pay in blood for the Ondrel dead. **Secret:** he has been meeting Tizzick Quennell in Scrivelow to draft a Zhorun blood-price claim against the Cendral crown, which he means to file after the council. If discovered, these meetings make him look like a man plotting something, which makes him a strong red herring. He is not involved in the assassination and would die for Tulmai. The player's keepsake name-cord bears the clan mark of his elder brother, killed in the Ondrel War; if he sees it, he will demand to know how the player came by it (a Zhorun matter: honest answer earns grudging respect, a lie earns a challenge). Can be won over by courage, plain speech, and taking a wound for the envoy.",
    },
    {
      name: 'Brannoc Uldskar',
      shortDescription:
        'Senior oathwright of Grethmoor and sealing officer of the Bannermoot. An elderly dwarf with a long copper-and-white braid clasped in gold, a kindly face, and ink on his cuffs. Deaf in his left ear. Everyone in Dunmarrow trusts him.',
      faction: 'Karrowdeep',
      location: 'Grethmoor',
      notes:
        "Gives the player the escort job; he recommended them to the Tollward personally. **He is the one who wants the envoy dead.** **Want:** to keep the Tulmai Testimony from ever being heard. Forty years ago, as a young oathwright, he sealed the Ondrel Cession knowing the Haddari signatory swore on a false hushname, under pressure from Cendral generals and his own guild-master. If it comes out, the Cession is void, and worse, the world learns a Karrow oathwright sealed a lie: trust in dwarven oaths, and so in the mark, collapses. He sincerely believes that would ruin the continent more surely than a war. **Secret:** he hired six Cendrali deserters through intermediaries to ambush Tulmai in the streets on the way to the Vexillary, wearing Princess Idrienne's colors, so the murder would be blamed on Cendral. He recommended a human Tollward escort so that a human failure would support the frame. His hearing loss is his sealer's surety being collected for the hollow oath; it began forty years ago. He suspects, and is tormented by the thought, that the hollow Cession cracked the Quinthane and caused the Hesterfall. **Clues:** the assassins' crossbow bolts are Cendral-fletched but their heads bear a Karrow foundry stamp; the killers were paid in new, unclipped marks from a single mint-run issued only to Grethmoor this month; the fee for their silence-quillbind in Scrivelow was paid in the same coin; Sabeline Voss sold the envoy's route to a buyer who paid in the same coin; a player with oath-sense feels a cold prickle if he swears to his innocence. He is not a monster: cornered, he may confess, bargain, or try to die with his secret.",
    },
    {
      name: 'Tizzick Quennell',
      shortDescription:
        'A goblin advocate of Scrivelow, three and a half feet tall, in a tailored green coat bristling with pens. Spectacles on a chain, ink to the elbows, and a grin that means he has found a clause you missed.',
      faction: 'Pettifold',
      location: 'Scrivelow',
      notes:
        "**Want:** a landmark case. He dreams of being named the Bannermoot's Registrar of Quillbinds and of drafting the renewal of the Quinthane itself; exposing a conspiracy against an envoy would make his name. **Secret:** ten days ago an anonymous client, through a hooded human proxy, paid him to draft a silence-quillbind binding six men never to name their employer. He drafted it and now suspects what it was for. He is bound by his advocate's confidentiality quillbind and physically cannot name the client or describe the contract, but he can be asked questions he answers by pointed silence, can show the player his fee ledger (paid in fresh single-run Grethmoor marks), or can point out that a quillbind of silence does not forbid the six from writing. He is also drafting Borukh's blood-price claim, and cannot mention that either. He likes the player (they once found a stolen deed for him) and enjoys a clever loophole more than money.",
    },
    {
      name: 'Ismerai Tholle',
      shortDescription:
        'A Lirauni elf of immense age, the last living signatory of the Quinthane. Tall, straight-backed, in robes the color of dry leaves. Her silver hair has begun, in the last year, to turn truly gray, and her hands tremble.',
      faction: 'Lirauni',
      location: 'Verge of Liraun',
      notes:
        "**Want:** to see the Quinthane renewed before she dies, and to learn what is killing her people. She has perhaps a season left and refuses to enter a stillhouse until the Bannermoot. **Secret:** when the Quinthane was sworn, the Lirauni pledged their undying years as its surety. She alone still remembers the exact words. If the treaty has been secretly breached, the surety is being collected, and that would explain the Hesterfall. She has told no one: it would shame her people and give every other banner leverage over them. She does not know about the false Ondrel Cession, but if she learns of it she will understand at once. Her hushname is one of the five anchors of the Quinthane; her death before renewal will weaken it badly. She is kind to the player, treats them as a grandchild, and sees more than she says.",
    },
    {
      name: 'Sabeline Voss',
      shortDescription:
        "Spymaster for Princess Idrienne of Cendral, posing as a trade attaché. A slim human woman of thirty-five in impeccable gray, with a silver wheat-sheaf pin, a soft voice, and eyes that inventory the room. Knows everyone's business.",
      faction: 'Cendral (Princess Idrienne)',
      location: 'The Vexillary',
      notes:
        "Starts suspicious of the player, whom she assumes may be Duke Roake's creature. **Want:** to win Cendral's banner seat for Idrienne, which means courting the Haddari and proving Idrienne is the peace candidate. An envoy murdered by men in Idrienne's colors would destroy her. **Secret:** two weeks ago, short of funds, she sold the envoy's arrival date and route through Dunmarrow to an anonymous buyer via a Tollward clerk, believing it was for a merchant wanting to court the Haddari. The buyer paid in fresh Grethmoor marks, which she still has. She is terrified this will surface, and will lie about it at first; if the player proves discreet, she will trade the coins and the name of the clerk for protection. She also knows Duke Roake has been meeting Grethmoor bankers about Tobiah Ansel's debts, which is true but unrelated, and she will push the player toward Roake as the culprit.",
    },
  ],

  lore: [
    {
      title: 'The Quinthane',
      keywords: ['quinthane', 'bannermoot', 'vexillary'],
      body: "The treaty of the five peoples, sworn three hundred years ago at the crossroads where Dunmarrow now stands. It fixes borders, guarantees trade on the five roads, forbids war between signatories without a year's formal notice, and requires mutual defense against outsiders. It was bound on the hushnames of five signatories, one per people; only Ismerai Tholle of the Lirauni still lives. Its term ends at the midwinter Bannermoot, when it must be renewed by all five peoples with new sworn signatories, or lapse. Amendments like the Ondrel Cession were sworn into it as sub-oaths.",
    },
    {
      title: 'Hushnames',
      keywords: ['hushname', 'namespeaker', 'namespeaking'],
      body: 'Every person of the five peoples receives a secret name at birth, whispered once by a parent. Most never learn their own. A hushname spoken aloud with intent by one who truly knows it compels its owner for a single breath: to halt, to hear, or to answer one question truly. It cannot force self-harm. Each use costs the speaker: a nosebleed, a lost memory, sometimes a day of life. The Ovanth stones hum when a hushname is spoken near them. Stealing a hushname is a crime every banner punishes by exile or death.',
    },
    {
      title: 'Oathwrights and Sureties',
      keywords: ['oathwright', 'surety', 'namesworn'],
      body: "A binding oath is sworn on one's hushname, before a sealing oathwright, with a pledged surety: years of life, a sense, a memory, a skill. Break it and the surety is collected, slowly. The sealing oathwright pledges a lesser surety that the oath was honestly sworn. An oath on a false name is hollow, and a hollow sub-oath can crack the oath it sits inside. Karrowdeep oathwrights keep the sealed ledgers of every oath in their counting-houses; Grethmoor holds Dunmarrow's.",
    },
    {
      title: 'Quillbinds and the Pettifold',
      keywords: ['quillbind', 'pettifold', 'scrivelow', 'nameink'],
      body: "The goblin guild-cities of the Pettifold write quillbinds: contracts in name-ink, carrying a drop of each signer's blood. A bound party's body will carry out the clauses whatever the mind wants. Both parties must sign freely and read the language, and disputes over literacy, translation, and ambiguous clauses are the lifeblood of goblin advocates. Advocates themselves are bound by confidentiality quillbinds and cannot name their clients. In Dunmarrow, quillbinds are drafted and filed in the warren of Scrivelow.",
    },
    {
      title: 'The Hesterfall',
      keywords: ['hesterfall', 'long autumn', 'lirauni', 'stillhouse'],
      body: "The Lirauni have never died of age, until now. Some forty years ago an elf found a gray hair, and within a decade the first Lirauni died of old age. The forest of Liraun is graying with them: leaves turn ash-colored and hang without falling, the Greening songs fail, birds leave. Gray-haired elves withdraw to stillhouses to wait, and their names are no longer spoken. Humans call it the Long Autumn. Theories blame plague, curse, the Ovanth ruins, or divine judgment. The Lirauni do not discuss it with outsiders.",
    },
    {
      title: 'The Haddari Khanate and the Zhorun',
      keywords: ['haddari', 'zhorun', 'khanate', 'khereg'],
      body: "The orc horse-clans of the eastern steppe, ruled by a Khan chosen by the clan mothers. They live by the Zhorun: guest-right is absolute once bread and salt are shared; an insult is answered by apology or challenge; a life saved is a debt owed; lying to a guest is worse than murder. Their dead lie in kheregs, ancestor-mounds where the clan mothers hear them one night a year, and testimony given at a khereg is sacred. The current Khan is young, and his war-captains are restless.",
    },
    {
      title: 'The Ondrel Cession',
      keywords: ['ondrel', 'cession'],
      body: "Forty-one years ago the Haddari and Cendral fought the Ondrel War over the winter pastures along the Ondrel river. Cendral won, barely. The next spring the Khanate signed the Ondrel Cession, sworn into the Quinthane at the Vexillary and sealed by a Karrow oathwright, giving the pastures to Cendral lords. Without them, hard winters have killed herds and children on the steppe ever since. Every Haddari knows the grievance by heart. Duke Harlan Roake made his name in that war.",
    },
    {
      title: 'Throneless Cendral',
      keywords: ['cendral', 'ceolmar', 'idrienne', 'roake', 'brevannon'],
      body: 'High King Ceolmar of Cendral died last winter at Brevannon, rumored poisoned, with no named heir. His daughter Princess Idrienne is backed by the southern lords and the peace faction. His brother Duke Harlan Roake, hero of the Ondrel War, is backed by the army. Tobiah Ansel claims to be a son by a secret marriage and is financed by dwarven loans. Cendral\'s gold seat at the Vexillary stands empty with a black ribbon across it; whoever fills it at the Bannermoot will be halfway to the crown.',
    },
    {
      title: 'The Karrowdeep and Grethmoor',
      keywords: ['karrowdeep', 'grethmoor', 'karrow'],
      body: "The dwarven mountain holds, famous for mines and smithcraft and above all for banking. Karrow vaults hold the wealth of every nation, and the silver mark, stamped with the mint-run of the issuing vault, is trusted from steppe to sea. That trust rests on one proverb: a Karrow oath is never broken. Grethmoor is their counting-house in Dunmarrow. By custom no one lies inside it, and a dwarf's braid records their life; cutting another's braid is a mortal insult.",
    },
    {
      title: 'The Ovanth',
      keywords: ['ovanth', 'ommerstones'],
      body: 'The vanished builders of the black standing stones, dead roads, and drowned cities scattered across the continent, older than any living nation. Nothing of their language survives but carved glyphs no one can read with certainty. Their stones hum faintly when a hushname is spoken nearby, and scholars believe the Ovanth first discovered name-magic. The Ommerstones, a ring deep in the Verge of Liraun, are the largest ruin near Dunmarrow. Lately, some stones have begun to hum when no one is speaking.',
    },
    {
      title: 'Dunmarrow and the Tollward',
      keywords: ['dunmarrow', 'tollward'],
      body: "The free city at the meeting of the five roads, built on the neutral ground where the Quinthane was sworn. Ruled by a council of guild-masters and policed by the Tollward, wardens in slate-blue coats who swear to no people and carry brass toll-keys. City law: no blade drawn in the Quincunx on market days; quarrels between peoples go before a Tollward magistrate; every Bannermoot envoy travels with a Tollward escort, so no banner can be accused of harming another's guest.",
    },
  ],

  missions: [
    {
      title: "The Envoy's Road",
      giver: 'Brannoc Uldskar',
      description:
        "Yeshkara Tulmai, envoy of the Haddari Khanate, arrives at Dunmarrow's east gate today to take her seat at the Bannermoot. By city law she must be escorted by a Tollward, and old Brannoc Uldskar of Grethmoor has recommended you. It should be a short walk: through the Quincunx, across the city, to the Vexillary. But the envoy has come to reopen the Ondrel Cession, half of Cendral would rather she did not, and her bodyguard would sooner be escorted by a wolf than a human. Someone intends for her never to reach the council, and for Cendral to take the blame.",
      objectives: [
        'Meet Yeshkara Tulmai and her guard Borukh Tamsagan at the Quincunx',
        'Escort the envoy safely across Dunmarrow to the Vexillary',
        'Survive the ambush and examine what the attackers left behind',
        'Follow the trail of the killers\' pay through Scrivelow and Grethmoor',
        'Name the true hand behind the attack before the Bannermoot sits',
      ],
      rewards: {
        money: 150,
        xp: 150,
        skillXp: [{ skill: 'Perception', amount: 40 }],
        items: [
          {
            name: 'Haddari guest-knot',
            quantity: 1,
            description:
              'A knot of red horsehair and a single bone bead, given by an envoy of the Khanate. Any Haddari who sees it knows you have shared bread and salt with the clans, and owes you guest-right.',
            tags: ['token', 'haddari', 'social'],
          },
        ],
        relationships: [
          { npc: 'Yeshkara Tulmai', affinity: 20, trust: 25 },
          { npc: 'Borukh Tamsagan', affinity: 15, trust: 30 },
        ],
      },
    },
    {
      title: 'The Words of Surety',
      giver: 'Ismerai Tholle',
      description:
        "Ismerai Tholle, last living signatory of the Quinthane, has asked for you by name. Deep in the gray forest, the Ommerstones bear an Ovanth inscription she believes records the pledges made when the treaty was first sworn. Her eyes are failing and her legs will not carry her that far. She wants a faithful rubbing of the stones, and someone she trusts to have it read, quietly, before the Bannermoot.",
      objectives: [
        'Hear Ismerai Tholle\'s request at the Verge of Liraun',
        'Find the Ommerstones deep in the graying forest',
        'Take a faithful rubbing of the Ovanth inscription',
        'Have the inscription read by someone who knows old glyphs, without it becoming common knowledge',
        'Bring the reading back to Ismerai',
      ],
      rewards: {
        money: 60,
        xp: 100,
        skillXp: [{ skill: 'Tongues', amount: 30 }],
        items: [
          {
            name: 'Living leaf of Liraun',
            quantity: 1,
            description:
              'A single leaf, still green, sealed in a locket of pale wood. Ismerai sang it into being with the last of her Greening. It stays fresh while its bearer keeps faith with the Lirauni.',
            tags: ['keepsake', 'lirauni', 'magic'],
          },
        ],
        relationships: [{ npc: 'Ismerai Tholle', affinity: 20, trust: 25 }],
      },
    },
  ],

  character: {
    name: 'Idris Venn',
    archetype: 'Tollward warden',
    bio: "Twenty-six, born in Dunmarrow to a Cendrali veteran of the Ondrel War and a mother who copied contracts for goblin advocates. You grew up in the Quincunx, speaking three tongues before you could read one, and swore into the Tollward at twenty: no banner, no people, only the city. You are good at your job, and you have a gift you do not understand: when someone swears falsely near you, your skin goes cold. Your father never talked about the war, and died without explaining the orc name-cord he kept in his sea chest.",
    location: 'The Quincunx',
    money: 30,
    level: 2,
    xp: 70,
    hp: 20,
    maxHp: 20,
    skills: [
      { name: 'Polearms', level: 3, xp: 45, description: 'Tollward glaive drill: reach, sweep, and hook a rider from the saddle.' },
      { name: 'Perception', level: 2, xp: 35, description: 'Spotting the wrong face in a crowd and the crossbow on the roof.' },
      { name: 'Tongues', level: 2, xp: 20, description: 'Trade-speech, working Haddari, Karrow cant, and enough goblin legal-script to be dangerous.' },
      { name: 'Streetwise', level: 2, xp: 15, description: "Knowing Dunmarrow's quarters, its fixers, and which clerk takes bribes." },
      { name: 'Oath-sense', level: 1, xp: 10, description: 'A cold prickle when a false oath is sworn nearby. Untrained, unreliable, and rare.' },
    ],
    items: [
      { name: 'Tollward glaive', description: 'A long-hafted blade with a hook on the back, slate-blue ribbon at the socket.', tags: ['weapon', 'polearm'], equipped: true, properties: { damage: 'd10' } },
      { name: 'Tollward brigandine', description: 'Slate-blue cloth over riveted plates. Stops a knife, mostly.', tags: ['armor'], equipped: true },
      { name: 'Brass toll-key', description: 'Your badge of office on a chain. Opens the city gates and marks you as sworn to no banner.', tags: ['badge', 'key', 'tollward'], equipped: true },
      { name: 'Bitterdraught', description: 'A stoppered flask of dwarven healing tincture. Tastes like licking a forge.', quantity: 2, tags: ['potion', 'healing', 'consumable'] },
      { name: 'Wax tablet and stylus', description: 'For notes, names, and the numbers on things that should not have numbers.', tags: ['tool', 'writing'] },
      {
        name: "Father's Haddari name-cord",
        description:
          'A braided horsehair cord knotted around a bone bead carved with a Haddari clan mark. Your father brought it home from the Ondrel War and never said whose it was. Any orc of that clan would know it on sight.',
        tags: ['keepsake', 'haddari'],
      },
    ],
    relationships: [
      {
        npc: 'Brannoc Uldskar',
        affinity: 25,
        trust: 30,
        status: 'patron',
        historyNotes: "- Changed your first month's pay into marks at a fair rate and called you \"a sensible young warden.\"\n- Recommended you personally for the envoy's escort.",
      },
      {
        npc: 'Tizzick Quennell',
        affinity: 15,
        trust: 5,
        status: 'acquaintance',
        historyNotes: '- You recovered a stolen deed for him last spring. He still sends you pamphlets on contract law.',
      },
      {
        npc: 'Ismerai Tholle',
        affinity: 20,
        trust: 15,
        status: 'fond',
        historyNotes: '- You carried her letters to the Vexillary for a season. She remembers your name, which elves rarely bother to do.',
      },
      {
        npc: 'Yeshkara Tulmai',
        affinity: 0,
        trust: 0,
        status: 'stranger',
        historyNotes: '- Your escort charge. You have never met.',
      },
      {
        npc: 'Borukh Tamsagan',
        affinity: -30,
        trust: -40,
        status: 'hostile',
        historyNotes: '- Refused your offered hand at the gate-post with a look. Calls you "Cendrali."',
      },
      {
        npc: 'Sabeline Voss',
        affinity: -5,
        trust: -20,
        status: 'suspicious',
        historyNotes: '- Has asked two Tollward clerks this week which lord you drink with.',
      },
    ],
  },
};
