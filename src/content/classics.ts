import type { CardDefinition } from "../game/types";
import { cardFactory, roll, rollTable } from "./author";

/**
 * Classic party and King's Cup content, merged into the always-included Core
 * pack so a new game is stocked with the basics ("Give Two", "Girls Drink")
 * alongside the supplied sample set.
 *
 * Sourced and adapted from public rules write-ups (Wikipedia's Kings / King's
 * Cup table, the Cloudfall Kings Cup compendium, and common drink-o-tron style
 * decks). Traditional speed-drinking rules are adapted to the game's single
 * sip unit and the "pass is always allowed" rule in docs/GAME_DESIGN.md. Rank
 * cards for 9, 10, Jack and Queen are intentionally absent because the sample
 * set already ships Rhyme Time, Categories, Rulemaster and Questions Only.
 *
 * A dice card is just a card with a `dice` definition from `./author`; nothing
 * else changes, and unassigned imprint art falls back deterministically.
 */
const card = cardFactory("core");

export const classicCards: CardDefinition[] = [
  // --- Table standards -----------------------------------------------------
  card(
    "give-one",
    "Give One",
    "sip",
    "Give 1 sip to anyone.",
    "A single copper coin flicked across a tavern table toward a waiting friend.",
  ),
  card(
    "give-two",
    "Give Two",
    "sip",
    "Give 2 sips to anyone.",
    "Two small cups slid across a scarred wooden table in a generous arc.",
  ),
  card(
    "drink-two",
    "Drink Two",
    "sip",
    "Drink 2.",
    "One adventurer lifting a plain mug with a resigned shrug, centered and clear.",
  ),
  card(
    "give-take",
    "Give and Take",
    "sip",
    "Give 2 sips to someone. Take 1 sip yourself.",
    "Two hands passing a cup across the table, one giving and one receiving.",
  ),
  card(
    "social-sip",
    "Social Sip",
    "group",
    "Everyone drinks 2.",
    "A ring of mismatched mugs lifting together over a warm tavern table.",
  ),
  card(
    "girls-drink",
    "Girls Drink",
    "group",
    "Everyone who identifies as a girl drinks 2.",
    "A trio of cheerful adventurers raising decorated cups in a small toast.",
  ),
  card(
    "guys-drink",
    "Guys Drink",
    "group",
    "Everyone who identifies as a guy drinks 2.",
    "Three burly adventurers clinking heavy tankards with broad grins.",
  ),
  card(
    "table-toast",
    "Table Toast",
    "group",
    "Raise your glass. Last to toast drinks 2.",
    "A crowded table of raised cups caught mid-cheer, one hand lagging behind.",
  ),
  card(
    "elders",
    "Respect Your Elders",
    "group",
    "Oldest player drinks 2.",
    "A grey-bearded veteran being toasted by younger adventurers at the table.",
  ),
  card(
    "youth",
    "Youth Is Wasted",
    "group",
    "Youngest player drinks 2.",
    "A fresh-faced adventurer shrugging while older friends raise their cups.",
  ),
  card(
    "tallest",
    "Big Friendly Giant",
    "group",
    "Tallest player drinks 2.",
    "A towering adventurer ducking under a low tavern beam while friends laugh.",
  ),
  card(
    "shortest",
    "Pocket Sized",
    "group",
    "Shortest player drinks 2.",
    "A small adventurer standing proudly on a stool to reach the table.",
  ),
  card(
    "new-blood",
    "New Blood",
    "group",
    "Newest player drinks 2.",
    "A nervous newcomer seated at a table of grinning regulars, cup in hand.",
  ),
  card(
    "late-arrival",
    "Fashionably Late",
    "group",
    "Last to arrive drinks 2.",
    "An adventurer bursting through the tavern door with leaves still on their cloak.",
  ),
  card(
    "couples",
    "Couples Drink",
    "group",
    "Anyone in a relationship drinks 2. Everyone else gives 2.",
    "Two entwined pairs of cups sitting together beside two lonely mugs.",
  ),
  card(
    "singles",
    "Single Pringle",
    "group",
    "Anyone single drinks 2. Everyone else gives 2.",
    "One lone mug placed under a small spotlight on a table of paired cups.",
  ),
  card(
    "birthday",
    "Birthday Month",
    "group",
    "If it is your birthday month, drink 2. Everyone else toasts you.",
    "A small candle stuck in a frosted mug as friends lean in with cheers.",
  ),

  // --- Reaction and reflex -------------------------------------------------
  card(
    "kings-four",
    "Four Is Floor",
    "challenge",
    "Touch the floor. Last one down drinks 2.",
    "A startled table of adventurers all diving to slap the tavern floorboards.",
  ),
  card(
    "kings-seven",
    "Seven Is Heaven",
    "challenge",
    "Reach for the sky. Last hand up drinks 2.",
    "A table of adventurers flinging their hands upward toward the rafters.",
  ),
  card(
    "hands-on-heads",
    "Hands on Heads",
    "challenge",
    "Put your hands on your head. Last one drinks 2.",
    "A circle of adventurers clutching their heads, one grinning latecomer behind.",
  ),
  card(
    "thumb-master",
    "Thumb Master",
    "rule",
    "Until next card: thumbs up means copy. Last to copy drinks 2.",
    "A sly adventurer pressing a thumb to the table while friends scramble to copy.",
  ),

  // --- Verbal games --------------------------------------------------------
  card(
    "most-likely",
    "Most Likely To",
    "group",
    "Name a misdeed. Point at the most likely. Most pointed drinks 2.",
    "A table of friends all pointing at one blushing adventurer, laughing.",
  ),
  card(
    "would-rather",
    "Would You Rather",
    "group",
    "Pose a dilemma. Point left or right. Minority drinks 2.",
    "Two adventurers splitting apart as friends point either way in a dilemma.",
  ),
  card(
    "truth-or-drink",
    "Truth or Drink",
    "challenge",
    "Ask someone a question. They answer honestly or drink 2.",
    "One adventurer leaning in with a pointed question while a friend hesitates.",
  ),
  card(
    "paranoia",
    "Paranoia",
    "challenge",
    "Whisper a question. They answer aloud. Ask what it was: drink 1.",
    "Two adventurers whispering behind a raised hand as the table leans in.",
  ),
  card(
    "two-truths",
    "Two Truths",
    "challenge",
    "Say two truths and one lie. First wrong guess drinks 2.",
    "An adventurer holding up three tally marks while friends squint in suspicion.",
  ),
  card(
    "rant",
    "Rant Mode",
    "challenge",
    "Name a topic for the drawer. They rant for 20 seconds or drink 2.",
    "A wild-eyed adventurer mid-rant on a tiny soapbox, cup waving overhead.",
  ),
  card(
    "impression",
    "Do the Impression",
    "challenge",
    "Do an impression of someone here. If nobody laughs, drink 2.",
    "A bard mimicking a stern friend while the table covers their laughter.",
  ),
  card(
    "stare-down",
    "Stare Down",
    "challenge",
    "Stare down a rival. First to blink or laugh drinks 2.",
    "Two adventurers locked in an intense stare across a candlelit table.",
  ),
  card(
    "thumb-war",
    "Thumb War",
    "challenge",
    "Challenge someone to a thumb war. Loser drinks 2.",
    "Two clasped hands mid thumb war above a table of watching mugs.",
  ),
  card(
    "alphabet",
    "Alphabet Race",
    "category",
    "Pick a letter. Name words starting with it. First blank drinks 2.",
    "A circle of adventurers blurting words with floating letters above them.",
  ),
  card(
    "story-time",
    "Story Time",
    "category",
    "Add one sentence to a group story. First to stall drinks 2.",
    "Adventurers around a fire adding lines to a tall tale, one scratching their head.",
  ),
  card(
    "fizz-buzz",
    "Fizz Buzz",
    "category",
    "Count up: Fizz on 3s, Buzz on 5s, both on 15. Slip = drink 2.",
    "A line of counting adventurers with numbers and question marks swirling above.",
  ),
  card(
    "fuzzy-duck",
    "Fuzzy Duck",
    "category",
    "Say fuzzy duck. Switch to ducky fuzz anytime. Slip = drink 2.",
    "A row of confused adventurers passing a small duck figurine from hand to hand.",
  ),

  // --- Temporary rules -----------------------------------------------------
  card(
    "lefty",
    "Lefty",
    "rule",
    "Until next card: drink with the wrong hand. Slip = drink 2.",
    "An adventurer awkwardly hoisting a tankard in the wrong hand, spilling a drop.",
  ),
  card(
    "no-pointing",
    "No Pointing",
    "rule",
    "Until next card: no pointing. Slip = drink 2.",
    "A guilty adventurer hiding a pointing finger behind their back.",
  ),
  card(
    "no-questions",
    "No Questions",
    "rule",
    "Until next card: no questions. Slip = drink 2.",
    "An adventurer clamping a hand over their mouth mid-question.",
  ),
  card(
    "sober-talk",
    "Sober Talk",
    "rule",
    "Until next card: no saying drink, drank or drunk. Slip = drink 2.",
    "A wide-eyed adventurer frozen mid-sentence beside hovering speech-scrolls.",
  ),
  card(
    "buffalo",
    "Buffalo",
    "rule",
    "Until next card: drink with your left hand. Slip = drink 2.",
    "A left-handed adventurer clutching a mug while a friend raises an eyebrow.",
  ),
  card(
    "accent",
    "Accent Lock",
    "rule",
    "Until next card: everyone talks in an accent. Slip = drink 2.",
    "A table of adventurers attempting grand accents, one breaking into a grin.",
  ),
  card(
    "library",
    "Library Mode",
    "rule",
    "Until next card: whisper everything. Slip = drink 2.",
    "A tavern table of adventurers leaning in to whisper dramatically.",
  ),
  card(
    "little-green-man",
    "Little Green Man",
    "rule",
    "Until next card: remove the tiny man first. Slip = drink 2.",
    "A tiny green imp perched on the rim of a mug, arms crossed, watching.",
  ),
  card(
    "question-master",
    "Question Master",
    "rule",
    "Until next card: anyone who answers your question drinks 2.",
    "A smug adventurer firing questions while friends answer with wary side-eye.",
  ),

  // --- King's Cup ranks ----------------------------------------------------
  card(
    "waterfall",
    "Ace Is Waterfall",
    "group",
    "Start a waterfall. Everyone sips in turn and stops in turn.",
    "A chain of adventurers sipping from raised cups in a rolling wave.",
  ),
  card(
    "kings-two",
    "Two Is You",
    "sip",
    "Give 2 sips to anyone.",
    "An adventurer pointing across the table while two small cups slide away.",
  ),
  card(
    "kings-three",
    "Three Is Me",
    "sip",
    "Drink 3.",
    "A resigned adventurer taking a long pull from a mug, three tally marks behind.",
  ),
  card(
    "kings-eight",
    "Eight Is Mate",
    "rule",
    "Pick a mate until next card. When one of you drinks, both drink.",
    "Two adventurers linking arms with cups raised in a loyal toast.",
  ),
  card(
    "kings-king",
    "King's Cup",
    "group",
    "Pour a sip into the cup. When full, the drawer sips from it.",
    "A central wooden cup ringed by curious adventurers and a worn crown.",
  ),

  // --- Dice basics ---------------------------------------------------------
  card(
    "lucky-sip",
    "Lucky Sip",
    "challenge",
    "Roll d6. Drink your roll.",
    "One ivory die resting beside a single mug, centered with warm tavern light.",
    roll(1, 6, "Drink {total}."),
  ),
  card(
    "open-hand",
    "Open Hand",
    "challenge",
    "Roll d6. Give your roll.",
    "An open palm offering tiny coins beside one tumbling six-sided die.",
    roll(1, 6, "Give {total}."),
  ),
  card(
    "odd-even",
    "Coin Flip",
    "challenge",
    "Roll d6. Odd: drink 3. Even: give 3.",
    "A single die balanced on its edge beside two mismatched cups.",
    rollTable(1, 6, [
      { min: 1, max: 3, instruction: "Odd: drink 3." },
      { min: 4, max: 6, instruction: "Even: give 3." },
    ]),
  ),
  card(
    "fate",
    "Fate",
    "challenge",
    "Roll d20. 10 or more: give 2. Under 10: drink 3.",
    "A twenty-sided die glowing faintly on a rune-etched table, centered and bold.",
    rollTable(1, 20, [
      { min: 1, max: 9, instruction: "Drink 3." },
      { min: 10, max: 20, instruction: "Give 2." },
    ]),
  ),
  card(
    "blessing",
    "Blessing",
    "challenge",
    "Roll d20. Only a natural 20 does anything: everyone else drinks 2.",
    "A radiant twenty-sided die crowned with a thin halo, centered and calm.",
    rollTable(1, 20, [
      { min: 1, max: 19, instruction: "Nothing happens." },
      { min: 20, max: 20, instruction: "Everyone else drinks 2." },
    ]),
  ),

  // --- Flavorful one-offs --------------------------------------------------
  card(
    "dragon-breath",
    "Dragon's Breath",
    "challenge",
    "Take a sip, then name someone. They drink 1 and take a sip back.",
    "An adventurer puffing a tiny plume of fire across the table, mug in hand.",
  ),
  card(
    "potion-courage",
    "Potion of Courage",
    "sip",
    "Drink 2, then dare someone to match you. They may pass.",
    "A bubbling green potion beside a brave adventurer squaring up to a friend.",
  ),
  card(
    "loot-drop",
    "Loot Drop",
    "challenge",
    "Roll d6. 5-6: give 4. Else drink 2.",
    "A small treasure chest bursting open beside one tumbling die, centered.",
    rollTable(1, 6, [
      { min: 1, max: 4, instruction: "Drink 2." },
      { min: 5, max: 6, instruction: "Give 4." },
    ]),
  ),
  card(
    "critical-hit",
    "Critical Hit",
    "challenge",
    "Rock-paper-scissors: winner gives 4, loser drinks 2.",
    "Two adventurers clashing hands in a rock-paper-scissors duel over a mug.",
  ),
  card(
    "tavern-brawl",
    "Tavern Brawl",
    "group",
    "On three, everyone points at someone. Most pointed drinks 3.",
    "A tavern of adventurers all pointing at once, mugs sloshing, grinning.",
  ),
  card(
    "bard",
    "Bardic Inspiration",
    "challenge",
    "Sing your next sentence. Laughs: drink 2. Silence: you drink 2.",
    "A bard mid-ballad with a tiny lute while friends stifle their laughter.",
  ),
  card(
    "dungeon-master",
    "Dungeon Master",
    "rule",
    "Until next card: narrate in third person. Slip = drink 2.",
    "An adventurer gesturing grandly behind a small screen of tavern menus.",
  ),
  card(
    "goblin-market",
    "Goblin Market",
    "category",
    "Name something from a goblin market. First blank drinks 2.",
    "A crooked market stall overflowing with odd trinkets under a striped awning.",
  ),
  card(
    "resurrection",
    "Resurrection",
    "sip",
    "Top up your drink, then take 2 sips for the fallen.",
    "A dusty mug refilled from a jug, a small candle lit beside it.",
  ),
  card(
    "prophecy",
    "Prophecy",
    "challenge",
    "Predict who drinks next. Right: give 3. Wrong: drink 3.",
    "A hooded seer peering into a cloudy orb while an adventurer waits nervously.",
  ),
  card(
    "mimic-chest",
    "Mimic Chest",
    "sip",
    "Open the chest: take 2 sips and give 1 away.",
    "A wooden chest with a toothy grin and a tongue, coins spilling out.",
  ),
  card(
    "side-quest",
    "Side Quest",
    "challenge",
    "Give the table a small dare. Anyone who refuses drinks 2.",
    "An adventurer pinning a tiny quest notice to a tavern board, cup in hand.",
  ),
];
