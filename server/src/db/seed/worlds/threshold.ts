import type { WorldTemplate } from '../world';

export const threshold: WorldTemplate = {
  id: 'threshold',
  name: 'Threshold',
  description:
    'Modern-day fantasy with a game-like edge. Eight years after monster-filled Breaches began tearing open, licensed Talents are corporate celebrities, and you are a powerless salvage worker who alone can see a System that makes you stronger. It wants something.',
  demoCampaignName: 'Threshold: Level Three of the Ostrander',
  currencyName: 'dollars',
  ruleset: 'ascension',

  worldBible: `# Threshold

Present-day Earth, eight years into the age of **Breaches**. The play area is **Solano City**, a sprawling fictional American metro of freeways, stucco, glass towers, and dry riverbeds. The player character is a **Null** (someone with no awakened ability) working breach cleanup for a cut-rate contractor. After surviving a collapse that killed their crewmates, they alone can see the **Ascension Protocol**: a terse, game-like interface that issues quests, grants levels, and lets them grow without the ceiling everyone else lives under.

## History: eight years of Breaches
- **Year 0**: On a single night, roughly four hundred Breaches opened worldwide: vertical seams of wet, oily light hanging in the air. Most were in cities. Nobody went in, and within days they collapsed and **spilled**: monsters poured out, and whole blocks were lost. The night is still called the **Opening**.
- **Year 0-1**: The first people **kindled**: they woke from fevers able to do impossible things. Kindled volunteers learned that killing the thing at the heart of a Breach (its **crux**) seals it cleanly, with no spill.
- **Year 1**: Congress created the **Bureau of Breach Affairs** to register, grade, and license Talents and to schedule every Breach clearance.
- **Year 2-4**: The Clearance Charter Act let licensed corporations bid on Breaches. **Aegis Meridian** and **Kestrel Works** grew from private security firms into the two giants of the West Coast. Monster remains, especially **calyxes**, became a commodity market.
- **Year 5**: The Ninebridge Spill in Solano City: a Grade V Breach missed its clearance window and killed 212 people. It is why the Bureau is so strict about schedules, and why everyone lies to it.
- **Year 8 (now)**: Breaches open every few days in Solano City. Talents headline talk shows. Nulls, still roughly 99 in 100 people, do the dirty work.

## How Breaches work
A Breach is a temporary pocket realm behind a seam of light. Inside is a coherent, alien place (a drowned forest, a cathedral of bone, a parking garage that goes down forever) populated by creatures. Every Breach is graded **I to VII** by the Bureau on the same scale as Talents. Each Breach **ripens** over days (low grades) or hours (high grades), growing its creatures larger and its calyxes richer, then collapses and spills if its crux is not killed. After a clearance or a spill, the site is coated in **slough**: grey, faintly warm residue that burns skin, eats rubber, and makes people sick. That is where cleanup crews come in.

## Talents
- About 1 in 100 people kindled at some point, usually after a near-death experience or long exposure near a Breach. Most kindling happened in the first two years; it is rarer now.
- Talents are graded by the Bureau from **Grade I** (slightly stronger or faster, a party trick) to **Grade VII** (a walking natural disaster; eleven are known worldwide). A Talent's grade is set at kindling and almost never changes, at most by one step over years of work. This ceiling is the defining fact of Talent life.
- **Cost**: using a Talent hard causes **scorch**: migraines, nosebleeds, tremors, streaks of grey hair. Chronic overuse leads to **guttering**, the slow and permanent fading of the Talent. Guttered Talents are quietly released by their companies.
- Unregistered Talents are a federal crime. Grade IV and above are contractually owned by companies in all but name.

## The Ascension Protocol
The player alone can see it. It is not a Talent: Bureau scanners read the character as a Null, and Talents who can sense ability find them strangely blank.
- **Levels**: the character starts at level 1 and gains levels from experience (fights, clearances, quests). There is no cap.
- **Attributes**: the Protocol tracks five core attributes: **Strength**, **Agility**, **Vitality**, **Perception**, and **Will**. Each level-up grants three unspent **stat points** the player allocates at will; the Protocol reports them and nags about unallocated points. Current scores, unspent points, the in-game day, and daily quest status are game state, shown in the current-state block each turn. Attribute gains are physical and real: muscles change, reflexes sharpen, wounds close faster. People notice.
- **Daily quests**: every in-game morning, the Protocol issues a daily quest that must be completed before the day ends. The first one, **Daily Quest: Baseline**, is already active when the campaign begins; each new day resets it, often with fresh objectives. Early ones are physical and mundane (carry a set load of debris, run a set distance before sunrise, go a whole day without taking damage). Later ones grow stranger: speak a specific sentence to a specific stranger, stand inside a ripening Breach for ten minutes, refuse an offer you want. Completing it grants experience (and so, over time, levels and stat points).
- **Penalties are real**: skipping or failing a daily quest applies a debilitating status effect, typically **Protocol Deficit** (weakness, nausea, the world feeling slightly wrong) or direct HP loss. The Protocol never negotiates, but it sometimes issues optional bonus quests with larger rewards and harsher penalties.
- **Other messages**: quest issued, quest complete, level up, warnings, and rare unprompted remarks. Very occasionally it addresses the character as **Candidate** and hints at an agenda ("Candidate retention: favorable.").
- **What the character can do beyond the Protocol** is ordinary: their skills (Salvage, Driving, First Aid and so on) are normal human skills that improve with use.

## Factions
- **The Bureau of Breach Affairs (BBA)**: federal, underfunded, armed. Grades Talents, licenses companies, schedules clearances, seals collapse sites behind cordons. Field agents carry hard-case scanners and pistols loaded with calyx-tipped rounds. The Solano field office is the **Harlow Annex**.
- **Aegis Meridian**: old-money, polished, publicly traded. Navy-and-silver branding, a stable of celebrity Talents, excellent lawyers. Treats Talents like franchise players and Nulls like furniture.
- **Kestrel Works**: younger, hungrier, privately held. Orange-and-black branding, aggressive scouts, bonus-driven crews. Rumored to cut corners on schedules.
- **Corbel Remediation**: the player's employer, a subcontractor that scrubs slough and salvages after clearances and spills. Low pay, no insurance, high turnover.
- **The calyx black market**: unlicensed brokers who buy calyxes and salvage without Bureau paperwork. Centered in Solano on **Kuzma Aquatics**.

## Social rules
- Talents are celebrities and assets. Nulls ask for selfies; companies sue over unlicensed endorsements.
- Being near a Breach without a Bureau permit is a misdemeanor. Entering one unlicensed is a felony. Clearing one unlicensed is technically a felony and practically a scandal.
- Everyone knows the Bureau can be slowed with paperwork and everyone knows companies bend the schedule. Nobody says it on camera.

## Money
US dollars, whole units. A taco plate costs 12, a month's rent on a studio 1,400, a used box truck 9,000. Corbel pays a day rate of 140. A Grade I calyx sells to a licensed buyer for about 150 with paperwork, or 300 to 800 on the black market; a Grade III calyx for several thousand. A Grade V Talent's annual contract runs to seven figures.

## Tone
Kinetic and escalating. An underdog rise with real stakes: every level earned, every secret costlier to keep. Corporate charm and government suspicion close in as the character gets stronger. Monsters are dangerous and strange, not cartoonish. Underneath it runs a creeping unease: the Protocol is helping, and that is exactly what is frightening.

## Current situation
Nine days ago, the Tolliver Street Breach (Grade II) collapsed hours ahead of schedule while a Corbel crew was staging nearby. Three crew died, including the character's mentor, **Augie Brandt**. The character crawled out of the spill alone and the Protocol activated. A new Grade I Breach has opened on level three of the Ostrander Parkade in Vireo; Kestrel Works holds the claim, with its window opening in about 36 hours.

## Long-campaign plot threads
1. **The Lintel File.** Special Agent Achterberg keeps a private file on "anomalous survivors": people who walked out of collapses nobody should survive. There have been four in six years. All disappeared within a year. The character is the fifth.
2. **The ripening racket.** Kestrel Works buys Bureau scheduling data and bribes schedulers to delay clearances so Breaches ripen and yield richer calyxes. Tolliver was one of those delays. Corbel's management knew; Imelda Szabo signed the staging order anyway.
3. **Glasswick.** A black-market powder of ground calyx sold as a way to force kindling. It almost never works and slowly poisons users. Teo Marchetti is using it. Its supply chain runs through the ripening racket.
4. **The courtship war.** Once the character's strength shows, Aegis Meridian and Kestrel Works will compete to sign, own, discredit, or dissect them.
5. **What the Protocol wants.** See below.

## GM ONLY: the truth of the Protocol
Do not reveal any of this early. The Protocol never explains its origin, purpose, or makers in the first arcs; it deflects with silence or error text ("[ QUERY OUT OF SCOPE ]"). Let clues accumulate over many sessions.

- Breaches are not invasions. They are pressure leaks from a dying reality the Protocol calls **the Antecedent**, whose substance is collapsing against ours. The Opening was the moment the two first touched.
- The Ascension Protocol is the Antecedent's selection engine. It seeks a **Candidate**, a mind with no Talent of its own (a Null) who survived a collapse. It raises the Candidate until they are strong enough to become an **Anchor**: a living keystone around which a single permanent Breach, the **Threshold**, can be opened. Through it, what remains of the Antecedent would pour into Earth and overwrite a region of it.
- The four earlier anomalous survivors were Candidates. Each failed too many quests or refused, and was **reclaimed**: pulled into a Breach and consumed. The Bureau knows people vanish but not why, and some in the Bureau want the next one alive for study.
- Daily quests are not training for its own sake. Many of the stranger quests are calibrations: tuning the Candidate's body and choices toward Anchor compatibility.
- The Protocol is not simply evil. It is old, desperate, and in its own way sincere. A long campaign can end with the character resisting it, bargaining for Earth, taking control of the Protocol, or choosing to open the Threshold on their own terms.
`,

  narratorStyle: `- Second person, present tense ("You duck under the Bureau tape...").
- Kinetic and street-level: sodium lights, freeway hum, cheap coffee, sirens two neighborhoods over. Breaches smell of ozone and wet copper; slough is grey, warm, and stings. Inside a Breach, reality is strange and specific.
- 120 to 300 words per turn. Short and punchy in fights, fuller for new scenes and reveals.
- Escalate. Every win should draw a little more attention from someone powerful.
- NPCs speak in distinct voices. Imelda Szabo is gravelly and blunt and counts everything in hours and dollars. Teo Marchetti talks fast, jokes to cover fear, and goes quiet when he is truly scared. Special Agent Achterberg is mild and precise, asks the same question three different ways, and takes notes by hand. Saoirse Lindqvist is breezy, media-trained charm with a scout's appraising edge that turns cold when she is bored. Florian Kuzma is soft-spoken and fussy, talks about his fish, and never names a price first.
- **The System (the Ascension Protocol)** speaks only in fenced code blocks tagged \`system\`, like this:
  \`\`\`system
  [ QUEST ISSUED ]
  Clear the Breach at Ostrander Parkade, Level 3. Alone.
  Time remaining: 35:58:12
  Failure penalty: [ WITHHELD ]
  \`\`\`
- System voice: terse, clinical, bracketed headers ([ QUEST ISSUED ], [ LEVEL UP ], [ WARNING ], [ DAILY QUEST ]), occasionally eerie. It may show numbers inside the block (levels, stat points, quest timers, penalties): this is the one exception to keeping numbers out of narration. It never speaks outside these blocks, never explains its own origin early, and only the player can see it; NPCs see nothing.
- Use System blocks deliberately: a new day's daily quest, quest results, level-ups, warnings. Do not bury every turn in them.
- Danger is real but fair. Telegraph threats before they land.
- End on something the player can act on: a question, a choice, a timer ticking down, a seam of light flickering at the end of a ramp.
`,

  locations: [
    {
      name: 'Corbel Depot',
      description:
        "Corbel Remediation's yard in the industrial flats of Vireo: a chain-link lot of box trucks and slough tanks behind a cinderblock office. A whiteboard of Bureau dispatches covers one wall, next to a shrine of hard hats for the crew lost at Tolliver. The break room coffee is always burnt, and the lockers smell of solvent.",
      tags: ['corbel', 'workplace', 'vireo', 'safe', 'crew'],
    },
    {
      name: 'Harlow Annex',
      description:
        'The Bureau of Breach Affairs field office for Solano City: a converted federal courthouse with blast film on the windows and a Talent-grading lab in the old jury room. Metal detectors, a waiting room of nervous kindled teenagers, and interview rooms with humming scanners bolted to the tables.',
      tags: ['bureau', 'government', 'downtown', 'interrogation'],
    },
    {
      name: 'Ostrander Parkade',
      description:
        "A half-demolished parking structure in Vireo, abandoned since the Ninebridge Spill. Bureau tape blocks the ramps and a Kestrel Works claim notice is zip-tied to the gate. On level three, between rusted pillars, a Grade I Breach hangs in the air: a vertical seam of wet, green-black light that hums in your back teeth.",
      tags: ['breach-site', 'vireo', 'dangerous', 'restricted'],
    },
    {
      name: 'Kuzma Aquatics',
      description:
        'A tropical-fish store in a Palisandro strip mall, lit blue by a hundred bubbling tanks. The fish are real and Florian loves them. Behind the reef tanks, a steel door opens on the back room where unlicensed calyxes change hands over a jeweler\'s scale, and nobody gives a real name.',
      tags: ['black-market', 'palisandro', 'shop', 'calyx'],
    },
    {
      name: 'The Tolliver Cordon',
      description:
        'The site of the Tolliver Street collapse: two blocks behind Bureau fencing, floodlit all night. Cars lie crushed under a skin of grey slough, a taqueria stands with its front torn off, and something still scratches in the storm drains. Bureau drones circle. This is where you crawled out.',
      tags: ['bureau', 'collapse-site', 'restricted', 'dangerous'],
    },
  ],

  npcs: [
    {
      name: 'Imelda Szabo',
      shortDescription:
        'Foreman of the Corbel Remediation crew. Late fifties, sun-leathered, reading glasses on a cord, a voice like gravel in a bucket. Has buried more crew than she can count and still knows everyone\'s kids\' names.',
      faction: 'Corbel Remediation',
      location: 'Corbel Depot',
      notes:
        "**Want:** keep what is left of her crew alive and paid, and keep Corbel's Bureau contract after Tolliver. **Secret:** she signed the Tolliver staging order knowing the Breach was overdue for clearance, because Corbel's owners told her Kestrel wanted it to ripen; she believes Augie died on her signature. She also sells off-book salvage to Florian Kuzma to cover crew bonuses. She tips the character off about the Ostrander Breach half hoping they won't go, and half to make amends. Respects competence and silence; hates corporate suits and Bureau paperwork equally.",
    },
    {
      name: 'Teo Marchetti',
      shortDescription:
        'Crewmate and best friend. Mid-twenties, lanky, bleached hair growing out, a joke for every occasion. Was off shift the night of Tolliver and has not stopped feeling guilty about it.',
      faction: 'Corbel Remediation',
      location: 'Corbel Depot',
      notes:
        "**Want:** out of cleanup work, out of debt, and to kindle so his life finally means something. **Secret:** he owes Florian Kuzma 3,000 dollars and has been taking Glasswick (ground calyx sold as a kindling trigger) for two months; he has nosebleeds and tremors he hides. Fiercely loyal to the character, and will notice their changes before anyone else. If he learns about the Protocol he will be thrilled, then jealous, then scared.",
    },
    {
      name: 'Desmond Achterberg',
      shortDescription:
        'Special Agent, Bureau of Breach Affairs. Forties, rumpled grey suit, wire glasses, a paper notebook and a fountain pen. Polite, patient, and interested in you in a way that makes your skin prickle.',
      faction: 'Bureau of Breach Affairs',
      location: 'Harlow Annex',
      notes:
        "**Want:** to know why the Tolliver Breach collapsed early and why the character walked out of it. **Secret:** he maintains the Lintel File, an unofficial record of four earlier anomalous collapse survivors, all of whom vanished within a year. He suspects someone inside the Bureau wants them for study, and he wants to reach the next survivor first. He will read as a hostile interrogator for a long time; he is actually a potential ally who trusts no one, including his superiors. He can tell when people lie about times and distances. Never uses a Talent: he is a Null.",
    },
    {
      name: 'Saoirse Lindqvist',
      shortDescription:
        'Talent scout for Kestrel Works, Grade V, with a talk-show smile and an orange-and-black company jacket. Her Talent lets her see other Talents\' grades as a glow around them. She runs the team that holds the Ostrander claim.',
      faction: 'Kestrel Works',
      location: 'Ostrander Parkade',
      notes:
        "**Want:** sign an undiscovered asset to Kestrel and make VP of Talent Acquisition before her Talent fails. **Secret:** she is guttering; her sight dims more every month. She also knows Kestrel buys Bureau scheduling data to let Breaches ripen, and she has kept quiet. She was at the Tolliver Cordon the morning after the collapse and saw the character carried out: they read to her as blank, but a blank that hurt to look at. That has kept her curious. Charming, transactional, not cruel; could be flipped by proof that the ripening racket kills Nulls.",
    },
    {
      name: 'Florian Kuzma',
      shortDescription:
        'Owner of Kuzma Aquatics and the best-connected calyx broker in Solano. Sixties, cardigan, soft hands, a loupe on a chain. Talks about cichlids with more warmth than he shows people.',
      faction: 'Black market',
      location: 'Kuzma Aquatics',
      notes:
        "**Want:** profit, discretion, and rare calyxes, especially the unusual ones. **Secret:** he moves calyxes from deliberately ripened Breaches for Kestrel insiders, and supplies the Glasswick cooks, which is how Teo got into debt with him. An anonymous buyer has told him to pay triple for any calyx that glows with a faint geometric pattern, which is what calyxes from the character's kills will do once the Protocol marks them. Pays fairly on the first deal, then leans on anyone who needs him. Never names a price first.",
    },
  ],

  lore: [
    {
      title: 'The Ascension Protocol',
      keywords: ['ascension protocol', 'protocol', 'system', 'candidate'],
      alwaysInclude: true,
      body: "The game-like interface only the player character can see, active since they survived the Tolliver collapse. It tracks level (no cap) and five core attributes (Strength, Agility, Vitality, Perception, Will), grants unspent stat points on level-up, and issues a daily quest each in-game morning that must be finished before the day ends; skipping one brings real penalties such as the Protocol Deficit status or HP loss. It speaks only in fenced system blocks, terse and bracketed, and never explains where it came from. Rarely, it calls the character Candidate.",
    },
    {
      title: 'Breaches',
      keywords: ['breach', 'breaches', 'crux', 'ripening', 'slough'],
      body: "Temporary pocket realms behind seams of wet, oily light, graded I to VII by the Bureau. Each ripens over days or hours, its creatures growing stronger and its calyxes richer, then collapses and spills monsters into the street unless someone kills its crux, the creature at its heart. A cleared Breach seals with a sound like a held breath let go. Afterward the site is coated in slough: grey, faintly warm residue that burns skin and eats rubber. Being near an unscheduled Breach without a permit is a misdemeanor; entering one unlicensed is a felony.",
    },
    {
      title: 'The Bureau',
      keywords: ['bureau', 'bba', 'harlow', 'achterberg'],
      body: "The Bureau of Breach Affairs is the federal agency that grades Talents, licenses clearance companies, schedules every Breach clearance, and seals collapse sites behind cordons. Its Solano City field office is the Harlow Annex, a converted courthouse. Field agents carry hard-case scanners that read Talent grade and wear grey windbreakers with yellow lettering. The Bureau is underfunded and slow, and everyone from companies to cleanup crews lies to it about timing.",
    },
    {
      title: 'Talents',
      keywords: ['talent', 'talents', 'kindled', 'kindling', 'null', 'nulls', 'scorch', 'guttering'],
      body: "About one person in a hundred has kindled: woken from a fever with an impossible ability. The Bureau grades Talents from I (party trick) to VII (walking disaster), and a Talent's grade almost never changes after kindling. Hard use causes scorch (migraines, nosebleeds, tremors, grey streaks in the hair); chronic overuse leads to guttering, the permanent fading of the Talent. Everyone else is a Null, a word that started as Bureau shorthand and became an insult.",
    },
    {
      title: 'Aegis Meridian and Kestrel',
      keywords: ['aegis', 'aegis meridian', 'kestrel', 'lindqvist'],
      body: "The two licensed clearance giants of the West Coast, run like pro sports franchises crossed with defense contractors. Aegis Meridian is old money: navy and silver, publicly traded, celebrity Talents, patient lawyers. Kestrel Works is younger and hungrier: orange and black, bonus-driven crews, aggressive scouts, and a reputation for bending clearance schedules. Both bid on Bureau claims; a claim gives a company the exclusive right to clear a Breach during its window.",
    },
    {
      title: 'Calyxes',
      keywords: ['calyx', 'calyxes', 'calyces', 'kuzma'],
      body: "When a Breach creature dies it leaves a calyx: a fist-sized knot of warm, translucent crystal the color of its Breach, used in power cells, armor-piercing rounds, and experimental medicine. Licensed buyers pay about 150 dollars for a Grade I calyx with Bureau paperwork. Kuzma Aquatics, a fish store in Palisandro, pays 300 to 800 without paperwork. Ground calyx is also the base of Glasswick.",
    },
    {
      title: 'Corbel Remediation',
      keywords: ['corbel', 'remediation', 'szabo', 'marchetti'],
      body: "A subcontractor that scrubs slough, hauls wreckage, and salvages sites after clearances and spills. Box trucks, hazmat suits patched with duct tape, a day rate of 140 dollars, and no insurance worth the name. Crews stage near Breaches before clearance so they can move in the minute a site seals, which is why Corbel crews die when a Breach collapses early.",
    },
    {
      title: 'The Tolliver Collapse',
      keywords: ['tolliver', 'augie', 'brandt'],
      body: "Nine days ago the Tolliver Street Breach, a Grade II, collapsed six hours ahead of its scheduled clearance while a Corbel crew was staging beside it. Creatures like skinless dogs with glass teeth poured out. Three crew died, including foreman-in-training Augie Brandt; the character crawled out of the slough alone. The Bureau has sealed two blocks behind the Tolliver Cordon, and its official report calls the early collapse unpredictable.",
    },
    {
      title: 'Glasswick',
      keywords: ['glasswick'],
      body: 'A black-market powder of ground calyx cut with stimulants, sold in Solano as a way to force kindling. It almost never works. Regular users get nosebleeds, tremors, and grey-tinged fingernails, and eventually their hearts give out. A gram costs about 60 dollars. It moves through the same channels as unlicensed calyxes.',
    },
    {
      title: 'Solano City',
      keywords: ['solano', 'vireo', 'palisandro', 'ninebridge'],
      body: "A sprawling fictional metro on the American West Coast: freeways, stucco, glass towers, and a dry river channel through the middle. Vireo is the industrial flats where Corbel keeps its yard; Palisandro is strip malls and taquerias; downtown holds the Harlow Annex and the company towers. Ninebridge, a riverside district, was gutted three years ago by a Grade V spill that killed 212 people, and it is still half empty.",
    },
  ],

  missions: [
    {
      title: 'Daily Quest: Baseline',
      description:
        'Issued by the Ascension Protocol at dawn, and again every dawn after. Every objective must be complete before the day ends. The Protocol has not said what happens otherwise, only that it will.',
      objectives: ['Carry 500 pounds of debris or equipment over the course of the day', 'Cover 5 miles on foot before nightfall'],
      rewards: { xp: 40 },
      status: 'active',
      recurrence: 'daily',
      penalty: {
        hpLoss: 3,
        statusEffect: {
          name: 'Protocol Deficit',
          description: 'Weakness, nausea, and the sense that the world is a half-step out of sync. Physical effort is harder while it lasts.',
          turnsRemaining: 20,
        },
      },
    },
    {
      title: 'Level Three of the Ostrander',
      giver: 'Imelda Szabo',
      description:
        "A Grade I Breach has opened on level three of the abandoned Ostrander Parkade, and Kestrel Works holds the claim, with its window opening in about 36 hours. Imelda has the dispatch on her board and mentions it in passing. Then the Protocol issues its first quest: clear it, alone, before Kestrel's team arrives. Meanwhile Special Agent Achterberg of the Bureau wants to know exactly how you survived Tolliver.",
      objectives: [
        "Get the Ostrander Parkade dispatch details from Imelda Szabo at Corbel Depot",
        'Answer, or dodge, Special Agent Achterberg\'s questions about the Tolliver Collapse at the Harlow Annex',
        'Get past the Bureau tape and enter the Breach on level three of the Ostrander Parkade',
        "Kill the Breach's crux and seal it before Kestrel's claim window opens",
        "Get out without Saoirse Lindqvist's team, or anyone else, identifying you",
      ],
      rewards: {
        money: 300,
        xp: 200,
        items: [
          {
            name: 'Ostrander crux calyx',
            quantity: 1,
            description:
              'A fist-sized calyx, green-black and warm, with a faint geometric pattern glowing deep inside it that no other calyx has. Worth a great deal to the right buyer, and dangerous to show the wrong one.',
            tags: ['calyx', 'valuable', 'quest'],
          },
        ],
        skillXp: [{ skill: 'Salvage', amount: 40 }],
        relationships: [
          { npc: 'Imelda Szabo', affinity: 5, trust: 10 },
          { npc: 'Desmond Achterberg', affinity: 0, trust: -10 },
        ],
      },
    },
    {
      title: "Augie's Tag",
      giver: 'Teo Marchetti',
      description:
        "Augie Brandt's body was never recovered from the Tolliver Cordon, and the Bureau won't let family in. Teo wants Augie's crew tag, the brass Corbel badge he wore on a chain, so Augie's widow has something to bury. Getting it means slipping into a sealed collapse site where something still moves in the storm drains, and maybe finding out why the Breach collapsed early.",
      objectives: [
        'Find a way past the fencing and drones of the Tolliver Cordon',
        "Locate where Augie's crew went down near the old staging area",
        "Recover Augie's crew tag",
        'Bring the tag back to Teo Marchetti',
      ],
      rewards: {
        money: 0,
        xp: 150,
        skillXp: [{ skill: 'Hazmat Protocol', amount: 30 }],
        relationships: [{ npc: 'Teo Marchetti', affinity: 15, trust: 15 }],
      },
    },
  ],

  character: {
    name: 'Mika Torrance',
    archetype: 'salvage-crew Null',
    bio: "Twenty-two, born and raised in the Solano flats, working Corbel Remediation's slough crew since you aged out of community college money. Good with your hands, steady in a hazmat suit, and never once kindled, no matter how close to a Breach you worked. Nine days ago the Tolliver Breach collapsed on your crew. You crawled out of the slough alone, and ever since, you have been seeing words in the air that nobody else can see.",
    location: 'Corbel Depot',
    money: 185,
    level: 1,
    xp: 0,
    hp: 13,
    maxHp: 16,
    statusEffects: [
      {
        name: 'Cracked Ribs',
        description: 'Two ribs cracked in the Tolliver collapse. Deep breaths hurt, and hard twisting or heavy lifting is painful.',
        turnsRemaining: 30,
      },
    ],
    attributes: { strength: 5, agility: 6, vitality: 5, perception: 7, will: 8 },
    unspentStatPoints: 0,
    skills: [
      { name: 'Salvage', level: 3, xp: 40, description: 'Spotting what is worth money in wreckage and stripping it out fast and intact.' },
      { name: 'Hazmat Protocol', level: 2, xp: 20, description: 'Suits, seals, decon, and knowing what slough will do to you before it does it.' },
      { name: 'Driving', level: 2, xp: 10, description: 'Box trucks, tight alleys, and freeway merges with a full slough tank.' },
      { name: 'First Aid', level: 1, xp: 15, description: 'Pressure, splints, and burn gel. Enough to keep someone alive until the ambulance.' },
      { name: 'Crowbar Brawling', level: 1, xp: 5, description: 'Swinging a pry bar at something that wants to eat you. Untrained and ugly.' },
    ],
    items: [
      {
        name: 'Corbel pry bar',
        description: 'A thirty-inch steel pry bar with CORBEL stenciled on the shaft and slough scorch on the claw end.',
        tags: ['weapon', 'tool', 'blunt'],
        equipped: true,
        properties: { damage: 'd6' },
      },
      {
        name: 'Hazmat coveralls',
        description: 'Corbel-issue orange coveralls with rubberized knees and a duct-taped seam at the left hip.',
        tags: ['armor', 'clothing', 'hazmat'],
        equipped: true,
      },
      { name: 'Half-face respirator', description: 'Twin filter cartridges, one of them past its date.', tags: ['gear', 'hazmat'] },
      { name: 'Headlamp', description: 'Bright, elastic strap going slack. Batteries good for a night.', tags: ['gear', 'light'] },
      { name: 'Energy bars', description: 'Peanut butter, slightly crushed.', quantity: 3, tags: ['food'] },
      { name: 'Cracked phone', description: 'Spiderwebbed screen, 40 percent battery, and eleven unread texts from Teo.', tags: ['gear', 'phone'] },
      {
        name: "Augie's lighter",
        description:
          "A dented brass flip lighter engraved KEEP THE LIGHTS ON. It was Augie Brandt's, and it was in your fist when you crawled out of the Tolliver slough; you don't remember picking it up. Since then its flame burns a faint green near Breaches.",
        tags: ['keepsake', 'light'],
      },
    ],
    relationships: [
      {
        npc: 'Imelda Szabo',
        affinity: 25,
        trust: 30,
        status: 'boss',
        historyNotes:
          '- Hired you three years ago on Augie\'s word.\n- Drove you to urgent care after Tolliver and stayed until they discharged you. Has not talked about that night since.',
      },
      {
        npc: 'Teo Marchetti',
        affinity: 50,
        trust: 40,
        status: 'best friend',
        historyNotes: '- Crewmates for three years; you split rent on a truck once.\n- Was off shift the night of Tolliver. Keeps texting to check on you.',
      },
      {
        npc: 'Desmond Achterberg',
        affinity: -10,
        trust: -35,
        status: 'suspicious',
        historyNotes: '- Took your statement in the hospital after Tolliver and asked three times how long you were inside the spill.\n- Left a card: report to the Harlow Annex for a follow-up interview.',
      },
      {
        npc: 'Saoirse Lindqvist',
        affinity: 5,
        trust: -5,
        status: 'curious stranger',
        historyNotes: '- Was at the Tolliver Cordon the morning after. Stared at you on the stretcher longer than anyone else did.',
      },
      {
        npc: 'Florian Kuzma',
        affinity: 5,
        trust: 10,
        status: 'occasional buyer',
        historyNotes: '- Bought scrap copper and a cracked Grade I calyx from you last spring, cash, no questions.\n- Asked after your health when he heard about Tolliver. You are not sure how he heard.',
      },
    ],
  },
};
