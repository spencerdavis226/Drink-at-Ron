import type { CardDefinition, Category, DiceDefinition } from "../game/types";
import { cardFactory, roll, rollTable } from "./author";

/**
 * The generated standard deck: original, dice-forward prompts in the blunt
 * table voice. This pass cut the file hard — every card here either rolls dice
 * with an exact computed result, or does something no other card does. The
 * near-identical d6 branch tables, duplicate call-outs, duplicate categories
 * and gimmick temporary rules were removed.
 *
 * Design rules for this file:
 * - One instruction per card; nobody tracks state between cards.
 * - Dice drive the amounts wherever possible (one to four d6/d20, total only).
 * - Every dice card resolves to an exact instruction; no odds/evens or
 *   "otherwise" logic is left for the table to work out.
 * - Keep it snarky and specific; avoid generic party-game boilerplate.
 *
 * Keep IDs stable: active sessions snapshot their text and order.
 */
type Draft = [
  id: string,
  title: string,
  category: Category,
  rules: string,
  dice?: DiceDefinition,
];
const card = cardFactory("core");

const drafts: Draft[] = [
  // --- Dice: straight pours -------------------------------------------------
  [
    "empty-the-tank",
    "Empty the Tank",
    "sip",
    "Roll d6. Drink your roll. The die knows what you did.",
    roll(1, 6, "Drink {total}."),
  ],
  [
    "pay-your-tab",
    "Pay Your Tab",
    "challenge",
    "Roll d6. Give your roll to anyone. No takebacks, no crying.",
    roll(1, 6, "Give {total}."),
  ],
  [
    "dice-debt",
    "Dice Debt",
    "challenge",
    "Roll d6. Drink 7 minus your roll. Show your work.",
    rollTable(1, 6, [
      { min: 1, max: 1, instruction: "Drink 6." },
      { min: 2, max: 2, instruction: "Drink 5." },
      { min: 3, max: 3, instruction: "Drink 4." },
      { min: 4, max: 4, instruction: "Drink 3." },
      { min: 5, max: 5, instruction: "Drink 2." },
      { min: 6, max: 6, instruction: "Drink 1." },
    ]),
  ],
  [
    "loose-change",
    "Loose Change",
    "sip",
    "Roll d6. Give that many, split between two people.",
    roll(1, 6, "Give {total}, split between two people."),
  ],
  [
    "big-spender",
    "Big Spender",
    "sip",
    "Roll 2d6. Give the total. Announce it like it's charity.",
    roll(2, 6, "Give {total}."),
  ],

  // --- Dice: 2d6 gambles ----------------------------------------------------
  [
    "lucky-sevens",
    "Lucky Sevens",
    "challenge",
    "Roll 2d6. A 7: give 7. Doubles: drink 4. Else drink 2.",
    {
      version: 1,
      count: 2,
      sides: 6,
      doubles: "Drink 4.",
      outcomes: [
        { min: 2, max: 6, instruction: "Drink 2." },
        { min: 7, max: 7, instruction: "Give 7." },
        { min: 8, max: 12, instruction: "Drink 2." },
      ],
    },
  ],
  [
    "boxcars",
    "Boxcars",
    "challenge",
    "Roll 2d6. Double 6s: everyone else drinks 4.",
    rollTable(2, 6, [
      { min: 2, max: 11, instruction: "Nothing happens." },
      { min: 12, max: 12, instruction: "Everyone else drinks 4." },
    ]),
  ],
  [
    "samesies",
    "Samesies",
    "challenge",
    "Roll 2d6. Doubles: give the total. Else drink half.",
    {
      version: 1,
      count: 2,
      sides: 6,
      doubles: "Give {total}.",
      outcomes: [
        { min: 2, max: 2, instruction: "Drink 1." },
        { min: 3, max: 4, instruction: "Drink 2." },
        { min: 5, max: 6, instruction: "Drink 3." },
        { min: 7, max: 8, instruction: "Drink 4." },
        { min: 9, max: 10, instruction: "Drink 5." },
        { min: 11, max: 12, instruction: "Drink 6." },
      ],
    },
  ],

  // --- Dice: d20 drama ------------------------------------------------------
  [
    "nat-one",
    "Nat One",
    "challenge",
    "Roll d20. A 1: finish your drink. Else drink 3.",
    rollTable(1, 20, [
      { min: 1, max: 1, instruction: "Finish your drink." },
      { min: 2, max: 20, instruction: "Drink 3." },
    ]),
  ],
  [
    "nat-twenty",
    "Nat Twenty",
    "challenge",
    "Roll d20. A 20: give 8. Else drink 2.",
    rollTable(1, 20, [
      { min: 1, max: 19, instruction: "Drink 2." },
      { min: 20, max: 20, instruction: "Give 8." },
    ]),
  ],
  [
    "close-call",
    "Close Call",
    "challenge",
    "Roll d20. 1–5: drink 5. 16–20: give 5. Else nothing.",
    rollTable(1, 20, [
      { min: 1, max: 5, instruction: "Drink 5." },
      { min: 6, max: 15, instruction: "Nothing happens." },
      { min: 16, max: 20, instruction: "Give 5." },
    ]),
  ],
  [
    "skyscraper",
    "Skyscraper",
    "challenge",
    "Roll d20. A 20: give 10. A 1: drink 10. Else drink 2.",
    rollTable(1, 20, [
      { min: 1, max: 1, instruction: "Drink 10." },
      { min: 2, max: 19, instruction: "Drink 2." },
      { min: 20, max: 20, instruction: "Give 10." },
    ]),
  ],
  [
    "overdrive",
    "Overdrive",
    "challenge",
    "Roll 4d6. Even total: give 6. Odd total: drink 6.",
    rollTable(4, 6, [
      { min: 4, max: 24, step: 2, instruction: "Give 6." },
      { min: 5, max: 23, step: 2, instruction: "Drink 6." },
    ]),
  ],

  // --- Dice: whole table ----------------------------------------------------
  [
    "round-for-the-table",
    "Round for the Table",
    "group",
    "Roll d6. Everyone drinks your roll. You just watch.",
    roll(1, 6, "Everyone but you drinks {total}."),
  ],
  [
    "group-roll",
    "Group Roll",
    "group",
    "Roll d20. 10+: everyone gives you 1. Else everyone drinks 1.",
    rollTable(1, 20, [
      { min: 1, max: 9, instruction: "Everyone drinks 1." },
      { min: 10, max: 20, instruction: "Everyone gives you 1." },
    ]),
  ],
  [
    "committee",
    "Committee",
    "group",
    "Roll d6. Point at that many people. Each drinks 1.",
    roll(1, 6, "Point at {total} players to drink 1 each."),
  ],

  // --- Dice: temporary rules ------------------------------------------------
  [
    "banned-number",
    "Banned Number",
    "rule",
    "Roll d6. Nobody may say it. Slip: drink 3.",
    roll(1, 6, "{total} is banned. Say it: drink 3."),
  ],
  [
    "heavy-hand",
    "Heavy Hand",
    "rule",
    "Roll d6. All drinks are doubled until the next card.",
    roll(1, 6, "Double every drink until the next card."),
  ],

  // --- Callouts: blunt, personal, specific ----------------------------------
  [
    "i-dont-know-shit",
    "I Don't Know Shit",
    "challenge",
    "Admit something basic you don't understand. Everyone drinks 2.",
  ],
  [
    "almost-lost-my-cool",
    "Almost Lost My Cool",
    "challenge",
    "If someone here is mad, calm them and give 3. Else rage and drink 3.",
  ],
  [
    "what-an-idiot",
    "What an Idiot",
    "challenge",
    "Call someone an idiot. They give 3, or you drink 3.",
  ],
  [
    "get-good",
    "Get Good",
    "challenge",
    "Insult someone's skills. They prove you wrong or drink 3.",
  ],
  [
    "for-safety",
    "For Safety",
    "sip",
    "Your next drink is water. Announce it like a heroic choice.",
  ],
  [
    "its-gotta-go",
    "It's Gotta Go",
    "challenge",
    "Finish your drink. Or pass and drink 3.",
  ],
  [
    "thanos-snap",
    "Thanos Snap",
    "group",
    "Pick half the table. Everyone picked drinks 2.",
  ],
  [
    "accent-off",
    "Accent Off",
    "challenge",
    "Talk in an accent. If you laugh first, drink 2.",
  ],
  [
    "loud-and-proud",
    "Loud and Proud",
    "challenge",
    "Say your next sentence too loud. If it lands, give 2.",
  ],
  [
    "useless-fact",
    "Useless Fact",
    "challenge",
    "Share an impressive useless fact. If nobody reacts, drink 2.",
  ],
  [
    "the-receipt",
    "The Receipt",
    "challenge",
    "Read your last purchase aloud. Cringe? Drink 3.",
  ],
  [
    "gym-class",
    "Gym Class",
    "challenge",
    "Ten jumping jacks or drink 3. No negotiation.",
  ],
  [
    "runway",
    "Runway",
    "challenge",
    "Do a runway walk. Table scores it: under 7, drink 3.",
  ],
  [
    "debate-club",
    "Debate Club",
    "challenge",
    "Defend an opinion nobody shares. Lose the vote: drink 3.",
  ],

  // --- Categories with teeth ------------------------------------------------
  [
    "bad-baby-names",
    "Bad Baby Names",
    "category",
    "Name terrible baby names. First repeat or blank drinks 3.",
  ],
  [
    "ex-cuses",
    "Ex-Cuses",
    "category",
    "Name an ex. First repeat, blank or cringe drinks 3.",
  ],
  [
    "cheap-beers",
    "Cheap Beers",
    "category",
    "Name cheap beers. First repeat or blank drinks 3.",
  ],
  [
    "creepy-crawlies",
    "Creepy Crawlies",
    "category",
    "Name bugs. First repeat or blank drinks 3.",
  ],

  // --- Temporary rules ------------------------------------------------------
  [
    "personal-space",
    "Personal Space",
    "rule",
    "Until next card: sit on your own hands. Slip: drink 2.",
  ],
  [
    "formal-night",
    "Formal Night",
    "rule",
    "Until next card: address everyone as my liege. Slip: drink 2.",
  ],
];

export const standardExpansionCards: CardDefinition[] = drafts.map(
  ([id, title, category, rules, dice]) =>
    card(id, title, category, rules, dice),
);
