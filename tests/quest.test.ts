import { describe, expect, it } from "vitest";
import {
  advance,
  createSession,
  currentCard,
  replaySession,
  validConfig,
} from "../src/game/engine";
import { rollDice, returnToCard } from "../src/game/dice";
import { parseSession } from "../src/app/persistence";
import { validateCatalog } from "../src/content/catalog";
import type {
  CardDefinition,
  GameConfig,
  PackDefinition,
  SessionState,
} from "../src/game/types";

// A small quest deck: two quest-only cards advance the meter, two regular
// cards do not, and the finale sits outside the shuffle. Independent of
// shipped content.
const plain = (id: string, extra: Partial<CardDefinition> = {}) =>
  ({
    version: 1,
    id: `quest.${id}`,
    title: id,
    rules: "Drink 1.",
    category: "sip",
    artwork: "art/tankard.webp",
    ...extra,
  }) as CardDefinition;
const catalog = [
  plain("gym-a", { quest: "quest" }),
  plain("gym-b", { quest: "quest" }),
  plain("wild"),
  plain("cave"),
  plain("finale", {
    category: "challenge",
    dice: { version: 1, count: 1, sides: 6, instruction: "Drink {total}." },
  }),
];
const pack: PackDefinition = {
  version: 1,
  id: "quest",
  title: "Quest",
  description: "Test",
  cardIds: ["quest.wild", "quest.cave"],
  quest: {
    mode: "Quest run",
    summary: "Earn 2 badges",
    label: "Badges",
    goal: 2,
    length: 3,
    cardIds: ["quest.gym-a", "quest.gym-b"],
    finaleId: "quest.finale",
  },
};
const rng = () => 0.42;
const questMode: GameConfig = {
  version: 1,
  packIds: ["quest"],
  limit: null,
  quest: "quest",
};
const start = (random = rng) =>
  createSession(questMode, catalog, [pack], random);
// Reveal and put aside the card in play, rolling it first if it has dice.
const draw = (state: SessionState) => {
  let s = advance(state, rng);
  if (currentCard(s).dice) s = returnToCard(rollDice(s, rng));
  return advance(s, rng);
};
const roundTrip = (s: SessionState) =>
  expect(parseSession(JSON.stringify(s))).toEqual(s);
const gymsFirst = () => {
  const s = start();
  s.order = ["quest.gym-a", "quest.gym-b", "quest.wild", "quest.cave"];
  return s;
};
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

describe("quest mode", () => {
  it("a quest needs its pack selected and no card limit", () => {
    expect(validConfig(questMode)).toBe(true);
    expect(validConfig({ ...questMode, limit: 30 })).toBe(false);
    expect(validConfig({ ...questMode, quest: "core" })).toBe(false);
  });

  it("starts the meter and keeps the finale out of the deck", () => {
    const s = start();
    expect(s.quest).toEqual({
      packId: "quest",
      label: "Badges",
      goal: 2,
      length: 3,
      count: 0,
      due: false,
      finale: catalog[4],
    });
    expect(s.order).not.toContain("quest.finale");
    roundTrip(s);
  });

  it("the same pack in a plain mode plays without a quest or its cards", () => {
    const s = createSession(
      { version: 1, packIds: ["quest"], limit: 30 },
      catalog,
      [pack],
      rng,
    );
    expect("quest" in s).toBe(false);
    expect([...s.order].sort()).toEqual(["quest.cave", "quest.wild"]);
  });

  it("advances on quest cards, deals the finale, and ends on it", () => {
    let s = draw(gymsFirst());
    expect(s.quest).toMatchObject({ count: 1, due: false });
    roundTrip(s);
    s = draw(s);
    expect(s.quest).toMatchObject({ count: 2, due: true });
    expect(currentCard(s).id).toBe("quest.finale");
    expect(s.position).toBe(2);
    roundTrip(s);
    // The finale rolls like any dice card and cannot be skipped unrolled.
    s = advance(s, rng);
    expect(advance(s, rng)).toBe(s);
    s = returnToCard(rollDice(s, rng));
    roundTrip(s);
    s = advance(s, rng);
    expect(s.phase).toBe("complete");
    expect(s.previousId).toBe("quest.finale");
    expect(s.discarded).toBe(3);
    roundTrip(s);
  });

  it("a card outside the quest leaves the meter alone", () => {
    const s = start();
    s.order = ["quest.wild", "quest.gym-a", "quest.gym-b", "quest.cave"];
    expect(draw(s).quest!.count).toBe(0);
  });

  it("spreads the quest's cards through its run", () => {
    for (let seed = 1; seed <= 50; seed++)
      expect(
        start(seeded(seed)).order.slice(0, 2).sort(),
        `seed ${seed}`,
      ).toEqual(["quest.gym-a", "quest.gym-b"]);
  });

  it("replay resets and re-spreads the run", () => {
    const s = replaySession(draw(draw(gymsFirst())), seeded(7));
    expect(s.quest).toMatchObject({ count: 0, due: false });
    expect(s.order.slice(0, 2).sort()).toEqual(["quest.gym-a", "quest.gym-b"]);
    roundTrip(s);
  });

  it("rejects saves whose quest state does not add up", () => {
    const s = draw(gymsFirst());
    const tamper = (change: (q: SessionState) => void) => {
      const copy = structuredClone(s);
      change(copy);
      return () => parseSession(JSON.stringify(copy));
    };
    expect(tamper((q) => (q.quest!.count = 2))).toThrow();
    expect(tamper((q) => (q.quest!.due = true))).toThrow();
    expect(tamper((q) => (q.quest!.packId = "core"))).toThrow();
    expect(tamper((q) => (q.quest!.length = 2))).toThrow();
    expect(tamper((q) => delete q.quest)).toThrow();
    expect(tamper((q) => delete q.config.quest)).toThrow();
    expect(tamper((q) => (q.quest!.finale = { ...catalog[0] }))).toThrow();
  });

  it("catalog validation requires a reachable goal and an unshuffled finale", () => {
    expect(() => validateCatalog(catalog, [pack])).not.toThrow();
    for (const change of [
      { goal: 3 },
      { goal: 0 },
      { length: 2 },
      { finaleId: "quest.wild" },
      { cardIds: ["quest.gym-a", "quest.wild"] },
      { cardIds: ["quest.gym-a", "quest.missing"] },
      { finaleId: "quest.missing" },
      { label: " " },
      { mode: "" },
    ])
      expect(() =>
        validateCatalog(catalog, [
          { ...pack, quest: { ...pack.quest!, ...change } },
        ]),
      ).toThrow("Invalid quest");
  });
});
