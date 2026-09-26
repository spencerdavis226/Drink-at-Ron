import type { CardDefinition } from "../game/types";
import { cardFactory, roll, rollTable } from "./author";

/**
 * Classic party and King's Cup content, merged into the always-included Core
 * pack so a new game is stocked with the basics ("Give Two", "Girls Drink")
 * alongside the supplied sample set.
 *
 * Sourced and adapted from public rules write-ups (Wikipedia's Kings / King's
 * Cup table, the Cloudfall Kings Cup compendium, and common drink-o-tron style
 * decks). Traditional speed-drinking rules are adapted to this game's pour and
 * "pass is always allowed" contract in docs/GAME_DESIGN.md, and wording follows
 * the blunt table voice in docs/CARD_VOICE_REFERENCE.md. Rank cards for 9, 10,
 * Jack and Queen are intentionally absent because the sample set already ships
 * Rhyme Time, Categories, Rulemaster and Questions Only.
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
    "Give 1 sip to anyone. Make eye contact.",
  ),
  card(
    "give-two",
    "Give Two",
    "sip",
    "Give 2 sips to anyone. Announce it like a tax refund.",
  ),
  card(
    "drink-two",
    "Drink Two",
    "sip",
    "Drink 2. No explanation owed.",
  ),
  card(
    "give-take",
    "Give and Take",
    "sip",
    "Give 2 sips to someone. Take 1 yourself. Balanced.",
  ),
  card(
    "social-sip",
    "Social Sip",
    "group",
    "Everyone drinks 2. Cheers to the group chat.",
  ),
  card(
    "girls-drink",
    "Girls Drink",
    "group",
    "Everyone who identifies as a girl drinks 2.",
  ),
  card(
    "guys-drink",
    "Guys Drink",
    "group",
    "Everyone who identifies as a guy drinks 2.",
  ),
  card(
    "table-toast",
    "Table Toast",
    "group",
    "Raise your glass. Last to toast drinks 2.",
  ),
  card(
    "elders",
    "Respect Your Elders",
    "group",
    "Oldest player drinks 2. You owe them this.",
  ),
  card(
    "youth",
    "Youth Is Wasted",
    "group",
    "Youngest player drinks 2. Youth is wasted on them.",
  ),
  card(
    "tallest",
    "Big Friendly Giant",
    "group",
    "Tallest player drinks 2. Duck.",
  ),
  card(
    "shortest",
    "Pocket Sized",
    "group",
    "Shortest player drinks 2. Podium not included.",
  ),
  card(
    "new-blood",
    "New Blood",
    "group",
    "Newest player drinks 2. Welcome to it.",
  ),
  card(
    "late-arrival",
    "Fashionably Late",
    "group",
    "Last to arrive drinks 2. Sinner.",
  ),
  card(
    "couples",
    "Couples Drink",
    "group",
    "Anyone partnered drinks 2. Singles give 2 and sulk.",
  ),
  card(
    "singles",
    "Single Pringle",
    "group",
    "Anyone single drinks 2. Everyone else gives 2.",
  ),
  card(
    "birthday",
    "Birthday Month",
    "group",
    "Birthday this month? Drink 2. Everyone else toasts you.",
  ),

  // --- Reaction and reflex -------------------------------------------------
  card(
    "kings-four",
    "Four Is Floor",
    "challenge",
    "Touch the floor. Last one down drinks 2.",
  ),
  card(
    "kings-seven",
    "Seven Is Heaven",
    "challenge",
    "Hands up. Last hand up drinks 2.",
  ),
  card(
    "hands-on-heads",
    "Hands on Heads",
    "challenge",
    "Put your hands on your head. Last one drinks 2.",
  ),
  card(
    "thumb-master",
    "Thumb Master",
    "rule",
    "Until next card: thumbs up means copy. Last to copy drinks 2.",
  ),

  // --- Verbal games --------------------------------------------------------
  card(
    "most-likely",
    "Most Likely To",
    "group",
    "Name a misdeed. Point at the most likely. Most pointed drinks 3.",
  ),
  card(
    "would-rather",
    "Would You Rather",
    "group",
    "Pose a dilemma. Point left or right. Minority drinks 2.",
  ),
  card(
    "truth-or-drink",
    "Truth or Drink",
    "challenge",
    "Answer honestly, or roll d6 and drink it.",
    roll(1, 6, "Drink {total}."),
  ),
  card(
    "paranoia",
    "Paranoia",
    "challenge",
    "Whisper a question. They answer aloud. Ask what it was: drink 2.",
  ),
  card(
    "two-truths",
    "Two Truths",
    "challenge",
    "Two truths and a lie. First wrong guess rolls d6 and drinks it.",
    roll(1, 6, "Drink {total}."),
  ),
  card(
    "rant",
    "Rant Mode",
    "challenge",
    "Rant for 20 seconds or roll d6 and drink it.",
    roll(1, 6, "Drink {total}."),
  ),
  card(
    "impression",
    "Do the Impression",
    "challenge",
    "Do an impression of someone here. If nobody laughs, drink 2.",
  ),
  card(
    "stare-down",
    "Stare Down",
    "challenge",
    "Stare down a rival. First to blink or laugh drinks 2.",
  ),
  card(
    "thumb-war",
    "Thumb War",
    "challenge",
    "Challenge someone to a thumb war. Loser drinks 2.",
  ),
  card(
    "alphabet",
    "Alphabet Race",
    "category",
    "Pick a letter. First blank or repeat drinks 2.",
  ),
  card(
    "story-time",
    "Story Time",
    "category",
    "Add one sentence to a group story. First to stall drinks 2.",
  ),
  card(
    "fizz-buzz",
    "Fizz Buzz",
    "category",
    "Count up: Fizz on 3s, Buzz on 5s. First slip rolls d6 and drinks it.",
    roll(1, 6, "Drink {total}."),
  ),
  card(
    "fuzzy-duck",
    "Fuzzy Duck",
    "category",
    "Say fuzzy duck. Switch to ducky fuzz anytime. Slip: drink 2.",
  ),

  // --- Temporary rules -----------------------------------------------------
  card(
    "lefty",
    "Lefty",
    "rule",
    "Until next card: drink with the wrong hand. Slip = drink 2.",
  ),
  card(
    "no-pointing",
    "No Pointing",
    "rule",
    "Until next card: no pointing. Slip = drink 2.",
  ),
  card(
    "no-questions",
    "No Questions",
    "rule",
    "Until next card: no questions. Slip = drink 2.",
  ),
  card(
    "sober-talk",
    "Sober Talk",
    "rule",
    "Until next card: no saying drink, drank or drunk. Slip = drink 2.",
  ),
  card(
    "buffalo",
    "Buffalo",
    "rule",
    "Until next card: drink with your left hand. Slip = drink 2.",
  ),
  card(
    "accent",
    "Accent Lock",
    "rule",
    "Until next card: everyone talks in an accent. Slip = drink 2.",
  ),
  card(
    "library",
    "Library Mode",
    "rule",
    "Until next card: whisper everything. Slip = drink 2.",
  ),
  card(
    "little-green-man",
    "Little Green Man",
    "rule",
    "Until next card: remove the tiny man first. Slip = drink 2.",
  ),
  card(
    "question-master",
    "Question Master",
    "rule",
    "Until next card: anyone who answers your question drinks 2.",
  ),

  // --- King's Cup ranks ----------------------------------------------------
  card(
    "waterfall",
    "Ace Is Waterfall",
    "group",
    "Start a waterfall. Everyone sips in turn and stops in turn.",
  ),
  card(
    "kings-two",
    "Two Is You",
    "sip",
    "Give 2 sips to anyone. Point so it's personal.",
  ),
  card(
    "kings-three",
    "Three Is Me",
    "sip",
    "Drink 3. The cards hate you personally.",
  ),
  card(
    "kings-eight",
    "Eight Is Mate",
    "rule",
    "Pick a mate until next card. When one of you drinks, both drink.",
  ),
  card(
    "kings-king",
    "King's Cup",
    "group",
    "Pour a sip into the cup. When full, the drawer sips from it.",
  ),

  // --- Dice basics ---------------------------------------------------------
  card(
    "lucky-sip",
    "Lucky Sip",
    "challenge",
    "Roll d6. Drink your roll. Call it luck.",
    roll(1, 6, "Drink {total}."),
  ),
  card(
    "open-hand",
    "Open Hand",
    "challenge",
    "Roll d6. Give your roll. Look generous.",
    roll(1, 6, "Give {total}."),
  ),
  card(
    "odd-even",
    "Coin Flip",
    "challenge",
    "Roll d6. Odd: drink 3. Even: give 3.",
    roll(1, 6, "Odd: drink 3. Even: give 3."),
  ),
  card(
    "fate",
    "Fate",
    "challenge",
    "Roll d20. 10 or more: give 3. Under 10: drink 4.",
    rollTable(1, 20, [
      { min: 1, max: 9, instruction: "Drink 4." },
      { min: 10, max: 20, instruction: "Give 3." },
    ]),
  ),
  card(
    "blessing",
    "Blessing",
    "challenge",
    "Roll d20. Only a natural 20 does anything: everyone else drinks 2.",
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
  ),
  card(
    "potion-courage",
    "Potion of Courage",
    "sip",
    "Drink 2, then dare someone to match you. They may pass.",
  ),
  card(
    "loot-drop",
    "Loot Drop",
    "challenge",
    "Roll d6. 5–6: give 4. Else drink 2.",
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
  ),
  card(
    "tavern-brawl",
    "Tavern Brawl",
    "group",
    "On three, everyone points at someone. Most pointed drinks 3.",
  ),
  card(
    "bard",
    "Bardic Inspiration",
    "challenge",
    "Sing your next sentence. Laughs: drink 2. Silence: you drink 2.",
  ),
  card(
    "dungeon-master",
    "Dungeon Master",
    "rule",
    "Until next card: narrate in third person. Slip = drink 2.",
  ),
  card(
    "goblin-market",
    "Goblin Market",
    "category",
    "Name something from a goblin market. First blank drinks 2.",
  ),
  card(
    "resurrection",
    "Resurrection",
    "sip",
    "Top up your drink, then take 2 sips for the fallen.",
  ),
  card(
    "prophecy",
    "Prophecy",
    "challenge",
    "Predict who drinks next. Right: give 3. Wrong: drink 3.",
  ),
  card(
    "mimic-chest",
    "Mimic Chest",
    "sip",
    "Open the chest: take 2 sips and give 1 away.",
  ),
  card(
    "side-quest",
    "Side Quest",
    "challenge",
    "Give the table a small dare. Anyone who refuses drinks 2.",
  ),
];
