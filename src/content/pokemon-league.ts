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

// --- The League gauntlet ------------------------------------------------------
// After the eighth badge: one Legendary, four of the Elite Four, then the
// Champion, each picked at random when the game starts and dealt one at a
// time. None is ever shuffled into the deck. Beating the Champion ends the
// game.

const finale = (
  id: string,
  name: string,
  ribbon: string,
  rules: string,
  dice?: DiceDefinition,
): CardDefinition => ({
  ...card(id, name, "challenge", rules, dice),
  ribbon,
});

const legendary = (
  id: string,
  name: string,
  rules: string,
  dice?: DiceDefinition,
) => finale(`legendary-${id}`, name, "Legendary Encounter", rules, dice);

export const legendaries: CardDefinition[] = [
  legendary(
    "articuno",
    "Articuno",
    "Blizzard hits the table. Roll d20. 1–13: everyone drinks 3. 14–20: caught; give 8.",
    rollTable(1, 20, [
      { min: 1, max: 13, instruction: "Frozen. Everyone drinks 3." },
      { min: 14, max: 20, instruction: "Caught! Give 8." },
    ]),
  ),
  legendary(
    "zapdos",
    "Zapdos",
    "Thunder. Roll 2d6. Under 9: you and both neighbors drink the total. 9 or more: caught.",
    rollTable(2, 6, [
      {
        min: 2,
        max: 8,
        instruction: "Struck. You and both neighbors drink {total}.",
      },
      { min: 9, max: 12, instruction: "Caught! Give {total}." },
    ]),
  ),
  legendary(
    "moltres",
    "Moltres",
    "Sky Attack. Roll d20. 1–12: take a high-proof shot. 13–20: caught; give a shot.",
    rollTable(1, 20, [
      { min: 1, max: 12, instruction: "Scorched. Take a high-proof shot." },
      { min: 13, max: 20, instruction: "Caught! Give a shot." },
    ]),
  ),
  legendary(
    "mewtwo",
    "Mewtwo",
    "Psystrike. Roll d20. 1–15: finish your drink. 16–19: drink 4. 20: caught.",
    rollTable(1, 20, [
      { min: 1, max: 15, instruction: "Overpowered. Finish your drink." },
      { min: 16, max: 19, instruction: "You hold on. Drink 4." },
      {
        min: 20,
        max: 20,
        instruction: "Caught! Everyone else finishes their drink.",
      },
    ]),
  ),
  legendary(
    "lugia",
    "Lugia",
    "Roll d20: everyone drinks that many seconds. 20: caught; you're spared.",
    rollTable(1, 20, [
      {
        min: 1,
        max: 19,
        instruction: "Everyone drinks for {total} seconds.",
      },
      {
        min: 20,
        max: 20,
        instruction: "Caught! Everyone else drinks for 20 seconds.",
      },
    ]),
  ),
  legendary(
    "ho-oh",
    "Ho-Oh",
    "Sacred Fire. Roll d6. Drink that many, then give twice that.",
    rollTable(
      1,
      6,
      [1, 2, 3, 4, 5, 6].map((n) => ({
        min: n,
        max: n,
        instruction: `Drink ${n}, then give ${n * 2}.`,
      })),
    ),
  ),
  legendary(
    "eon-duo",
    "Latias & Latios",
    "Pick a partner. Roll 2d6. Matching dice: caught; both give 10. Else both drink half.",
    {
      ...rollTable(
        2,
        6,
        Array.from({ length: 11 }, (_, i) => ({
          min: i + 2,
          max: i + 2,
          instruction: `They slip away. You both drink ${Math.ceil((i + 2) / 2)}.`,
        })),
      ),
      doubles: "Caught both! You both give 10.",
    },
  ),
  legendary(
    "deoxys",
    "Deoxys",
    "Psycho Boost. Roll d20. 1–10: drink 6. 11–19: drink 3. 20: caught; give 10.",
    rollTable(1, 20, [
      { min: 1, max: 10, instruction: "Psycho Boost lands. Drink 6." },
      { min: 11, max: 19, instruction: "Glancing blow. Drink 3." },
      { min: 20, max: 20, instruction: "Caught! Give 10." },
    ]),
  ),
];

const eliteFour = (
  id: string,
  name: string,
  type: string,
  rules: string,
  dice?: DiceDefinition,
) => finale(`elite-${id}`, name, `Elite Four · ${type}`, rules, dice);

export const eliteFourMembers: CardDefinition[] = [
  eliteFour(
    "lorelei",
    "Lorelei",
    "Ice",
    "Chug a glass of ice water, then roll d6 and drink that many.",
    rollTable(
      1,
      6,
      [1, 2, 3, 4, 5, 6].map((n) => ({
        min: n,
        max: n,
        instruction: `Brain freeze. Drink ${n}.`,
      })),
    ),
  ),
  eliteFour(
    "bruno",
    "Bruno",
    "Fighting",
    "Arm-wrestle the two strongest players back to back. Each loss: drink 5.",
  ),
  eliteFour(
    "agatha",
    "Agatha",
    "Ghost",
    "Drink 3. Until your next turn you can't say anyone's name. Each slip: drink 3.",
  ),
  eliteFour(
    "will",
    "Will",
    "Psychic",
    "The table secretly picks a number from 1 to 10. Three guesses; each miss: drink 2.",
  ),
  eliteFour(
    "karen",
    "Karen",
    "Dark",
    "Tell the table something you've never told them, or finish your drink.",
  ),
  eliteFour(
    "sidney",
    "Sidney",
    "Dark",
    "Roll 2d6. Under 7: finish your drink. Exactly 7: drink 7. Over 7: give 5.",
    rollTable(2, 6, [
      { min: 2, max: 6, instruction: "Crunched. Finish your drink." },
      { min: 7, max: 7, instruction: "A standoff. Drink 7." },
      { min: 8, max: 12, instruction: "You beat him. Give 5." },
    ]),
  ),
  eliteFour(
    "phoebe",
    "Phoebe",
    "Ghost",
    "Eyes shut; someone swaps drinks with you. Guess who, or drink 4 of theirs.",
  ),
  eliteFour(
    "glacia",
    "Glacia",
    "Ice",
    "Roll d20. 1–12: drink 6, ice cold. 13–19: drink 3. 20: give 8.",
    rollTable(1, 20, [
      { min: 1, max: 12, instruction: "Sheer Cold. Drink 6." },
      { min: 13, max: 19, instruction: "You thaw out. Drink 3." },
      { min: 20, max: 20, instruction: "You shatter her ice. Give 8." },
    ]),
  ),
  eliteFour(
    "drake",
    "Drake",
    "Dragon",
    "Dragon Claw. Roll 3d6. Drink half the total, rounded up, plus 2.",
    rollTable(
      3,
      6,
      Array.from({ length: 16 }, (_, i) => ({
        min: i + 3,
        max: i + 3,
        instruction: `Drink ${Math.ceil((i + 3) / 2) + 2}.`,
      })),
    ),
  ),
];

const champion = (
  id: string,
  name: string,
  region: string,
  rules: string,
  dice: DiceDefinition,
) => finale(`league-champion-${id}`, name, `Champion · ${region}`, rules, dice);

// The last card of the run: the whole table fights, and winning ends it.
export const champions: CardDefinition[] = [
  champion(
    "blue",
    "Blue",
    "Kanto",
    "Your rival got here first. Roll d20. 1–8: all finish. 9–16: all drink 4. 17–20: you win.",
    rollTable(1, 20, [
      {
        min: 1,
        max: 8,
        instruction: "Blue smells you. Everyone finishes their drink.",
      },
      { min: 9, max: 16, instruction: "Close fight. Everyone drinks 4." },
      {
        min: 17,
        max: 20,
        instruction: "Champion! Hand out 10 and take a victory lap.",
      },
    ]),
  ),
  champion(
    "lance",
    "Lance",
    "Johto",
    "Hyper Beam. Roll d20. 1–10: all finish. 11–18: all drink 3. 19–20: you win.",
    rollTable(1, 20, [
      {
        min: 1,
        max: 10,
        instruction:
          "Hyper Beam sweeps the table. Everyone finishes their drink.",
      },
      { min: 11, max: 18, instruction: "Close fight. Everyone drinks 3." },
      {
        min: 19,
        max: 20,
        instruction: "Hall of Fame! Make a rule for the rest of the night.",
      },
    ]),
  ),
  champion(
    "steven",
    "Steven",
    "Hoenn",
    "Roll 2d6. Under 9: everyone drinks the total. 9 or more: you win; give it.",
    rollTable(2, 6, [
      {
        min: 2,
        max: 8,
        instruction: "Meteor Mash. Everyone drinks {total}.",
      },
      {
        min: 9,
        max: 12,
        instruction: "Champion! Give {total}, split however you like.",
      },
    ]),
  ),
];
