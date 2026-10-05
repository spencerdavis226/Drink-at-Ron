import { describe, expect, it } from "vitest";
import {
  advance,
  createSession,
  currentCard,
  dueQuest,
  replaySession,
} from "../src/game/engine";
import { rollDice, returnToCard } from "../src/game/dice";
import { parseSession } from "../src/app/persistence";
import { validateCatalog } from "../src/content/catalog";
import type {
  CardDefinition,
  PackDefinition,
  SessionState,
} from "../src/game/types";

// A small quest deck: two cards earn a badge, one does not, and the finale
// sits outside the shuffle. Independent of shipped content.
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
  cardIds: ["quest.gym-a", "quest.gym-b", "quest.wild"],
  quest: { label: "Badges", goal: 2, finaleId: "quest.finale" },
};
const rng = () => 0.42;
const start = (limit: number | null = null) =>
  createSession(
    { version: 1, packIds: ["quest"], limit },
    catalog,
    [pack],
    rng,
  );
// Reveal and put aside the card in play, rolling it first if it has dice.
const draw = (state: SessionState) => {
  let s = advance(state, rng);
  if (currentCard(s).dice) s = returnToCard(rollDice(s, rng));
  return advance(s, rng);
};
const roundTrip = (s: SessionState) =>
  expect(parseSession(JSON.stringify(s))).toEqual(s);
// Order the deck so both gyms come first: the finale is due after two draws.
const gymsFirst = () => {
  const s = start();
  s.order = ["quest.gym-a", "quest.gym-b", "quest.wild"];
  return s;
};

describe("pack quests", () => {
  it("starts a meter for a selected quest pack and keeps the finale out of the deck", () => {
    const s = start();
    expect(s.quests).toEqual([
      {
        packId: "quest",
        label: "Badges",
        goal: 2,
        count: 0,
        due: false,
        shown: 0,
        finale: catalog[3],
      },
    ]);
    expect(s.order).not.toContain("quest.finale");
    roundTrip(s);
  });

  it("sessions without a quest pack carry no quest state", () => {
    const s = createSession(
      { version: 1, packIds: ["quest"], limit: null },
      catalog,
      [{ ...pack, quest: undefined }],
      rng,
    );
    expect("quests" in s).toBe(false);
    const withoutFinale = createSession(
      { version: 1, packIds: ["quest"], limit: null },
      catalog.slice(0, 3),
      [pack],
      rng,
    );
    expect("quests" in withoutFinale).toBe(false);
  });

  it("advances on quest cards, then deals the finale between deck cards", () => {
    let s = draw(gymsFirst());
    expect(s.quests![0]).toMatchObject({ count: 1, due: false });
    roundTrip(s);
    s = draw(s);
    expect(s.quests![0]).toMatchObject({ count: 2, due: true });
    expect(currentCard(s).id).toBe("quest.finale");
    expect(s.position).toBe(2);
    roundTrip(s);
    // The finale rolls like any dice card and cannot be skipped unrolled.
    s = advance(s, rng);
    expect(advance(s, rng)).toBe(s);
    s = returnToCard(rollDice(s, rng));
    roundTrip(s);
    s = advance(s, rng);
    expect(s.quests![0]).toMatchObject({ count: 0, due: false, shown: 1 });
    expect(s.previousId).toBe("quest.finale");
    expect(s.position).toBe(2);
    expect(s.discarded).toBe(3);
    expect(currentCard(s).id).toBe("quest.wild");
    roundTrip(s);
  });

  it("a non-quest card leaves the meter alone", () => {
    const s = start();
    s.order = ["quest.wild", "quest.gym-a", "quest.gym-b"];
    expect(draw(s).quests![0].count).toBe(0);
  });

  it("can earn the finale again in a long game", () => {
    let s = gymsFirst();
    for (let i = 0; i < 12; i++) s = draw(s);
    expect(s.quests![0].shown).toBeGreaterThan(1);
    roundTrip(s);
  });

  it("completes a finite game on the finale", () => {
    let s = gymsFirst();
    s.config.limit = 3;
    s = draw(draw(draw(s)));
    expect(s.phase).toBe("complete");
    expect(s.previousId).toBe("quest.finale");
    expect(dueQuest(s)).toBeDefined();
    roundTrip(s);
  });

  it("replay resets the meter", () => {
    const s = replaySession(draw(draw(gymsFirst())), rng);
    expect(s.quests![0]).toMatchObject({ count: 0, due: false, shown: 0 });
    roundTrip(s);
  });

  it("rejects saves whose quest state does not add up", () => {
    const s = draw(gymsFirst());
    const tamper = (change: (q: SessionState) => void) => {
      const copy = structuredClone(s);
      change(copy);
      return () => parseSession(JSON.stringify(copy));
    };
    expect(tamper((q) => (q.quests![0].count = 2))).toThrow();
    expect(tamper((q) => (q.quests![0].due = true))).toThrow();
    expect(tamper((q) => (q.quests![0].shown = 1))).toThrow();
    expect(tamper((q) => (q.quests![0].packId = "core"))).toThrow();
    expect(tamper((q) => (q.quests = []))).toThrow();
    expect(tamper((q) => (q.quests![0].finale = { ...catalog[0] }))).toThrow();
  });

  it("catalog validation requires a reachable goal and an unshuffled finale", () => {
    expect(() => validateCatalog(catalog, [pack])).not.toThrow();
    for (const quest of [
      { ...pack.quest!, goal: 3 },
      { ...pack.quest!, goal: 0 },
      { ...pack.quest!, finaleId: "quest.wild" },
      { ...pack.quest!, finaleId: "quest.missing" },
      { ...pack.quest!, label: " " },
    ])
      expect(() => validateCatalog(catalog, [{ ...pack, quest }])).toThrow(
        "Invalid quest",
      );
  });
});

describe("quest pacing", () => {
  const seeded = (seed: number) => () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  it("puts enough quest cards before the last draw of a finite game", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const s = createSession(
        { version: 1, packIds: ["quest"], limit: 3 },
        catalog,
        [pack],
        seeded(seed),
      );
      expect(s.order.slice(0, 2).sort(), `seed ${seed}`).toEqual([
        "quest.gym-a",
        "quest.gym-b",
      ]);
    }
  });

  it("leaves an endless game to chance", () => {
    const orders = new Set(
      Array.from(
        { length: 30 },
        (_, seed) =>
          createSession(
            { version: 1, packIds: ["quest"], limit: null },
            catalog,
            [pack],
            seeded(seed + 1),
          ).order[2],
      ),
    );
    expect(orders.has("quest.gym-a") || orders.has("quest.gym-b")).toBe(true);
  });

  it("paces a replay too", () => {
    const s = replaySession(
      createSession(
        { version: 1, packIds: ["quest"], limit: 3 },
        catalog,
        [pack],
        rng,
      ),
      seeded(7),
    );
    expect(s.order[2]).toBe("quest.wild");
  });
});
