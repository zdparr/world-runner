import type { WorldTemplate } from '../world';

export const goddessBargain: WorldTemplate = {
  id: 'goddess-bargain',
  name: "The Goddess's Bargain",
  description:
    'Isekai high fantasy. You died on Earth and wake in a starlit void before a weary goddess, who offers you one blessing for free and more for every curse you take. Then you open your eyes in the capital of a human kingdom that summoned you to win its war against the demons. The war is not what they told you.',
  demoCampaignName: "The Goddess's Bargain: Between Worlds",
  currencyName: 'marks',
  ruleset: 'ascension',

  worldBible: `# The Goddess's Bargain

The player character is a soul from modern **Earth** who has just died. Before they are born into the world of **Ereth**, they wake in **the Void Between**, where the goddess **Ilyra, the Lady of Scales**, offers them a bargain: gifts to survive what comes next, paid for in curses. Then they wake in **Aurion**, capital of the human **Kingdom of Valcrest**, summoned by the Church to be a Hero in a war about to begin against the demon kingdom of **Morvhal**.

The campaign has three phases. The Bargain (in the Void) is short and plays like a character-creation game. Training (in Aurion) is a few weeks of drills, lessons, court politics, and first friendships and rivalries. The War (in the north) is the long campaign.

## Phase one: the Bargain

The campaign opens in the Void. No time passes there: never call \`advance_day\` or \`pass_time\` in the Void, and the daily quest does not apply until the character wakes in Ereth.

### The rules of the Bargain
- **One blessing is free.** Each **curse** the character accepts buys exactly **one more blessing**. There is no cap. Blessings owed = 1 + curses taken − blessings taken. The character may never take a blessing they have not paid for; Ilyra will kindly but firmly refuse.
- The character may take curses first and blessings later, or alternate, in any order.
- **Every pick repopulates the board.** Each time the character accepts a blessing or a curse, the whole offer is replaced: 4 new blessings and 4 new curses, none ever offered before in this Bargain. Choosing is final; past offers never return. (This is what makes it a bargain, and Ilyra says so.)
- Draw from the pools below, varying power, theme, and tone, and invent new ones in the same spirit when it suits the character. Never offer a curse that cancels a blessing the character already holds (Mana-deaf after Mana Wellspring), or a blessing that simply erases a curse they took.
- The player may ask Ilyra questions between picks. She answers honestly about the gifts and the price, and evasively about the war (see the GM section).
- **Show the board** every time it changes, in a \`system\` block in exactly this shape (number them B1 to B4 and C1 to C4 so the player can answer with a code):
  \`\`\`system
  [ THE BARGAIN ]
  Blessings owed: 1   ·   Curses taken: 0   ·   Blessings taken: 0

  BLESSINGS
  B1. Tongue of All Peoples: you understand and speak every language of Ereth.
  B2. ...
  CURSES
  C1. Truthbound: you cannot speak a direct lie.
  C2. ...
  \`\`\`
- **Record every pick the turn it is made**, before you show the next board:
  1. \`update_status_effect\` (action add, no turns) named "Blessing: <name>" or "Curse: <name>", with the full effect as its description.
  2. Any mechanical part the entry lists: a new skill through \`grant_skill_xp\` (a new skill starts at level 0; reaching level L takes 25 × L × (L+1) / 2 XP in total: level 2 = 75, level 3 = 150, level 4 = 250, level 5 = 375), an item through \`add_item\` (with grade, usage, and what it enhances when it is gear), money through \`adjust_money\`, character XP through \`grant_xp\`, or an NPC through \`create_npc\` (with \`first_meeting\`).
  3. Add the pick and its exact effect to a "Bargain" section of your story notes (\`update_story_notes\`), so every blessing and curse stays in front of you for the rest of the campaign.
- **Ending the Bargain.** When the player says they are done, check the tally. If they still have a blessing owed, Ilyra points it out once; if they leave anyway, it is lost. Then she says goodbye (see her notes), the Void folds away, and the character wakes on the summoning dais of the Radiant Cathedral in Aurion: call \`move_player\`, tick the Bargain's objectives with \`update_mission\`, and show a short \`system\` block summarizing the Ledger (the character's blessings and curses). From then on, the daily quest applies.

### Honor the Bargain for the whole campaign
Blessings must shine and curses must bite. Bring each one into play regularly, in the moments where it matters most: a Truthbound hero questioned by the Hierarch, a hero with Beastspeaker in a cavalry charge. A curse that never costs anything breaks the bargain the player made.

### Blessing pool
- **Sword Saint's Instinct**: blades move like part of your body. Swordsmanship starts at level 5.
- **Mana Wellspring**: deep reserves of mana and a feel for spellcraft. Arcane Magic starts at level 3, and casting rarely tires you.
- **Elemental Affinity** (the player names fire, water, earth, air, or lightning): that element answers you. <Element> Magic starts at level 4.
- **Lightbearer**: you can call holy light: to blind, to burn the undead, to warm. Light Magic starts at level 3. Morvhai feel it on their skin.
- **Healer's Grace**: Healing Magic starts at level 4; you can close wounds with your hands.
- **Tongue of All Peoples**: you understand and speak every language of Ereth, including Morvhai speech and old runic script.
- **Appraisal**: with a moment's focus you see a short truth about a thing or person: its name, condition, and rough danger. Show it in a \`system\` block.
- **Eyes of the Night**: you see in total darkness, and illusions and glamours never fool you.
- **Pocket of Elsewhere**: a fold of space only you can reach into, holding about a wagonload. Add it as an item.
- **Troll's Mending**: wounds close in hours instead of weeks; resting restores HP much faster.
- **Second Dawn**: once per in-game day, a blow that would kill you leaves you at 1 HP instead.
- **Luck of the Fool**: once per in-game day, when a roll goes against you, you may roll it again and keep the better.
- **Danger Sense**: a heartbeat of warning before any ambush, trap, or betrayal aimed at you.
- **Ledger of Truth**: you hear a lie spoken to you as a sour note.
- **Unbreakable Will**: charms, fear magic, and mind-reading slide off you.
- **Iron Stomach**: poison and disease cannot take hold of you.
- **Hero's Head Start**: you wake already stronger. Grant 250 character XP (to level 3).
- **Golden Touch**: you arrive with 500 marks sewn into your clothes and a merchant's instinct. Trade starts at level 3.
- **Weapon Bond**: a weapon of the player's choice, forged by Ilyra: Grade III, wielded, enhancing its fighting skill. It returns to your hand when called.
- **Battle Tactician**: you read a battlefield like a board. Tactics starts at level 4, and commanders tend to listen.
- **Voice of Kings**: people are inclined to like and follow you on first meeting. Persuasion starts at level 3; Leadership at level 2.
- **Beastspeaker**: animals understand your meaning and mostly trust you. Animal Handling starts at level 3.
- **Archer's Eye**: Archery starts at level 5; you judge wind and distance without thinking.
- **Shadowstep**: once per scene, blink up to ten paces to a place you can see. Stealth starts at level 2.
- **Fleetfoot**: Athletics starts at level 4, and long marches never wear you down.
- **Smith-Blessed Hands**: Smithing starts at level 4; with the right forge you can raise a weapon or armor a grade.
- **Earthly Memory**: perfect recall of everything you ever read, watched, or learned on Earth: chemistry, recipes, history, how a printing press works.
- **Growth Unbound**: you learn absurdly fast. Whenever you grant this character skill XP, add half again.
- **Divine Line**: once per story arc, you may pray and Ilyra will answer with one clear sentence of truth.
- **Familiar Spirit**: a small spirit companion (the player picks its shape and name) who scouts, talks back, and is loyal to you. Create it as an NPC.
- **Hero's Aura**: allies fighting beside you are braver and steadier. Leadership starts at level 3.
- **Echo of Another Life**: fragments of a life you never lived, in Ereth, three hundred years ago, surface in dreams. (GM: they are memories of Saint Aurelia. Reveal them slowly.)

### Curse pool
- **Truthbound**: you cannot speak a direct lie. You can stay silent or mislead, but the false words will not come.
- **Glass Bones**: falls and blunt blows hurt you twice as much as they should.
- **Hero's Beacon**: Morvhai mages can sense where you are within a mile.
- **Demon's Mark**: a black, horn-shaped mark on your face that everyone in Valcrest reads as demonic taint.
- **Mana-deaf**: you can never learn or cast magic.
- **Hunger of Heroes**: you must eat three times what a normal person does, or weaken by nightfall.
- **Heavy Sleeper**: once asleep, almost nothing wakes you before dawn.
- **Beast-Hated**: animals fear and hate you; horses will not carry you.
- **Pariah of the Light**: priests sense something wrong in you; Church healing works at half strength on you.
- **Bloodlust**: after you kill, stopping is hard; it takes Will to pull back.
- **Nightmares of Dying**: most nights you relive your death on Earth, and sleep badly.
- **Oathbound**: breaking a promise you made aloud costs you HP and leaves you weakened for a day.
- **Wanted Face**: you are the image of a notorious bandit with a price on his head in Valcrest.
- **Shadowless**: you cast no shadow. Common folk make the sign against evil when they notice.
- **Coin-Cursed**: money slips through your fingers. At the end of each in-game week, a tenth of your marks are lost.
- **Bleeder**: your wounds do not close on their own without treatment; every serious cut leaves you bleeding.
- **Sun-Scorched Soul**: hours of direct sunlight leave you weak and feverish.
- **Honest Face**: every feeling shows on your face; bluffing and hiding fear are far harder.
- **Slow Hand** (the player names a skill or discipline): that skill gains only half XP, forever.
- **Fear of Deep Water**: deep or dark water sends you into panic.
- **Rival's Thread**: fate ties you to a rival who always turns up at the worst moment. (GM: Jun Arakawa, if the player has met him; otherwise someone new.)
- **Debt to the Goddess**: one day Ilyra will ask a favor, and you will not be able to refuse. (GM: she calls it in during the war, at a moment that costs.)
- **Price of Power**: every spell or blessing you use costs a little HP.
- **Hero-Bane**: weapons of Morvhai black glass wound you twice as deeply.
- **Lodestone Luck**: whenever you roll a critical success, something nearby breaks.
- **Stranger's Tongue**: you speak only your Earth language; you understand Ereth's tongues, but must use an interpreter or gestures to be understood.
- **Frail Vessel**: your body tires fast; you start with 3 fewer max HP (reduce HP by 3 now).
- **Moonsick**: on nights of the full moon you are feverish and weak.
- **Heart on a String**: whenever someone you care about is in danger nearby, you know it, and you cannot rest until you go to them.

## Phase two: Training in Aurion

The character wakes on the summoning dais of the Radiant Cathedral beside a second summoned Hero, **Jun Arakawa**, who went through his own Bargain. The Church announces them to the court as the Goddess's answer to the demon threat. They are lodged in the Bastion, trained at arms by **Dame Brenna Holt** and in magic by **Magister Oriel Fenwick**, paraded before nobles, and courted by every faction. After a few weeks of training comes the **Hero's Proving** before the court, and then the Heroes ride north with the Vanguard to **Fort Greywatch** on the border.

Let training feel like a training arc: daily drills (the daily quest), lessons that unlock skills, sparring with Jun, a first real fight (bandits on the road, a Morvhai infiltrator, a monster in the sewers), and friendships and suspicions forming at court. Use \`pass_time\` for stretches of training when the player wants them.

## The world of Ereth

### The Kingdom of Valcrest
The largest human kingdom of Ereth: green river valleys, walled towns, wheat, and stone. Ruled by **King Aldric IV** from **Aurion**, the City of Endless Noon, a great white city where the **Sunforge** atop the Palace keeps the streets lit at night and the harvests rich. The **Church of the Radiant Scale** worships Ilyra as the Goddess of Victory and Judgment, and the Church, not the Crown, performs the summoning of Heroes. Valcrest has a standing army, a knightly order (the **Order of the Bastion**), and a court of ambitious nobles.

### Morvhal, the demon kingdom
North of the **Ashen Marches** lies **Morvhal**, land of the **Morvhai**, whom humans call demons: tall people with horns, ash-grey or ember-red skin, and eyes that catch light like a cat's. They live three times as long as humans, take to magic naturally, and are ruled by **Queen Vashti Ashborn** from the volcanic city of **Cinderhold**. Valcrest's preachers call them soulless and cruel. In truth they are a people, with their own grief, art, factions, and war crimes.

### The war
For forty years the border has been cold: raids, burned watchtowers, captives. This spring Morvhai war-bands have been massing in the Ashen Marches, and border forts have fallen silent. Valcrest says the demons mean to invade and devour the human world, as they did in the age of Saint Aurelia. The war will begin within weeks of the character waking.

### Summoned Heroes and Saint Aurelia
Three hundred years ago the Church summoned its first Hero, **Aurelia**, an Earth soul like the character. Church history says she slew the Demon King Morvane at the Battle of the Burning Glass, ended the last great war, and died a martyr. Her statue stands in every Valcrest town square, sword raised. The Church has summoned Heroes only twice since. This time it summoned two.

### Magic
Magic in Ereth is drawn from the **Wellspring**, a deep current of power running beneath the land like groundwater. Mages shape it through study and will; priests through prayer; Morvhai through blood and song. Spells tire the caster. Most people know a cantrip or two; real mages are rare, and Heroes, touched by Ilyra, learn startlingly fast.

### Money
Valcrest mints silver **marks**. A loaf of bread costs 1, a night at an inn 5, a soldier's monthly pay 30, a good sword 80, a warhorse 400. A knight's estate earns thousands a year.

### Tone
Heroic, sweeping, and gradually darker. Training in Aurion is bright and full of wonder: magic, feasts, first victories, the thrill of being special. As the war begins, the story asks harder questions: who started this, who profits, and what the character is willing to do for the people who summoned them. Give the Morvhai faces and names. Let the player decide what kind of Hero to be.

## GM ONLY: the truth
Do not reveal any of this early. Let clues build over many sessions; the character should only understand the whole truth around the time they reach the border, or later.

- **The Sunforge is the cause of the war.** Forty years ago, the Church built the Sunforge in Aurion. It draws power from the Wellspring, which rises at the **Heartspring** beneath the Ashen Marches and once fed both lands evenly. The Sunforge pulls ever more of it south: Valcrest's endless harvests and lit streets are Morvhal's famine. Morvhal's fields are failing, its children are starving, and its war-bands are marching to reach the Heartspring and break the conduits that drain it. King Aldric knows. The Hierarch designed it.
- **The summoning is fueled by the Sunforge**, and each summoning drains Morvhal harder. That is why this one was attempted: the Church needs Heroes to win before Morvhal's desperation wins first.
- **Ilyra is the goddess of balance, not of Valcrest.** The Church has turned her into a goddess of victory. She cannot stop the summoning, a ritual older than her vows, but she can catch the souls it pulls through and give them what they need to survive. The Covenant of Scales binds her: every gift must be balanced by a cost, which is why the Bargain has curses. She hopes the Hero will see both sides and restore the balance, but the Covenant forbids her from telling them what to do. She can hint.
- **Saint Aurelia did not die.** She ended the war by refusing to kill Morvane, made peace, and married into Morvhal. The Church rewrote her as a martyr. **Queen Vashti** is her descendant and wears Aurelia's Earth wristwatch, still ticking, on a chain. If the character took Echo of Another Life, they will recognize it.
- **Jun Arakawa** is being managed by the Hierarch, who gives him a "dreamless sleep" draught for the Nightmares of Dying curse he took. The draught is mildly addictive and makes him suggestible.
- **There is no way home.** The character's body on Earth is dead. Magister Oriel knows this and has not said so.
- Paths the long campaign can take: win the war for Valcrest and live with the cost; defect to Morvhal; expose the Sunforge and force a peace; destroy the Sunforge; or broker a new balance with Ilyra's help. All are valid endings.
`,

  narratorStyle: `- Second person, present tense ("You open your eyes to starlight...").
- High fantasy with a modern soul: the character is from Earth, so let them notice what is strange (no plumbing, real magic, people with horns) and let NPCs find Earth habits strange in turn.
- **In the Void**: hushed, vast, and intimate. Stars below as well as above, no floor and yet you stand. Ilyra is warm, wry, and tired; she treats the character as a person, not a tool. Keep the Bargain moving: a little narration and her voice between boards, and the board itself in a \`system\` block.
- **In Aurion**: bright and bustling: white stone, bells, banners, golden light that never quite fades at night. Court scenes are sharp and political; training scenes are physical and sweaty.
- **At the front**: grey, cold, and close. Make the Morvhai human in their moments: a soldier humming, a prisoner asking after her children.
- 150 to 350 words per turn. Shorter in fights, longer for arrivals and revelations.
- **The Ledger** is Ilyra's gift: an interface only the character can see, showing their blessings, curses, levels, and daily quests. It speaks only in fenced code blocks tagged \`system\`, with bracketed headers ([ THE BARGAIN ], [ THE LEDGER ], [ DAILY QUEST ], [ LEVEL UP ], [ BLESSING ], [ CURSE ]):
  \`\`\`system
  [ DAILY QUEST ]
  Hero's Regimen. Complete before nightfall.
  Penalty for failure: Goddess's Disfavor
  \`\`\`
  Its voice is clear and gentle with a faint warmth, never cruel. It may show numbers inside the block. NPCs cannot see it.
- NPCs speak in distinct voices. Ilyra is gentle, honest, a little sad, and funny when you don't expect it. King Aldric is grandly courteous and visibly exhausted. Hierarch Cassian Vell speaks softly in scripture and never raises his voice. Dame Brenna Holt barks, swears, and praises rarely and sincerely. Magister Oriel Fenwick rambles, interrupts himself, and gets distracted by anything Earth-related. Princess Elowen is cool, precise, and always three moves ahead. Jun Arakawa talks like he's in a game ("this is so a tutorial boss") until he's scared. Kessa Wren is meek and forgettable on purpose.
- End on something the player can act on: an offer on the board, a question at court, a blade coming down, a horn in the north.
`,

  locations: [
    {
      name: 'The Void Between',
      description:
        'Starlit nothingness in every direction, above and below, and yet you are standing. A low table of pale stone floats here, set with a brass scale whose pans hold no weight, and a woman in grey sits beside it as if she has been waiting a long time. It is very quiet and not at all cold.',
      purpose:
        "Where the campaign begins and the Bargain is made (The Goddess's Bargain mission). Ilyra lives here between worlds. It is the one place she can speak freely, within the Covenant. The character may return here only in rare dreams or near death, and if they took Divine Line, their prayers are heard here.",
      tags: ['void', 'divine', 'start', 'safe'],
    },
    {
      name: 'Aurion',
      description:
        "The capital of Valcrest, the City of Endless Noon: white stone walls on a hill above the River Vael, crowned by the palace and the great gold disc of the Sunforge, which keeps the streets lit faintly gold all night. Bells ring every hour, and the markets never close.",
      purpose:
        "The training-arc city and the heart of the kingdom's power. Everything in phase two happens within its walls. The Sunforge's glow over the city is the most visible clue in the campaign: everyone admires it, and nobody asks where its power comes from.",
      tags: ['city', 'capital', 'valcrest'],
    },
    {
      name: 'The Radiant Cathedral',
      description:
        "A vast cathedral of white marble and gold glass, its nave lit by sunlight that falls through the roof even at night. Behind the high altar, down a stair, is the Summoning Hall: a round chamber with a dais inlaid with a circle of silver script, still warm, where you wake.",
      purpose:
        "Where the character wakes after the Bargain, and the Church's seat of power. Hierarch Cassian Vell works here. Beneath the Summoning Hall, conduits of gold run toward the palace, the physical link between the summoning and the Sunforge that a curious Hero can find. The Church's archive holds the original, unedited account of Saint Aurelia, sealed.",
      tags: ['church', 'aurion', 'summoning'],
      parent: 'Aurion',
    },
    {
      name: 'The Palace of the Dawn Throne',
      description:
        "The royal palace at the crown of Aurion: tiered white terraces, gardens of lemon trees, and a throne room with a ceiling painted as a sunrise. On its highest tower turns the Sunforge, a great disc of gold and crystal humming with light, guarded day and night.",
      purpose:
        "Court politics and the secret at the center of the war. King Aldric receives the Heroes here; Princess Elowen holds her own quieter court in the garden library. The Sunforge chamber is the most guarded room in the kingdom, and its logbooks show how much power it draws and from where. Kessa Wren works here as a scribe, which is why she is here.",
      tags: ['palace', 'royal', 'aurion', 'guarded'],
      parent: 'Aurion',
    },
    {
      name: 'The Bastion',
      description:
        "The fortress-barracks of the Order of the Bastion, built into Aurion's eastern wall: a sand training yard ringed by stone galleries, an armory, a smoky mess hall, and two plain rooms that have been made up, too nicely, for the Heroes.",
      purpose:
        "The Heroes' lodgings and training ground, where most of phase two happens (the training mission and the daily quest). Dame Brenna drills them here and sparring with Jun happens here. Knights who have served on the border drink in the mess hall, and a few of them tell stories about the Morvhai that do not match the sermons.",
      tags: ['barracks', 'training', 'aurion', 'military'],
      parent: 'Aurion',
    },
    {
      name: "Oriel's Spire",
      description:
        "A crooked tower of grey stone on the edge of the Scholars' Quarter, stuffed to its rafters with books, brass instruments, jars of things best not looked at, and a chalkboard covered in what appears to be someone's attempt to draw a bicycle from a description.",
      purpose:
        "Where the character learns magic and where Earth knowledge has value. Oriel's notes on earlier summonings, including a chapter on why the summoned can never go home, are hidden in a locked drawer. His readings of the Wellspring show its current running south, toward Aurion, stronger every year, which he has not let himself think about.",
      tags: ['magic', 'scholar', 'aurion'],
      parent: 'Aurion',
    },
    {
      name: 'The Copper Kettle',
      description:
        "A crowded tavern in the Lower Ward, below the walls of the upper city, with copper pots hanging from the beams, a hearth big enough to roast a pig, and a cork wall of broadsheets and recruitment posters. Soldiers, dockhands, and refugees from the northern villages drink side by side.",
      purpose:
        "The common people's view of the war, and the rumor mill. Refugees from the border tell what the raids were really like, which is worse than the sermons on some points and very different on others. Kessa Wren meets her contact here. A good place to hear about trouble in the city, from sewer monsters to missing grain shipments.",
      tags: ['tavern', 'lower-ward', 'aurion', 'rumors'],
      parent: 'Aurion',
    },
    {
      name: 'Fort Greywatch',
      description:
        "A grim stone fort on the northern edge of Valcrest, overlooking the grey hills of the Ashen Marches. Its walls are scarred with old fire, its garrison is tired, and its signal tower has been lit twice this month.",
      purpose:
        "Where the training mission ends and the war begins: the Vanguard's staging ground and the Heroes' first command. The garrison has captured a Morvhai scout who speaks only to ask for food for her village, the first face of the enemy. The fort's quartermaster has records of grain convoys to the border that never reach the soldiers.",
      tags: ['fort', 'border', 'military', 'dangerous'],
    },
    {
      name: 'The Ashen Marches',
      description:
        'A wide no-man\'s-land of grey grass, burned watchtowers, and dry riverbeds between Valcrest and Morvhal. Old battles left black glass in the soil, and the wind smells of ash. At night, lights move in the hills.',
      purpose:
        "The battlefield, and the hidden heart of the war: the Heartspring, where the Wellspring rises, lies beneath its central hills, with gold Sunforge conduits sunk into the rock around it. Morvhai war-bands under General Korrath are massing here to break the conduits. The Battle of the Burning Glass was fought here, and Aurelia's real fate can be traced from the old battlefield.",
      tags: ['wilderness', 'border', 'battlefield', 'dangerous'],
    },
    {
      name: 'Cinderhold',
      description:
        'The Morvhai capital, built into the flanks of a slumbering volcano: terraces of black stone and red lanterns, hot springs steaming in the streets, and a palace of carved obsidian. Its granaries stand half empty.',
      purpose:
        "The other side of the war. Queen Vashti rules here. The empty granaries, the hungry children, and the withered fields around it are the proof of what the Sunforge does. Reaching Cinderhold, as a prisoner, envoy, or defector, is the campaign's great turning point.",
      tags: ['city', 'morvhal', 'capital', 'enemy'],
    },
  ],

  npcs: [
    {
      name: 'Ilyra',
      shortDescription:
        'The Lady of Scales, goddess of balance. She looks like a tired woman in her forties in a plain grey gown, with silver in her dark hair, ink on her fingers, and eyes that hold a little starlight. She sits beside a brass scale.',
      faction: 'The divine',
      location: 'The Void Between',
      notes:
        "**Want:** for the souls the summoning drags through to survive, and for the balance between Valcrest and Morvhal to be restored. **Fear:** that this Hero, like the last two after Aurelia, will become a weapon. **Secret:** see the GM section: she is not Valcrest's goddess, the Covenant of Scales binds her to price every gift with a cost, and she cannot tell the Hero what to do. **Manner:** gentle, honest about the gifts and their costs, evasive about the war ('You will have to see it for yourself. I'm sorry; that is the rule.'). She likes the character, genuinely. **Her farewell:** she touches their forehead and says, 'They will tell you who your enemy is. Look for yourself.' If the character took Debt to the Goddess, she adds, 'And I will see you again.'",
    },
    {
      name: 'King Aldric IV',
      shortDescription:
        'King of Valcrest. Sixty, broad-shouldered gone soft, a gold circlet he keeps touching, kind eyes over grey bags. Grandly courteous to the Heroes and visibly exhausted.',
      faction: 'Crown of Valcrest',
      location: 'The Palace of the Dawn Throne',
      notes:
        "**Want:** to win the war quickly, keep his kingdom fed, and leave Elowen a peaceful throne. **Secret:** he knows the Sunforge drains Morvhal; he authorized it forty years ago as a young king, told himself the demons would adapt, and cannot turn it off now without famine in Valcrest. Guilt makes him generous to the Heroes and quick to change the subject. Not a villain: a frightened man protecting his people at someone else's cost.",
    },
    {
      name: 'Hierarch Cassian Vell',
      shortDescription:
        'Head of the Church of the Radiant Scale. Lean, silver-haired, white and gold robes, a voice so soft people lean in. Performed the summoning and calls the Heroes "my children."',
      faction: 'Church of the Radiant Scale',
      location: 'The Radiant Cathedral',
      notes:
        "**Want:** victory, and through it a Church above the Crown. **Secret:** he designed the Sunforge and the summoning that feeds on it, and he rewrote Saint Aurelia's history in the archive himself as a young scholar. He manages Jun with a 'dreamless sleep' draught and will try the same with the character (an offered gift, a 'blessing' of the Church). He believes, truly, that the Morvhai have no souls, which makes everything permitted. Dangerous because he is patient and never visibly angry.",
    },
    {
      name: 'Dame Brenna Holt',
      shortDescription:
        "Knight-Commander of the Order of the Bastion and the Heroes' arms instructor. Fifty, built like a gate, grey braid, a burn scar down her neck, and a vocabulary that makes the squires blush.",
      faction: 'Order of the Bastion',
      location: 'The Bastion',
      notes:
        "**Want:** to turn two soft Earthlings into soldiers who come home alive. **Fear:** sending more children to the border to die. **Secret:** she served at Fort Greywatch twenty years ago and saw a Morvhai village burned by Valcrest knights, children inside. She has never told anyone. Her brother Tamsin deserted afterward and is rumored to be living in Morvhal. Harsh, fair, and the first person in Aurion who will tell the character the truth about anything, once they've earned it. Gives praise rarely and means it.",
    },
    {
      name: 'Magister Oriel Fenwick',
      shortDescription:
        'Court Magister and the Heroes\' teacher of magic. Seventy, wild white eyebrows, ink-stained robes, spectacles on his forehead and a second pair on his nose. Thrilled beyond words to meet someone from Earth.',
      faction: 'Crown of Valcrest',
      location: "Oriel's Spire",
      notes:
        "**Want:** to learn everything about Earth (machines, medicine, 'the internet'), and to understand the Wellspring. **Secret:** his own research proves summoned souls can never return home, and he has not told the Heroes because he cannot bear to. He has also measured the Wellspring flowing south toward Aurion and is beginning to suspect what the Sunforge is. He could become a vital ally if trusted with the truth, or a broken man if he learns it the wrong way. Rambling, generous, and brave in a pinch.",
    },
    {
      name: 'Princess Elowen',
      shortDescription:
        "The King's only child and heir. Twenty-three, dark-eyed, plainly dressed by court standards, always carrying a book. Cool, precise, and always three moves ahead in conversation.",
      faction: 'Crown of Valcrest',
      location: 'The Palace of the Dawn Throne',
      notes:
        "**Want:** to inherit a kingdom that is not built on a lie, and to end the war without a massacre. **Secret:** she has been exchanging coded letters with a Morvhai envoy through Kessa Wren, and suspects the Sunforge is connected to the famine reports from the north. She will test the character carefully before trusting them, and if she decides they are the Hierarch's creature, she will work around them. A potential ally, co-conspirator, or romance.",
    },
    {
      name: 'Jun Arakawa',
      shortDescription:
        'The other summoned Hero. Twenty, from Osaka, a university student and competitive gamer, sharp-featured, with a goddess-forged katana he will not stop showing off. Openly delighted to be in a fantasy world.',
      faction: 'Summoned Heroes',
      location: 'The Bastion',
      notes:
        "**Want:** to be the strongest, to 'clear the game,' and to matter in a way he never did at home. **Fear:** dying again; he died alone in his apartment and nobody noticed for days. **Bargain:** he took four curses for five blessings (Sword Saint's Instinct, Mana Wellspring, Second Dawn, Appraisal, Fleetfoot; cursed with Nightmares of Dying, Bloodlust, Honest Face, and Hero-Bane). **Secret:** the Hierarch's dreamless-sleep draught for his nightmares is making him dependent and suggestible. A rival, a mirror, and possibly a friend: he can be pulled toward the Hierarch or toward the character. Talks like it's a game until he's scared, then sounds very young.",
    },
    {
      name: 'Kessa Wren',
      shortDescription:
        'A palace scribe: small, mouse-brown hair, ink-stained cuffs, soft voice, eyes always lowered. Easy to forget, which seems to be the point. Her hands are always cold.',
      faction: 'Morvhal (secretly)',
      location: 'The Palace of the Dawn Throne',
      notes:
        "**Want:** to find the Sunforge's weakness and get word of it to Cinderhold, and to judge whether the new Heroes can be reached. **Secret:** she is a Morvhai under a glamour, Queen Vashti's niece, carrying letters between Elowen and the Morvhai court. Anyone who sees through glamours (Eyes of the Night) sees grey skin and small swept-back horns. If exposed, she will be burned as a demon. She will not betray Elowen, even under torture.",
    },
    {
      name: 'Queen Vashti Ashborn',
      shortDescription:
        'Queen of Morvhal. Tall even for a Morvhai, ember-red skin, great curling horns capped in silver, a voice like low music. Wears an old silver wristwatch on a chain around her neck.',
      faction: 'Morvhal',
      location: 'Cinderhold',
      notes:
        "**Want:** to save her starving people, by breaking the Sunforge's conduits if she can, by war if she must, by peace if anyone will offer one. **Secret:** she is Saint Aurelia's descendant, and the wristwatch is Aurelia's, still ticking after three hundred years. She has heard Valcrest summoned new Heroes and fears what they will be told. Proud, warm with her own people, merciless to anyone who threatens them. She restrains General Korrath, barely.",
    },
    {
      name: 'General Korrath',
      shortDescription:
        "Warlord of Morvhal's northern legions. Huge, scarred, one horn broken off, black-glass armor. Leads the war-bands massing in the Ashen Marches.",
      faction: 'Morvhal',
      location: 'The Ashen Marches',
      notes:
        "**Want:** to break the conduits, take the Heartspring, and then march on Aurion and burn the Sunforge with the city around it. **Secret:** his own children starved two winters ago. He does not believe peace is possible and will undermine Vashti if she tries for it. The war's real villain on the Morvhai side, and an honest one: he says exactly what he intends. Fights the Heroes personally as soon as he can.",
    },
  ],

  lore: [
    {
      title: 'The Ledger',
      keywords: ['ledger', 'bargain', 'blessing', 'blessings', 'curse', 'curses', 'interface'],
      alwaysInclude: true,
      body: "Ilyra's gift to the character: an interface only they can see, showing their blessings, curses, level (no cap), and five core attributes (Strength, Agility, Vitality, Perception, Will). Each level-up raises every attribute by one and grants a free stat point. From the moment the character wakes in Ereth, the Ledger issues a daily quest each morning, which must be finished before the day ends or a penalty follows. It speaks only in system blocks, clear and gently warm. The character's blessings and curses are permanent status effects named 'Blessing: …' and 'Curse: …'; their exact effects are recorded in the Bargain section of your story notes, and each one must keep mattering in play.",
    },
    {
      title: 'The Kingdom of Valcrest',
      keywords: ['valcrest', 'aurion', 'aldric', 'kingdom', 'humans'],
      body: "The largest human kingdom of Ereth: river valleys, walled towns, wheat and stone. King Aldric IV rules from Aurion, the City of Endless Noon, where the Sunforge keeps the streets lit at night. The Order of the Bastion is its knighthood; the Church of the Radiant Scale its faith. For forty years it has prospered as never before, with rich harvests and peace in the south, while the northern border smolders.",
    },
    {
      title: 'The Morvhai',
      keywords: ['morvhai', 'morvhal', 'demon', 'demons', 'vashti', 'korrath', 'cinderhold'],
      body: "The people of Morvhal, called demons in Valcrest: tall, horned, ash-grey or ember-red, with eyes that catch the light. They live three times as long as humans, take naturally to magic sung or drawn in blood, and are ruled by Queen Vashti Ashborn from Cinderhold, a city built into a volcano. Valcrest's preachers call them soulless devourers. Few humans alive have actually spoken with one.",
    },
    {
      title: 'The Church of the Radiant Scale',
      keywords: ['church', 'radiant scale', 'hierarch', 'cassian', 'priest', 'priests', 'cathedral'],
      body: "Valcrest's faith, which worships Ilyra as the Goddess of Victory and Judgment who weighs souls and favors the righteous. Its head is Hierarch Cassian Vell, and its seat is the Radiant Cathedral in Aurion. The Church performs the summoning of Heroes, a rite it guards jealously, and its sermons teach that the Morvhai have no souls to weigh.",
    },
    {
      title: 'Saint Aurelia',
      keywords: ['aurelia', 'saint', 'first hero', 'morvane', 'burning glass'],
      body: "The first summoned Hero, three hundred years ago, a soul from Earth. Church history says she slew the Demon King Morvane at the Battle of the Burning Glass in the Ashen Marches, ending the last great war, and died a martyr. Her statue, sword raised, stands in every Valcrest town square. Her feast day is the longest day of the year.",
    },
    {
      title: 'The Sunforge',
      keywords: ['sunforge', 'endless noon', 'golden light'],
      body: "A great disc of gold and crystal on the highest tower of the royal palace, built by the Church forty years ago. It gathers the Wellspring's power to light Aurion through the night, bless Valcrest's harvests, and power the Church's greatest rites. It is the pride of the kingdom, guarded day and night, and few have seen its inner chamber.",
    },
    {
      title: 'The Wellspring and magic',
      keywords: ['wellspring', 'magic', 'mana', 'spell', 'spells', 'heartspring'],
      body: "All magic in Ereth draws on the Wellspring, a deep current of power under the land. Mages shape it by study and will, priests by prayer, Morvhai by blood and song. Spellcasting tires the body, and pushing too far brings nosebleeds and fainting. Scholars say the Wellspring rises somewhere in the north. Heroes touched by the goddess learn magic startlingly fast.",
    },
    {
      title: 'Summoned Heroes',
      keywords: ['hero', 'heroes', 'summoned', 'summoning', 'earth', 'jun'],
      body: "Souls drawn from another world by the Church's summoning rite, blessed by the goddess, and bound to the service of Valcrest. There have been only three summonings in three hundred years: Saint Aurelia, two Heroes a century ago whose stories the Church tells less often, and now the character and Jun Arakawa. Heroes grow stronger far faster than ordinary people, and the court treats them as part saint, part weapon, part curiosity.",
    },
    {
      title: 'The Ashen Marches',
      keywords: ['ashen marches', 'marches', 'border', 'greywatch', 'black glass'],
      body: "The grey no-man's-land between Valcrest and Morvhal: burned watchtowers, dry riverbeds, and black glass in the soil from the Battle of the Burning Glass. Fort Greywatch guards the Valcrest side. This spring, Morvhai war-bands under General Korrath are massing in its hills, and two border forts have fallen silent.",
    },
  ],

  missions: [
    {
      title: 'Daily Quest: Hero\'s Regimen',
      description:
        'Issued by the Ledger every dawn once the character has woken in Ereth. Every objective must be complete before the day ends. Heroes are made, not born, the Ledger says, and it does not say what happens to Heroes who skip their training.',
      objectives: ['Complete 300 weapon drills', 'Run five circuits of the Bastion walls (or as far on the road)', 'Spend an hour studying magic, history, or war'],
      rewards: { xp: 40 },
      status: 'active',
      recurrence: 'daily',
      penalty: {
        hpLoss: 3,
        statusEffect: {
          name: "Goddess's Disfavor",
          description: 'A dull, heavy listlessness, as if the world has turned a little away from you. Effort comes harder and luck runs thin while it lasts.',
          turnsRemaining: 20,
        },
      },
    },
    {
      title: "The Goddess's Bargain",
      giver: 'Ilyra',
      description:
        "Between death and waking, Ilyra offers the character a bargain: one blessing for free, and one more for every curse they accept. Each choice changes what is offered next, and nothing passed over ever returns. When they are done, they will wake in a world at war.",
      objectives: ['Accept the free blessing', 'Decide whether to trade curses for more blessings', 'Tell Ilyra you are ready, and wake in Ereth'],
      rewards: { xp: 50 },
      status: 'active',
    },
    {
      title: 'Steel for the Summoned',
      giver: 'Dame Brenna Holt',
      description:
        'Valcrest summoned its Heroes to win a war that begins within weeks. Before they ride north they must be presented to the King, trained at arms by Dame Brenna and in magic by Magister Oriel, and prove themselves before the court in the Hero\'s Proving.',
      objectives: [
        'Stand before King Aldric in the throne room and hear why you were summoned',
        'Train at arms under Dame Brenna Holt in the Bastion',
        'Learn the foundations of magic from Magister Oriel Fenwick',
        "Win, or survive with honor, the Hero's Proving before the court",
        'Ride north with the Vanguard to Fort Greywatch',
      ],
      rewards: {
        money: 200,
        xp: 400,
        items: [
          {
            name: 'Hero\'s commission',
            quantity: 1,
            description: "A sealed royal warrant naming you a Hero of Valcrest with the rank of knight-captain. Soldiers must obey you; nobles must listen.",
            tags: ['document', 'quest', 'authority'],
          },
        ],
        relationships: [
          { npc: 'Dame Brenna Holt', affinity: 10, trust: 15 },
          { npc: 'King Aldric IV', affinity: 10, trust: 5 },
        ],
      },
    },
  ],

  character: {
    name: 'Riley Hayes',
    archetype: 'summoned Hero',
    bio: "Twenty-six, from Columbus, Ohio. Shift lead at a distribution warehouse, half an EMT course behind you, a cat named Biscuit, and a stack of fantasy novels you kept meaning to finish. The last thing you remember is the crosswalk, a kid's red jacket, and headlights. You pushed. Then nothing, and then stars.",
    location: 'The Void Between',
    money: 0,
    level: 1,
    xp: 0,
    hp: 12,
    maxHp: 12,
    attributes: { strength: 5, agility: 5, vitality: 5, perception: 6, will: 7 },
    unspentStatPoints: 0,
    skills: [
      { name: 'First Aid', level: 2, xp: 20, description: 'Half an EMT course: pressure, splints, recovery position, and staying calm.' },
      { name: 'Logistics', level: 2, xp: 10, description: 'Moving a lot of things to the right place on time. Armies run on it.' },
      { name: 'Driving', level: 1, xp: 15, description: 'Cars and forklifts. Horses are another matter.' },
      { name: 'Genre Savvy', level: 2, xp: 0, description: 'Too many fantasy novels and video games. You know how these stories usually go, which is not always how this one does.' },
    ],
    items: [
      {
        name: 'The clothes you died in',
        description: "Jeans, sneakers, and a grey hoodie from your warehouse's safety week, oddly clean. They will look very strange in Ereth.",
        tags: ['clothing', 'earth'],
        equipped: true,
      },
      { name: 'Dead phone', description: 'Black screen, cracked corner, a photo of Biscuit as the lock screen if it ever turns on again.', tags: ['earth', 'keepsake'] },
    ],
    relationships: [
      {
        npc: 'Ilyra',
        affinity: 15,
        trust: 5,
        status: 'just met',
        historyNotes: '- Caught your soul as it fell between worlds. She has been waiting for you, and seems sorry about something.',
      },
    ],
  },
};
