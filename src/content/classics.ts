import type { CardDefinition } from "../game/types";
import { cardFactory, roll, rollTable } from "./author";

/**
 * Classic party and King's Cup content for the generated main deck. Traditional
 * rules are adapted to this game's pour and "pass is always allowed" contract,
 * keeping the blunt table voice.
 *
 * This file was trimmed hard: near-duplicate reaction cards, redundant "roll a
 * die, do a thing" branches, and cards already covered by the sample set were
 * removed. King's Cup ranks for 9, 10, Jack and Queen stay covered by Rhyme
 * Time, Categories, Rulemaster and Questions Only in the sample set.
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
  card("drink-two", "Drink Two", "sip", "Drink 2. No explanation owed."),
  card(
    "give-take",
    "Give and Take",
    "sip",
    "Give 2 sips to someone. Take 1 yourself. Balanced.",
  ),
  card("social-sip", "Social Sip", "group", "Everyone drinks 2. Cheers!"),
  card("girls-drink", "Girls Drink", "group", "Girls drink 2."),
  card("guys-drink", "Guys Drink", "group", "Guys drink 2."),
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
  card("tallest", "Big Friendly Giant", "group", "Tallest player drinks 2."),
  card(
    "new-blood",
    "New Blood",
    "group",
    "First time Drink-at-Ron players drink 13. Get absolutely fucked.",
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
    "Couples drink 2. Singles give 2 and sulk.",
  ),
  card(
    "birthday",
    "Birthday Month",
    "group",
    "Your birthday this month? Drink 2. Everyone else toasts you.",
  ),

  // --- Reaction and reflex -------------------------------------------------
  card(
    "kings-four",
    "Four Is Floor",
    "challenge",
    "Touch the floor with your hands. Last one down drinks 2.",
  ),
  card(
    "kings-seven",
    "Seven Is Heaven",
    "challenge",
    "Hands up. Last hand up drinks 2.",
  ),

  // --- Verbal games --------------------------------------------------------
  card(
    "truth-or-drink",
    "Truth or Drink",
    "challenge",
    "The group asks you a question. Answer honestly, or roll d6 and drink it.",
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
    "Do an impression of someone here. You both drink 3.",
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
    "story-time",
    "Story Time",
    "category",
    "Go around the table adding one word to a group story. First mistake drinks 2.",
  ),

  // --- Temporary rules -----------------------------------------------------
  card(
    "sober-talk",
    "Sober Talk",
    "rule",
    "Until your next turn, you can't say drink, drank or drunk. Slip = drink 2.",
  ),
  card("buffalo", "Buffalo", "rule", "It's gotta go."),
  card(
    "accent",
    "Accent Lock",
    "rule",
    "Until your next turn: everyone talks in an accent. Slip = drink 2.",
  ),
  card(
    "library",
    "Library Mode",
    "rule",
    "Until your next turn, everyone whispers. Slip = drink 2.",
  ),
  card(
    "little-green-man",
    "Little Green Man",
    "rule",
    "Until your next turn, everyone removes the tiny man before drinking. Slip = drink 2.",
  ),
  card(
    "question-master",
    "Question Master",
    "rule",
    "Until your next turn: anyone who answers your question drinks 2.",
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
    "Pick a mate until your next turn. When one of you drinks, both drink.",
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
    rollTable(1, 6, [
      { min: 1, max: 5, step: 2, instruction: "Drink 3." },
      { min: 2, max: 6, step: 2, instruction: "Give 3." },
    ]),
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
    "Roll d20. Give your roll.",
    roll(1, 20, "Give {total}."),
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
    "Drink as many as you want, then pick someone to drink that many.",
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
    "tavern-brawl",
    "Tavern Brawl",
    "group",
    "On three, everyone points at someone. Most pointed drinks 3.",
  ),
  card(
    "dungeon-master",
    "Dungeon Master",
    "rule",
    "Until your next turn, you narrate in third person. Slip = drink 2.",
  ),
  card(
    "prophecy",
    "Prophecy",
    "challenge",
    "Predict who finishes their drink next. Right: give 3. Wrong: drink 3.",
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
    "Give the table a dare. Anyone who refuses drinks 2.",
  ),
];
