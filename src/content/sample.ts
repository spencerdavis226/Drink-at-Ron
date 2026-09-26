import type { CardDefinition, PackDefinition } from "../game/types";
import { cardFactory, roll, rollTable } from "./author";
import { classicCards } from "./classics";
import { standardExpansionCards } from "./standard-expansion";

// The generated main deck: the supplied 40-card sample set, the classic /
// King's Cup basics, and the trimmed voice/dice expansion. The supplied Sheet1
// house cards now live in their own pack (`./custom`). Cards with a `dice`
// definition pause the deck until the roll is resolved. Cheers, Idiots keeps
// its individual illustrated scene; everything else renders in the shared
// painted frame with its deterministic imprint.
const card = cardFactory("core");

export const sampleCards: CardDefinition[] = [
  card("house-special", "House Special", "sip", "Drink 3."),
  card("bar-tab", "Bar Tab", "sip", "Give 3."),
  card("bad-influence", "Bad Influence", "sip", "Pick someone. Both drink 2."),
  card("last-call", "Last Call", "group", "Everyone drinks 2."),
  card(
    "you-specifically",
    "Fuck You In Particular",
    "sip",
    "Pick someone. They drink 6.",
  ),
  card(
    "cheap-date",
    "Cheap Date",
    "group",
    "Cheapest drink at the table drinks 3.",
  ),
  card("baller", "Big Money", "group", "Priciest drink at the table gives 4."),
  card(
    "group-project",
    "Group Project",
    "group",
    "Hands up. Last hand up drinks 3.",
  ),
  card(
    "bad-text",
    "U Up?",
    "sip",
    "Anyone who sent a regrettable late-night text drinks 3.",
  ),
  card(
    "fake-sick",
    "Corporate Wellness",
    "sip",
    "Anyone who faked sick to skip work drinks 3.",
  ),
  card(
    "crypto-bro",
    "Financial Genius",
    "sip",
    "Crypto owners drink 2. Everyone else gives 2.",
  ),
  card(
    "smooth-brain",
    "Smooth Brain",
    "challenge",
    "Admit something dumb you believed. Drink 2.",
  ),
  card(
    "would-you",
    "Would You Though?",
    "group",
    "Most likely to text an ex drinks 3.",
  ),
  card(
    "cheers-idiots",
    "Cheers, Idiots",
    "group",
    "Cheers. Everyone drinks 2.",
    undefined,
    "art/cheers.webp",
  ),
  card(
    "dice-tax",
    "Dice Tax",
    "challenge",
    "Roll d6. Drink half, round up.",
    rollTable(1, 6, [
      { min: 1, max: 2, instruction: "Drink 1." },
      { min: 3, max: 4, instruction: "Drink 2." },
      { min: 5, max: 6, instruction: "Drink 3." },
    ]),
  ),
  card(
    "give-a-shit",
    "Give a Shit",
    "challenge",
    "Roll d6. Give that many.",
    roll(1, 6, "Give {total}."),
  ),
  card(
    "fuckin-math",
    "Fuckin' Math",
    "challenge",
    "Roll d6. Drink 7 minus your roll.",
    rollTable(1, 6, [
      { min: 1, max: 1, instruction: "Drink 6." },
      { min: 2, max: 2, instruction: "Drink 5." },
      { min: 3, max: 3, instruction: "Drink 4." },
      { min: 4, max: 4, instruction: "Drink 3." },
      { min: 5, max: 5, instruction: "Drink 2." },
      { min: 6, max: 6, instruction: "Drink 1." },
    ]),
  ),
  card(
    "low-roller",
    "Pathetic",
    "challenge",
    "Roll d6. 1–2: drink 4. Else give 2.",
    rollTable(1, 6, [
      { min: 1, max: 2, instruction: "Drink 4." },
      { min: 3, max: 6, instruction: "Give 2." },
    ]),
  ),
  card(
    "high-roller",
    "Big Dick Energy",
    "challenge",
    "Roll d6. 5–6: give 5. Else drink 2.",
    rollTable(1, 6, [
      { min: 1, max: 4, instruction: "Drink 2." },
      { min: 5, max: 6, instruction: "Give 5." },
    ]),
  ),
  card(
    "same-shit",
    "Same Shit",
    "challenge",
    "Roll 2d6. Doubles: give total. Else drink 3.",
    {
      version: 1,
      count: 2,
      sides: 6,
      doubles: "Give {total}.",
      outcomes: [{ min: 2, max: 12, instruction: "Drink 3." }],
    },
  ),
  card(
    "two-beers-math",
    "That's Two Beers",
    "challenge",
    "Roll 4d6. Give the total.",
    roll(4, 6, "Give {total}."),
  ),
  card(
    "snake-eyes",
    "Snake Eyes",
    "challenge",
    "Roll 2d6. Double 1s: drink 11. Else give 3.",
    rollTable(2, 6, [
      { min: 2, max: 2, instruction: "Drink 11." },
      { min: 3, max: 12, instruction: "Give 3." },
    ]),
  ),
  card(
    "lucky-bastard",
    "Lucky Bastard",
    "challenge",
    "Roll 2d6. 9+: give 5. Under 9: drink 3.",
    rollTable(2, 6, [
      { min: 2, max: 8, instruction: "Drink 3." },
      { min: 9, max: 12, instruction: "Give 5." },
    ]),
  ),
  card(
    "fuck-around",
    "Fuck Around & Find Out",
    "challenge",
    "Roll d20. 1: take a shot. 20: give a shot. Else drink 2.",
    rollTable(1, 20, [
      { min: 1, max: 1, instruction: "Take a shot." },
      { min: 2, max: 19, instruction: "Drink 2." },
      { min: 20, max: 20, instruction: "Give a shot." },
    ]),
  ),
  card(
    "crit-fail",
    "Critical Failure",
    "challenge",
    "Roll d20. 1–5: drink 4. 16–20: give 4.",
    rollTable(1, 20, [
      { min: 1, max: 5, instruction: "Drink 4." },
      { min: 6, max: 15, instruction: "Nothing happens." },
      { min: 16, max: 20, instruction: "Give 4." },
    ]),
  ),
  card(
    "chosen-one",
    "God's Drunkest Soldier",
    "challenge",
    "Roll d20. Odd: drink your roll. Even: give your roll.",
    rollTable(1, 20, [
      { min: 1, max: 19, step: 2, instruction: "Drink {total}." },
      { min: 2, max: 20, step: 2, instruction: "Give {total}." },
    ]),
  ),
  card(
    "categories",
    "Categories",
    "category",
    "Pick a category. First repeat or blank drinks 3.",
  ),
  card(
    "rhyme-time",
    "Rhyme Time",
    "category",
    "Pick a word. First bad rhyme drinks 3.",
  ),
  card(
    "rock-paper-drink",
    "Rock Paper Drink",
    "category",
    "Challenge someone. Loser drinks 3.",
  ),
  card(
    "never-have-i",
    "Never Have I Ever",
    "category",
    "Say one. Anyone who has drinks 2.",
  ),
  card(
    "rulemaster",
    "Rulemaster",
    "rule",
    "Make a rule until the end of the game. Breaker drinks 2.",
  ),
  card(
    "no-names",
    "Who the Fuck Are You?",
    "rule",
    "Until your next turn, nobody uses names. Slip = drink 2.",
  ),
  card(
    "potty-mouth",
    "Church Mode",
    "rule",
    "Until your next turn, nobody swears. Slip = drink 2.",
  ),
  card(
    "cursed-number",
    "Cursed Number",
    "rule",
    "Roll d6. Nobody may say that number until your next turn. Slip = drink 2.",
    roll(1, 6, "{total} is banned until your next turn. Say it: drink 2."),
  ),
];

// The generated main deck. All three packs are opt-in at setup.
export const coreCards: CardDefinition[] = [
  ...sampleCards,
  ...classicCards,
  ...standardExpansionCards,
];

export const samplePack: PackDefinition = {
  version: 1,
  id: "core",
  logo: "art/packs/core.svg",
  title: "The Core deck",
  description:
    "The main deck: sample prompts, King's Cup basics, and the dice-forward standard cards.",
  cardIds: coreCards.map((card) => card.id),
};
