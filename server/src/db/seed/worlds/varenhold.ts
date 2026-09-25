import type { WorldTemplate } from '../world';

export const varenhold: WorldTemplate = {
  id: 'varenhold',
  name: 'Varenhold',
  description:
    'High fantasy on a frontier at war. A fortress-city of soldiers, licensed mages, and zealous inquisitors holds the mountain pass against the armies of the dead, and the ancient wards are failing.',
  demoCampaignName: 'Varenhold: The Silent Watchtower',
  currencyName: 'gold',

  worldBible: `# Varenhold

The Kingdom of **Aurelan** is old, proud, and tired. Its northern border is the **Stormgate**, a mountain pass guarded for three centuries by the fortress-city of **Varenhold**: tiered walls of pale granite climbing a cliffside, crowned by the Bastion and its great signal beacon. Beyond the pass lie the **Ashen Wastes**, and beyond them the court of the **Pale King**.

Twenty years ago the Pale King's Ashen Legion broke through the pass. The Stormguard held Varenhold at terrible cost, and the Conclave's mages raised the **Stormgate Wards**, a chain of enchanted watchtowers that sealed the pass. The war ended. The dead stopped coming. Now the signal fires of the watchtowers are going dark, one by one.

## Peoples
- **Humans** make up most of Aurelan, from farmers in the southern vales to the noble houses of the capital, Solenne.
- **Dwarves** of the Ironroot clans hold the deep mines east of the pass. They are allies of the Crown by old oath, famous smiths, and fierce veterans of the war.
- **Elves** are rare and long-lived. Most withdrew to the Silverwood after the war; the few who remain are scholars, rangers, or exiles.

## Magic
Magic is real, powerful, and dangerous. Mages draw on **the Aether**, a current of raw power that runs through the world. Spells take effort and focus, and channeling too much causes **strain**: nosebleeds, frost on the skin, fainting, and, in the worst cases, burning out entirely. Magic can heal, ward, and destroy. It cannot raise the dead, which is why what the Pale King does is so feared.

By royal law, anyone born with the gift (**mage-born**) must be trained and licensed by the **Conclave of the Silver Flame**. Unlicensed magic is a crime, and the Church's inquisitors hunt those who hide it.

## Powers
- **The Stormguard**: Varenhold's garrison and the Crown's finest soldiers. Blue-grey cloaks, storm-sigil shields, and a creed: *Hold the gate.* They are stretched thin; the capital sends fewer recruits every year.
- **The Conclave of the Silver Flame**: the order of licensed mages. Brilliant, arrogant, and increasingly distrusted since the war's end. Its Varenhold chapter is a shadow of what it was.
- **The Church of the Radiant Dawn**: the kingdom's faith, worshipping the Dawnfather, the sun who drives back the dark. Its inquisitors, the **Dawnwardens**, police unlicensed magic and preach that mage-craft invites the Pale King's corruption.
- **The Pale King**: a sorcerer who conquered death, or was conquered by it. He commands the Ashen Legion: the risen dead, bound spirits, and the living fanatics who serve him in hope of eternity.

## Money
The coin of the realm is the **gold sovereign** ("gold"). A hot meal costs 1 gold, a night at a good inn 3, a healing draught 25, a soldier's month's pay 30, a fine enchanted blade several hundred.

## Tone
Epic and heroic, but with weight. Courage matters because the danger is real. Magic should feel wondrous and costly. Soldiers are people: tired, funny, brave, afraid. The dead are horrifying, not comic.

## Current tensions
Greywatch, the nearest of the seven watchtowers, has not lit its signal fire in three nights. A patrol sent to check on it has not returned. Ash has been falling on the northern wall.
`,

  narratorStyle: `- Second person, present tense ("You climb the last of the wall stairs...").
- Epic and vivid: wind off the mountains, torchlight on steel, the hum of magic in the air. Let big moments feel big.
- 150 to 350 words per turn. Shorter for quick exchanges, longer for arrivals, battles, and revelations.
- Magic is sensory and costly: describe what it looks, sounds, and feels like, and the strain it leaves behind.
- NPCs speak in distinct voices. Commander Thorne is clipped and dry, all orders and understatement. Magister Vael is florid, archaic, and distracted by tea and theory. Brakka is loud, warm, and swears by her ancestors' beards. Inquisitor Soren is soft-spoken and unfailingly polite, which is worse than shouting.
- Combat is fast, dangerous, and fair. Telegraph threats before they land, and let tactics matter.
- End on something the player can act on: a question, a choice, a horn sounding in the distance.
`,

  locations: [
    {
      name: 'The Bastion',
      description:
        "The fortress at the top of Varenhold, carved into the cliff itself. Stormguard soldiers drill in the torchlit courtyard while the great beacon burns overhead. Stairs climb to the north wall and its view across the Stormgate Pass; the war room, with its map table of the seven watchtowers, sits behind the commander's door.",
      tags: ['stormguard', 'military', 'fortress', 'north-wall'],
    },
    {
      name: 'The Gilded Griffin',
      description:
        'A sprawling inn in the lower city, loud with off-duty soldiers, dwarven traders, and travelers waiting for the pass to reopen. A carved griffin with gilded wings hangs over a hearth big enough to roast an ox. Brakka keeps a table by the fire for veterans, and a cellar door she never talks about.',
      tags: ['lower-city', 'inn', 'safe', 'rumors'],
    },
    {
      name: 'The Silver Spire',
      description:
        'The Conclave chapter house: a slender tower of pale stone, half its upper floors dark and shuttered since the war. The library smells of old vellum and ozone. Warding circles are inlaid in the floor, glowing faintly, and a humming model of the seven watchtowers turns slowly in the air of the central hall.',
      tags: ['conclave', 'magic', 'library', 'wards'],
    },
  ],

  npcs: [
    {
      name: 'Commander Aveline Thorne',
      shortDescription:
        'Commander of the Varenhold garrison. Forties, close-cropped grey hair, a scarred jaw, and a Stormguard cloak that has seen every battle of the last war. Speaks as little as possible.',
      faction: 'Stormguard',
      location: 'The Bastion',
      notes:
        "Knows the wards are failing along the whole Stormgate, not just at Greywatch, and has told no one to prevent panic. Sent a patrol of six to Greywatch; none returned. Can't spare more soldiers, so she needs someone capable and discreet. Respects results, courage, and honesty; despises politics.",
    },
    {
      name: 'Magister Orrin Vael',
      shortDescription:
        'An elven archmage of the Conclave, centuries old, with silver hair, ink-stained fingers, and robes embroidered with star charts. Absent-minded until he suddenly is not.',
      faction: 'Conclave of the Silver Flame',
      location: 'The Silver Spire',
      notes:
        "Raised the Stormgate Wards himself twenty years ago. Believes Greywatch's ward was broken deliberately, not worn out. Can sense latent magic in people and will notice the gift in anyone mage-born, licensed or not; he would take an unlicensed apprentice in secret, which is a crime. Distrusts the Church and is watched by the Dawnwardens.",
    },
    {
      name: 'Brakka Ironbrew',
      shortDescription:
        'Dwarven owner of the Gilded Griffin. A former Stormguard sergeant with a braided red beard, a brass leg, and a laugh you can hear from the street.',
      faction: 'Independent',
      location: 'The Gilded Griffin',
      notes:
        "Lost her leg holding the gate in the last war. Hears every rumor in the city. Is quietly sheltering two young mage-born refugees in her cellar, hiding them from the Dawnwardens. Fiercely loyal to Stormguard soldiers, past and present.",
    },
    {
      name: 'Inquisitor Malrec Soren',
      shortDescription:
        'A Dawnwarden inquisitor of the Radiant Dawn. Tall, gaunt, in white and gold, with a sunburst pendant and gentle, patient eyes. Never raises his voice.',
      faction: 'Church of the Radiant Dawn',
      location: 'The Bastion',
      notes:
        "Sincerely believes the mage-born are a doorway for the Pale King. Is pressing Thorne to put the Conclave under Church authority. Unknown to him, his aide Brother Hesk broke Greywatch's ward with a stolen relic, meaning to prove the Conclave's wards cannot be trusted; he did not know the dead were waiting on the other side. Soren is a zealot, not a traitor, and would be horrified to learn the truth.",
    },
  ],

  lore: [
    {
      title: 'The Aether and the Conclave',
      keywords: ['aether', 'magic', 'conclave', 'silver flame', 'mage', 'mage-born', 'spell', 'strain', 'license'],
      body: 'Magic flows from the Aether, and only the mage-born can channel it. Channeling takes focus, and overreaching causes strain: nosebleeds, frost on the skin, fainting, and at worst a permanent burnout. The Conclave of the Silver Flame trains and licenses every mage in Aurelan; a licensed mage wears a silver flame brooch. Unlicensed casting is punishable by imprisonment, or worse if the Church gets there first.',
    },
    {
      title: 'The Church of the Radiant Dawn',
      keywords: ['radiant dawn', 'dawnfather', 'church', 'dawnwarden', 'inquisitor', 'priest', 'faith', 'soren'],
      body: 'The Church worships the Dawnfather, the sun who drives back the dark. Its priests heal with prayer and its hymns are sung at every Stormguard funeral. Its inquisitors, the Dawnwardens, hunt unlicensed magic, and since the war they have argued that all magic, licensed or not, is a door the Pale King can walk through. Relics of the Dawn can snuff out spells.',
    },
    {
      title: 'The Pale King and the Ashen Legion',
      keywords: ['pale king', 'ashen legion', 'ashen wastes', 'undead', 'dead', 'ash', 'war', 'necromancy'],
      body: 'Nobody living remembers the Pale King as a man. His Ashen Legion is made of the risen dead, grey and silent, driven by bound spirits and led by living fanatics who hope to be rewarded with eternity. Where the Legion marches, ash falls from a clear sky. Twenty years ago it broke through the Stormgate and was stopped only at Varenhold\'s walls. Fire and blessed steel destroy the dead; ordinary wounds only slow them.',
    },
    {
      title: 'The Stormgate Wards',
      keywords: ['ward', 'wards', 'watchtower', 'greywatch', 'stormgate', 'pass', 'signal fire', 'beacon'],
      body: "Seven watchtowers line the Stormgate Pass, each built around a ward-stone raised by the Conclave after the war. Together they form a barrier the dead cannot cross. Each tower lights a signal fire at dusk to show the ward holds. Greywatch is the nearest, half a day's climb north of Varenhold. A broken ward-stone goes dark and cold to the touch.",
    },
    {
      title: 'The Stormguard',
      keywords: ['stormguard', 'soldier', 'soldiers', 'garrison', 'hold the gate', 'sergeant', 'patrol'],
      body: "The Stormguard is the Crown's northern army, headquartered at the Bastion of Varenhold. Its soldiers wear blue-grey cloaks and carry shields painted with a lightning-struck tower. Their creed is three words, *Hold the gate*, spoken at oath-takings and funerals alike. Veterans of the last war are revered in the city and rarely pay for their own drinks.",
    },
  ],

  missions: [
    {
      title: 'The Silent Watchtower',
      giver: 'Commander Aveline Thorne',
      description:
        "Greywatch, the nearest watchtower on the Stormgate Pass, has not lit its signal fire in three nights, and the patrol sent to check on it never returned. Commander Thorne can't spare another squad without leaving the walls thin. She needs someone to climb to Greywatch, find out what silenced it, and bring the answer back to her, and no one else.",
      objectives: [
        "Learn about Greywatch's ward from Magister Vael at the Silver Spire",
        'Reach Greywatch tower on the Stormgate Pass',
        'Discover what silenced the tower and what became of the patrol',
        'Report back to Commander Thorne at the Bastion',
      ],
      rewards: {
        money: 200,
        xp: 150,
        skillXp: [{ skill: 'Perception', amount: 40 }],
        relationships: [{ npc: 'Commander Aveline Thorne', affinity: 10, trust: 20 }],
      },
    },
  ],

  character: {
    name: 'Rowan Ashford',
    archetype: 'Stormguard spellsword',
    bio: "Twenty-three, the child of a southern farming family, sworn into the Stormguard at seventeen. A capable soldier with a secret: you are mage-born, and have never been licensed. Sparks sometimes jump from your fingers when you are angry or afraid, and you have learned to hide it. If the Dawnwardens found out, your career would be the least of what you lost.",
    location: 'The Bastion',
    money: 35,
    level: 2,
    xp: 60,
    hp: 22,
    maxHp: 22,
    skills: [
      { name: 'Swordplay', level: 3, xp: 50, description: 'Stormguard blade drill: cut, guard, riposte.' },
      { name: 'Shield Defense', level: 2, xp: 30, description: 'Holding the line behind a shield.' },
      { name: 'Athletics', level: 2, xp: 10, description: 'Climbing, running, and hauling armor up mountain paths.' },
      { name: 'Perception', level: 2, xp: 40, description: 'Noticing the thing that is out of place.' },
      { name: 'Channeling', level: 1, xp: 25, description: 'Untrained, raw magic: sparks, flashes of force, a little warmth. Hard to control.' },
    ],
    items: [
      { name: 'Stormguard longsword', description: 'Standard issue, well kept. The storm-sigil on the pommel is worn smooth by your thumb.', tags: ['weapon', 'blade'], equipped: true, properties: { damage: 'd8' } },
      { name: 'Stormguard shield', description: 'Round, iron-rimmed, painted with a lightning-struck tower.', tags: ['armor', 'shield'], equipped: true },
      { name: 'Chainmail hauberk', description: 'Heavy, cold in the mornings, and it has saved your life twice.', tags: ['armor'], equipped: true },
      { name: 'Healing draught', description: 'A vial of bitter green Conclave tincture. Closes wounds in minutes.', quantity: 2, tags: ['potion', 'healing', 'consumable'] },
      { name: 'Trail rations', description: 'Hard cheese, dried apples, and oat cake wrapped in waxed cloth.', quantity: 3, tags: ['food'] },
      {
        name: "Mother's river stone",
        description: 'A smooth grey stone on a cord. It grows warm when magic is worked nearby. You have never told anyone why you keep it.',
        tags: ['keepsake', 'magic'],
      },
    ],
    relationships: [
      {
        npc: 'Commander Aveline Thorne',
        affinity: 10,
        trust: 25,
        status: 'commanding officer',
        historyNotes: '- Your commander for three years.\n- Noticed you in the ash-storm drill last winter and remembered your name.',
      },
      {
        npc: 'Brakka Ironbrew',
        affinity: 30,
        trust: 20,
        status: 'friend',
        historyNotes: '- Pours your first drink free after every patrol.\n- Once patched your arm in her kitchen and asked no questions about the scorch marks.',
      },
      {
        npc: 'Inquisitor Malrec Soren',
        affinity: -5,
        trust: -10,
        status: 'wary',
        historyNotes: '- Has taken an interest in you since the torches in the barracks flared when you walked past.',
      },
    ],
  },
};
