import type { CampaignChoiceInput } from '@narrator/shared';
import type { WorldTemplate } from '../world';

// Faction names double as the reputation keys: an NPC whose `faction` matches one acts on the character's standing with it.
const AZURE = 'Azure Cloud Sect';
const CRIMSON = 'Crimson Blade Hall';
const VERDANT = 'Verdant Pill Pavilion';
const WANDERING = 'Wandering Immortal Alliance';

type RootOption = CampaignChoiceInput['options'][number];

/**
 * One spiritual root on the Root-Testing Stone. Locking it grants the root's affinity skill, the
 * beginner technique Master Lu Feng hands every youth the stone lights for, and the "Spiritual Roots"
 * condition. The rival is whoever the stone lit for that root elsewhere this season.
 */
function root(r: {
  element: string;
  summary: string;
  affinity: string;
  technique: { name: string; description: string };
  rival: { name: string; shortDescription: string; faction: string; location: string; notes: string };
}): RootOption {
  return {
    id: r.element.toLowerCase(),
    label: r.element.toUpperCase(),
    summary: r.summary,
    grants: {
      skills: [{ name: `${r.element} Affinity`, level: 1, description: r.affinity }],
      items: [
        {
          name: `Jade slip: ${r.technique.name}`,
          description: r.technique.description,
          tags: ['jade-slip', 'manual', 'technique', r.element.toLowerCase()],
        },
      ],
      statusEffects: [
        {
          name: 'Spiritual Roots',
          description: `Dominant root: ${r.element}, read on the Root-Testing Stone in Willowbrook. Secondary roots: not yet read (see Root Composition).`,
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
    '[ WILLOWBROOK VILLAGE SQUARE ]\nThe Root-Testing Stone stands under the old willow: grey, waist-high, cold as well water.\nMaster Lu Feng nods to you. "Hand flat. Breathe. Do not try to impress it."\nWarmth climbs your arm. Light wakes inside the stone.\nWhat color answers you first?',
  footer: 'A root is what you were born with, not what you will become. The stone has lit for others this season, and they are already walking toward the same mountains.',
  options: [
    root({
      element: 'Fire',
      summary: 'A red glow like a forge seen through smoke. Destruction, flame, and a temper that burns hot.',
      affinity:
        "Sensing and drawing fire-aspected qi: the warmth in a hearth, the sun on stone, anger in the blood. Rolled to learn and wield fire techniques and to feel heat-rich places. Grows from lighting a wick by touch into flame that answers like a limb. Its weakness: water quenches fire.",
      technique: {
        name: 'Ember Heart Sutra',
        description:
          "A beginner's fire breathing method, copied onto a palm-sized slip of green jade. Pressed to the brow, its words unfold in the mind: kindle qi in the lower dantian like coals under ash. Trained, it becomes the Ember Heart Sutra skill. Lv1: warm hands in snow, a wick lit at a touch. It grows into a Flame Palm that scorches through cloth and hide.",
      },
      rival: {
        name: 'Yan Chixiao',
        shortDescription:
          'Stone-tested rival (FIRE). Seventeen, wiry and sun-black, a miner\'s brat from the Ironpeak foothills, sleeves burned off at the elbow, knuckles scabbed, and a grin that dares you to hit it.',
        faction: CRIMSON,
        location: 'Spiritfall Market',
        notes:
          "**Root:** Fire, the root the player was not given. Lit the stone so hard in his mining camp that it cracked. Instructor Hong Lie recruited him for the Crimson Blade Hall that afternoon. **Want:** to beat an Azure Cloud disciple in front of a crowd, then every disciple after. **Method:** fights in the Proving Ring every few days and gets better every time. **Toward the player:** loud challenges; respects anyone who gets back up, and will share a jug with them afterward. **Clue he holds:** Hall Master Tie had him carry a rubbing of a stone tablet from the Sunken Forge to Spiritfall. It shows Moonwater Lake with three marks around it and a fourth under Willow Hill. He thought it was a mining map.",
      },
    }),
    root({
      element: 'Water',
      summary: 'A blue that moves like a river under ice. Healing, adaptability, and fine control of qi.',
      affinity:
        "Sensing and drawing water-aspected qi: rain, rivers, blood, and the tides of the body. Rolled to learn water techniques, to heal, and to steady another cultivator's qi. Grows from easing a fever into knitting wounds and turning a blow aside like a current. Its weakness: earth dams water.",
      technique: {
        name: 'Still Pool Meditation',
        description:
          "A beginner's water method on a slip of pale jade. Its words unfold like ripples: let qi settle until it is clear enough to see the bottom. Trained, it becomes the Still Pool Meditation skill. Lv1: calm the mind, sense how qi flows in a body, cool a fever with a palm. It grows into healing, and into qi control fine enough to thread a needle.",
      },
      rival: {
        name: 'Lan Shuyue',
        shortDescription:
          'Stone-tested rival (WATER). Eighteen, a county magistrate\'s daughter: composed, straight-backed, plain blue silk, hair pinned with a single silver comb, and a voice that never rises.',
        faction: AZURE,
        location: 'Azure Cloud Sect',
        notes:
          "**Root:** Water, the root the player was not given. Tested in the county seat; Elder Bai Shuang marked her as the year's most promising candidate before the trial even began. **Want:** to become a core disciple and prove a mortal official's daughter belongs among old cultivation clans. **Method:** perfection, early mornings, and never owing anyone. **Toward the player:** courteous and quietly competitive; an ally to anyone who treats her as an equal rather than a rival or a prize. **Clue she holds:** in the sect's Scripture Pavilion, the founder Yun Qiao's biography skips forty years, and on the founding stele the name of his teacher has been chiseled away.",
      },
    }),
    root({
      element: 'Earth',
      summary: 'A slow amber glow, heavy as a mountain. Defense, endurance, and a body that does not break.',
      affinity:
        "Sensing and drawing earth-aspected qi: stone, soil, mountains, and the weight of the body. Rolled to learn earth techniques, to stand firm, and to feel what lies underground. Grows from a stance no one can shove into skin that turns a blade. Its weakness: wood roots through earth.",
      technique: {
        name: 'Rooted Mountain Stance',
        description:
          "A beginner's earth method on a heavy slip of brown jade. Its words come slowly, like stones settling: sink qi into the bones and let the mountain hold you. Trained, it becomes the Rooted Mountain Stance skill. Lv1: stand firm against a charging man, carry twice your load. It grows into a body that shrugs off blows and qi that braces a wall.",
      },
      rival: {
        name: 'Shi Dazhuang',
        shortDescription:
          "Stone-tested rival (EARTH). Twenty, a farmer's son built like a granary door, sunburned neck, patched hemp clothes, huge careful hands, and the shyest smile in the province.",
        faction: VERDANT,
        location: 'The Verdant Pill Pavilion',
        notes:
          "**Root:** Earth, the root the player was not given. Hired by the Verdant Pill Pavilion to tend its earth-fire pill furnaces, which only an earth root can keep steady. **Want:** enough to buy the pills that hold back his mother's cold-poison, then a farm with good soil. **Method:** hard work, honesty, and saying yes to anyone who pays. **Toward the player:** friendly from the first meeting and loyal to the bone; easy to exploit, which others will try. **Clue he holds:** on full-moon nights the earth-fire under the Pavilion's furnaces leans like a compass needle toward Willow Hill, and the furnaces run cold for an hour.",
      },
    }),
    root({
      element: 'Wood',
      summary: 'A green that breathes like spring leaves. Vitality, herbalism, and restoration.',
      affinity:
        "Sensing and drawing wood-aspected qi: living things, growth, sap, and the age of a herb. Rolled to learn wood techniques, judge a spirit herb's potency, aid alchemy, and restore vitality. Grows from coaxing a wilted plant into regrowing flesh. Its weakness: metal cuts wood.",
      technique: {
        name: 'Spring Sap Breathing',
        description:
          "A beginner's wood method on a slip of leaf-green jade. Its words open like buds: draw qi up from the roots of the world and let it rise like sap. Trained, it becomes the Spring Sap Breathing skill. Lv1: sense a herb's age and potency by touch, recover from fatigue faster. It grows into restoring others and stirring plants to grow.",
      },
      rival: {
        name: 'Mu Qingqing',
        shortDescription:
          'Stone-tested rival (WOOD). Sixteen, small and quick, green-stained fingertips, a herb satchel bigger than her torso, and eyes that price everything in the room.',
        faction: VERDANT,
        location: 'The Verdant Pill Pavilion',
        notes:
          "**Root:** Wood, the root the player was not given. Pavilion Mistress Su took her as a personal apprentice within a week. **Want:** to be the youngest Pill Master in the Pavilion's history. **Method:** talent, long nights, and buying (or stealing) the best herbs before anyone else reaches them. **Toward the player:** a sharp competitor at every herb patch; a generous partner in any venture that teaches her something new. **Clue she holds:** deep in Whispering Bamboo Forest a line of jade bamboo flowers once in sixty years, and it is flowering now, in a line straight as an arrow pointing to the Listening Stone.",
      },
    }),
    root({
      element: 'Metal',
      summary: 'A white gleam like a whetted edge. Weapon mastery and a body tempered like steel.',
      affinity:
        "Sensing and drawing metal-aspected qi: ore, blades, autumn air, and the edge of intent. Rolled to learn metal techniques, to channel qi into weapons, and to judge a weapon's quality. Grows from a sharper cut into qi that extends a blade beyond its steel. Its weakness: fire melts metal.",
      technique: {
        name: 'Edge-Tempering Form',
        description:
          "A beginner's metal method on a slip of white jade, cold to hold. Its words come like hammer strokes: fold qi into the bones, then into the blade. Trained, it becomes the Edge-Tempering Form skill. Lv1: qi in a blade (or a sickle) so it bites deeper, a grip that does not slip. It grows into sword qi and a body hard as worked iron.",
      },
      rival: {
        name: 'Jin Ruifeng',
        shortDescription:
          "Stone-tested rival (METAL). Nineteen, tall and austere, a swordsmith's son, black training robes, a plain unadorned sword, and a stare that measures how far away you are.",
        faction: CRIMSON,
        location: 'Bladecrest Fortress',
        notes:
          "**Root:** Metal, the root the player was not given. Hall Master Tie Wushuang took him as a personal disciple, the first in ten years. **Want:** to forge a sword that can cut qi itself; privately, to stop being Tie's weapon. **Method:** silence and endless practice. **Toward the player:** cold, then respectful after a fair fight; one of the few Crimson disciples who might turn against the Hall Master if shown what Tie really did to the Han clan. **Clue he holds:** the Hall's excavation at the Sunken Forge has reached a door that no blade can scratch, with an inscription: 'Bamboo, iron, and moon: three lights open the way.'",
      },
    }),
    root({
      element: 'Wind',
      summary: 'A pale flicker that never stays still. Speed, movement, and evasion.',
      affinity:
        "Sensing and drawing wind-aspected qi: moving air, high places, breath, and motion. Rolled to learn wind techniques, to move fast, dodge, leap, and hear what the wind carries. Grows from quick feet into running across treetops. Its weakness: ice stills wind.",
      technique: {
        name: 'Drifting Leaf Steps',
        description:
          "A beginner's wind method on a slip of translucent jade, almost weightless. Its words flutter: let qi lift the body like a leaf on a gust. Trained, it becomes the Drifting Leaf Steps skill. Lv1: a burst of speed, a longer leap, a dodge that seems lucky. It grows into crossing rooftops, running on bamboo, and never being where the blow lands.",
      },
      rival: {
        name: 'Feng Ling',
        shortDescription:
          'Stone-tested rival (WIND). Fifteen, a skinny orphan with a crooked fringe, a stolen silk belt over rags, bare feet that never seem to touch the ground, and quick hands.',
        faction: WANDERING,
        location: 'Spiritfall Market',
        notes:
          "**Root:** Wind, the root the player was not given. Was a Spiritfall pickpocket until Lu Feng's stone lit for her; she refused every sect and runs messages for the Wandering Immortal Alliance. **Want:** freedom, and to learn who left her on the market steps as a baby. **Method:** speed, theft, and knowing every rooftop in Spiritfall. **Toward the player:** steals from them once to see if they notice; a loyal little sister to anyone who catches her and doesn't hit her. **Clue she holds:** she lifted a sealed letter from the medicine peddler Mo, addressed to 'the one sleeping under the hill', and could not read it. It is in her bundle.",
      },
    }),
    root({
      element: 'Lightning',
      summary: 'A violet crack that makes your hair stand up. Explosive power and rapid attacks.',
      affinity:
        "Sensing and drawing lightning-aspected qi: storms, sudden force, and the spark between heartbeats. Rolled to learn lightning techniques, to strike first, and to sense a coming storm. Grows from a jolt that numbs a hand into strikes faster than the eye. Its weakness: wind scatters the storm.",
      technique: {
        name: 'Thunderclap Pulse',
        description:
          "A beginner's lightning method on a slip of violet jade that tingles against the skin. Its words arrive all at once, like a thunderclap: gather qi tight, then release it in one beat. Trained, it becomes the Thunderclap Pulse skill. Lv1: a jolt through the palm that stuns a man for a breath, a first strike before the other side has moved. It grows into chained strikes and lightning through a blade.",
      },
      rival: {
        name: 'Lei Hongbo',
        shortDescription:
          'Stone-tested rival (LIGHTNING). Twenty-two, loud and broad, hair that stands up in a permanent frizz, a scorched hemp robe, a wine gourd, and a laugh that makes horses bolt.',
        faction: WANDERING,
        location: 'Moonwater Lake',
        notes:
          "**Root:** Lightning, the root the player was not given. Tested late, joined the Azure Cloud Sect, and was thrown out in a month for brawling with Senior Brother Gu Chen. Now drinks with Old Drunk Jiang and calls it training. **Want:** to be struck by heavenly lightning and live, tempering his body like the old legends. **Method:** climbing high places in storms. **Toward the player:** an instant, reckless friend, and a terrible influence. **Clue he holds:** every full moon, lightning falls from a clear sky onto the same rock on Moonwater's island, and the rock rings like a temple bell.",
      },
    }),
    root({
      element: 'Ice',
      summary: 'A frost-white glow that makes your breath smoke. Control, precision, and defense.',
      affinity:
        "Sensing and drawing ice-aspected qi: cold, stillness, winter, and the moment before motion. Rolled to learn ice techniques, to slow or hold an enemy, to aim precisely, and to stay calm. Grows from frosting a cup into walls of ice and qi that freezes a technique mid-strike. Its weakness: lightning shatters ice.",
      technique: {
        name: 'Frost Lotus Breath',
        description:
          "A beginner's ice method on a slip of frosted white jade that never warms. Its words open like petals in snow: breathe until qi is still, then make it colder. Trained, it becomes the Frost Lotus Breath skill. Lv1: frost a surface by touch, a steady hand and a calm mind under pressure. It grows into ice shields, frozen ground, and needles of frost thrown with perfect aim.",
      },
      rival: {
        name: 'Han Xueyin',
        shortDescription:
          'Stone-tested rival (ICE). Seventeen, pale and very still, white mourning ribbon in her black hair, a worn sword older than she is, and a voice like snow falling.',
        faction: AZURE,
        location: 'Azure Cloud Sect',
        notes:
          "**Root:** Ice, the root the player was not given. The last of the Han clan, which the Crimson Blade Hall destroyed ten years ago over an ice-vein mine in Ironpeak; Elder Bai Shuang sheltered her. **Want:** to kill Hall Master Tie Wushuang. **Method:** patience; she will not move until she is sure. **Toward the player:** cold and suspicious; thaws only for people who keep their promises, and remembers every one. **Clue she holds:** her clan was not killed for the mine. Her father had dug up a fragment of moon-silver carved with a bamboo leaf and a crescent, and Tie took it from his body.",
      },
    }),
  ],
};

const composition: CampaignChoiceInput = {
  key: 'root_composition',
  title: 'Root composition',
  prompt:
    '[ THE ROOT-TESTING STONE ]\nThe first light settles, but the stone is not finished with you.\nMaster Lu Feng leans closer, watching its depths. "Now we see how many."',
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
              'Pure single root. Techniques of your root train at the normal pace and bite deep; techniques of any other element are one step harder and stall at level 5 without a rare method. Breakthroughs come a little easier (+1 on Qi Cultivation). Sects covet pure roots.',
            turnsRemaining: null,
            modifiers: [{ target: 'Qi Cultivation', bonus: 1 }],
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
              'Dual root: your dominant root and one secondary (named in Spiritual Roots), whose affinity starts at level 0. Both elements train at the normal pace, and you can learn combined techniques of the pair (wind and fire as a blazing gale). Other elements are one step harder.',
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
              'Mixed roots: your dominant root and two or more secondaries (named in Spiritual Roots), each affinity starting at level 0. No element is a step harder for you, and you can braid any of them. Breakthroughs are harder (-1 on Qi Cultivation), and sect examiners rate you low.',
            turnsRemaining: null,
            modifiers: [{ target: 'Qi Cultivation', bonus: -1 }],
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
    'An open-ended cultivation fantasy. You are an ordinary herb-gatherer in a remote village of Azure Mist Province when a traveling cultivator sets a Root-Testing Stone under the willow. Discover your spiritual roots, find a sect, a master, or your own way, train for years if you like, and decide whether to chase the lost inheritance of an ancient immortal, or immortality itself.',
  demoCampaignName: 'Ascension: The Testing Stone',
  currencyName: 'spirit stones',
  reputation: { [AZURE]: 0, [CRIMSON]: 0, [VERDANT]: 0, [WANDERING]: 0 },

  choices: [roots, composition],

  worldBible: `# Ascension: Path of the Immortal

An open-ended cultivation fantasy (xianxia) campaign. Individuals can gather spiritual energy (qi), temper their bodies, master supernatural techniques, and, perhaps, become immortal. The character begins as an ordinary mortal in **Azure Mist Province**, a remote, misty region of mountains, bamboo, and lakes at the edge of the **Great Celestial Continent**, and discovers they can cultivate. There is no single story to follow: the player decides what their path is for (immortality, mastery, wealth, knowledge, leadership, love, revenge, or freedom) and the world answers.

## The character
A sixteen-year-old herb-gatherer of **Willowbrook Village**, raised by the village herbalist Granny Wen. For three nights, lights have flickered on Willow Hill, wells have run warm, and two goats were found drained and grey. Yesterday the wandering cultivator **Master Lu Feng** arrived with a Root-Testing Stone on his back. Today, under the old willow in the village square, he is testing every youth in Willowbrook.

## The opening: the Root-Testing Stone
- The play screen has already shown the player the stone's panel with the eight roots as buttons. Do not repeat the menu in prose. Set the scene around it: villagers crowding the square, children who touched the stone and saw nothing, Granny Wen pretending not to watch, Tao Xiaoshan just stepping away from a stone that stayed grey.
- If the player does something else first (asks questions, refuses, runs off), let them. The stone and Lu Feng wait, and the panel stays until they choose. Never pick for them.
- **When the player picks their dominant root**, call \`lock_choice\` that same turn. It grants the root's Affinity skill, a jade slip with a beginner's technique (Lu Feng gives one to every youth the stone lights for), and the "Spiritual Roots" condition. Narrate the light filling the stone and the crowd's reaction.
- **Then root composition** (the next panel): Pure, Dual, or Mixed. Lock it with \`lock_choice\` when the player picks. For **Dual**, ask which second light flickered (any root but the dominant one); for **Mixed**, which two or more. Then for each secondary root: \`grant_skill_xp\` on "<Element> Affinity" for 5 (it is learned at level 0), and \`update_status_effect\` on "Spiritual Roots" to name them. The character's roots are now permanent and part of who they are. If the player asks to change them later, the world refuses: roots can be refined by rare treasures in Act IV, never swapped.
- **The others.** \`lock_choice\` brings the youths whom Lu Feng's stone lit for the other roots this season into the world, offscreen. The result names them. Write them into your story notes right away (who, where, which faction, what they want). Bring them in one at a time: a name overheard, a sighting at the market, then a meeting. They are the character's generation: rivals, friends, and sometimes enemies, and each one carries a clue to the Azure Void inheritance.
- After the test, Lu Feng offers what he offers every youth: a letter of recommendation to the Azure Cloud Sect's entrance trial (day 15), an introduction at Spiritfall Market to the other powers, or, if he likes them, a month on the road as his student. The player may take any, none, or something else entirely.

## Spiritual roots
The eight roots are **Fire** (destruction, flame), **Water** (healing, adaptability, qi control), **Earth** (defense, endurance, body strengthening), **Wood** (vitality, herbalism, restoration), **Metal** (weapons, physical reinforcement), **Wind** (speed, movement, evasion), **Lightning** (explosive power, rapid attacks), and **Ice** (control, precision, defense). Each is an Affinity skill ("Fire Affinity"), rolled when learning or using techniques of that element, sensing that kind of qi, and judging elemental things. Affinity grows with use and cultivation in places rich in its element.

**Composition** (the "Root Composition" condition) is the trade-off:
| Composition | Strength | Cost |
| Pure | Its element trains fast and deep; +1 on Qi Cultivation; sects compete for them | Other elements are one step harder and stall at level 5 without a rare method |
| Dual | Two elements at normal pace; combined techniques of the pair | Other elements one step harder |
| Mixed | Every element at normal pace; can braid any combination | -1 on Qi Cultivation (breakthroughs are harder); examiners rate them low and elders dismiss them |

**No root is superior.** Each element presses one and is pressed by one: water quenches fire, fire melts metal, metal cuts wood, wood roots through earth, earth dams water; and among the three rarer "heavenly" roots, lightning shatters ice, ice stills wind, wind scatters the storm. Pressing is an edge in circumstance (+1 or +2 on an exchange, or a technique that simply works better), never a guarantee. Heavenly roots are rare in Azure Mist, so manuals and teachers for them are scarce and expensive. Talent opens doors; understanding, effort, resources, and choices decide who walks through.

**Roots shape opportunities.** Masters prefer disciples of their own element; techniques of the character's elements are on offer more often; the Verdant Pill Pavilion wants wood and fire (alchemy) and earth (furnaces); the Crimson Blade Hall wants metal, fire, and lightning but takes anyone who wins; the Azure Cloud Sect prizes water, wind, and ice and pure roots; the Wandering Immortal Alliance does not care at all. Let NPCs react to the character's roots: a covetous elder, a dismissive examiner, a rival of the same element.

## Cultivation: realms and techniques
Cultivation uses the ordinary skill system. The character's cultivation base is the **Qi Cultivation** skill (learned at level 0 the first time they successfully draw qi into their body, usually by training a breathing method or under a teacher). Their realm is the **"Cultivation Realm"** condition: update its description whenever they break through.

| Realm | Qi Cultivation level | What it means |
| Mortal | none | An ordinary person. |
| Qi Condensation | 1 to 9 (the stage is the level: "third stage") | Qi in the meridians: stronger, faster, sharper senses; basic techniques; fasting for days. |
| Foundation Establishment | 10 to 19 | A solid foundation of qi: flying on a sword (badly at first), a lifespan of two centuries, techniques that break boulders. Elders of small sects. |
| Core Formation | 20 to 29 | A golden core: masters, sect elders, a lifespan of five centuries. Very few in Azure Mist. |
| Nascent Soul | 30+ | A soul that can leave the body. Legends in the province; the frontier of Act IV. |
| Beyond | — | Soul Transformation, Void Refinement, and Immortal Ascension: rumors from the Central Plains. |

**Breakthroughs.** At Qi Cultivation 10, 20, and 30 the character reaches a bottleneck: further levels pile up, but the realm does not change and next-realm techniques stay out of reach until they break through. A breakthrough is a scene, not a formality: a quiet place rich in qi, preparation (a breakthrough pill, a protector, a settled heart), then a \`skill_check\` on Qi Cultivation at DC 14 (Foundation), 18 (Core), or 22 (Nascent Soul). Preparation counts as gear: a Foundation Establishment Pill, a spirit vein, a master standing guard. On success, update "Cultivation Realm", \`grant_xp\` (200 × the new realm's number: 200 for Foundation, 400 for Core, 600 for Nascent Soul), and show the world changing. On failure, add a "Qi Deviation" condition (-2 to all checks for several days, or worse on a critical failure) and let them try again when healed. Never skip the bottleneck because a level number went up.

**Techniques** are skills named for the method ("Ember Heart Sutra", "Azure Cloud Sword Art"). They come from jade slips, manuals, masters, sects, ruins, and inheritances. Learning one starts it at level 0 (\`grant_skill_xp\` or a training \`pass_time\`). Techniques of the character's root elements train at the normal pace; off-element techniques are one step harder (Pure: and stall at level 5). A technique can never exceed the character's Qi Cultivation level by more than 5 (no Foundation-level art at the second stage of Qi Condensation).

**Training.** For days or months of training, use \`pass_time\` with the skills trained and the teacher, if any (a master who knows the technique matters greatly after level 10). For nightly practice (qi circulation before sleep, sword forms at dawn), use \`set_routine\`. Cultivating in a qi-rich place (Moonwater's shore, a sect's spirit vein, a rented cultivation chamber in Spiritfall) or with spirit stones and pills counts as a teacher for Qi Cultivation, and stacks with one. Time skips of months or years are welcome: the world moves on during them (see "The world moves").

**Realm gaps.** A full realm is not overcome by a lucky roll. A Qi Condensation cultivator fighting a Foundation Establishment one needs a trick, terrain, a treasure, allies, or a way to run. Within a realm, a stage or two is a real edge (+1 or +2 per exchange), not a wall.

## Fighting
Use \`skill_check\` for each exchange (a technique, an Affinity, a weapon skill, Brawling), \`adjust_hp\` for wounds, and conditions for lingering injuries (broken meridians, poison, frostbite). Spiritual combat is fast and visible: a flare of qi, a bloom of light, a shockwave in the dust. A mortal cannot stand against a cultivator. Killing in the sects' lands brings vengeance from someone's master; disputes are settled at the Proving Ring, on sect duel platforms, or in the wilderness where nobody watches.

## Gear
Use the existing graded gear. Mortal steel is ungraded. **Spirit tools** are graded I to VII (I: a Qi Condensation weapon; II: Foundation; III: Core Formation; higher: legend). When the character gains one, \`update_item\` it with its grade, usage ("wielded" or "worn"), and what it enhances (a technique or an Affinity), then \`equip_item\`. Typical: a Grade I spirit sword (enhances a sword technique) 25 spirit stones; a Grade I protective robe 20; a Grade II flying sword 300 and up.

## Money
Cultivators trade in **spirit stones** (low-grade, unless noted; 100 low-grade make one mid-grade). Mortal purchases (a meal, an inn bed, a pair of sandals) are paid in copper and not tracked; a single spirit stone is a mortal family's month of income. Typical prices: a Qi Gathering Pill 2; a beginner manual 5 to 15; a good technique manual 30 to 100; a month in a cultivation chamber at Spiritfall 10; a Foundation Establishment Pill 300 (rarely for sale); a spirit herb 1 to 8; a first-rank beast core 5 to 15. An outer disciple's stipend is 3 spirit stones and one Qi Gathering Pill a month. Pills and herbs are inventory items; Qi Gathering Pills taken during training count as a teacher for Qi Cultivation.

## Azure Mist Province
Remote, misty, and beautiful: green mountains standing in seas of cloud, terraced rice fields, bamboo forests that whisper without wind, and a lake that holds the moon. Mortals farm and trade and mostly ignore cultivators, who mostly ignore them back. Distances: Willowbrook to Spiritfall Market is a day on foot; to the Azure Cloud Sect's mountain, two days; to Ironpeak, three; Moonwater is half a day from Willowbrook over the hills.

## The factions
The character's standing with four factions is tracked (Faction reputation, in the current state). Change it with \`adjust_reputation\` when their deeds reach the faction. Any NPC whose faction matches acts on it. The player may join one, stay independent, or deal with several. Joining one costs standing with its rivals, but is never permanent: disciples leave, are expelled, or are poached.

### Azure Cloud Sect
The province's oldest and most respected sect, on Cloudveil Peak. **Philosophy:** cultivation is the harmony of heart, qi, and heaven; discipline, meditation, and balance before power. **Leaders:** Sect Master Yun Zhenhai; Elder Bai Shuang (outer court and entrance trial). **Rank:** outer disciple, inner disciple, core disciple, elder. Entry is through the annual trial (day 15) or an elder's personal sponsorship. Outer disciples earn **contribution points** by doing sect tasks, which buy manuals, pills, and time in the spirit-vein caves (track points in the "Sect Standing" condition if the character joins). **Rivalry:** Crimson Blade Hall (contempt for brute force, and an old border dispute over Ironpeak); polite distrust of the Alliance's "rootless wanderers".
- 20+: invited to the trial or offered an elder's sponsorship; access to the outer library. 40+: inner disciple candidacy; the spirit-vein caves; a master. -20: barred from the trial; disciples pick fights. -50: hunted as a "demonic cultivator" if any excuse can be found.

### Crimson Blade Hall
A martial hall in Bladecrest Fortress in the Ironpeak Mountains. **Philosophy:** strength is the only truth heaven respects; a cultivator who will not fight is a mortal with extra steps. **Leaders:** Hall Master Tie Wushuang; Instructor Hong Lie (recruiter, the Proving Ring). Entry is by combat: win three bouts at the Proving Ring in Spiritfall or survive a month at Bladecrest. Roots and composition matter less here than anywhere; results are everything. Training is brutal and excellent for weapon and body techniques. **Rivalry:** the Azure Cloud Sect (hypocrites with good manners); they destroyed the Han clan ten years ago and pretend it was a fair duel.
- 20+: Proving Ring bouts with real purses; weapon techniques taught; a recruiter's offer. 40+: Bladecrest's forge and a Hall-made spirit weapon; a place in the Sunken Forge excavation. -20: challenged on sight by Hall disciples. -50: a bounty.

### Verdant Pill Pavilion
An alchemists' house with its great hall in Spiritfall Market and gardens all over the province. **Philosophy:** cultivation runs on medicine; whoever controls the pills controls the province, and the Pavilion sells to everyone. **Leaders:** Pavilion Mistress Su Qinghe; Alchemist Fang Yao (herb buyer and front counter). Entry by apprenticeship (a wood or fire root helps; anyone with Herb Lore is worth a look). Teaches Alchemy and Herbalism as skills; sells pills, buys herbs and beast cores. **Rivalry:** neutral in name, rival to anyone who brews or sells pills without them; quietly at odds with the Crimson Hall, which owes them money.
- 20+: fair prices; herb-gathering commissions; a pill furnace to rent. 40+: apprenticeship to a Pill Master; first pick of rare pills (a Foundation Establishment Pill). -20: prices doubled. -50: no alchemist in the province will sell to them, and some will sell poison.

### Wandering Immortal Alliance
Not a sect: a loose brotherhood of independent cultivators (rogue cultivators to the sects) who meet at the Drunken Crane Teahouse in Spiritfall Market. **Philosophy:** the Dao belongs to no one; a cultivator's path is their own, and nobody kneels. **Leaders:** nobody, officially; Old Drunk Jiang is who everyone listens to, and Master Lu Feng carries word between villages. Membership is a word at the teahouse and a promise to help a fellow wanderer once. They share rumors, ruins, and dangerous jobs; masters there take students one at a time, in their own way. **Rivalry:** resent the sects' monopoly on spirit veins and manuals; the Azure Cloud Sect calls them rabble, the Crimson Hall calls them prey.
- 20+: rumors, shared expeditions, a bed at the Drunken Crane. 40+: a wandering master's teaching; Alliance members come when called. -20: the teahouse goes quiet when they enter. -50: everyone who walks alone avoids them, and some sell them out.

## How the world moves (if no one changes it)
Track the day in your story notes. Show events through rumor, prices, new arrivals, and changed faces; never as a summons. When a \`pass_time\` skip crosses an event, it happens offscreen and reaches the character as news when they surface. The player can change any of it.
| Day | Event |
| 1 | The root test in Willowbrook. |
| 3 | Lu Feng leaves for Spiritfall Market, unless the player has given him a reason to stay. A third animal is drained on Willow Hill. |
| 5 | Tao Xiaoshan meets the medicine peddler Mo on the road and is promised "roots that can be bought". |
| 10 | The Hall of Myriad Treasures holds its auction in Spiritfall (every 30 days after). |
| 15 | The Azure Cloud Sect's annual entrance trial at the Cloudgate Steps. |
| 20 | A Tusked Bamboo Boar King rampages in Whispering Bamboo Forest; herb prices in Spiritfall double. |
| 30 | On the full moon, fishermen see a palace of light rise from Moonwater Lake for an hour. Rumors of the **Azure Void inheritance** spread across the province. |
| 40 | Every faction sends people: Azure Cloud disciples to the bamboo forest, Crimson Blade Hall to the Sunken Forge, the Pavilion buying maps, wanderers gathering at the Drunken Crane. |
| 45 | The Crimson Blade Hall breaks into the Sunken Forge's outer hall. People die in the traps. |
| 60 | Full moon: the Moon Key's trial on Moonwater opens for one night. |
| 75 | Mo Xuan begins his blood rite on Willow Hill, with Tao Xiaoshan's help. Willowbrook is in danger. |
| 90 | The Night of Nine Lights: the thousand-year cycle turns and the Forgotten Immortal Grotto opens to whoever holds the three keys. |
| 120 | If no one has renewed the seal, the Hollow Vein cracks: a beast tide, corrupted qi, and the province in turmoil, drawing powers from beyond Azure Mist. |
If the player ignores the inheritance, someone else claims it: a rival, a faction, or Mo Xuan. Decide who by what has happened, and let it change the province.

## The arc (a shape, not a script)
- **Act I, The Awakening:** the village, the stone, the disturbances on Willow Hill, the first choice of path.
- **Act II, The First Steps:** learning to draw qi; the Azure Cloud trial, a wandering master, or self-taught cultivation from a jade slip; gathering herbs and beast cores; meeting the rivals. Qi Condensation.
- **Act III, The Hidden Legacy:** the rumor of the Azure Void inheritance; the three keys; the factions racing; Mo Xuan. Cooperate, compete, sell what they learn, or ignore it entirely.
- **Act IV, The Path Beyond:** Foundation Establishment and after. Beyond Azure Mist: the great sects of the Central Plains, ancient cultivation realms, dangerous beasts, and forgotten civilizations (see the lore). Open it when the character is strong enough or the inheritance is resolved, never before they want it.

## GM ONLY: the truth
Reveal none of this early. Clues come from the rivals' notes, the Willow Song, the locations, and careful investigation.
- **The Azure Void Immortal**, Master Qingxu, lived a thousand years ago. His roots were mixed and mediocre; he climbed to the edge of ascension through understanding, not talent. Beneath Azure Mist runs the **Hollow Vein**, a wound in the world that leaks corrupting qi. Instead of ascending, Qingxu sealed it with his own life and built his grotto over the seal, under Willow Hill. His three disciples founded the province's powers: **Yun Qiao** (the Azure Cloud Sect), **Tie Hen** (the Crimson Blade Hall), and **Su Mingxiang** (the Verdant Pill Pavilion). The Wandering Immortal Alliance keeps his habit of walking alone. A fourth disciple, **Yue Wanqing**, stayed behind to guard the seal.
- **The betrayal.** Yun Qiao wanted the grotto's treasures and tried to break in after his master's death; Yue Wanqing stopped him, and he erased the story from his sect's records. The current Sect Master knows; the sect would be shamed if it came out.
- **The three keys.** The **Jade Bamboo Key** at the Listening Stone in Whispering Bamboo Forest, guarded by the Silver-Eyed Fox. The **Iron Key** behind the unscratchable door of the Sunken Forge in Ironpeak (Hall Master Tie holds a moon-silver fragment that is part of its lock, taken from the Han clan). The **Moon Key** on Moonwater's island, given by Yue Wanqing only on a full moon to someone who passes her trial. Each key tests the heart, not the root: patience (bamboo), resolve (iron), and compassion (moon).
- **The seal is failing.** The thousand-year cycle ends on day 90. The lights on Willow Hill are the grotto waking. Whoever enters with the keys can claim the inheritance and renew the seal, or break it and drink the Hollow Vein's power.
- **The inheritance adapts.** Qingxu's legacy, the **Azure Void Scripture**, reshapes itself to the heir's own roots. It favors no element and no composition. It is a path, not a power-up: a superb method, his memories, a Grade III treasure, and the duty of the seal.
- **Mo Xuan**, "Peddler Mo", is a Hollow Vein cultivator (Foundation Establishment) who drained the animals while probing the seal. He wants the seal broken. He recruits the desperate, starting with Tao Xiaoshan, whom he promises artificial roots grown from the Vein's qi (they would work, at a terrible price).
- **Yue Wanqing**, the Moon Hermitess of Moonwater, is a remnant soul bound to the lake for a thousand years. She is tired and wants the duty passed to someone worthy, then rest.
- **What each claimant does with the inheritance:** the Azure Cloud Sect buries the shameful truth and grows mighty; the Crimson Blade Hall's Tie turns the Scripture to conquest; the Pavilion seeks Qingxu's lost pill formulas and lets the seal lapse to sell the cure; an Alliance claimant renews the seal and shares the teaching; Mo Xuan breaks the seal; a rival does what their notes suggest; the character does whatever they choose.

## Narrator rules for this world
- **Never railroad.** The player decides each day what to do: train, gather, explore, trade, fight, court, investigate, or rest. Offer hooks (a master's offer, a rival's challenge, a herb in season, a rumor, a faction's request) and let them choose. The inheritance is an optional mystery; the province is full of other paths.
- **Remember who they are.** Their roots, realm, techniques, gear, sect standing, and relationships should be visible in every scene: an elder notices their root, a rival measures their stage, a shopkeeper recognizes the sect token, a beast avoids (or seeks) their element. Look things up with the read tools rather than assuming.
- **Masters, rivals, companions, and leaders recur.** Keep a small cast and bring them back changed. The stone-tested rivals advance on their own: every week or two of game time, one of them breaks through, wins something, loses something, or needs help.
- **NPCs pursue their own ambitions.** Factions move, prices change, rivals train, and people grow older during time skips. After a long skip, open with what changed: who rose, who fell, who died, what happened at the last auction.
- **Advancement must feel earned and meaningful.** Show qi as sensation (warmth in the dantian, a meridian opening like a dam breaking), make breakthroughs big moments, and give each new technique a first use worth narrating. Never hand out levels for nothing, and never block a clever plan.
- **Continuity across training.** Keep the "Cultivation Realm", "Spiritual Roots", and any sect condition current. Record debts, promises, grudges, and master-disciple bonds in your story notes; they outlast any time skip.
- Fights are fast and dangerous: one \`skill_check\` per exchange, realm gaps respected, wounds that matter.
`,

  narratorStyle: `- Second person, present tense ("Mist pools in the rice terraces below as you climb...").
- Classical cultivation fantasy with a light, lyrical hand: mountains in seas of cloud, bamboo that whispers, incense and pine resin, jade and silk, rain on tiled roofs. Beautiful, quiet, and dangerous underneath.
- Qi is felt in the body: warmth in the dantian, a cold thread along a meridian, the pressure of a stronger cultivator's aura like deep water. Make cultivation sensory, not abstract.
- Hierarchy is visible: who bows and how low, juniors and seniors ("Senior Brother", "Junior Sister", "Elder"), the weight of a master's word, the contempt of the strong for the weak, and the face everyone is trying to keep.
- Fights are swift and vivid: a flare of technique, footwork on wet stone, light and shockwaves, then stillness.
- 150 to 350 words per turn. Shorter in fights and conversations, longer for arrivals in new places, breakthroughs, and returns after a time skip.
- NPCs speak in distinct voices. Granny Wen scolds to hide worry and quotes herbal remedies for everything. Master Lu Feng is unhurried, wry, and answers questions with questions. Tao Xiaoshan jokes too much and goes quiet when it matters. Sect Master Yun is serene and never quite answers. Elder Bai Shuang is curt and exact, and fair. Senior Brother Gu Chen is charming to superiors and silky to juniors. Hall Master Tie speaks in short verdicts. Instructor Hong Lie roars and laughs. Pavilion Mistress Su is gracious and always calculating a price. Alchemist Fang Yao fusses, sniffs, and haggles. Old Drunk Jiang rambles, rhymes, and then says something terrifyingly precise. Madam Jin talks like a contract. Peddler Mo is humble, kindly, and slightly too interested. The Moon Hermitess speaks as if from very far away.
- End on something the player can act on: an offer, a challenge, a rumor, a herb in bloom, a door that should not be open.
`,

  locations: [
    {
      name: 'Azure Mist Province',
      description:
        'A remote province at the edge of the Great Celestial Continent: green mountains standing in seas of cloud, terraced rice fields, whispering bamboo, and a lake that holds the moon. Mortals farm; cultivators climb.',
      purpose:
        "The campaign's world: the board every faction is playing on, and the home of the Azure Void Immortal's buried legacy. Holds every starting location; Act IV opens the wider continent beyond it.",
      tags: ['province', 'region', 'hub'],
    },
    {
      name: 'Willowbrook Village',
      description:
        'A peaceful village of tiled roofs and vegetable plots along a clear stream, with an ancient willow in the square, a shrine to the earth god, a tea stall, and Granny Wen\'s herb shop with bundles drying under the eaves.',
      purpose:
        "The starting location and the character's home: the root test, Granny Wen, Tao Xiaoshan, and Headman Zhou. A place to return to that changes as the character does, and, if Mo Xuan's plans go ahead, a place in danger around day 75.",
      tags: ['village', 'home', 'start', 'mortal'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'Willow Hill',
      description:
        'A grassy hill above the village crowned by a crumbling stone shrine of no god anyone remembers. Lately the shrine\'s cracks glow faintly at night, and the grass around it has gone grey.',
      purpose:
        "Site of the spiritual disturbances (Lights on Willow Hill): the grotto waking beneath it and Mo Xuan's probing of the seal. Its shrine hides the grotto's outer gate. Where Mo Xuan begins his blood rite on day 75.",
      tags: ['hill', 'shrine', 'mystery', 'disturbance'],
      parent: 'Willowbrook Village',
    },
    {
      name: 'Azure Cloud Sect',
      description:
        'White halls and blue-tiled pagodas on Cloudveil Peak, reached by the Thousand Cloudgate Steps. Bells, incense, disciples in blue robes practicing forms on mist-soaked platforms, and cranes circling the summit.',
      purpose:
        "Seat of the Azure Cloud Sect: the annual entrance trial (day 15), outer and inner courts, the Scripture Pavilion (with the founder's erased teacher), spirit-vein caves, and the sect's masters. Disciplined cultivation and the sect's buried shame.",
      tags: ['sect', 'mountain', 'training'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'Whispering Bamboo Forest',
      description:
        'Miles of towering green bamboo that rustles and murmurs even when no wind blows. Shafts of light, mist on the ground, spirit herbs in the shadows, and paths that are not where they were yesterday.',
      purpose:
        'Wilderness for gathering herbs (Mistbell Orchids), hunting first-rank spirit beasts, and getting lost. Home of the Silver-Eyed Fox, the flowering line of jade bamboo, and the Listening Stone where the Jade Bamboo Key waits for someone patient.',
      tags: ['wilderness', 'forest', 'herbs', 'beasts'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'Spiritfall Market',
      description:
        'A trading town that grew around a waterfall whose spray glitters with qi. Stalls of herbs, beast cores, and jade slips; cultivators in every color of robe; mortal merchants shouting prices; cultivation chambers for rent by the month.',
      purpose:
        "The crossroads of the province: trade, rumors, the Hall of Myriad Treasures' monthly auction (Madam Jin), the Proving Ring (Crimson Blade Hall recruitment), the Verdant Pill Pavilion, and the Drunken Crane Teahouse. Where all four factions meet, and where Peddler Mo sells his remedies.",
      tags: ['market', 'town', 'trade', 'hub'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'The Verdant Pill Pavilion',
      description:
        'A three-story hall of green-glazed tiles in Spiritfall Market, smelling of a hundred herbs and pill smoke. A counter of jars and scales at the front; behind it, furnace rooms glowing with earth-fire.',
      purpose:
        "Seat of the Verdant Pill Pavilion (Pavilion Mistress Su, Alchemist Fang Yao): buys herbs and beast cores, sells pills, rents furnaces, and takes apprentices. Its earth-fire furnaces point toward Willow Hill on full moons.",
      tags: ['alchemy', 'shop', 'faction'],
      parent: 'Spiritfall Market',
    },
    {
      name: 'The Drunken Crane Teahouse',
      description:
        'A ramshackle teahouse on stilts over the falls\' pool, with a crooked crane-shaped sign, mismatched tables, a rumor board, and more wine served than tea.',
      purpose:
        'Gathering place of the Wandering Immortal Alliance (Old Drunk Jiang): rumors, shared expeditions, dangerous jobs, independent masters, and a bed for wanderers. The heart of the independent path.',
      tags: ['teahouse', 'rumors', 'faction'],
      parent: 'Spiritfall Market',
    },
    {
      name: 'Ironpeak Mountains',
      description:
        'Black, jagged peaks streaked with ore, cold winds, mining camps clinging to cliffs, and the ruins of an older civilization half-buried in rockslides. Spirit beasts den in the high passes.',
      purpose:
        'Dangerous country for rare ores, beast cores, and ancient ruins. Home of the Crimson Blade Hall at Bladecrest Fortress and the Sunken Forge where the Iron Key lies. The old Han clan ice-vein mine is here.',
      tags: ['mountains', 'dangerous', 'ruins', 'ore'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'Bladecrest Fortress',
      description:
        'A fortress of black stone carved into a cliff, with sword racks along every wall, forges roaring day and night, and disciples sparring in a courtyard stained red.',
      purpose:
        "Seat of the Crimson Blade Hall (Hall Master Tie Wushuang): brutal martial training, weapon techniques, the Hall's spirit forge, and the base of its excavation of the Sunken Forge. Where Tie keeps the Han clan's moon-silver fragment.",
      tags: ['fortress', 'sect', 'martial', 'faction'],
      parent: 'Ironpeak Mountains',
    },
    {
      name: 'The Sunken Forge',
      description:
        'An ancient ruin fallen into a crevasse: colossal anvils, cold furnaces the size of houses, rune-carved pillars, and corridors that still hum when struck. Traps still work.',
      purpose:
        "Ruins of the forge where Tie Hen made his master's weapons. Treasure, traps, and constructs; the Crimson Hall's excavation; and the unscratchable door hiding the Iron Key, which opens to resolve, not force.",
      tags: ['ruins', 'dungeon', 'ancient', 'dangerous'],
      parent: 'Ironpeak Mountains',
    },
    {
      name: 'Moonwater Lake',
      description:
        'A wide, still lake in a bowl of hills, so clear that the moon seems to lie on its bottom. Mist walks across it at dawn; a small island of pines sits in the middle; the qi here is thick enough to taste.',
      purpose:
        'The richest qi in the province, free to anyone: a place to cultivate, fish for spirit carp, and find Lei Hongbo and Old Jiang drinking. Home of the Moon Hermitess, Yue Wanqing, and the full-moon trial for the Moon Key on the island.',
      tags: ['lake', 'mystery', 'qi-rich', 'cultivation'],
      parent: 'Azure Mist Province',
    },
    {
      name: 'Forgotten Immortal Grotto',
      description:
        'A place that appears in old songs and nowhere on any map: an immortal\'s cave-dwelling, sealed for a thousand years.',
      purpose:
        "The Azure Void Immortal's grotto beneath Willow Hill, built over the seal on the Hollow Vein. Opens fully on the Night of Nine Lights (day 90) to whoever holds the three keys. Holds the Azure Void Scripture, Qingxu's memories and treasures, and the choice to renew the seal or break it.",
      tags: ['hidden', 'grotto', 'inheritance', 'ancient'],
      parent: 'Azure Mist Province',
    },
  ],

  npcs: [
    {
      name: 'Granny Wen',
      shortDescription:
        "Willowbrook's herbalist. Seventies, tiny and bent, a cloud of white hair in a blue kerchief, hands stained brown by forty years of roots, and a scolding voice that never quite hides her worry.",
      faction: '',
      location: 'Willowbrook Village',
      notes:
        "**Who:** raised the character after their parents died of fever. Taught them every herb in the valley. **Secret:** sixty years ago she climbed the Cloudgate Steps for the Azure Cloud trial and was turned away for a weak mixed root. She has never said so. **Want:** for the character to be happy, and safe, and not to make her mistake of spending a life wondering. **Knows:** the **Willow Song**, an old village lullaby that is a riddle to the three keys (see lore). Sings it when worried. **Toward the player:** love, expressed as nagging.",
    },
    {
      name: 'Headman Zhou Dacheng',
      shortDescription:
        "Willowbrook's headman. Fifties, stout and anxious, a good silk jacket worn on every occasion, a long pipe, and a way of wringing his hands while he talks.",
      faction: '',
      location: 'Willowbrook Village',
      notes:
        '**Want:** the disturbances on Willow Hill gone, and a cultivator in the village to protect it. **Gives:** Lights on Willow Hill. **Offers:** a small purse and the village\'s gratitude; if the character becomes a cultivator, he will brag about them to every county clerk. **Toward the player:** fond but distracted; treats them as a child until they are not one.',
    },
    {
      name: 'Tao Xiaoshan',
      shortDescription:
        "The character's oldest friend. Sixteen, lanky, quick to grin, a woodcutter's apprentice with sawdust in his hair and a bamboo flute in his belt.",
      faction: '',
      location: 'Willowbrook Village',
      notes:
        "**Root:** none; the stone stayed grey for him in front of the whole village. **Want:** not to be left behind. **Arc:** if no one intervenes, he meets Peddler Mo on day 5 and is promised roots that can be bought. By day 75 he is helping Mo's blood rite on Willow Hill, with roots of grey Hollow Vein qi that are slowly eating him. **Can be saved** by friendship, by a mortal path that honors him (the Pavilion takes mortals as herb-gatherers; Granny Wen needs an heir), or by the inheritance. **Toward the player:** loyal, proud, and hurting; he will never ask for help.",
    },
    {
      name: 'Master Lu Feng',
      shortDescription:
        'A wandering cultivator. Forties, lean and weathered, a wide bamboo hat, a grey traveling robe patched at the knees, a staff, and a waist-high grey stone strapped to his back as if it weighed nothing.',
      faction: WANDERING,
      location: 'Willowbrook Village',
      notes:
        "**Realm:** Foundation Establishment, early stage; Wind root (pure). **Who:** a former inner disciple of the Azure Cloud Sect who left twenty years ago 'to see the road'. Travels the province testing village youths with his Root-Testing Stone; sects pay him a finder's fee. **Secret:** the Alliance sent him to Willowbrook because someone has been draining animals across the province; he suspects a Hollow Vein cultivator and is tracking Peddler Mo. **Gives:** The Testing Stone. **Offers:** a letter of recommendation to any faction; one month on the road as his student to a youth who interests him. **Toward the player:** wry, patient, and watching to see what they do with what they are given.",
    },
    {
      name: 'Sect Master Yun Zhenhai',
      shortDescription:
        'Master of the Azure Cloud Sect. Appears fifty, is over two hundred: silver-streaked hair, a pale blue robe embroidered with clouds, a whisk of white horsehair, and a calm that fills a room.',
      faction: AZURE,
      location: 'Azure Cloud Sect',
      notes:
        "**Realm:** Core Formation, middle stage; Water and Wind. **Want:** to restore the sect's fading glory before he dies; the inheritance would do it. **Secret (GM only):** knows the founder Yun Qiao was the Azure Void Immortal's disciple and tried to rob his master's grotto; the sect erased it. He will claim the inheritance quietly and bury the story. **Toward the player:** gracious and distant; interested once they show talent or know something he does not.",
    },
    {
      name: 'Elder Bai Shuang',
      shortDescription:
        "Outer Court Elder of the Azure Cloud Sect. Appears forty: severe and elegant, white robes edged in pale blue, hair bound with a jade pin, and eyes that grade you before you've spoken.",
      faction: AZURE,
      location: 'Azure Cloud Sect',
      notes:
        "**Realm:** Foundation Establishment, late stage; Ice (pure). **Runs:** the outer court and the annual entrance trial. **Gives:** The Azure Cloud Entrance Trial. **Want:** disciples worth teaching; protects Han Xueyin, whom she sheltered as a child. **Toward the player:** curt and exact; looks down on mixed roots and says so, but grades fairly and admits it when she is wrong. A hard master and a good one.",
    },
    {
      name: 'Senior Brother Gu Chen',
      shortDescription:
        'Inner disciple and steward of the outer disciples. Twenty-five, handsome, an immaculate blue robe, a jade fan, and a smile that is pleasant to superiors and silky to juniors.',
      faction: AZURE,
      location: 'Azure Cloud Sect',
      notes:
        "**Realm:** Qi Condensation, ninth stage, stuck at the bottleneck. **Want:** a Foundation Establishment Pill and the respect of his elders. **Method:** skims the outer disciples' stipends and takes 'gifts' for good tasks. **Toward the player:** a classic bully if they are weak and a flatterer if they are useful; an enemy who grows more dangerous when exposed. Threw Lei Hongbo out of the sect.",
    },
    {
      name: 'Hall Master Tie Wushuang',
      shortDescription:
        'Master of the Crimson Blade Hall. Fifties, huge and scarred, iron-grey hair cropped short, a crimson coat over black armor, and a broadsword across his back as long as a man.',
      faction: CRIMSON,
      location: 'Bladecrest Fortress',
      notes:
        "**Realm:** Core Formation, early stage; Metal (pure). **Philosophy:** strength is truth. **Secret (GM only):** destroyed the Han clan ten years ago for a moon-silver fragment that is part of the Iron Key's lock, not for their mine; he has been digging toward the Sunken Forge's door ever since. Wants the inheritance to make the Hall the master of the province. **Toward the player:** ignores the weak; respects anyone who defeats a Hall disciple, and wants to own them.",
    },
    {
      name: 'Instructor Hong Lie',
      shortDescription:
        "Crimson Blade Hall recruiter and master of the Proving Ring. Forties, red-bearded and barrel-chested, a crimson sash, a voice like a gong, and the laugh of a man who enjoys a good fight more than winning one.",
      faction: CRIMSON,
      location: 'Spiritfall Market',
      notes:
        '**Realm:** Foundation Establishment, early stage; Fire. **Runs:** the Proving Ring in Spiritfall: open bouts every few days, purses of 1 to 5 spirit stones, Hall recruitment for anyone who wins three in a row. **Gives:** The Proving Ring. **Want:** good fighters, and fair ones; he does not know (and would hate) what Tie did to the Han clan. **Toward the player:** loud, generous, and honest; the best face of his Hall.',
    },
    {
      name: 'Pavilion Mistress Su Qinghe',
      shortDescription:
        'Mistress of the Verdant Pill Pavilion. Appears thirty-five: graceful, layered green silks, a hairpin of carved jade leaves, a faint smell of osmanthus, and the soft smile of someone who has already set the price.',
      faction: VERDANT,
      location: 'The Verdant Pill Pavilion',
      notes:
        "**Realm:** Foundation Establishment, late stage; Wood and Fire. **Want:** the Azure Void Immortal's lost pill formulas, above all the Nine Turns Rebirth Pill. **Method:** sells to everyone, lends to everyone, and remembers. **Secret (GM only):** the Pavilion's founder left notes that the seal 'needs only a worthy hand'. Su would let it lapse if the Pavilion could sell the remedy for the Vein's corruption. **Toward the player:** courteous; makes offers that sound generous and are not quite.",
    },
    {
      name: 'Alchemist Fang Yao',
      shortDescription:
        "The Pavilion's front-counter alchemist and herb buyer. Sixties, bald and spindly, magnifying lenses on a cord, burn-spotted sleeves, and a nose that can tell a herb's age from across the room.",
      faction: VERDANT,
      location: 'The Verdant Pill Pavilion',
      notes:
        "**Buys:** spirit herbs (1 to 8 spirit stones each), beast cores, and anything odd. **Sells:** Qi Gathering Pills (2), wound salves, antidotes. **Gives:** Mistbell Orchids. **Want:** a good apprentice who is not Mu Qingqing, who frightens him. **Toward the player:** fussy and stingy at first; delighted by anyone with real Herb Lore, and will teach them basic Alchemy for errands.",
    },
    {
      name: 'Old Drunk Jiang',
      shortDescription:
        'An old wanderer. Ancient or ageless, ragged robes, a wispy beard, a red gourd of wine always at his lips, and a habit of falling asleep anywhere, including mid-sentence.',
      faction: WANDERING,
      location: 'The Drunken Crane Teahouse',
      notes:
        "**Realm:** hidden; at least Core Formation (Lightning). **Who:** the closest thing the Wandering Immortal Alliance has to a leader, which he denies. **Want:** a student who is not trying to impress him; wine. **Gives:** Old Jiang's Wager. **Knows:** far more about the Azure Void Immortal than he admits; he met Yue Wanqing once, a century ago. **Toward the player:** rambling and rude; if they pass his test, a teacher of unconventional genius who never explains anything twice.",
    },
    {
      name: 'Madam Jin Ruyi',
      shortDescription:
        'Owner of the Hall of Myriad Treasures in Spiritfall Market. Forties, plump and glittering, gold-thread robes, an abacus of jade beads, and a smile that charges interest.',
      faction: '',
      location: 'Spiritfall Market',
      notes:
        "**Offers:** the monthly auction (day 10, then every 30 days), appraisals, consignment sales, and information at a price. Strictly neutral; all four factions bank with her. **Want:** profit, and to be the one who sells the map to the grotto. **Knows:** who bought what, and who is short of money. **Toward the player:** businesslike; useful to anyone who brings her something rare.",
    },
    {
      name: 'Peddler Mo',
      shortDescription:
        'A traveling medicine peddler. Fifties, thin and stooped, a grey robe, a carrying-pole with two medicine chests, kind tired eyes, and remedies that work better than they should.',
      faction: '',
      location: 'Spiritfall Market',
      notes:
        "**Secret (GM only):** Mo Xuan, a Hollow Vein cultivator (Foundation Establishment, hiding his aura as a mortal's). Drained the animals on Willow Hill while probing the seal. **Want:** the seal broken and the Vein's power. **Method:** finds the desperate and offers them what the world denied them, starting with Tao Xiaoshan (day 5). Begins his blood rite on Willow Hill on day 75. **Toward the player:** kindly, helpful, cheap remedies, and too many questions about Willow Hill and their roots. Feng Ling has one of his letters.",
    },
    {
      name: 'The Silver-Eyed Fox',
      shortDescription:
        'A spirit beast of Whispering Bamboo Forest: a slender white fox with three tails, silver eyes, and the habit of watching travelers from just beyond the path.',
      faction: '',
      location: 'Whispering Bamboo Forest',
      notes:
        "**Rank:** a third-rank spirit beast, roughly late Qi Condensation; can speak to cultivators of the third stage or higher, and chooses not to most of the time. **Guards:** the Listening Stone and the Jade Bamboo Key, which it gives to whoever waits there a full day and night without taking anything from the forest. **Want:** to be left alone; to protect its kits from hunters. **Toward the player:** curious, mischievous, and leads people astray for fun; a powerful friend to anyone who helps its kits.",
    },
    {
      name: 'Foreman Dou Laosan',
      shortDescription:
        'Foreman of the mortal miners in Ironpeak. Fifties, coal-grimed and bowlegged, a cough from the dust, a lamp on his helmet, and a miner\'s gallows humor.',
      faction: '',
      location: 'Ironpeak Mountains',
      notes:
        "**Runs:** the mortal crews who dig ore for the Crimson Blade Hall, and now dig toward the Sunken Forge. **Want:** his men to stop dying in traps. **Knows:** the safe paths through the ruins, the old Han mine, and that Hall Master Tie's men searched the Han bodies for something. **Toward the player:** wary of cultivators; warm to anyone who treats his men as people. Will guide them into the Sunken Forge for a fair price.",
    },
    {
      name: 'The Moon Hermitess',
      shortDescription:
        'A woman seen on Moonwater Lake at night: white robes, long black hair unbound, a small boat that leaves no wake, and a face that is hard to remember afterward.',
      faction: '',
      location: 'Moonwater Lake',
      notes:
        "**Secret (GM only):** Yue Wanqing, the Azure Void Immortal's fourth disciple, a remnant soul bound to the lake for a thousand years to guard the seal. Holds the Moon Key and gives it only on a full moon, to someone who passes her trial of compassion (choosing to help another at a cost to themselves). **Want:** to pass the duty to someone worthy, and rest. **Toward the player:** distant and gentle; appears to people who cultivate on her shore for many nights.",
    },
  ],

  lore: [
    {
      title: 'Cultivation Realms',
      keywords: ['realm', 'realms', 'cultivation', 'qi', 'stage', 'breakthrough', 'bottleneck', 'foundation', 'core', 'nascent', 'condensation'],
      alwaysInclude: true,
      body: "Cultivation is measured in realms. The character's cultivation base is the Qi Cultivation skill; their realm is the 'Cultivation Realm' condition. Mortal (no Qi Cultivation); Qi Condensation (levels 1 to 9, the level is the stage); Foundation Establishment (10 to 19); Core Formation (20 to 29); Nascent Soul (30+); beyond lie Soul Transformation, Void Refinement, and Immortal Ascension. At levels 10, 20, and 30 the character is bottlenecked until a breakthrough: a prepared scene and a Qi Cultivation check at DC 14, 18, or 22. Failure brings Qi Deviation. A full realm's gap is not overcome by a lucky roll.",
    },
    {
      title: 'Spiritual Roots',
      keywords: ['root', 'roots', 'spiritual root', 'affinity', 'element', 'pure', 'dual', 'mixed', 'fire', 'water', 'earth', 'wood', 'metal', 'wind', 'lightning', 'ice'],
      alwaysInclude: true,
      body: "Every cultivator has spiritual roots, their natural affinity for kinds of qi: Fire, Water, Earth, Wood, Metal, and the rarer heavenly roots Wind, Lightning, and Ice. Each root is an Affinity skill. Composition matters: a Pure root is deep and narrow, a Dual root braids two elements, a Mixed root can learn anything but breaks through with difficulty. Off-element techniques are one step harder (except for Mixed). Elements press each other in two cycles (water, fire, metal, wood, earth; lightning, ice, wind), an edge of circumstance, never destiny. No root makes a cultivator superior; sects merely prefer some.",
    },
    {
      title: 'Azure Mist Province',
      keywords: ['azure mist', 'province', 'willowbrook', 'spiritfall', 'ironpeak', 'moonwater', 'bamboo'],
      body: "A remote province at the edge of the Great Celestial Continent, known for mist, mountains, and bamboo. Its powers are the Azure Cloud Sect on Cloudveil Peak, the Crimson Blade Hall in the Ironpeak Mountains, the Verdant Pill Pavilion in Spiritfall Market, and the independent Wandering Immortal Alliance. Spiritfall Market is the crossroads. To the great sects of the Central Plains, Azure Mist is a backwater; the strongest cultivators here are at Core Formation.",
    },
    {
      title: 'The Azure Void Immortal',
      keywords: ['azure void', 'immortal', 'qingxu', 'inheritance', 'legacy', 'grotto', 'keys', 'nine lights'],
      body: "A legend of Azure Mist: a thousand years ago an immortal called the Azure Void walked these mountains, taught three disciples, and vanished instead of ascending. Stories say his grotto lies hidden somewhere in the province with his scripture and treasures, and opens only once in a thousand years to whoever holds 'bamboo, iron, and moon'. Every faction claims some link to him. Most people think it is a children's tale.",
    },
    {
      title: 'The Willow Song',
      keywords: ['willow song', 'lullaby', 'song', 'riddle', 'granny wen'],
      body: "A lullaby sung in Willowbrook for longer than anyone remembers: 'Wait by the stone where the bamboo listens, / take nothing, child, and the green will glisten. / Iron sleeps where the old fires died; / it opens to one who will not step aside. / The moon on the water asks one thing true: / what would you give that is not for you? / Three lights gathered, the willow will wake, / and the sleeper below will have his sake.' Granny Wen sings it. It is a riddle to the three keys and the grotto under Willow Hill.",
    },
    {
      title: 'Sects and Disciples',
      keywords: ['sect', 'disciple', 'outer', 'inner', 'core disciple', 'elder', 'master', 'senior brother', 'junior', 'contribution'],
      body: "Sects rank their members: outer disciples (chores and basic training), inner disciples (real techniques and resources), core disciples (the sect's future, personally taught by elders), elders, and the sect master. Disciples address each other as Senior or Junior Brother and Sister by seniority, not age. Contribution points, earned by sect tasks, buy manuals, pills, and time in spirit-vein caves. A master-disciple bond is close to family and binding both ways; betraying a master is among the worst crimes a cultivator can commit.",
    },
    {
      title: 'Spirit Stones, Pills, and Herbs',
      keywords: ['spirit stone', 'spirit stones', 'pill', 'pills', 'herb', 'herbs', 'alchemy', 'qi gathering', 'beast core', 'price', 'auction'],
      body: "Cultivators trade in spirit stones: crystallized qi, used as money and absorbed during cultivation. One low-grade stone is a mortal family's month of income; 100 make a mid-grade stone. Pills speed cultivation and heal: a Qi Gathering Pill costs about 2, a Foundation Establishment Pill about 300 when one can be found. Spirit herbs (1 to 8 each) and beast cores (5 to 15 for a first-rank beast) sell at the Verdant Pill Pavilion or Madam Jin's Hall of Myriad Treasures, which holds an auction every month.",
    },
    {
      title: 'Spirit Beasts',
      keywords: ['beast', 'beasts', 'spirit beast', 'monster', 'fox', 'boar', 'core', 'beast tide'],
      body: "Animals that absorb qi become spirit beasts, ranked first through ninth roughly alongside cultivator realms (first to third rank is Qi Condensation; fourth to sixth is Foundation Establishment). From the third rank many are cunning; some speak. Their cores, hides, and bones are valuable. Azure Mist has bamboo boars, mist serpents, iron-backed apes in Ironpeak, and spirit carp in Moonwater. A beast tide, when beasts flee or rage together, is a disaster for mortal villages.",
    },
    {
      title: 'The Great Celestial Continent',
      keywords: ['continent', 'central plains', 'beyond', 'great sects', 'heavenly court', 'ancient realm', 'act iv'],
      body: "Azure Mist is one province on the edge of the Great Celestial Continent. Beyond it lie the Central Plains, ruled by the Nine Great Sects, where Nascent Soul cultivators are elders; the Sea of Ten Thousand Islands, full of rogue cultivators and sea beasts; the Southern Wilds, home to beast kings and old tribal cultivation; the Northern Frost Wastes; and the Ruins of the Fallen Heavenly Court, the remains of a civilization of immortals that fell ages ago. Secret realms open there for a few days a century. Few from Azure Mist ever go.",
    },
  ],

  missions: [
    {
      title: 'The Testing Stone',
      giver: 'Master Lu Feng',
      description:
        "A wandering cultivator has set a Root-Testing Stone under Willowbrook's old willow. Every youth in the village is lining up. Whatever the stone shows you will change what comes next, or prove that nothing will.",
      objectives: ['Lay your hand on the Root-Testing Stone', 'Learn what the stone reveals about your spiritual roots', 'Decide what to do with what you have learned'],
      status: 'active',
      rewards: { xp: 50 },
    },
    {
      title: 'Lights on Willow Hill',
      giver: 'Headman Zhou Dacheng',
      description:
        "For three nights, lights have flickered at the old shrine on Willow Hill, the wells have run warm, and animals have been found drained and grey. The headman wants it stopped, and is too frightened to go up the hill himself.",
      objectives: ['Investigate the shrine on Willow Hill', 'Find out what is draining the animals', 'Deal with it, or bring it to someone who can'],
      rewards: { money: 3, xp: 100, relationships: [{ npc: 'Headman Zhou Dacheng', affinity: 10, trust: 15 }] },
    },
    {
      title: 'The Azure Cloud Entrance Trial',
      giver: 'Elder Bai Shuang',
      description:
        "Once a year the Azure Cloud Sect opens the Thousand Cloudgate Steps to anyone under twenty-five with a spiritual root. Climb the steps, survive the elder's examination, and become an outer disciple of the most respected sect in the province. The trial is on day 15. Most who try fail.",
      objectives: ['Reach the foot of the Cloudgate Steps by day 15', 'Climb the Thousand Steps', "Pass Elder Bai Shuang's examination of root and heart", 'Be entered on the roll of outer disciples'],
      rewards: { xp: 150, relationships: [{ npc: 'Elder Bai Shuang', affinity: 5, trust: 10 }] },
    },
    {
      title: 'Mistbell Orchids',
      giver: 'Alchemist Fang Yao',
      description:
        "Mistbell Orchids bloom in the deep shade of Whispering Bamboo Forest for a few weeks each year, and the Pavilion needs them for Qi Gathering Pills. Fang Yao pays well for fresh ones, and sniffs at anything wilted.",
      objectives: ['Find a patch of Mistbell Orchids in Whispering Bamboo Forest', 'Gather five without bruising them', 'Bring them to Fang Yao fresh'],
      rewards: { money: 6, xp: 60, skillXp: [{ skill: 'Herb Lore', amount: 15 }] },
    },
    {
      title: 'The Proving Ring',
      giver: 'Instructor Hong Lie',
      description:
        "A ring of red stone in Spiritfall Market, where anyone may fight anyone who agrees. Win three bouts in a row and Instructor Hong Lie will offer you a place in the Crimson Blade Hall, whether you want it or not.",
      objectives: ['Win a bout in the Proving Ring', 'Win a second', 'Win a third, and decide what to say to Hong Lie'],
      rewards: { money: 10, xp: 80 },
    },
    {
      title: "Old Jiang's Wager",
      giver: 'Old Drunk Jiang',
      description:
        "Old Drunk Jiang bets you can't bring him a cup of water from the very middle of Moonwater Lake on a full-moon night without spilling a drop. If you win, he says, he'll teach you something. If you lose, you buy the wine.",
      objectives: ['Reach the middle of Moonwater Lake on a full-moon night', 'Bring back a full cup without spilling', 'Collect on the wager'],
      rewards: { xp: 120, relationships: [{ npc: 'Old Drunk Jiang', affinity: 10, trust: 15 }] },
    },
    {
      title: 'Whispers of the Azure Void',
      description:
        "An old lullaby, a cracked shrine, lights on the hill, and a legend of an immortal who vanished instead of ascending. If any of it is true, the greatest inheritance in Azure Mist is somewhere close, and soon everyone will be looking for it.",
      objectives: [
        'Learn the legend of the Azure Void Immortal',
        'Find the three keys: bamboo, iron, and moon',
        'Find the Forgotten Immortal Grotto',
        'Claim the inheritance, share it, or leave it sleeping',
      ],
      rewards: { xp: 1000 },
    },
  ],

  character: {
    name: 'Wei Lin',
    archetype: 'Willowbrook herb-gatherer',
    bio: "Sixteen, born and raised in Willowbrook Village. Your parents died of fever when you were four, and Granny Wen, the village herbalist, took you in. You know every root and leaf in the valley, you can climb a cliff for a single mountain ginseng, and you have never been farther than the county market. You have heard of cultivators the way you have heard of dragons. Then, three nights ago, lights began flickering on Willow Hill, and yesterday a wandering cultivator walked into the village with a stone on his back. Today, under the old willow, everyone your age is lining up to touch it.",
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
        name: 'Cultivation Realm',
        description: 'Mortal. No qi drawn, no technique learned. (Realms follow the Qi Cultivation skill.)',
        turnsRemaining: null,
        modifiers: [],
      },
    ],
    skills: [
      { name: 'Herb Lore', level: 2, xp: 20, description: 'Identifying, gathering, and preparing medicinal plants, and later spirit herbs: their age, potency, and dangers. Granny Wen taught you well.' },
      { name: 'Woodcraft', level: 1, xp: 10, description: 'Moving through forest and hills: tracking, finding paths, foraging, reading weather, and not getting lost.' },
      { name: 'Climbing', level: 1, xp: 10, description: 'Cliffs, trees, and rooftops. You have climbed for ginseng since you were eight.' },
      { name: 'Perception', level: 1, xp: 5, description: 'Noticing what is out of place: a track, a lie, a glint of light where there should be none.' },
      { name: 'Letters', level: 1, xp: 0, description: 'Reading and writing. Granny Wen made you learn from her herbal; enough to read a manual slowly.' },
    ],
    items: [
      { name: 'Herb basket', description: 'A woven bamboo basket with shoulder straps, smelling of mint and earth.', tags: ['container', 'tool'], equipped: true },
      { name: 'Herb sickle', description: 'A small, sharp iron sickle for cutting roots and stems. Not a weapon, unless it has to be.', tags: ['tool', 'weapon', 'blade'], equipped: true },
      { name: 'Straw rain cloak', description: 'A cape of woven straw that sheds rain and smells like a haystack.', tags: ['clothing'], equipped: true },
      {
        name: "Granny Wen's herbal",
        description: "A thick hand-copied book of valley herbs and remedies, with Granny Wen's notes crammed in the margins. On the last page, in a younger hand, someone has written the words of a song.",
        tags: ['book', 'herbalism', 'keepsake'],
      },
      {
        name: 'Warm grey pebble',
        description: 'A smooth grey pebble you picked up near the shrine on Willow Hill the first night the lights appeared. It stays warm, even in the stream.',
        tags: ['curiosity', 'mystery'],
      },
    ],
    relationships: [
      {
        npc: 'Granny Wen',
        affinity: 60,
        trust: 65,
        status: 'family',
        historyNotes: '- Took you in when your parents died. Taught you every herb in the valley, and scolds you every day out of love.',
      },
      {
        npc: 'Tao Xiaoshan',
        affinity: 50,
        trust: 50,
        status: 'friend',
        historyNotes: '- Best friend since you were both small enough to fall in the stream together. Touched the stone an hour ago; it stayed grey.',
      },
      {
        npc: 'Headman Zhou Dacheng',
        affinity: 10,
        trust: 15,
        status: 'acquaintance',
        historyNotes: "- Still calls you 'Granny Wen's little one'. Asked you yesterday whether you'd seen anything strange on Willow Hill.",
      },
      {
        npc: 'Master Lu Feng',
        affinity: 0,
        trust: 0,
        status: 'stranger',
        historyNotes: '- Arrived yesterday with a stone on his back. Looked at you a moment longer than at the others.',
      },
    ],
  },
};
