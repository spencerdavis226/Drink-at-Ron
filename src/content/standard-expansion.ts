import type { CardDefinition, Category, DiceDefinition } from "../game/types";
import { cardFactory, roll, rollTable } from "./author";

/**
 * The standard Core expansion: original, dice-forward prompts written in the
 * blunt table voice of `docs/CARD_VOICE_REFERENCE.md` and the supplied Sheet1
 * cards. Replaces the earlier generic "drink 1" filler.
 *
 * Design rules for this file:
 * - One instruction per card; nobody tracks state between cards.
 * - Dice drive the amounts wherever possible (one to four d6/d20, total only).
 * - Pours are dice-sized: a rolled total is the pour, pass is always allowed,
 *   and any drink can be nonalcoholic.
 * - Keep it snarky and specific; avoid generic party-game boilerplate.
 *
 * Keep IDs stable: active sessions snapshot their text and order.
 *
 * The `Draft` tuple stays compact so ~114 cards remain reviewable in one file;
 * the optional fifth slot carries a structured `dice` definition.
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
    roll(1, 6, "Drink 7 minus your roll."),
  ],
  [
    "middle-management",
    "Middle Management",
    "challenge",
    "Roll d6. 1–2: drink 3. 3–4: give 3. 5–6: drink 3.",
    rollTable(1, 6, [
      { min: 1, max: 2, instruction: "Drink 3." },
      { min: 3, max: 4, instruction: "Give 3." },
      { min: 5, max: 6, instruction: "Drink 3." },
    ]),
  ],
  [
    "rock-bottom",
    "Rock Bottom",
    "challenge",
    "Roll d6. 1–2: drink 5. Else drink 1. Could be worse.",
    rollTable(1, 6, [
      { min: 1, max: 2, instruction: "Drink 5." },
      { min: 3, max: 6, instruction: "Drink 1." },
    ]),
  ],
  [
    "high-noon",
    "High Noon",
    "challenge",
    "Roll d6. 5–6: give 6. Else drink 2.",
    rollTable(1, 6, [
      { min: 1, max: 4, instruction: "Drink 2." },
      { min: 5, max: 6, instruction: "Give 6." },
    ]),
  ],
  [
    "even-money",
    "Even Money",
    "challenge",
    "Roll d6. Odd: drink 4. Even: give 4. The house wins.",
    roll(1, 6, "Odd: drink 4. Even: give 4."),
  ],
  [
    "ten-percent",
    "Ten Percent",
    "challenge",
    "Roll d6. Drink half your roll, rounded up. Tip included.",
    roll(1, 6, "Drink half your roll, rounded up."),
  ],
  [
    "pay-it-forward",
    "Pay It Forward",
    "challenge",
    "Roll d6. Give half your roll, rounded up. Be smug about it.",
    roll(1, 6, "Give half your roll, rounded up."),
  ],
  [
    "surcharge",
    "Surcharge",
    "challenge",
    "Roll d6. Drink that many. On a 6, drink 2 more.",
    roll(1, 6, "Drink {total}. On a 6, drink 2 more."),
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
    roll(2, 6, "A 7: give 7. Doubles: drink 4. Otherwise drink 2."),
  ],
  [
    "boxcars",
    "Boxcars",
    "challenge",
    "Roll 2d6. Double 6s: everyone else drinks 4.",
    roll(2, 6, "Double 6s: everyone else drinks 4. Otherwise nothing."),
  ],
  [
    "bad-start",
    "Bad Start",
    "challenge",
    "Roll 2d6. Double 1s: drink 6. Else give 3.",
    rollTable(2, 6, [
      { min: 2, max: 2, instruction: "Drink 6." },
      { min: 3, max: 12, instruction: "Give 3." },
    ]),
  ],
  [
    "double-digits",
    "Double Digits",
    "challenge",
    "Roll 2d6. 10 or more: give 6. Under 10: drink 3.",
    rollTable(2, 6, [
      { min: 2, max: 9, instruction: "Drink 3." },
      { min: 10, max: 12, instruction: "Give 6." },
    ]),
  ],
  [
    "crap-out",
    "Crap Out",
    "challenge",
    "Roll 2d6. 2, 3 or 12: drink 6. Else give 2.",
    rollTable(2, 6, [
      { min: 2, max: 3, instruction: "Drink 6." },
      { min: 4, max: 11, instruction: "Give 2." },
      { min: 12, max: 12, instruction: "Drink 6." },
    ]),
  ],
  [
    "split-the-pot",
    "Split the Pot",
    "challenge",
    "Roll 2d6. Give half, rounded up. Drink the rest.",
    roll(2, 6, "Give half the total, rounded up. Drink the rest."),
  ],
  [
    "house-edge",
    "House Edge",
    "challenge",
    "Roll 2d6. Drink the total minus 3, minimum 1.",
    roll(2, 6, "Drink {total} minus 3, at least 1."),
  ],
  [
    "cold-streak",
    "Cold Streak",
    "challenge",
    "Roll 2d6. 4 or less: drink 5. Else drink 1.",
    rollTable(2, 6, [
      { min: 2, max: 4, instruction: "Drink 5." },
      { min: 5, max: 12, instruction: "Drink 1." },
    ]),
  ],
  [
    "all-or-nothing",
    "All or Nothing",
    "challenge",
    "Roll 2d6. 12: give 12. Anything less: drink 2.",
    rollTable(2, 6, [
      { min: 2, max: 11, instruction: "Drink 2." },
      { min: 12, max: 12, instruction: "Give 12." },
    ]),
  ],
  [
    "table-stakes",
    "Table Stakes",
    "challenge",
    "Roll 2d6. 9+: give 5. Under 9: drink 3.",
    rollTable(2, 6, [
      { min: 2, max: 8, instruction: "Drink 3." },
      { min: 9, max: 12, instruction: "Give 5." },
    ]),
  ],
  [
    "samesies",
    "Samesies",
    "challenge",
    "Roll 2d6. Doubles: give the total. Else drink half.",
    roll(2, 6, "Doubles: give {total}. Otherwise drink half, rounded up."),
  ],
  [
    "double-down",
    "Double Down",
    "challenge",
    "Roll 2d6. Doubles: drink 5. Else give 3.",
    roll(2, 6, "Doubles: drink 5. Otherwise give 3."),
  ],

  // --- Dice: d20 drama ------------------------------------------------------
  [
    "nat-one",
    "Nat One",
    "challenge",
    "Roll d20. A 1: finish your drink. Else drink 3.",
    roll(1, 20, "A 1: finish your drink. Otherwise drink 3."),
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
    "coin-flip",
    "Coin Flip",
    "challenge",
    "Roll d20. 11+: give 4. 10 or less: drink 4.",
    rollTable(1, 20, [
      { min: 1, max: 10, instruction: "Drink 4." },
      { min: 11, max: 20, instruction: "Give 4." },
    ]),
  ],
  [
    "the-gods-decide",
    "The Gods Decide",
    "challenge",
    "Roll d20. 10 or more: everyone else drinks 3. Else drink 4.",
    rollTable(1, 20, [
      { min: 1, max: 9, instruction: "Drink 4." },
      { min: 10, max: 20, instruction: "Everyone else drinks 3." },
    ]),
  ],
  [
    "percentage-tax",
    "Percentage Tax",
    "challenge",
    "Roll d20. Drink 21 minus your roll. Show your work.",
    roll(1, 20, "Drink 21 minus your roll."),
  ],
  [
    "long-shot",
    "Long Shot",
    "challenge",
    "Roll d20. 19–20: give 8. Else drink 2.",
    rollTable(1, 20, [
      { min: 1, max: 18, instruction: "Drink 2." },
      { min: 19, max: 20, instruction: "Give 8." },
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
    "the-swing",
    "The Swing",
    "challenge",
    "Roll d20. Under 10: drink half. 10+: give half.",
    roll(1, 20, "Under 10: drink half, rounded up. 10+: give half, rounded up."),
  ],
  [
    "game-of-chance",
    "Game of Chance",
    "challenge",
    "Roll d20. Odd: give 5. Even: drink 5.",
    roll(1, 20, "Odd: give 5. Even: drink 5."),
  ],
  [
    "triple-threat",
    "Triple Threat",
    "challenge",
    "Roll 3d6. Give the total, capped at 9.",
    roll(3, 6, "Give {total}, capped at 9."),
  ],
  [
    "three-dice-deep",
    "Three Dice Deep",
    "challenge",
    "Roll 3d6. Drink half the total, rounded down.",
    roll(3, 6, "Drink half the total, rounded down."),
  ],
  [
    "prison-rules",
    "Prison Rules",
    "challenge",
    "Roll 3d6. Triple 1s: drink 9. Else drink 2.",
    rollTable(3, 6, [
      { min: 3, max: 3, instruction: "Drink 9." },
      { min: 4, max: 18, instruction: "Drink 2." },
    ]),
  ],
  [
    "full-house",
    "Full House",
    "challenge",
    "Roll 3d6. All three match: give 12. Else drink 3.",
    roll(3, 6, "All three match: give 12. Otherwise drink 3."),
  ],
  [
    "overdrive",
    "Overdrive",
    "challenge",
    "Roll 4d6. Even total: give 6. Odd total: drink 6.",
    roll(4, 6, "Even total: give 6. Odd total: drink 6."),
  ],

  // --- Dice: whole-table ----------------------------------------------------
  [
    "round-for-the-table",
    "Round for the Table",
    "group",
    "Roll d6. Everyone drinks your roll. You just watch.",
    roll(1, 6, "Everyone but you drinks {total}."),
  ],
  [
    "potluck",
    "Potluck",
    "group",
    "Roll 2d6. Everyone drinks half the total, rounded up.",
    roll(2, 6, "Everyone drinks half the total, rounded up."),
  ],
  [
    "table-tax",
    "Table Tax",
    "group",
    "Roll d6. Everyone else drinks your roll. Toast them.",
    roll(1, 6, "Everyone else drinks {total}."),
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
    "snake-pit",
    "Snake Pit",
    "group",
    "Roll 2d6. Doubles: everyone drinks 2. Else only you do.",
    roll(2, 6, "Doubles: everyone drinks 2. Otherwise you drink 2."),
  ],
  [
    "committee",
    "Committee",
    "group",
    "Roll d6. Point at that many people. Each drinks 1.",
    roll(1, 6, "Point at {total} players to drink 1 each."),
  ],
  [
    "last-call-roll",
    "Last Call Roll",
    "group",
    "Roll d6. Everyone toasts and drinks your roll.",
    roll(1, 6, "Everyone toasts and drinks {total}."),
  ],
  [
    "crowd-surf",
    "Crowd Surf",
    "group",
    "Roll d6. Give that many total, split however you like.",
    roll(1, 6, "Give {total} total, split however you like."),
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
    "lucky-charm-rule",
    "Lucky Charm",
    "rule",
    "Roll d6. That number is lucky. Say it: give 1.",
    roll(1, 6, "{total} is lucky. Say it: give 1."),
  ],
  [
    "parity",
    "Parity",
    "rule",
    "Roll d6. Even: drink left-handed. Odd: no names. Slip: drink 2.",
    roll(1, 6, "Even: drink left-handed. Odd: no names. Slip: drink 2."),
  ],
  [
    "trick-die",
    "Trick Die",
    "rule",
    "Roll d6. 1–3: no pointing. 4–6: no questions. Slip: drink 2.",
    rollTable(1, 6, [
      { min: 1, max: 3, instruction: "No pointing. Slip: drink 2." },
      { min: 4, max: 6, instruction: "No questions. Slip: drink 2." },
    ]),
  ],
  [
    "heavy-hand",
    "Heavy Hand",
    "rule",
    "Roll d6. All drinks are doubled until the next card.",
    roll(1, 6, "Double every drink until the next card."),
  ],
  [
    "roll-with-it",
    "Roll With It",
    "rule",
    "Roll d6. That number is unlucky. Roll it again later and drink 3.",
    roll(1, 6, "{total} is unlucky. Mention it and drink 3."),
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
    "do-better",
    "Do Better",
    "sip",
    "Drink 1 more than the last person drank. Blame them.",
  ],
  [
    "get-good",
    "Get Good",
    "challenge",
    "Insult someone's skills. They prove you wrong or drink 3.",
  ],
  [
    "another-one",
    "Another One",
    "sip",
    "Drink the last amount you drank, then 1 more.",
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
    "call-out-overpack",
    "Call Out",
    "group",
    "Who overpacks for one night? They drink 3.",
  ],
  [
    "call-out-ghost",
    "Ghosted the Chat",
    "group",
    "Who reads the group chat and never replies? They drink 3.",
  ],
  [
    "call-out-notes",
    "Notes App Menace",
    "group",
    "Who lives in their notes app? They drink 3.",
  ],
  [
    "damn-youre-old",
    "Damn, You're Old",
    "group",
    "Oldest drinks 3. Youngest gives 1 for the disrespect.",
  ],
  [
    "big-baby",
    "Big Baby",
    "group",
    "Youngest drinks 2. Oldest gives 1 for the disrespect.",
  ],
  [
    "nicetitties",
    "Nicetitties",
    "challenge",
    "Genuinely compliment the player on your right. Sincerity or sip twice.",
  ],
  [
    "still-single",
    "Still Single",
    "group",
    "Anyone single drinks 2. Everyone partnered gives 1.",
  ],
  [
    "power-couple",
    "Power Couple",
    "group",
    "Anyone partnered drinks 2. Singles give 1.",
  ],
  [
    "the-cino",
    "The Cino",
    "group",
    "Ever lost money gambling? Drink 3. Still up? Give 2.",
  ],
  [
    "first-class",
    "First Class",
    "group",
    "Flown first class? Drink 2 and brag. Everyone else gives 1.",
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
    "weatherman",
    "Weatherman",
    "challenge",
    "Give tonight's forecast. If it's wrong by last call, drink 3.",
  ],
  [
    "happy-holidays",
    "Happy Holidays",
    "challenge",
    "Invent a holiday in ten seconds. Flop: drink 3.",
  ],
  [
    "tin-hat",
    "Tin Hat",
    "challenge",
    "Share a conspiracy you half-believe. Table votes: pass or drink 3.",
  ],
  [
    "debate-club",
    "Debate Club",
    "challenge",
    "Defend an opinion nobody shares. Lose the vote: drink 3.",
  ],
  [
    "stare-off",
    "Stare Down",
    "challenge",
    "Stare down a rival. First to laugh drinks 3.",
  ],
  [
    "thumb-battle",
    "Thumb War",
    "challenge",
    "Thumb war someone. Loser drinks 3.",
  ],
  [
    "best-of-three",
    "Best of Three",
    "challenge",
    "Best-of-three rock-paper-scissors. Loser drinks 4.",
  ],
  [
    "knowledge-gap",
    "Knowledge Gap",
    "challenge",
    "Name five of anything the table picks. Miss: drink 3.",
  ],
  [
    "late-night-text",
    "U Up?",
    "challenge",
    "Read your last late-night text aloud. Refuse: drink 4.",
  ],
  [
    "corporate-wellness",
    "Corporate Wellness",
    "challenge",
    "Faked sick to skip work? Drink 3. Honest? Give 2.",
  ],
  [
    "hr-hazard",
    "HR Violation",
    "challenge",
    "Hooked up with a coworker? Drink 4. HR is watching.",
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
    "hockey-guys",
    "Hockey Guys",
    "category",
    "Name hockey players. First repeat or blank drinks 3.",
  ],
  [
    "name-those-pokemon",
    "Name Those Pokémon",
    "category",
    "Name Pokémon. First repeat or blank drinks 3.",
  ],
  [
    "trilogies",
    "Trilogies",
    "category",
    "Name movie trilogies. First repeat or blank drinks 3.",
  ],
  [
    "taco-bell-menu",
    "Taco Bell Menu",
    "category",
    "Name Taco Bell items. First repeat or blank drinks 3.",
  ],
  [
    "things-you-lick",
    "Things You Lick",
    "category",
    "Name things you lick. First repeat or blank drinks 3.",
  ],
  [
    "us-capitals",
    "US Capitals",
    "category",
    "Name US capitals. First repeat or blank drinks 3.",
  ],
  [
    "kitchen-things",
    "Kitchen Things",
    "category",
    "Name things in a kitchen. First repeat or blank drinks 3.",
  ],
  [
    "never-say-to-cops",
    "Never Say This",
    "category",
    "Name things you never say to a cop. First repeat or blank drinks 3.",
  ],
  [
    "animated-movies",
    "Animated Movies",
    "category",
    "Name animated movies. First repeat or blank drinks 3.",
  ],
  [
    "reality-tv",
    "Reality TV",
    "category",
    "Name reality shows. First repeat or blank drinks 3.",
  ],
  [
    "freddies-sales",
    "Freddies Sales",
    "category",
    "Name things on sale at Freddie's. First repeat or blank drinks 3.",
  ],
  [
    "creepy-crawlies",
    "Creepy Crawlies",
    "category",
    "Name bugs. First repeat or blank drinks 3.",
  ],

  // --- Temporary rules ------------------------------------------------------
  [
    "hands-off",
    "Hands Off",
    "rule",
    "Until next card: no hands to drink. Slip: drink 2.",
  ],
  [
    "banana-peel",
    "Banana Peel",
    "rule",
    "Until next card: peel your drink like a banana. Slip: drink 2.",
  ],
  [
    "beer-ban",
    "Beer Ban",
    "rule",
    "Until next card: say beer and drink 2.",
  ],
  [
    "t-rex-arms",
    "T-Rex Arms",
    "rule",
    "Until next card: tiny T-rex arms. Slip: drink 2.",
  ],
  [
    "first-name-only",
    "First Name Only",
    "rule",
    "Until next card: first names only. Slip: drink 2.",
  ],
  [
    "high-lord",
    "High Lord",
    "rule",
    "Until next card: speak like a fantasy lord. Slip: drink 2.",
  ],
  [
    "last-names-only",
    "Last Names Only",
    "rule",
    "Until next card: last names only. Slip: drink 2.",
  ],
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
  [
    "copycat",
    "Copycat",
    "rule",
    "Until next card: copy whoever drank last. Slip: drink 2.",
  ],
];

export const standardExpansionCards: CardDefinition[] = drafts.map(
  ([id, title, category, rules, dice]) =>
    card(id, title, category, rules, dice),
);
