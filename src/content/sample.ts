import type { CardDefinition, PackDefinition } from "../game/types";
import { cardFactory } from "./author";
import { classicCards } from "./classics";
import { standardExpansionCards } from "./standard-expansion";
import { houseCards } from "./custom";

// The house collection: the supplied 40-card sample set, the classic / King's
// Cup basics, the voice/dice expansion, and every supplied Sheet1 house card —
// all under the always-included `core` pack. Cards with a `dice` definition
// pause the deck until the roll is resolved. Cheers, Idiots keeps its individual
// illustrated scene; everything else renders in the shared painted frame with
// its deterministic imprint.
const card = cardFactory("core");

export const sampleCards: CardDefinition[] = [
  card(
    "house-special",
    "House Special",
    "sip",
    "Drink 3.",
  ),
  card(
    "bar-tab",
    "Bar Tab",
    "sip",
    "Give 3.",
  ),
  card(
    "bad-influence",
    "Bad Influence",
    "sip",
    "Pick someone. Both drink 2.",
  ),
  card(
    "last-call",
    "Last Call",
    "group",
    "Everyone drinks 2.",
  ),
  card(
    "you-specifically",
    "Fuck You Specifically",
    "sip",
    "Pick someone. They drink 4.",
  ),
  card(
    "cheap-date",
    "Cheap Date",
    "group",
    "Cheapest drink at the table drinks 3.",
  ),
  card(
    "baller",
    "Big Money",
    "group",
    "Priciest drink at the table gives 4.",
  ),
  card(
    "group-project",
    "Group Project",
    "group",
    "Last hand in the air drinks 3.",
  ),
  card(
    "bad-text",
    "U Up?",
    "sip",
    "Sent a regrettable late-night text? Drink 3.",
  ),
  card(
    "hr-violation",
    "HR Violation",
    "sip",
    "Hooked up with a coworker? Drink 4.",
  ),
  card(
    "fake-sick",
    "Corporate Wellness",
    "sip",
    "Faked sick to skip work? Drink 3.",
  ),
  card(
    "crypto-bro",
    "Financial Genius",
    "sip",
    "Own crypto? Drink 2. Don't? Give 2.",
  ),
  card(
    "deez-nuts",
    "Deez Nuts",
    "challenge",
    "Get someone with a deez nuts joke. They drink 3.",
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
    {
      version: 1,
      count: 1,
      sides: 6,
      instruction: "Drink half your roll, rounded up.",
    },
  ),
  card(
    "give-a-shit",
    "Give a Shit",
    "challenge",
    "Roll d6. Give that many.",
    { version: 1, count: 1, sides: 6, instruction: "Give {total}." },
  ),
  card(
    "fuckin-math",
    "Fuckin' Math",
    "challenge",
    "Roll d6. Drink 7 minus your roll.",
    { version: 1, count: 1, sides: 6, instruction: "Drink 7 minus your roll." },
  ),
  card(
    "low-roller",
    "Pathetic",
    "challenge",
    "Roll d6. 1–2: drink 4. Else give 2.",
    {
      version: 1,
      count: 1,
      sides: 6,
      outcomes: [
        { min: 1, max: 2, instruction: "Drink 4." },
        { min: 3, max: 6, instruction: "Give 2." },
      ],
    },
  ),
  card(
    "high-roller",
    "Big Dick Energy",
    "challenge",
    "Roll d6. 5–6: give 5. Else drink 2.",
    {
      version: 1,
      count: 1,
      sides: 6,
      outcomes: [
        { min: 1, max: 4, instruction: "Drink 2." },
        { min: 5, max: 6, instruction: "Give 5." },
      ],
    },
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
      instruction: "Doubles: give {total}. Otherwise drink 3.",
    },
  ),
  card(
    "two-beers-math",
    "That's Two Beers",
    "challenge",
    "Roll 2d6. Give the total.",
    { version: 1, count: 2, sides: 6, instruction: "Give {total}." },
  ),
  card(
    "snake-eyes",
    "Snake Eyes",
    "challenge",
    "Roll 2d6. Double 1s: drink 6. Else give 3.",
    {
      version: 1,
      count: 2,
      sides: 6,
      outcomes: [
        { min: 2, max: 2, instruction: "Drink 6." },
        { min: 3, max: 12, instruction: "Give 3." },
      ],
    },
  ),
  card(
    "lucky-bastard",
    "Lucky Bastard",
    "challenge",
    "Roll 2d6. 9+: give 5. Under 9: drink 3.",
    {
      version: 1,
      count: 2,
      sides: 6,
      outcomes: [
        { min: 2, max: 8, instruction: "Drink 3." },
        { min: 9, max: 12, instruction: "Give 5." },
      ],
    },
  ),
  card(
    "fuck-around",
    "Fuck Around & Find Out",
    "challenge",
    "Roll d20. 1: drink 5. 20: give 8. Else drink 2.",
    {
      version: 1,
      count: 1,
      sides: 20,
      outcomes: [
        { min: 1, max: 1, instruction: "Drink 5." },
        { min: 2, max: 19, instruction: "Drink 2." },
        { min: 20, max: 20, instruction: "Give 8." },
      ],
    },
  ),
  card(
    "crit-fail",
    "Critical Failure",
    "challenge",
    "Roll d20. 1–5: drink 4. 16–20: give 4.",
    {
      version: 1,
      count: 1,
      sides: 20,
      instruction: "Roll 1–5: drink 4. Roll 16–20: give 4. Otherwise nothing.",
    },
  ),
  card(
    "chosen-one",
    "God's Drunkest Soldier",
    "challenge",
    "Roll d20. 20: everyone else drinks 3. 1: drink 5.",
    {
      version: 1,
      count: 1,
      sides: 20,
      instruction:
        "Roll 20: everyone else drinks 3. Roll 1: drink 5. Otherwise nothing.",
    },
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
    "questions-only",
    "Questions Only",
    "category",
    "Questions only. First statement drinks 3.",
  ),
  card(
    "name-3",
    "Name 3",
    "category",
    "Group picks a topic. Name 3 or drink 3.",
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
    "Make a rule until next card. Breaker drinks 2.",
  ),
  card(
    "no-names",
    "Who the Fuck Are You?",
    "rule",
    "Until next card: no names. Slip = drink 2.",
  ),
  card(
    "potty-mouth",
    "Church Mode",
    "rule",
    "Until next card: no swearing. Slip = drink 2.",
  ),
  card(
    "captain-dumbass",
    "Captain Dumbass",
    "rule",
    "Until next card: call everyone \u201cCaptain.\u201d Slip = drink 2.",
  ),
  card(
    "cursed-number",
    "Cursed Number",
    "rule",
    "Roll d6. That number is banned. Say it = drink 2.",
    {
      version: 1,
      count: 1,
      sides: 6,
      instruction: "{total} is banned. Say it: drink 2.",
    },
  ),
  card(
    "dice-lord",
    "Dice Lord",
    "rule",
    "Roll d6. Odd: no pointing. Even: no questions. Slip = drink 2.",
    {
      version: 1,
      count: 1,
      sides: 6,
      instruction: "Odd: no pointing. Even: no questions. Slip: drink 2.",
    },
  ),
];

// The always-included Core deck: the supplied sample set, the classic / King's
// Cup basics, the voice/dice expansion, and every supplied house row.
export const coreCards: CardDefinition[] = [
  ...sampleCards,
  ...classicCards,
  ...standardExpansionCards,
  ...houseCards,
];

export const samplePack: PackDefinition = {
  version: 1,
  id: "core",
  logo: "art/packs/core.svg",
  title: "The Core deck",
  description:
    "The always-on deck: sample prompts, King's Cup basics, the voice/dice expansion, and every supplied house card.",
  cardIds: coreCards.map((card) => card.id),
};
