import type { CardDefinition, DiceDefinition } from "../game/types";
import { cardFactory, choice, rollTable } from "./author";

// Pokémon League mode only: the 24 gym leaders of Kanto, Johto and Hoenn and
// the League finale. None of these is in the regular Pokémon deck; the mode
// adds them (`quest.cardIds`). Every leader earns the table a badge when the
// card is put aside, win or lose, so the challenge is the price of the badge:
// most battles are lost more often than won, and losing costs real drinks.
// Written for this mode at the owner's request (2026-10-05); they replace the
// gentler leader cards that came from the supplied board sheets.
const card = cardFactory("pokemon");

const leader = (
  id: string,
  name: string,
  badge: string,
  rules: string,
  dice?: DiceDefinition,
): CardDefinition => ({
  ...card(`gym-${id}`, name, "challenge", rules, dice),
  quest: "pokemon",
  ribbon: `Gym Leader · ${badge} Badge`,
});

// d6/d20 helpers for "drink half, rounded up" and "roll plus N".
const half = (count: number, sides: 6 | 20) =>
  rollTable(
    count,
    sides,
    Array.from({ length: count * sides - count + 1 }, (_, i) => {
      const total = i + count;
      return {
        min: total,
        max: total,
        instruction: `Drink ${Math.ceil(total / 2)}.`,
      };
    }),
  );

export const gymLeaders: CardDefinition[] = [
  // --- Kanto -------------------------------------------------------------------
  leader(
    "brock",
    "Brock",
    "Boulder",
    "Brock's Onix won't budge. Roll d20. 1–12: drink 5. 13–19: drink 2. 20: give 6.",
    rollTable(1, 20, [
      { min: 1, max: 12, instruction: "Onix flattens you. Drink 5." },
      { min: 13, max: 19, instruction: "You chip through. Drink 2." },
      { min: 20, max: 20, instruction: "Critical hit. Give 6." },
    ]),
  ),
  leader(
    "misty",
    "Misty",
    "Cascade",
    "Start a waterfall. You can't stop until everyone else has, then drink 2 more.",
  ),
  leader(
    "lt-surge",
    "Lt. Surge",
    "Thunder",
    "Roll 2d6. Matching dice: finish your drink. Under 8: drink 4. 8 or more: give 4.",
    {
      ...rollTable(2, 6, [
        { min: 2, max: 7, instruction: "Shocked. Drink 4." },
        { min: 8, max: 12, instruction: "You ground him. Give 4." },
      ]),
      doubles: "Paralyzed. Finish your drink.",
    },
  ),
  leader(
    "erika",
    "Erika",
    "Rainbow",
    "Sleep Powder: eyes shut until your next turn. Roll d6 and drink it plus 2.",
    rollTable(
      1,
      6,
      [1, 2, 3, 4, 5, 6].map((n) => ({
        min: n,
        max: n,
        instruction: `Drink ${n + 2}, eyes shut.`,
      })),
    ),
  ),
  leader(
    "koga",
    "Koga",
    "Soul",
    "Toxic. Drink 3 now. Until your next turn, drink 1 every time anyone else drinks.",
  ),
  leader(
    "sabrina",
    "Sabrina",
    "Marsh",
    "Answer 3 yes-or-no questions from the table. Any pause or lie: drink 3.",
  ),
  leader(
    "blaine",
    "Blaine",
    "Volcano",
    "Quiz time! The table asks you 3 trivia questions. Each miss: drink 3. All right: give 6.",
  ),
  leader(
    "giovanni",
    "Giovanni",
    "Earth",
    "The boss. Roll d20. 1–10: a shot and 3 more. 11–19: drink 4. 20: everyone else finishes.",
    rollTable(1, 20, [
      {
        min: 1,
        max: 10,
        instruction: "Team Rocket wins. Take a shot and drink 3.",
      },
      { min: 11, max: 19, instruction: "You scrape by. Drink 4." },
      {
        min: 20,
        max: 20,
        instruction: "You beat the boss. Everyone else finishes their drink.",
      },
    ]),
  ),

  // --- Johto -------------------------------------------------------------------
  leader(
    "falkner",
    "Falkner",
    "Zephyr",
    "Stand on one foot until your next turn. Each time you touch down: drink 3.",
  ),
  leader(
    "bugsy",
    "Bugsy",
    "Hive",
    "Bug swarm. Roll 3d6 and drink half the total, rounded up.",
    half(3, 6),
  ),
  leader(
    "whitney",
    "Whitney",
    "Plain",
    "Miltank's Rollout. Roll d6. 1: drink 1. 2: 3. 3: 6. 4: 10. 5–6: Whitney cries; give 5.",
    rollTable(1, 6, [
      { min: 1, max: 1, instruction: "Rollout hits once. Drink 1." },
      { min: 2, max: 2, instruction: "Rollout hits twice. Drink 3." },
      { min: 3, max: 3, instruction: "Three hits. Drink 6." },
      { min: 4, max: 4, instruction: "Four hits. Drink 10." },
      { min: 5, max: 6, instruction: "Whitney bursts into tears. Give 5." },
    ]),
  ),
  leader(
    "morty",
    "Morty",
    "Fog",
    "Curse. Drink 2 now. Until your next turn, drink 2 whenever anyone says your name.",
  ),
  leader(
    "chuck",
    "Chuck",
    "Storm",
    "Arm-wrestle the strongest player. Loser drinks 6. If they refuse, they drink 6.",
  ),
  leader(
    "jasmine",
    "Jasmine",
    "Mineral",
    "Hold a full drink at arm's length for 30 seconds. Lower it: finish it. Make it: give 4.",
  ),
  leader(
    "pryce",
    "Pryce",
    "Glacier",
    "Chug a glass of ice water, or roll d20 and drink half, rounded up.",
    choice(half(1, 20), "Chugged it", "Roll"),
  ),
  leader(
    "clair",
    "Clair",
    "Rising",
    "Dragon battle. Roll 2d6. Under 9: drink the total. 9 or more: give the total.",
    rollTable(2, 6, [
      { min: 2, max: 8, instruction: "Dragonbreath. Drink {total}." },
      { min: 9, max: 12, instruction: "You tame the dragon. Give {total}." },
    ]),
  ),

  // --- Hoenn -------------------------------------------------------------------
  leader(
    "roxanne",
    "Roxanne",
    "Stone",
    "Name 8 Pokémon types in 10 seconds. Drink 2 for each one you miss.",
  ),
  leader(
    "brawly",
    "Brawly",
    "Knuckle",
    "Ten push-ups, or roll d20 and drink half, rounded up.",
    choice(half(1, 20), "Did them", "Roll"),
  ),
  leader(
    "wattson",
    "Wattson",
    "Dynamo",
    "Wahahaha! Roll 2d6 and drink the total. Matching dice: everyone else drinks it instead.",
    {
      ...rollTable(2, 6, [
        { min: 2, max: 12, instruction: "Shocked. Drink {total}." },
      ]),
      doubles: "Overcharge. Everyone else drinks {total}.",
    },
  ),
  leader(
    "flannery",
    "Flannery",
    "Heat",
    "Roll d6. 1–4: take a high-proof or spicy shot. 5–6: give a shot.",
    rollTable(1, 6, [
      {
        min: 1,
        max: 4,
        instruction: "Burned. Take a high-proof or spicy shot.",
      },
      { min: 5, max: 6, instruction: "You douse her. Give a shot." },
    ]),
  ),
  leader(
    "norman",
    "Norman",
    "Balance",
    "Drink 4 and call the player on your left Dad for the rest of the game. Refuse: drink 8.",
  ),
  leader(
    "winona",
    "Winona",
    "Feather",
    "Drink 4 standing on a chair. Stay up until your next turn or finish your drink.",
  ),
  leader(
    "tate-liza",
    "Tate & Liza",
    "Mind",
    "Pick a partner. Roll 2d6. Matching: both give 8. Under 8: both drink 5. Over: both drink 2.",
    {
      ...rollTable(2, 6, [
        { min: 2, max: 7, instruction: "They outmatch you. You both drink 5." },
        {
          min: 8,
          max: 12,
          instruction: "You hold them off. You both drink 2.",
        },
      ]),
      doubles: "Perfect sync. You both give 8.",
    },
  ),
  leader(
    "wallace",
    "Wallace",
    "Rain",
    "Cross the room heel to toe, drink balanced on your head. Spill or wobble: finish it.",
  ),
];

// The finale: dealt when the table earns its eighth badge, never shuffled.
export const league = card(
  "league",
  "Pokémon League",
  "challenge",
  "Eight badges! The whole table takes on the Champion. Roll d20.",
  rollTable(1, 20, [
    {
      min: 1,
      max: 5,
      instruction: "The Champion sweeps. Everyone finishes their drink.",
    },
    { min: 6, max: 12, instruction: "A close fight. Everyone drinks 3." },
    {
      min: 13,
      max: 19,
      instruction: "Victory! Hand out 5 drinks while everyone toasts you.",
    },
    {
      min: 20,
      max: 20,
      instruction: "Hall of Fame. Make a rule for the rest of the game.",
    },
  ]),
);
