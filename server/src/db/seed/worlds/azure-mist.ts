import type { CampaignChoiceInput } from '@narrator/shared';
import type { WorldTemplate } from '../world';

// Faction names double as the reputation keys: an NPC whose `faction` matches one acts on the character's standing with it.
const AZURE = 'Azure Cloud Sect';
const CRIMSON = 'Crimson Blade Hall';
const VERDANT = 'Verdant Pill Pavilion';
const WANDERING = 'Wandering Immortal Alliance';

type RootOption = CampaignChoiceInput['options'][number];

/**
 * Each element's magic is its own skill. The names are single, distinct words on purpose: skill
 * lookup falls back to matching any shared word, so "Fire Magic" would resolve to an existing
 * "Wind Magic" instead of being learned as a new skill.
 */
const SCHOOLS: Record<string, string> = {
  Fire: 'Pyromancy',
  Water: 'Hydromancy',
  Earth: 'Geomancy',
  Wood: 'Phytomancy',
  Metal: 'Ferromancy',
  Wind: 'Aeromancy',
  Lightning: 'Electromancy',
  Ice: 'Cryomancy',
};
const SCHOOL_LIST = Object.entries(SCHOOLS)
  .map(([element, school]) => `${element}: ${school}`)
  .join(', ');

/**
 * One spiritual root on the Testing Stone. Locking it grants the element's magic skill, the primer
 * scroll Master Rowan Fenn hands every youth the stone lights for, and the "Spiritual Roots"
 * condition. The rival is whoever the stone lit for that root elsewhere this season.
 */
function root(r: {
  element: string;
  summary: string;
  magic: string;
  technique: { name: string; description: string };
  rival: { name: string; shortDescription: string; faction: string; location: string; notes: string };
}): RootOption {
  const school = SCHOOLS[r.element]!;
  return {
    id: r.element.toLowerCase(),
    label: r.element.toUpperCase(),
    summary: r.summary,
    grants: {
      skills: [{ name: school, level: 1, description: r.magic }],
      items: [
        {
          name: `Primer scroll: ${r.technique.name}`,
          description: r.technique.description,
          tags: ['scroll', 'manual', 'technique', r.element.toLowerCase()],
        },
      ],
      statusEffects: [
        {
          name: 'Spiritual Roots',
          description: `Dominant root: ${r.element} (skill: ${school}), read on the Testing Stone in Willowbrook. Secondary roots: not yet read (see Root Composition). Every root is its own skill, rolled on its own.`,
          turnsRemaining: null,
          modifiers: [],
        },
      ],
    },
    ifNotChosen: { npc: r.rival },
  };
}

const roots: CampaignChoiceInput = {
  key: 'spiritual_root',
  title: 'Dominant spiritual root',
  prompt:
    '[ WILLOWBROOK VILLAGE GREEN ]\nThe Testing Stone stands under the old willow: grey, waist-high, cold as well water.\nMaster Rowan Fenn nods to you. "Hand flat. Breathe. Don\'t try to impress it."\nWarmth climbs your arm. Light wakes inside the stone.\nWhat color answers you first?',
  footer: 'A root is what you were born with, not what you will become. The stone has lit for others this season, and they are already walking toward the same mountains.',
  options: [
    root({
      element: 'Fire',
      summary: 'A red glow like a forge seen through smoke. Destruction, flame, and a temper that burns hot.',
      magic:
        "Fire magic: sensing and drawing fire-aspected aether (a hearth's warmth, sun on stone, anger in the blood) and shaping it. Rolled for fire spells and techniques, resisting heat, and feeling fire-rich places. Grows from lighting a wick by touch into flame that answers like a limb. Its weakness: water quenches fire.",
      technique: {
        name: 'Ember Heart Litany',
        description:
          "A beginner's fire method on a rolled vellum scroll sealed with red wax. Read once, its words stay in the mind: kindle aether in the core like coals under ash. Trained, it becomes the Ember Heart Litany skill. Lv1: warm hands in snow, a candle lit at a touch. It grows into a Searing Hand that scorches through leather and hide.",
      },
      rival: {
        name: 'Kester Flint',
        shortDescription:
          "Stone-tested rival (FIRE). Seventeen, wiry and soot-dark, a miner's brat from the Ironpeak foothills, sleeves burned off at the elbow, knuckles scabbed, and a grin that dares you to hit it.",
        faction: CRIMSON,
        location: 'Spiritfall Market',
        notes:
          "**Root:** Fire, the root the player was not given. Lit the stone so hard in his mining camp that it cracked. Master-at-Arms Roderick Hale recruited him for the Crimson Blade Hall that afternoon. **Want:** to beat an Azure Cloud novice in front of a crowd, then every one after. **Method:** fights in the Proving Ring every few days and gets better every time. **Toward the player:** loud challenges; respects anyone who gets back up, and will share a jug with them afterward. **Clue he holds:** Hallmaster Ironside had him carry a rubbing of a carved tablet from the Sunken Forge to Spiritfall. It shows Moonwater Lake with three marks around it and a fourth under Willow Hill. He thought it was a mining map.",
      },
    }),
    root({
      element: 'Water',
      summary: 'A blue that moves like a river under ice. Healing, adaptability, and fine control of aether.',
      magic:
        "Water magic: sensing and drawing water-aspected aether (rain, rivers, blood, the tides of the body) and shaping it. Rolled for water spells and techniques, healing, and steadying another's aether. Grows from easing a fever into knitting wounds and turning a blow aside like a current. Its weakness: earth dams water.",
      technique: {
        name: 'Still Pool Meditation',
        description:
          "A beginner's water method on a scroll of pale blue vellum. Its words settle like ripples: let aether grow still until it is clear enough to see the bottom. Trained, it becomes the Still Pool Meditation skill. Lv1: calm the mind, sense how aether flows in a body, cool a fever with a palm. It grows into healing, and into control fine enough to thread a needle.",
      },
      rival: {
        name: 'Marisol Avenell',
        shortDescription:
          "Stone-tested rival (WATER). Eighteen, a county magistrate's daughter: composed, straight-backed, a plain blue gown, dark hair held with a single silver comb, and a voice that never rises.",
        faction: AZURE,
        location: 'Azure Cloud Sect',
        notes:
          "**Root:** Water, the root the player was not given. Tested in the county town; Elder Isolde Whitmore marked her as the year's most promising candidate before the trial even began. **Want:** to reach the inner circle and prove a magistrate's daughter belongs among the old channeling families. **Method:** perfection, early mornings, and never owing anyone. **Toward the player:** courteous and quietly competitive; an ally to anyone who treats her as an equal rather than a rival or a prize. **Clue she holds:** in the sect library, the founder Edric Cloudmere's chronicle skips forty years, and on the founding stone the name of his teacher has been chiseled away.",
      },
    }),
    root({
      element: 'Earth',
      summary: 'A slow amber glow, heavy as a mountain. Defense, endurance, and a body that does not break.',
      magic:
        "Earth magic: sensing and drawing earth-aspected aether (stone, soil, mountains, the weight of the body) and shaping it. Rolled for earth spells and techniques, standing firm, toughening the body, and feeling what lies underground. Grows from a stance no one can shove into skin that turns a blade. Its weakness: wood roots through earth.",
      technique: {
        name: 'Bedrock Stance',
        description:
          "A beginner's earth method on a heavy scroll weighted with lead caps. Its words come slowly, like stones settling: sink aether into the bones and let the mountain hold you. Trained, it becomes the Bedrock Stance skill. Lv1: stand firm against a charging man, carry twice your load. It grows into a body that shrugs off blows and aether that braces a wall.",
      },
      rival: {
        name: 'Bram Holloway',
        shortDescription:
          "Stone-tested rival (EARTH). Twenty, a farmer's son built like a barn door, sunburned neck, patched homespun, huge careful hands, and the shyest smile in the province.",
        faction: VERDANT,
        location: 'The Verdant Pill Pavilion',
        notes:
          "**Root:** Earth, the root the player was not given. Hired by the Verdant Pill Pavilion to tend its deep-fire furnaces, which only an earth root can keep steady. **Want:** enough to buy the elixirs that hold back his mother's frost-wasting, then a farm with good soil. **Method:** hard work, honesty, and saying yes to anyone who pays. **Toward the player:** friendly from the first meeting and loyal to the bone; easy to exploit, which others will try. **Clue he holds:** on full-moon nights the deep-fire under the Pavilion's furnaces leans like a compass needle toward Willow Hill, and the furnaces run cold for an hour.",
      },
    }),
    root({
      element: 'Wood',
      summary: 'A green that breathes like spring leaves. Vitality, herbalism, and restoration.',
      magic:
        "Wood magic: sensing and drawing wood-aspected aether (living things, growth, sap, the age of a herb) and shaping it. Rolled for wood spells and techniques, judging an aether-herb's potency, aiding alchemy, and restoring vitality. Grows from coaxing a wilted plant into regrowing flesh. Its weakness: metal cuts wood.",
      technique: {
        name: 'Greenwood Breath',
        description:
          "A beginner's wood method on a scroll pressed with dried leaves. Its words open like buds: draw aether up from the roots of the world and let it rise like sap. Trained, it becomes the Greenwood Breath skill. Lv1: sense a herb's age and potency by touch, recover from fatigue faster. It grows into restoring others and stirring plants to grow.",
      },
      rival: {
        name: 'Hazel Thorne',
        shortDescription:
          'Stone-tested rival (WOOD). Sixteen, small and quick, green-stained fingertips, a herb satchel bigger than her torso, and eyes that price everything in the room.',
        faction: VERDANT,
        location: 'The Verdant Pill Pavilion',
        notes:
          "**Root:** Wood, the root the player was not given. Mistress Ashgrove took her as a personal apprentice within a week. **Want:** to be the youngest Master Alchemist in the Pavilion's history. **Method:** talent, long nights, and buying (or stealing) the best herbs before anyone else reaches them. **Toward the player:** a sharp competitor at every herb patch; a generous partner in any venture that teaches her something new. **Clue she holds:** deep in Whispering Bamboo Forest a line of silver-green bamboo flowers once in sixty years, and it is flowering now, in a line straight as an arrow pointing to the Listening Stone.",
      },
    }),
    root({
      element: 'Metal',
      summary: 'A white gleam like a whetted edge. Weapon mastery and a body tempered like steel.',
      magic:
        "Metal magic: sensing and drawing metal-aspected aether (ore, blades, autumn air, the edge of intent) and shaping it. Rolled for metal spells and techniques, channeling aether into weapons, and judging a weapon's quality. Grows from a sharper cut into a blade whose edge reaches beyond its steel. Its weakness: fire melts metal.",
      technique: {
        name: 'Edge-Tempering Form',
        description:
          "A beginner's metal method on a scroll with iron end-caps, cold to hold. Its words come like hammer strokes: fold aether into the bones, then into the blade. Trained, it becomes the Edge-Tempering Form skill. Lv1: aether in a blade (or a sickle) so it bites deeper, a grip that does not slip. It grows into cutting arcs of force and a body hard as worked iron.",
      },
      rival: {
        name: 'Gideon Forsythe',
        shortDescription:
          "Stone-tested rival (METAL). Nineteen, tall and austere, a swordsmith's son, black training leathers, a plain unadorned sword, and a stare that measures how far away you are.",
        faction: CRIMSON,
        location: 'Bladecrest Fortress',
        notes:
          "**Root:** Metal, the root the player was not given. Hallmaster Brand Ironside took him as a personal apprentice, the first in ten years. **Want:** to forge a sword that can cut aether itself; privately, to stop being Ironside's weapon. **Method:** silence and endless practice. **Toward the player:** cold, then respectful after a fair fight; one of the few Crimson fighters who might turn against the Hallmaster if shown what he really did to House Harrowgate. **Clue he holds:** the Hall's excavation at the Sunken Forge has reached a door no blade can scratch, with an inscription: 'Bamboo, iron, and moon: three lights open the way.'",
      },
    }),
    root({
      element: 'Wind',
      summary: 'A pale flicker that never stays still. Speed, movement, and evasion.',
      magic:
        "Wind magic: sensing and drawing wind-aspected aether (moving air, high places, breath, motion) and shaping it. Rolled for wind spells and techniques, moving fast, dodging, leaping, and hearing what the wind carries. Grows from quick feet into running across treetops. Its weakness: ice stills wind.",
      technique: {
        name: 'Thistledown Step',
        description:
          "A beginner's wind method on a scroll so thin it lifts in a breeze. Its words flutter: let aether lift the body like thistledown on a gust. Trained, it becomes the Thistledown Step skill. Lv1: a burst of speed, a longer leap, a dodge that seems lucky. It grows into crossing rooftops, running along branches, and never being where the blow lands.",
      },
      rival: {
        name: 'Pip Larkin',
        shortDescription:
          'Stone-tested rival (WIND). Fifteen, a skinny orphan with a crooked fringe, a stolen silk sash over rags, bare feet that never seem to touch the ground, and quick hands.',
        faction: WANDERING,
        location: 'Spiritfall Market',
        notes:
          "**Root:** Wind, the root the player was not given. Was a Spiritfall pickpocket until Rowan Fenn's stone lit for her; she refused every sect and runs messages for the Wandering Immortal Alliance. **Want:** freedom, and to learn who left her on the market steps as a baby. **Method:** speed, theft, and knowing every rooftop in Spiritfall. **Toward the player:** steals from them once to see if they notice; a loyal little sister to anyone who catches her and doesn't hit her. **Clue she holds:** she lifted a sealed letter from Peddler Mott, addressed to 'the one sleeping under the hill', and could not read it. It is in her bundle.",
      },
    }),
    root({
      element: 'Lightning',
      summary: 'A violet crack that makes your hair stand up. Explosive power and rapid attacks.',
      magic:
        "Lightning magic: sensing and drawing lightning-aspected aether (storms, sudden force, the spark between heartbeats) and shaping it. Rolled for lightning spells and techniques, striking first, and sensing a coming storm. Grows from a jolt that numbs a hand into strikes faster than the eye. Its weakness: wind scatters the storm.",
      technique: {
        name: 'Thunderclap Pulse',
        description:
          "A beginner's lightning method on a scroll that crackles when unrolled. Its words arrive all at once, like a thunderclap: gather aether tight, then release it in one beat. Trained, it becomes the Thunderclap Pulse skill. Lv1: a jolt through the palm that stuns a man for a breath, a first strike before the other side has moved. It grows into chained strikes and lightning through a blade.",
      },
      rival: {
        name: 'Jory Stormwell',
        shortDescription:
          'Stone-tested rival (LIGHTNING). Twenty-two, loud and broad, hair that stands up in a permanent frizz, a scorched leather jerkin, a wineskin, and a laugh that makes horses bolt.',
        faction: WANDERING,
        location: 'Moonwater Lake',
        notes:
          "**Root:** Lightning, the root the player was not given. Tested late, joined the Azure Cloud Sect, and was thrown out within a month for brawling with Prefect Cassius Grey. Now drinks with Old Barnaby and calls it training. **Want:** to be struck by true storm-lightning and live, tempering his body like the old legends. **Method:** climbing high places in storms. **Toward the player:** an instant, reckless friend, and a terrible influence. **Clue he holds:** every full moon, lightning falls from a clear sky onto the same rock on Moonwater's island, and the rock rings like a church bell.",
      },
    }),
    root({
      element: 'Ice',
      summary: 'A frost-white glow that makes your breath smoke. Control, precision, and defense.',
      magic:
        "Ice magic: sensing and drawing ice-aspected aether (cold, stillness, winter, the moment before motion) and shaping it. Rolled for ice spells and techniques, slowing or holding an enemy, precise aim, and staying calm. Grows from frosting a cup into walls of ice and cold that freezes a spell mid-cast. Its weakness: lightning shatters ice.",
      technique: {
        name: 'Hoarfrost Veil',
        description:
          "A beginner's ice method on a frost-rimed scroll that never warms. Its words open like frost on glass: breathe until aether is still, then make it colder. Trained, it becomes the Hoarfrost Veil skill. Lv1: frost a surface by touch, a steady hand and a calm mind under pressure. It grows into ice shields, frozen ground, and shards of frost thrown with perfect aim.",
      },
      rival: {
        name: 'Ilse Harrowgate',
        shortDescription:
          'Stone-tested rival (ICE). Seventeen, pale and very still, a black mourning ribbon in her white-blond hair, a worn sword older than she is, and a voice like snow falling.',
        faction: AZURE,
        location: 'Azure Cloud Sect',
        notes:
          "**Root:** Ice, the root the player was not given. The last of House Harrowgate, which the Crimson Blade Hall destroyed ten years ago over an ice-vein mine in Ironpeak; Elder Isolde Whitmore sheltered her. **Want:** to kill Hallmaster Brand Ironside. **Method:** patience; she will not move until she is sure. **Toward the player:** cold and suspicious; thaws only for people who keep their promises, and remembers every one. **Clue she holds:** her house was not destroyed for the mine. Her father had dug up a fragment of moon-silver engraved with a bamboo leaf and a crescent, and Ironside took it from his body.",
      },
    }),
  ],
};

const composition: CampaignChoiceInput = {
  key: 'root_composition',
  title: 'Root composition',
  prompt: '[ THE TESTING STONE ]\nThe first light settles, but the stone is not finished with you.\nMaster Rowan Fenn leans closer, watching its depths. "Now we see how many."',
  footer: 'Pure, braided, or motley: no composition is better, only different. The sects will judge you by it anyway.',
  options: [
    {
      id: 'pure',
      label: 'PURE ROOT',
      summary: 'One light, clear as a bell. Your dominant root alone: deep, fast, and narrow.',
      grants: {
        statusEffects: [
          {
            name: 'Root Composition',
            description:
              `Pure single root. Your root's school and techniques train at the normal pace and bite deep. Any other element is learned as its own school skill (${SCHOOL_LIST}), one step harder, and stalls at level 5 without a rare method. +1 on Channeling (easier breakthroughs).`,
            turnsRemaining: null,
            modifiers: [{ target: 'Channeling', bonus: 1 }],
          },
        ],
      },
    },
    {
      id: 'dual',
      label: 'DUAL ROOT',
      summary: 'A second light braids through the first. Name the color: two elements, and techniques that join them.',
      grants: {
        statusEffects: [
          {
            name: 'Root Composition',
            description:
              `Dual root. The secondary root is its OWN skill (${SCHOOL_LIST}): start it at level 1 with grant_skill_xp 25 and roll it on its own, never through the dominant root's skill. Both train at the normal pace; combined techniques of the pair are open. Other elements: own skill, one step harder.`,
            turnsRemaining: null,
            modifiers: [],
          },
        ],
      },
    },
    {
      id: 'mixed',
      label: 'MIXED ROOT',
      summary: 'Three or more lights, none of them bright. Elders call it a motley root. Every path is open; every breakthrough is harder.',
      grants: {
        statusEffects: [
          {
            name: 'Root Composition',
            description:
              `Mixed roots. EACH secondary root is its own skill (${SCHOOL_LIST}): start each at level 1 with grant_skill_xp 25 and roll it on its own. An element learned later is a new skill too. No element is a step harder; any can be braided. -1 on Channeling (harder breakthroughs).`,
            turnsRemaining: null,
            modifiers: [{ target: 'Channeling', bonus: -1 }],
          },
        ],
      },
    },
  ],
};

export const azureMist: WorldTemplate = {
  id: 'azure-mist',
  name: 'Ascension: Path of the Immortal',
  description:
    'An open-ended fantasy of magic and ascension. You are an ordinary herb-gatherer in a remote village of Azure Mist Province when a wandering mage sets a Testing Stone under the willow. Discover your spiritual roots, find a sect, a master, or your own way, train for years if you like, and decide whether to chase the lost legacy of an ancient immortal, or immortality itself.',
  demoCampaignName: 'Ascension: The Testing Stone',
  currencyName: 'aether shards',
  reputation: { [AZURE]: 0, [CRIMSON]: 0, [VERDANT]: 0, [WANDERING]: 0 },

  choices: [roots, composition],

  worldBible: `# Ascension: Path of the Immortal

An open-ended high-fantasy campaign of magic and ascension. Some people can draw **aether**, the living energy of the world, into their bodies: they temper their flesh, master elemental magic, climb through ranks of power, and, perhaps, become immortal. The character begins as an ordinary mortal in **Azure Mist Province**, a remote, misty region of mountains, forests, and lakes at the edge of the **Great Celestial Continent**, and discovers they can channel. There is no single story to follow: the player decides what their path is for (immortality, mastery, wealth, knowledge, leadership, love, revenge, or freedom) and the world answers.

## The character
A sixteen-year-old herb-gatherer of **Willowbrook Village**, raised by the village herbalist Granny Wren. For three nights, lights have flickered on Willow Hill, wells have run warm, and two goats were found drained and grey. Yesterday the wandering mage **Master Rowan Fenn** arrived with a Testing Stone on his back. Today, under the old willow on the village green, he is testing every youth in Willowbrook.

## The opening: the Testing Stone
- The play screen has already shown the player the stone's panel with the eight roots as buttons. Do not repeat the menu in prose. Set the scene around it: villagers crowding the green, children who touched the stone and saw nothing, Granny Wren pretending not to watch, Tam Ashby just stepping away from a stone that stayed grey.
- If the player does something else first (asks questions, refuses, runs off), let them. The stone and Master Fenn wait, and the panel stays until they choose. Never pick for them.
- **When the player picks their dominant root**, call \`lock_choice\` that same turn. It grants that element's school of magic as a skill (Wind: "Aeromancy"), a primer scroll with a beginner's technique (Fenn gives one to every youth the stone lights for), and the "Spiritual Roots" condition. Narrate the light filling the stone and the crowd's reaction.
- **Then root composition** (the next panel): Pure, Dual, or Mixed. Lock it with \`lock_choice\` when the player picks. For **Dual**, ask which second light flickered (any root but the dominant one); for **Mixed**, which two or more. **The same turn they name them, for EACH secondary root:** call \`grant_skill_xp\` with that element's school name (exactly as in the table below: "Pyromancy", "Cryomancy") and amount 25, which creates it as its own skill at level 1. Then \`update_status_effect\` on "Spiritual Roots" listing every root and its skill. Never record a secondary root only in a condition: if it is not a skill on the sheet, it does not exist for rolls.
- The character's roots are permanent. If the player asks to change them later, the world refuses: roots can be refined by rare treasures in Act IV, never swapped.
- **The others.** \`lock_choice\` brings the youths whom Fenn's stone lit for the other roots this season into the world, offscreen. The result names them. Write them into your story notes right away (who, where, which faction, what they want). Bring them in one at a time: a name overheard, a sighting at the market, then a meeting. They are the character's generation: rivals, friends, and sometimes enemies, and each one carries a clue to the Azure Immortal's legacy.
- After the test, Fenn offers what he offers every youth: a letter of recommendation to the Azure Cloud Sect's entrance trial (day 15), an introduction at Spiritfall Market to the other powers, or, if he likes them, a month on the road as his apprentice. The player may take any, none, or something else entirely.

## Spiritual roots and elemental magic
The eight roots are **Fire** (destruction, flame), **Water** (healing, adaptability, control), **Earth** (defense, endurance, body strengthening), **Wood** (vitality, herbalism, restoration), **Metal** (weapons, physical reinforcement), **Wind** (speed, movement, evasion), **Lightning** (explosive power, rapid attacks), and **Ice** (control, precision, defense).

**Every element is its own skill**, a school of magic with its own name. Use these names exactly, and never invent variants ("Fire Magic", "Pyromancy (fire)"):
| Element | Skill |
| Fire | Pyromancy |
| Water | Hydromancy |
| Earth | Geomancy |
| Wood | Phytomancy |
| Metal | Ferromancy |
| Wind | Aeromancy |
| Lightning | Electromancy |
| Ice | Cryomancy |
A character with several roots has several separate school skills, each with its own level, its own XP, and its own rolls.
- **Roll the element being used.** A fire spell rolls Pyromancy (or the fire technique's own skill), even if the character's dominant root is Wind. Never roll one element's skill for another element, and never merge two elements into one roll; a combined technique rolls its own technique skill, or the lower of the two school skills.
- **Learning a new element** (an off-element for Pure or Dual, or any element for Mixed) creates that element's school skill at level 0 with \`grant_skill_xp\`, and it trains on its own from there.
- Each school skill is rolled to sense that kind of aether, cast or empower spells and techniques of that element, and judge elemental things, and it grows with use and with training in places rich in its element.

**Composition** (the "Root Composition" condition) is the trade-off:
| Composition | Strength | Cost |
| Pure | Its element trains fast and deep; +1 on Channeling; sects compete for them | Other elements are one step harder and stall at level 5 without a rare method |
| Dual | Two elements at normal pace, each its own skill; combined techniques of the pair | Other elements one step harder |
| Mixed | Three or more elements at normal pace, each its own skill; can braid any combination | -1 on Channeling (breakthroughs are harder); examiners rate them low and elders dismiss them |

**No root is superior.** Each element presses one and is pressed by one: water quenches fire, fire melts metal, metal cuts wood, wood roots through earth, earth dams water; and among the three rarer "sky" roots, lightning shatters ice, ice stills wind, wind scatters the storm. Pressing is an edge in circumstance (+1 or +2 on an exchange, or a spell that simply works better), never a guarantee. Sky roots are rare in Azure Mist, so grimoires and teachers for them are scarce and expensive. Talent opens doors; understanding, effort, resources, and choices decide who walks through.

**Roots shape opportunities.** Masters prefer apprentices of their own element; techniques of the character's elements are on offer more often; the Verdant Pill Pavilion wants wood and fire (alchemy) and earth (furnaces); the Crimson Blade Hall wants metal, fire, and lightning but takes anyone who wins; the Azure Cloud Sect prizes water, wind, and ice and pure roots; the Wandering Immortal Alliance does not care at all. Let NPCs react to the character's roots: a covetous elder, a dismissive examiner, a rival of the same element.

## Channeling: ranks and techniques
Ascension uses the ordinary skill system. The character's raw power is the **Channeling** skill (learned at level 0 the first time they successfully draw aether into their body, usually by training a primer or under a teacher). Their rank is the **"Ascension Rank"** condition: update its description whenever they break through.

| Rank | Channeling level | What it means |
| Mortal | none | An ordinary person. |
| Initiate | 1 to 9 (the level is the circle: "third circle") | Aether in the veins: stronger, faster, sharper senses; basic spells and techniques; going days without food. |
| Adept | 10 to 19 | A true well of aether: flight on a channeled wind or blade (badly at first), a lifespan of two centuries, spells that break boulders. The elders of small sects. |
| Magister | 20 to 29 | A crystallized heart of aether: masters, sect elders, a lifespan of five centuries. Very few in Azure Mist. |
| Archon | 30+ | A soul that can walk outside the body. Legends in the province; the frontier of Act IV. |
| Beyond | — | Exalted, Ascendant, and Immortal: rumors from the Heartlands. |

**Breakthroughs.** At Channeling 10, 20, and 30 the character reaches a threshold: further levels pile up, but the rank does not change and next-rank techniques stay out of reach until they break through. A breakthrough is a scene, not a formality: a quiet place rich in aether, preparation (an ascension elixir, a guardian, a settled heart), then a \`skill_check\` on Channeling at DC 14 (Adept), 18 (Magister), or 22 (Archon). Preparation counts as gear: an Adept's Elixir, a ley-line spring, a master standing guard. On success, update "Ascension Rank", \`grant_xp\` (200 for Adept, 400 for Magister, 600 for Archon), and show the world changing. On failure, add an "Aether Burn" condition (-2 to all checks for several days, or worse on a critical failure) and let them try again when healed. Never skip the threshold because a level number went up.

**Techniques** are skills named for the method ("Ember Heart Litany", "Azure Cloud Swordform"). They come from scrolls, grimoires, masters, sects, ruins, and the legacy. Learning one starts it at level 0 (\`grant_skill_xp\` or a training \`pass_time\`). Techniques of the character's root elements train at the normal pace; off-element techniques are one step harder (Pure: and stall at level 5). A technique can never exceed the character's Channeling level by more than 5.

**Training.** For days or months of training, use \`pass_time\` with the skills trained (name each element's magic skill separately) and the teacher, if any (a master who knows the art matters greatly after level 10). For nightly practice (channeling before sleep, sword forms at dawn), use \`set_routine\`. Training in an aether-rich place (Moonwater's shore, a sect's ley-line spring, a rented channeling cell in Spiritfall) or with aether shards and elixirs counts as a teacher for Channeling, and stacks with one. Time skips of months or years are welcome: the world moves on during them (see "How the world moves").

**Rank gaps.** A full rank is not overcome by a lucky roll. An Initiate fighting an Adept needs a trick, terrain, a treasure, allies, or a way to run. Within a rank, a circle or two is a real edge (+1 or +2 per exchange), not a wall.

## Fighting
Use \`skill_check\` for each exchange (a technique, an element's school skill, a weapon skill, Brawling), \`adjust_hp\` for wounds, and conditions for lingering injuries (scorched veins, poison, frostbite). Magical combat is fast and visible: a flare of aether, a bloom of light, a shockwave in the dust. A mortal cannot stand against a channeler. Killing in the sects' lands brings vengeance from someone's master; disputes are settled at the Proving Ring, on sect dueling grounds, or in the wilderness where nobody watches.

## Gear
Use the existing graded gear. Mortal steel is ungraded. **Aether-forged** gear is graded I to VII (I: an Initiate's weapon; II: Adept; III: Magister; higher: legend). When the character gains one, \`update_item\` it with its grade, usage ("wielded" or "worn"), and what it enhances (a technique or an element's school skill), then \`equip_item\`. Typical: a Grade I aether-forged sword 25 shards; a Grade I warded cloak 20; a Grade II staff of focus 300 and up.

## Money
Channelers trade in **aether shards** (common shards, unless noted; 100 make one greater shard). Mortal purchases (a meal, an inn bed, a pair of boots) are paid in copper and silver and not tracked; a single shard is a peasant family's month of income. Typical prices: a Gathering Draught 2; a beginner's scroll 5 to 15; a good grimoire 30 to 100; a month in a channeling cell at Spiritfall 10; an Adept's Elixir 300 (rarely for sale); an aether-herb 1 to 8; a first-rank beast heartstone 5 to 15. A novice's stipend is 3 shards and one Gathering Draught a month. Elixirs and herbs are inventory items; Gathering Draughts taken during training count as a teacher for Channeling.

## Azure Mist Province
Remote, misty, and beautiful: green mountains standing in seas of cloud, terraced barley fields and orchards, forests that whisper without wind, and a lake that holds the moon. Mortals farm and trade and mostly ignore channelers, who mostly ignore them back. Distances: Willowbrook to Spiritfall Market is a day on foot; to the Azure Cloud Sect's mountain, two days; to Ironpeak, three; Moonwater is half a day from Willowbrook over the hills.

## The factions
The character's standing with four factions is tracked (Faction reputation, in the current state). Change it with \`adjust_reputation\` when their deeds reach the faction. Any NPC whose faction matches acts on it. The player may join one, stay independent, or deal with several. Joining one costs standing with its rivals, but is never permanent: members leave, are expelled, or are poached.

### Azure Cloud Sect
The province's oldest and most respected order of mages, in a mountain abbey on Cloudveil Peak. **Philosophy:** magic is the harmony of mind, aether, and the heavens; discipline, contemplation, and balance before power. **Leaders:** High Master Aldous Vael; Elder Isolde Whitmore (novices and the entrance trial). **Rank:** novice, acolyte, inner circle, elder. Entry is through the annual trial (day 15) or an elder's personal sponsorship. Novices earn **merit** by doing the sect's tasks, which buys grimoires, elixirs, and time at the ley-line springs (track merit in a "Sect Standing" condition if the character joins). **Rivalry:** the Crimson Blade Hall (contempt for brute force, and an old border dispute over Ironpeak); polite distrust of the Alliance's "hedge-mages".
- 20+: invited to the trial or offered an elder's sponsorship; access to the lower library. 40+: inner circle candidacy; the ley-line springs; a master. -20: barred from the trial; novices pick fights. -50: hunted as a "hollow-mage" if any excuse can be found.

### Crimson Blade Hall
A martial brotherhood in Bladecrest Fortress in the Ironpeak Mountains. **Philosophy:** strength is the only truth the world respects; a mage who will not fight is a scholar with extra steps. **Leaders:** Hallmaster Brand Ironside; Master-at-Arms Roderick Hale (recruiter, the Proving Ring). Entry is by combat: win three bouts at the Proving Ring in Spiritfall or survive a month at Bladecrest. Roots and composition matter less here than anywhere; results are everything. Training is brutal and excellent for weapon and body techniques. **Rivalry:** the Azure Cloud Sect (hypocrites with good manners); they destroyed House Harrowgate ten years ago and pretend it was a fair duel.
- 20+: Proving Ring bouts with real purses; weapon techniques taught; a recruiter's offer. 40+: Bladecrest's forge and a Hall-made aether-forged weapon; a place in the Sunken Forge excavation. -20: challenged on sight by Hall fighters. -50: a bounty.

### Verdant Pill Pavilion
A guild of alchemists with its great hall in Spiritfall Market and herb gardens all over the province. **Philosophy:** magic runs on medicine; whoever controls the pills and elixirs controls the province, and the Pavilion sells to everyone. **Leaders:** Mistress Seraphine Ashgrove; Alchemist Fennick Pye (herb buyer and front counter). Entry by apprenticeship (a wood or fire root helps; anyone with Herb Lore is worth a look). Teaches Alchemy and Herbalism as skills; sells elixirs, buys herbs and heartstones. **Rivalry:** neutral in name, rival to anyone who brews or sells elixirs without them; quietly at odds with the Crimson Hall, which owes them money.
- 20+: fair prices; herb-gathering commissions; an alembic to rent. 40+: apprenticeship to a Master Alchemist; first pick of rare elixirs (an Adept's Elixir). -20: prices doubled. -50: no alchemist in the province will sell to them, and some will sell poison.

### Wandering Immortal Alliance
Not a sect: a loose fellowship of independent mages (hedge-mages, to the sects) who meet at the Drunken Crane in Spiritfall Market. **Philosophy:** magic belongs to no one; every path is one's own, and nobody kneels. **Leaders:** nobody, officially; Old Barnaby is who everyone listens to, and Master Rowan Fenn carries word between villages. Membership is a word at the Drunken Crane and a promise to help a fellow wanderer once. They share rumors, ruins, and dangerous jobs; masters there take apprentices one at a time, in their own way. **Rivalry:** resent the sects' hold on ley-lines and grimoires; the Azure Cloud Sect calls them rabble, the Crimson Hall calls them prey.
- 20+: rumors, shared expeditions, a bed at the Drunken Crane. 40+: a wandering master's teaching; Alliance members come when called. -20: the tavern goes quiet when they enter. -50: everyone who walks alone avoids them, and some sell them out.

## How the world moves (if no one changes it)
Track the day in your story notes. Show events through rumor, prices, new arrivals, and changed faces; never as a summons. When a \`pass_time\` skip crosses an event, it happens offscreen and reaches the character as news when they surface. The player can change any of it.
| Day | Event |
| 1 | The root test in Willowbrook. |
| 3 | Rowan Fenn leaves for Spiritfall Market, unless the player has given him a reason to stay. A third animal is drained on Willow Hill. |
| 5 | Tam Ashby meets Peddler Mott on the road and is promised "roots that can be bought". |
| 10 | The Gilded Hall holds its auction in Spiritfall (every 30 days after). |
| 15 | The Azure Cloud Sect's annual entrance trial at the Cloudgate Steps. |
| 20 | A Thicket Boar King rampages in Whispering Bamboo Forest; herb prices in Spiritfall double. |
| 30 | On the full moon, fishermen see a palace of light rise from Moonwater Lake for an hour. Rumors of the **Azure Immortal's legacy** spread across the province. |
| 40 | Every faction sends people: Azure Cloud acolytes to the bamboo forest, the Crimson Blade Hall to the Sunken Forge, the Pavilion buying maps, wanderers gathering at the Drunken Crane. |
| 45 | The Crimson Blade Hall breaks into the Sunken Forge's outer hall. People die in the traps. |
| 60 | Full moon: the Moon Key's trial on Moonwater opens for one night. |
| 75 | Morcant Vire begins his blood rite on Willow Hill, with Tam Ashby's help. Willowbrook is in danger. |
| 90 | The Night of Nine Lights: the thousand-year cycle turns and the Forgotten Immortal Grotto opens to whoever holds the three keys. |
| 120 | If no one has renewed the seal, the Hollow Vein cracks: a beast surge, tainted aether, and the province in turmoil, drawing powers from beyond Azure Mist. |
If the player ignores the legacy, someone else claims it: a rival, a faction, or Morcant Vire. Decide who by what has happened, and let it change the province.

## The arc (a shape, not a script)
- **Act I, The Awakening:** the village, the stone, the disturbances on Willow Hill, the first choice of path.
- **Act II, The First Steps:** learning to channel; the Azure Cloud trial, a wandering master, or self-taught magic from a primer; gathering herbs and heartstones; meeting the rivals. Initiate.
- **Act III, The Hidden Legacy:** the rumor of the Azure Immortal's legacy; the three keys; the factions racing; Morcant Vire. Cooperate, compete, sell what they learn, or ignore it entirely.
- **Act IV, The Path Beyond:** Adept and after. Beyond Azure Mist: the great orders of the Heartlands, ancient realms, dangerous beasts, and forgotten civilizations (see the lore). Open it when the character is strong enough or the legacy is resolved, never before they want it.

## GM ONLY: the truth
Reveal none of this early. Clues come from the rivals' notes, the Willow Song, the locations, and careful investigation.
- **The Azure Immortal**, Master Aurel Vane, lived a thousand years ago. His roots were mixed and middling; he climbed to the edge of immortality through understanding, not talent. Beneath Azure Mist runs the **Hollow Vein**, a wound in the world that leaks tainted aether. Instead of ascending, Aurel sealed it with his own life and built his grotto over the seal, under Willow Hill. His three apprentices founded the province's powers: **Edric Cloudmere** (the Azure Cloud Sect), **Torvald Ironside** (the Crimson Blade Hall, and the Hallmaster's ancestor), and **Maud Greenhallow** (the Verdant Pill Pavilion). The Wandering Immortal Alliance keeps his habit of walking alone. A fourth apprentice, **Selene**, stayed behind to guard the seal.
- **The betrayal.** Edric Cloudmere wanted the grotto's treasures and tried to break in after his master's death; Selene stopped him, and he erased the story from his sect's records. The current High Master knows; the sect would be disgraced if it came out.
- **The three keys.** The **Bamboo Key** at the Listening Stone in Whispering Bamboo Forest, guarded by the Silver-Eyed Fox. The **Iron Key** behind the unscratchable door of the Sunken Forge in Ironpeak (Hallmaster Ironside holds a moon-silver fragment that is part of its lock, taken from House Harrowgate). The **Moon Key** on Moonwater's island, given by Selene only on a full moon to someone who passes her trial. Each key tests the heart, not the root: patience (bamboo), resolve (iron), and compassion (moon).
- **The seal is failing.** The thousand-year cycle ends on day 90. The lights on Willow Hill are the grotto waking. Whoever enters with the keys can claim the legacy and renew the seal, or break it and drink the Hollow Vein's power.
- **The legacy adapts.** Aurel's **Azure Codex** reshapes itself to the heir's own roots. It favors no element and no composition. It is a path, not a power-up: a superb method, his memories, a Grade III treasure, and the duty of the seal.
- **Morcant Vire**, "Peddler Mott", is a hollow-mage (Adept) who drained the animals while probing the seal. He wants the seal broken. He recruits the desperate, starting with Tam Ashby, whom he promises false roots grown from the Vein's aether (they would work, at a terrible price).
- **Selene**, the Moon Hermitess of Moonwater, is a lingering spirit bound to the lake for a thousand years. She is tired and wants the duty passed to someone worthy, then rest.
- **What each claimant does with the legacy:** the Azure Cloud Sect buries the shameful truth and grows mighty; Hallmaster Ironside turns the Codex to conquest; the Pavilion seeks Aurel's lost formulas (above all the Phoenix Elixir) and lets the seal lapse to sell the cure; an Alliance claimant renews the seal and shares the teaching; Morcant breaks the seal; a rival does what their notes suggest; the character does whatever they choose.

## Narrator rules for this world
- **Never railroad.** The player decides each day what to do: train, gather, explore, trade, fight, court, investigate, or rest. Offer hooks (a master's offer, a rival's challenge, a herb in season, a rumor, a faction's request) and let them choose. The legacy is an optional mystery; the province is full of other paths.
- **One skill per element, always.** Check the character's skills before any elemental roll and roll the skill for the element actually used. If a root the character has is missing from their skills, create it with \`grant_skill_xp\` before rolling.
- **Remember who they are.** Their roots, rank, techniques, gear, sect standing, and relationships should be visible in every scene: an elder notices their root, a rival measures their circle, a shopkeeper recognizes the sect badge, a beast avoids (or seeks) their element. Look things up with the read tools rather than assuming.
- **Masters, rivals, companions, and leaders recur.** Keep a small cast and bring them back changed. The stone-tested rivals advance on their own: every week or two of game time, one of them breaks through, wins something, loses something, or needs help.
- **NPCs pursue their own ambitions.** Factions move, prices change, rivals train, and people grow older during time skips. After a long skip, open with what changed: who rose, who fell, who died, what happened at the last auction.
- **Advancement must feel earned and meaningful.** Show aether as sensation (warmth in the chest, a cold thread along a vein, a channel opening like a dam breaking), make breakthroughs big moments, and give each new technique a first use worth narrating. Never hand out levels for nothing, and never block a clever plan.
- **Continuity across training.** Keep the "Ascension Rank", "Spiritual Roots", and any sect condition current. Record debts, promises, grudges, and master-apprentice bonds in your story notes; they outlast any time skip.
- Fights are fast and dangerous: one \`skill_check\` per exchange, rank gaps respected, wounds that matter.
`,

  narratorStyle: `- Second person, present tense ("Mist pools in the valley below as you climb...").
- High fantasy with a light, lyrical hand: mountains standing in seas of cloud, whispering forests, candle smoke and pine resin, wool and silver, rain on slate roofs, bells across a valley. Beautiful, quiet, and dangerous underneath.
- Aether is felt in the body: warmth gathering in the chest, a cold thread along a vein, the pressure of a stronger mage's presence like deep water. Make magic sensory, not abstract.
- Hierarchy is visible: who bows and who doesn't, novices and masters ("Master", "Elder", "Brother", "Sister", "Prefect"), the weight of a master's word, and the contempt of the strong for the weak.
- Fights are swift and vivid: a flare of magic, footwork on wet stone, light and shockwaves, then stillness.
- 150 to 350 words per turn. Shorter in fights and conversations, longer for arrivals in new places, breakthroughs, and returns after a time skip.
- NPCs speak in distinct voices. Granny Wren scolds to hide worry and has a remedy for everything. Master Rowan Fenn is unhurried, wry, and answers questions with questions. Tam Ashby jokes too much and goes quiet when it matters. High Master Vael is serene and never quite answers. Elder Whitmore is curt, exact, and fair. Prefect Cassius Grey is charming to superiors and silky to juniors. Hallmaster Ironside speaks in short verdicts. Master-at-Arms Hale roars and laughs. Mistress Ashgrove is gracious and always calculating a price. Alchemist Pye fusses, sniffs, and haggles. Old Barnaby rambles, rhymes, and then says something terrifyingly precise. Madam Ottilie Gold talks like a contract. Peddler Mott is humble, kindly, and slightly too interested. The Moon Hermitess speaks as if from very far away.
- End on something the player can act on: an offer, a challenge, a rumor, a herb in bloom, a door that should not be open.
`,

  locations: [
    {
      name: 'Azure Mist Province',
      description:
        'A remote province at the edge of the Great Celestial Continent: green mountains standing in seas of cloud, terraced fields and orchards, whispering forests, and a lake that holds the moon. Mortals farm; mages climb.',
      purpose:
        "The campaign's world: the board every faction is playing on, and the home of the Azure Immortal's buried legacy. Holds every starting location; Act IV opens the wider continent beyond it.",
      tags: ['province', 'region', 'hub'],
    },
    {
      name: 'Willowbrook Village',
      description:
        "A peaceful village of thatched cottages and vegetable plots along a clear stream, with an ancient willow on the green, a mossy wayside chapel, the Willow Inn, and Granny Wren's herb shop with bundles drying under the eaves.",
      purpose:
        "The starting location and the character's home: the root test, Granny Wren, Tam Ashby, and Reeve Hollin. A place to return to that changes as the character does, and, if Morcant Vire's plans go ahead, a place in danger around day 75.",
      tags: ['village', 'home', 'start', 'mortal'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'Willow Hill',
      description:
        "A grassy hill above the village crowned by a crumbling stone chapel to a saint no one remembers. Lately the chapel's cracks glow faintly at night, and the grass around it has gone grey.",
      purpose:
        "Site of the disturbances (Lights on Willow Hill): the grotto waking beneath it and Morcant Vire's probing of the seal. The chapel hides the grotto's outer gate. Where Morcant begins his blood rite on day 75.",
      tags: ['hill', 'chapel', 'mystery', 'disturbance'],
      parent: 'Willowbrook Village',
    },
    {
      name: 'Azure Cloud Sect',
      description:
        'A white-stone abbey of halls and slate-roofed towers on Cloudveil Peak, reached by the Thousand Cloudgate Steps. Bells, candlelit cloisters, novices in blue robes drilling on mist-soaked terraces, and eagles circling the summit.',
      purpose:
        "Seat of the Azure Cloud Sect: the annual entrance trial (day 15), novice and inner circles, the library (with the founder's erased teacher), the ley-line springs, and the sect's masters. Disciplined magic and the sect's buried shame.",
      tags: ['sect', 'abbey', 'mountain', 'training'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'Whispering Bamboo Forest',
      description:
        'Miles of towering bamboo that rustles and murmurs even when no wind blows. Shafts of light, mist on the ground, aether-herbs in the shadows, and paths that are not where they were yesterday.',
      purpose:
        'Wilderness for gathering herbs (Mistbell Orchids), hunting first-rank aether beasts, and getting lost. Home of the Silver-Eyed Fox, the flowering line of bamboo, and the Listening Stone where the Bamboo Key waits for someone patient.',
      tags: ['wilderness', 'forest', 'herbs', 'beasts'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'Spiritfall Market',
      description:
        'A trading town that grew around a waterfall whose spray glitters with aether. Stalls of herbs, heartstones, and scrolls; mages in every color of cloak; merchants shouting prices; channeling cells for rent by the month.',
      purpose:
        "The crossroads of the province: trade, rumors, the Gilded Hall's monthly auction (Madam Ottilie Gold), the Proving Ring (Crimson Blade Hall recruitment), the Verdant Pill Pavilion, and the Drunken Crane. Where all four factions meet, and where Peddler Mott sells his remedies.",
      tags: ['market', 'town', 'trade', 'hub'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'The Verdant Pill Pavilion',
      description:
        'A three-story guildhall of green-glazed tiles in Spiritfall Market, smelling of a hundred herbs and alembic smoke. A counter of jars and scales at the front; behind it, furnace rooms glowing with deep-fire.',
      purpose:
        'Seat of the Verdant Pill Pavilion (Mistress Ashgrove, Alchemist Pye): buys herbs and heartstones, sells elixirs, rents alembics, and takes apprentices. Its deep-fire furnaces point toward Willow Hill on full moons.',
      tags: ['alchemy', 'shop', 'faction'],
      parent: 'Spiritfall Market',
    },
    {
      name: 'The Drunken Crane',
      description:
        "A ramshackle tavern on stilts over the falls' pool, with a crooked crane-shaped sign, mismatched tables, a rumor board, and more ale poured than anyone admits.",
      purpose:
        'Gathering place of the Wandering Immortal Alliance (Old Barnaby): rumors, shared expeditions, dangerous jobs, independent masters, and a bed for wanderers. The heart of the independent path.',
      tags: ['tavern', 'rumors', 'faction'],
      parent: 'Spiritfall Market',
    },
    {
      name: 'Ironpeak Mountains',
      description:
        'Black, jagged peaks streaked with ore, cold winds, mining camps clinging to cliffs, and the ruins of an older civilization half-buried in rockslides. Aether beasts den in the high passes.',
      purpose:
        'Dangerous country for rare ores, heartstones, and ancient ruins. Home of the Crimson Blade Hall at Bladecrest Fortress and the Sunken Forge where the Iron Key lies. The old Harrowgate ice-vein mine is here.',
      tags: ['mountains', 'dangerous', 'ruins', 'ore'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'Bladecrest Fortress',
      description:
        'A fortress of black stone carved into a cliff, with weapon racks along every wall, forges roaring day and night, and fighters sparring in a courtyard stained red.',
      purpose:
        "Seat of the Crimson Blade Hall (Hallmaster Brand Ironside): brutal martial training, weapon techniques, the Hall's aether-forge, and the base of its excavation of the Sunken Forge. Where Ironside keeps the Harrowgate moon-silver fragment.",
      tags: ['fortress', 'martial', 'faction'],
      parent: 'Ironpeak Mountains',
    },
    {
      name: 'The Sunken Forge',
      description:
        'An ancient ruin fallen into a crevasse: colossal anvils, cold furnaces the size of houses, rune-carved pillars, and corridors that still hum when struck. The traps still work.',
      purpose:
        "Ruins of the forge where Torvald Ironside made his master's weapons. Treasure, traps, and constructs; the Crimson Hall's excavation; and the unscratchable door hiding the Iron Key, which opens to resolve, not force.",
      tags: ['ruins', 'dungeon', 'ancient', 'dangerous'],
      parent: 'Ironpeak Mountains',
    },
    {
      name: 'Moonwater Lake',
      description:
        'A wide, still lake in a bowl of hills, so clear that the moon seems to lie on its bottom. Mist walks across it at dawn; a small island of pines sits in the middle; the aether here is thick enough to taste.',
      purpose:
        'The richest aether in the province, free to anyone: a place to train, fish for moon pike, and find Jory Stormwell and Old Barnaby drinking. Home of the Moon Hermitess, Selene, and the full-moon trial for the Moon Key on the island.',
      tags: ['lake', 'mystery', 'aether-rich', 'training'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'Forgotten Immortal Grotto',
      description: "A place that appears in old songs and nowhere on any map: an immortal's hidden sanctum, sealed for a thousand years.",
      purpose:
        "The Azure Immortal's grotto beneath Willow Hill, built over the seal on the Hollow Vein. Opens fully on the Night of Nine Lights (day 90) to whoever holds the three keys. Holds the Azure Codex, Aurel Vane's memories and treasures, and the choice to renew the seal or break it.",
      tags: ['hidden', 'grotto', 'legacy', 'ancient'],
      parent: 'Azure Mist Province',
    },
  ],

  npcs: [
    {
      name: 'Granny Wren',
      shortDescription:
        "Willowbrook's herbalist. Seventies, tiny and bent, a cloud of white hair under a blue kerchief, hands stained brown by forty years of roots, and a scolding voice that never quite hides her worry.",
      faction: '',
      location: 'Willowbrook Village',
      notes:
        "**Who:** raised the character after their parents died of fever. Taught them every herb in the valley. **Secret:** sixty years ago she climbed the Cloudgate Steps for the Azure Cloud trial and was turned away for a weak mixed root. She has never said so. **Want:** for the character to be happy, and safe, and not to make her mistake of spending a life wondering. **Knows:** the **Willow Song**, an old village lullaby that is a riddle to the three keys (see lore). Sings it when worried. **Toward the player:** love, expressed as nagging.",
    },
    {
      name: 'Reeve Tobias Hollin',
      shortDescription:
        "Willowbrook's reeve. Fifties, stout and anxious, a good wool coat worn on every occasion, a clay pipe, and a way of wringing his hands while he talks.",
      faction: '',
      location: 'Willowbrook Village',
      notes:
        "**Want:** the disturbances on Willow Hill gone, and a mage in the village to protect it. **Gives:** Lights on Willow Hill. **Offers:** a small purse and the village's gratitude; if the character becomes a mage, he will brag about them to every county clerk. **Toward the player:** fond but distracted; treats them as a child until they are not one.",
    },
    {
      name: 'Tam Ashby',
      shortDescription:
        "The character's oldest friend. Sixteen, lanky, quick to grin, a woodcutter's apprentice with sawdust in his hair and a tin whistle in his belt.",
      faction: '',
      location: 'Willowbrook Village',
      notes:
        "**Root:** none; the stone stayed grey for him in front of the whole village. **Want:** not to be left behind. **Arc:** if no one intervenes, he meets Peddler Mott on day 5 and is promised roots that can be bought. By day 75 he is helping Morcant's blood rite on Willow Hill, with false roots of grey Hollow Vein aether that are slowly eating him. **Can be saved** by friendship, by a mortal path that honors him (the Pavilion takes mortals as herb-gatherers; Granny Wren needs an heir), or by the legacy. **Toward the player:** loyal, proud, and hurting; he will never ask for help.",
    },
    {
      name: 'Master Rowan Fenn',
      shortDescription:
        'A wandering mage. Forties, lean and weathered, a wide-brimmed hat, a grey traveling cloak patched at the elbows, a walking staff, and a waist-high grey stone strapped to his back as if it weighed nothing.',
      faction: WANDERING,
      location: 'Willowbrook Village',
      notes:
        "**Rank:** Adept, first circle; Wind root (pure). **Who:** a former inner-circle mage of the Azure Cloud Sect who left twenty years ago 'to see the road'. Travels the province testing village youths with his Testing Stone; sects pay him a finder's fee. **Secret:** the Alliance sent him to Willowbrook because someone has been draining animals across the province; he suspects a hollow-mage and is tracking Peddler Mott. **Gives:** The Testing Stone. **Offers:** a letter of recommendation to any faction; one month on the road as his apprentice to a youth who interests him. **Toward the player:** wry, patient, and watching to see what they do with what they are given.",
    },
    {
      name: 'High Master Aldous Vael',
      shortDescription:
        'High Master of the Azure Cloud Sect. Looks fifty, is over two hundred: silver-streaked beard, a pale blue robe embroidered with clouds, a white oak staff, and a calm that fills a room.',
      faction: AZURE,
      location: 'Azure Cloud Sect',
      notes:
        "**Rank:** Magister; Water and Wind. **Want:** to restore the sect's fading glory before he dies; the legacy would do it. **Secret (GM only):** knows the founder Edric Cloudmere was the Azure Immortal's apprentice and tried to rob his master's grotto; the sect erased it. He will claim the legacy quietly and bury the story. **Toward the player:** gracious and distant; interested once they show talent or know something he does not.",
    },
    {
      name: 'Elder Isolde Whitmore',
      shortDescription:
        "Elder of the novices at the Azure Cloud Sect. Looks forty: severe and elegant, white robes edged in pale blue, silver-grey hair in a tight braid, and eyes that grade you before you've spoken.",
      faction: AZURE,
      location: 'Azure Cloud Sect',
      notes:
        "**Rank:** Adept, ninth circle; Ice (pure). **Runs:** the novices and the annual entrance trial. **Gives:** The Azure Cloud Entrance Trial. **Want:** students worth teaching; protects Ilse Harrowgate, whom she sheltered as a child. **Toward the player:** curt and exact; looks down on mixed roots and says so, but grades fairly and admits it when she is wrong. A hard master and a good one.",
    },
    {
      name: 'Prefect Cassius Grey',
      shortDescription:
        'Inner-circle acolyte and prefect over the novices. Twenty-five, handsome, an immaculate blue robe, a silver signet ring, and a smile that is pleasant to superiors and silky to juniors.',
      faction: AZURE,
      location: 'Azure Cloud Sect',
      notes:
        "**Rank:** Initiate, ninth circle, stuck at the threshold. **Want:** an Adept's Elixir and the respect of his elders. **Method:** skims the novices' stipends and takes 'gifts' for good duties. **Toward the player:** a classic bully if they are weak and a flatterer if they are useful; an enemy who grows more dangerous when exposed. Threw Jory Stormwell out of the sect.",
    },
    {
      name: 'Hallmaster Brand Ironside',
      shortDescription:
        'Master of the Crimson Blade Hall. Fifties, huge and scarred, iron-grey hair cropped short, a crimson surcoat over black plate, and a greatsword across his back as long as a man.',
      faction: CRIMSON,
      location: 'Bladecrest Fortress',
      notes:
        "**Rank:** Magister; Metal (pure). **Philosophy:** strength is truth. Descended from the Hall's founder, Torvald Ironside. **Secret (GM only):** destroyed House Harrowgate ten years ago for a moon-silver fragment that is part of the Iron Key's lock, not for their mine; he has been digging toward the Sunken Forge's door ever since. Wants the legacy to make the Hall master of the province. **Toward the player:** ignores the weak; respects anyone who defeats a Hall fighter, and wants to own them.",
    },
    {
      name: 'Master-at-Arms Roderick Hale',
      shortDescription:
        'Crimson Blade Hall recruiter and master of the Proving Ring. Forties, red-bearded and barrel-chested, a crimson sash, a voice like a war horn, and the laugh of a man who enjoys a good fight more than winning one.',
      faction: CRIMSON,
      location: 'Spiritfall Market',
      notes:
        '**Rank:** Adept, second circle; Fire. **Runs:** the Proving Ring in Spiritfall: open bouts every few days, purses of 1 to 5 shards, Hall recruitment for anyone who wins three in a row. **Gives:** The Proving Ring. **Want:** good fighters, and fair ones; he does not know (and would hate) what Ironside did to House Harrowgate. **Toward the player:** loud, generous, and honest; the best face of his Hall.',
    },
    {
      name: 'Mistress Seraphine Ashgrove',
      shortDescription:
        'Mistress of the Verdant Pill Pavilion. Looks thirty-five: graceful, layered green velvets, a circlet of silver leaves, a faint scent of lavender, and the soft smile of someone who has already set the price.',
      faction: VERDANT,
      location: 'The Verdant Pill Pavilion',
      notes:
        "**Rank:** Adept, eighth circle; Wood and Fire. **Want:** the Azure Immortal's lost formulas, above all the Phoenix Elixir. **Method:** sells to everyone, lends to everyone, and remembers. **Secret (GM only):** the Pavilion's founder left notes that the seal 'needs only a worthy hand'. Ashgrove would let it lapse if the Pavilion could sell the remedy for the Vein's taint. **Toward the player:** courteous; makes offers that sound generous and are not quite.",
    },
    {
      name: 'Alchemist Fennick Pye',
      shortDescription:
        "The Pavilion's front-counter alchemist and herb buyer. Sixties, bald and spindly, spectacles on a cord, scorch-spotted sleeves, and a nose that can tell a herb's age from across the room.",
      faction: VERDANT,
      location: 'The Verdant Pill Pavilion',
      notes:
        '**Buys:** aether-herbs (1 to 8 shards each), heartstones, and anything odd. **Sells:** Gathering Draughts (2), wound salves, antidotes. **Gives:** Mistbell Orchids. **Want:** a good apprentice who is not Hazel Thorne, who frightens him. **Toward the player:** fussy and stingy at first; delighted by anyone with real Herb Lore, and will teach them basic Alchemy for errands.',
    },
    {
      name: 'Old Barnaby',
      shortDescription:
        'An old wanderer. Ancient or ageless, ragged robes, a wispy beard, a battered leather wineskin always at his lips, and a habit of falling asleep anywhere, including mid-sentence.',
      faction: WANDERING,
      location: 'The Drunken Crane',
      notes:
        "**Rank:** hidden; at least Magister (Lightning). **Who:** the closest thing the Wandering Immortal Alliance has to a leader, which he denies. **Want:** an apprentice who is not trying to impress him; wine. **Gives:** Old Barnaby's Wager. **Knows:** far more about the Azure Immortal than he admits; he met Selene once, a century ago. **Toward the player:** rambling and rude; if they pass his test, a teacher of unconventional genius who never explains anything twice.",
    },
    {
      name: 'Madam Ottilie Gold',
      shortDescription:
        'Owner of the Gilded Hall in Spiritfall Market. Forties, plump and glittering, gold-thread brocade, an abacus of polished garnets, and a smile that charges interest.',
      faction: '',
      location: 'Spiritfall Market',
      notes:
        '**Offers:** the monthly auction (day 10, then every 30 days), appraisals, consignment sales, and information at a price. Strictly neutral; all four factions bank with her. **Want:** profit, and to be the one who sells the map to the grotto. **Knows:** who bought what, and who is short of money. **Toward the player:** businesslike; useful to anyone who brings her something rare.',
    },
    {
      name: 'Peddler Mott',
      shortDescription:
        'A traveling medicine peddler. Fifties, thin and stooped, a grey coat, a handcart of corked bottles, kind tired eyes, and remedies that work better than they should.',
      faction: '',
      location: 'Spiritfall Market',
      notes:
        "**Secret (GM only):** Morcant Vire, a hollow-mage (Adept, hiding his presence as a mortal's). Drained the animals on Willow Hill while probing the seal. **Want:** the seal broken and the Vein's power. **Method:** finds the desperate and offers them what the world denied them, starting with Tam Ashby (day 5). Begins his blood rite on Willow Hill on day 75. **Toward the player:** kindly, helpful, cheap remedies, and too many questions about Willow Hill and their roots. Pip Larkin has one of his letters.",
    },
    {
      name: 'The Silver-Eyed Fox',
      shortDescription:
        'An aether beast of Whispering Bamboo Forest: a slender white fox with three tails, silver eyes, and the habit of watching travelers from just beyond the path.',
      faction: '',
      location: 'Whispering Bamboo Forest',
      notes:
        "**Rank:** a third-rank aether beast, roughly a late Initiate; can speak to mages of the third circle or higher, and chooses not to most of the time. **Guards:** the Listening Stone and the Bamboo Key, which it gives to whoever waits there a full day and night without taking anything from the forest. **Want:** to be left alone; to protect its kits from hunters. **Toward the player:** curious, mischievous, and leads people astray for fun; a powerful friend to anyone who helps its kits.",
    },
    {
      name: 'Foreman Dougal Pike',
      shortDescription:
        "Foreman of the mortal miners in Ironpeak. Fifties, coal-grimed and bowlegged, a cough from the dust, a lamp on his helmet, and a miner's gallows humor.",
      faction: '',
      location: 'Ironpeak Mountains',
      notes:
        "**Runs:** the mortal crews who dig ore for the Crimson Blade Hall, and now dig toward the Sunken Forge. **Want:** his men to stop dying in traps. **Knows:** the safe paths through the ruins, the old Harrowgate mine, and that Ironside's men searched the Harrowgate bodies for something. **Toward the player:** wary of mages; warm to anyone who treats his men as people. Will guide them into the Sunken Forge for a fair price.",
    },
    {
      name: 'The Moon Hermitess',
      shortDescription:
        'A woman seen on Moonwater Lake at night: white robes, long dark hair unbound, a small boat that leaves no wake, and a face that is hard to remember afterward.',
      faction: '',
      location: 'Moonwater Lake',
      notes:
        "**Secret (GM only):** Selene, the Azure Immortal's fourth apprentice, a lingering spirit bound to the lake for a thousand years to guard the seal. Holds the Moon Key and gives it only on a full moon, to someone who passes her trial of compassion (choosing to help another at a cost to themselves). **Want:** to pass the duty to someone worthy, and rest. **Toward the player:** distant and gentle; appears to people who train on her shore for many nights.",
    },
  ],

  lore: [
    {
      title: 'Ascension Ranks',
      keywords: ['rank', 'ranks', 'channeling', 'aether', 'circle', 'breakthrough', 'threshold', 'initiate', 'adept', 'magister', 'archon', 'ascension'],
      alwaysInclude: true,
      body: "Power is measured in ranks. The character's raw power is the Channeling skill; their rank is the 'Ascension Rank' condition. Mortal (no Channeling); Initiate (levels 1 to 9, the level is the circle); Adept (10 to 19); Magister (20 to 29); Archon (30+); beyond lie Exalted, Ascendant, and Immortal. At levels 10, 20, and 30 the character is held at a threshold until a breakthrough: a prepared scene and a Channeling check at DC 14, 18, or 22. Failure brings Aether Burn. A full rank's gap is not overcome by a lucky roll.",
    },
    {
      title: 'Spiritual Roots',
      keywords: ['root', 'roots', 'spiritual root', 'magic', 'element', 'pure', 'dual', 'mixed', 'fire', 'water', 'earth', 'wood', 'metal', 'wind', 'lightning', 'ice'],
      alwaysInclude: true,
      body: "Every mage has spiritual roots, their natural bond with kinds of aether: Fire, Water, Earth, Wood, Metal, and the rarer sky roots Wind, Lightning, and Ice. EVERY ELEMENT IS ITS OWN SKILL, a school of magic: Pyromancy (fire), Hydromancy (water), Geomancy (earth), Phytomancy (wood), Ferromancy (metal), Aeromancy (wind), Electromancy (lightning), Cryomancy (ice), each with its own level and its own rolls; a character with three roots has three school skills. Roll the skill of the element actually used, never another's. Composition: Pure is deep and narrow, Dual braids two elements, Mixed can learn anything but breaks through with difficulty. Elements press each other in two cycles (water, fire, metal, wood, earth; lightning, ice, wind), an edge of circumstance, never destiny. No root makes a mage superior; sects merely prefer some.",
    },
    {
      title: 'Azure Mist Province',
      keywords: ['azure mist', 'province', 'willowbrook', 'spiritfall', 'ironpeak', 'moonwater', 'bamboo'],
      body: 'A remote province at the edge of the Great Celestial Continent, known for mist, mountains, and forests. Its powers are the Azure Cloud Sect on Cloudveil Peak, the Crimson Blade Hall in the Ironpeak Mountains, the Verdant Pill Pavilion in Spiritfall Market, and the independent Wandering Immortal Alliance. Spiritfall Market is the crossroads. To the great orders of the Heartlands, Azure Mist is a backwater; the strongest mages here are Magisters.',
    },
    {
      title: 'The Azure Immortal',
      keywords: ['azure immortal', 'immortal', 'aurel', 'vane', 'legacy', 'grotto', 'keys', 'nine lights', 'codex'],
      body: "A legend of Azure Mist: a thousand years ago a mage called the Azure Immortal walked these mountains, taught three apprentices, and vanished instead of ascending. Stories say his grotto lies hidden somewhere in the province with his codex and treasures, and opens only once in a thousand years to whoever holds 'bamboo, iron, and moon'. Every faction claims some link to him. Most people think it is a children's tale.",
    },
    {
      title: 'The Willow Song',
      keywords: ['willow song', 'lullaby', 'song', 'riddle', 'granny wren'],
      body: "A lullaby sung in Willowbrook for longer than anyone remembers: 'Wait by the stone where the bamboo listens, / take nothing, child, and the green will glisten. / Iron sleeps where the old fires died; / it opens to one who will not step aside. / The moon on the water asks one thing true: / what would you give that is not for you? / Three lights gathered, the willow will wake, / and the sleeper below his rest may take.' Granny Wren sings it. It is a riddle to the three keys and the grotto under Willow Hill.",
    },
    {
      title: 'Sects and Apprentices',
      keywords: ['sect', 'novice', 'acolyte', 'inner circle', 'elder', 'master', 'apprentice', 'prefect', 'merit', 'brother', 'sister'],
      body: "Orders rank their members: novices (chores and basic training), acolytes (real techniques and resources), the inner circle (the order's future, personally taught by elders), elders, and the High Master. Members call each other Brother and Sister; prefects keep the novices in line. Merit, earned by the order's tasks, buys grimoires, elixirs, and time at the ley-line springs. A master-apprentice bond is close to family and binding both ways; betraying a master is among the worst crimes a mage can commit.",
    },
    {
      title: 'Aether Shards, Elixirs, and Herbs',
      keywords: ['shard', 'shards', 'elixir', 'elixirs', 'draught', 'pill', 'herb', 'herbs', 'alchemy', 'heartstone', 'price', 'auction'],
      body: "Mages trade in aether shards: crystallized aether, used as money and drawn on during training. One common shard is a peasant family's month of income; 100 make a greater shard. Elixirs speed training and heal: a Gathering Draught costs about 2, an Adept's Elixir about 300 when one can be found. Aether-herbs (1 to 8 each) and beast heartstones (5 to 15 for a first-rank beast) sell at the Verdant Pill Pavilion or Madam Gold's Gilded Hall, which holds an auction every month.",
    },
    {
      title: 'Aether Beasts',
      keywords: ['beast', 'beasts', 'aether beast', 'monster', 'fox', 'boar', 'heartstone', 'beast surge'],
      body: 'Animals that absorb aether become aether beasts, ranked first through ninth roughly alongside mage ranks (first to third rank is Initiate; fourth to sixth is Adept). From the third rank many are cunning; some speak. Their heartstones, hides, and bones are valuable. Azure Mist has thicket boars, mist serpents, ironback bears in Ironpeak, and moon pike in Moonwater. A beast surge, when beasts flee or rage together, is a disaster for mortal villages.',
    },
    {
      title: 'The Great Celestial Continent',
      keywords: ['continent', 'heartlands', 'beyond', 'great orders', 'celestial court', 'ancient realm', 'act iv'],
      body: 'Azure Mist is one province on the edge of the Great Celestial Continent. Beyond it lie the Heartlands, ruled by the Nine Great Orders, where Archons sit as elders; the Thousand Isles, full of hedge-mages and sea beasts; the Southern Wilds, home to beast kings and old tribal magic; the Northern Frost Wastes; and the Ruins of the Fallen Celestial Court, the remains of a civilization of immortals that fell ages ago. Hidden realms open there for a few days a century. Few from Azure Mist ever go.',
    },
  ],

  missions: [
    {
      title: 'The Testing Stone',
      giver: 'Master Rowan Fenn',
      description:
        "A wandering mage has set a Testing Stone under Willowbrook's old willow. Every youth in the village is lining up. Whatever the stone shows you will change what comes next, or prove that nothing will.",
      objectives: ['Lay your hand on the Testing Stone', 'Learn what the stone reveals about your spiritual roots', 'Decide what to do with what you have learned'],
      status: 'active',
      rewards: { xp: 50 },
    },
    {
      title: 'Lights on Willow Hill',
      giver: 'Reeve Tobias Hollin',
      description:
        'For three nights, lights have flickered at the old chapel on Willow Hill, the wells have run warm, and animals have been found drained and grey. The reeve wants it stopped, and is too frightened to go up the hill himself.',
      objectives: ['Investigate the chapel on Willow Hill', 'Find out what is draining the animals', 'Deal with it, or bring it to someone who can'],
      rewards: { money: 3, xp: 100, relationships: [{ npc: 'Reeve Tobias Hollin', affinity: 10, trust: 15 }] },
    },
    {
      title: 'The Azure Cloud Entrance Trial',
      giver: 'Elder Isolde Whitmore',
      description:
        "Once a year the Azure Cloud Sect opens the Thousand Cloudgate Steps to anyone under twenty-five with a spiritual root. Climb the steps, survive the elder's examination, and become a novice of the most respected order in the province. The trial is on day 15. Most who try fail.",
      objectives: ['Reach the foot of the Cloudgate Steps by day 15', 'Climb the Thousand Steps', "Pass Elder Whitmore's examination of root and heart", 'Be entered on the roll of novices'],
      rewards: { xp: 150, relationships: [{ npc: 'Elder Isolde Whitmore', affinity: 5, trust: 10 }] },
    },
    {
      title: 'Mistbell Orchids',
      giver: 'Alchemist Fennick Pye',
      description:
        'Mistbell Orchids bloom in the deep shade of Whispering Bamboo Forest for a few weeks each year, and the Pavilion needs them for Gathering Draughts. Pye pays well for fresh ones, and sniffs at anything wilted.',
      objectives: ['Find a patch of Mistbell Orchids in Whispering Bamboo Forest', 'Gather five without bruising them', 'Bring them to Fennick Pye fresh'],
      rewards: { money: 6, xp: 60, skillXp: [{ skill: 'Herb Lore', amount: 15 }] },
    },
    {
      title: 'The Proving Ring',
      giver: 'Master-at-Arms Roderick Hale',
      description:
        'A ring of red stone in Spiritfall Market, where anyone may fight anyone who agrees. Win three bouts in a row and Master-at-Arms Hale will offer you a place in the Crimson Blade Hall, whether you want it or not.',
      objectives: ['Win a bout in the Proving Ring', 'Win a second', 'Win a third, and decide what to say to Hale'],
      rewards: { money: 10, xp: 80 },
    },
    {
      title: "Old Barnaby's Wager",
      giver: 'Old Barnaby',
      description:
        "Old Barnaby bets you can't bring him a cup of water from the very middle of Moonwater Lake on a full-moon night without spilling a drop. If you win, he says, he'll teach you something. If you lose, you buy the wine.",
      objectives: ['Reach the middle of Moonwater Lake on a full-moon night', 'Bring back a full cup without spilling', 'Collect on the wager'],
      rewards: { xp: 120, relationships: [{ npc: 'Old Barnaby', affinity: 10, trust: 15 }] },
    },
    {
      title: 'Whispers of the Azure Immortal',
      description:
        'An old lullaby, a cracked chapel, lights on the hill, and a legend of an immortal who vanished instead of ascending. If any of it is true, the greatest legacy in Azure Mist is somewhere close, and soon everyone will be looking for it.',
      objectives: [
        'Learn the legend of the Azure Immortal',
        'Find the three keys: bamboo, iron, and moon',
        'Find the Forgotten Immortal Grotto',
        'Claim the legacy, share it, or leave it sleeping',
      ],
      rewards: { xp: 1000 },
    },
  ],

  character: {
    name: 'Robin Ashdown',
    archetype: 'Willowbrook herb-gatherer',
    bio: "Sixteen, born and raised in Willowbrook Village. Your parents died of fever when you were four, and Granny Wren, the village herbalist, took you in. You know every root and leaf in the valley, you can climb a cliff for a single sprig of mountain saffron, and you have never been farther than the county market. You have heard of mages the way you have heard of dragons. Then, three nights ago, lights began flickering on Willow Hill, and yesterday a wandering mage walked into the village with a stone on his back. Today, under the old willow, everyone your age is lining up to touch it.",
    location: 'Willowbrook Village',
    money: 2,
    level: 1,
    xp: 0,
    hp: 12,
    maxHp: 12,
    statusEffects: [
      {
        name: 'Spiritual Roots',
        description: 'Untested. As far as anyone knows, a mortal.',
        turnsRemaining: null,
        modifiers: [],
      },
      {
        name: 'Ascension Rank',
        description: 'Mortal. No aether drawn, no technique learned. (Ranks follow the Channeling skill.)',
        turnsRemaining: null,
        modifiers: [],
      },
    ],
    skills: [
      { name: 'Herb Lore', level: 2, xp: 20, description: 'Identifying, gathering, and preparing medicinal plants, and later aether-herbs: their age, potency, and dangers. Granny Wren taught you well.' },
      { name: 'Woodcraft', level: 1, xp: 10, description: 'Moving through forest and hills: tracking, finding paths, foraging, reading weather, and not getting lost.' },
      { name: 'Climbing', level: 1, xp: 10, description: 'Cliffs, trees, and rooftops. You have climbed for herbs since you were eight.' },
      { name: 'Perception', level: 1, xp: 5, description: 'Noticing what is out of place: a track, a lie, a glint of light where there should be none.' },
      { name: 'Letters', level: 1, xp: 0, description: 'Reading and writing. Granny Wren made you learn from her herbal; enough to read a scroll slowly.' },
    ],
    items: [
      { name: 'Herb basket', description: 'A woven willow basket with shoulder straps, smelling of mint and earth.', tags: ['container', 'tool'], equipped: true },
      { name: 'Herb sickle', description: 'A small, sharp iron sickle for cutting roots and stems. Not a weapon, unless it has to be.', tags: ['tool', 'weapon', 'blade'], equipped: true },
      { name: 'Oiled wool cloak', description: 'A hooded cloak of oiled wool that sheds rain and smells faintly of sheep.', tags: ['clothing'], equipped: true },
      {
        name: "Granny Wren's herbal",
        description: "A thick hand-copied book of valley herbs and remedies, with Granny Wren's notes crammed in the margins. On the last page, in a younger hand, someone has written the words of a song.",
        tags: ['book', 'herbalism', 'keepsake'],
      },
      {
        name: 'Warm grey pebble',
        description: 'A smooth grey pebble you picked up near the chapel on Willow Hill the first night the lights appeared. It stays warm, even in the stream.',
        tags: ['curiosity', 'mystery'],
      },
    ],
    relationships: [
      {
        npc: 'Granny Wren',
        affinity: 60,
        trust: 65,
        status: 'family',
        historyNotes: '- Took you in when your parents died. Taught you every herb in the valley, and scolds you every day out of love.',
      },
      {
        npc: 'Tam Ashby',
        affinity: 50,
        trust: 50,
        status: 'friend',
        historyNotes: '- Best friend since you were both small enough to fall in the stream together. Touched the stone an hour ago; it stayed grey.',
      },
      {
        npc: 'Reeve Tobias Hollin',
        affinity: 10,
        trust: 15,
        status: 'acquaintance',
        historyNotes: "- Still calls you 'Granny Wren's little one'. Asked you yesterday whether you'd seen anything strange on Willow Hill.",
      },
      {
        npc: 'Master Rowan Fenn',
        affinity: 0,
        trust: 0,
        status: 'stranger',
        historyNotes: '- Arrived yesterday with a stone on his back. Looked at you a moment longer than at the others.',
      },
    ],
  },
};
