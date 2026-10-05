import { describe, expect, it } from "vitest";
import {
  advance,
  createSession,
  currentCard,
  finaleStage,
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
// cards do not, and a two-stage finale (one of two rivals, then the boss)
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
  plain("cave"),
  plain("rival-a"),
  plain("rival-b"),
  plain("boss", {
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
    finale: [
      { label: "Rival", pick: 1, cardIds: ["quest.rival-a", "quest.rival-b"] },
      { label: "Boss", pick: 1, cardIds: ["quest.boss"] },
    ],
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

  it("starts the meter and picks the finale, keeping it out of the deck", () => {
    const s = start();
    expect(s.quest).toMatchObject({
      packId: "quest",
      label: "Badges",
      goal: 2,
      length: 3,
      count: 0,
      due: false,
      step: 0,
    });
    expect(s.quest!.stages.map((stage) => stage.label)).toEqual([
      "Rival",
      "Boss",
    ]);
    expect(s.quest!.finale).toHaveLength(2);
    expect(["quest.rival-a", "quest.rival-b"]).toContain(s.quest!.finale[0]);
    expect(s.quest!.finale[1]).toBe("quest.boss");
    for (const id of ["quest.rival-a", "quest.rival-b", "quest.boss"])
      expect(s.order).not.toContain(id);
    roundTrip(s);
  });

  it("each stage picks at random", () => {
    const rivals = new Set(
      Array.from(
        { length: 20 },
        (_, i) => start(seeded((i + 1) * 99991)).quest!.finale[0],
      ),
    );
    expect(rivals).toEqual(new Set(["quest.rival-a", "quest.rival-b"]));
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

  it("deals the finale stages in order between deck cards, and ends on the last", () => {
    let s = draw(gymsFirst());
    expect(s.quest).toMatchObject({ count: 1, due: false });
    roundTrip(s);
    s = draw(s);
    expect(s.quest).toMatchObject({ count: 2, due: true, step: 0 });
    const rival = s.quest!.finale[0];
    expect(currentCard(s).id).toBe(rival);
    expect(finaleStage(s.quest!)).toEqual({
      label: "Rival",
      index: 0,
      size: 1,
    });
    expect(s.position).toBe(2);
    roundTrip(s);
    s = draw(s);
    expect(s.phase).toBe("hidden");
    expect(s.previousId).toBe(rival);
    expect(s.quest!.step).toBe(1);
    expect(currentCard(s).id).toBe("quest.boss");
    expect(s.position).toBe(2);
    roundTrip(s);
    // The boss rolls like any dice card and cannot be skipped unrolled.
    s = advance(s, rng);
    expect(advance(s, rng)).toBe(s);
    s = returnToCard(rollDice(s, rng));
    roundTrip(s);
    s = advance(s, rng);
    expect(s.phase).toBe("complete");
    expect(s.previousId).toBe("quest.boss");
    expect(s.discarded).toBe(4);
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

  it("replay resets the meter and re-picks the finale", () => {
    const s = replaySession(draw(draw(gymsFirst())), seeded(7));
    expect(s.quest).toMatchObject({ count: 0, due: false, step: 0 });
    expect(s.order.slice(0, 2).sort()).toEqual(["quest.gym-a", "quest.gym-b"]);
    roundTrip(s);
  });

  it("rejects saves whose quest state does not add up", () => {
    const s = draw(draw(gymsFirst()));
    const tamper = (change: (q: SessionState) => void) => {
      const copy = structuredClone(s);
      change(copy);
      return () => parseSession(JSON.stringify(copy));
    };
    expect(tamper((q) => (q.quest!.count = 1))).toThrow();
    expect(tamper((q) => (q.quest!.due = false))).toThrow();
    expect(tamper((q) => (q.quest!.packId = "core"))).toThrow();
    expect(tamper((q) => (q.quest!.length = 2))).toThrow();
    expect(tamper((q) => (q.quest!.step = 2))).toThrow();
    expect(tamper((q) => (q.quest!.finale = ["quest.boss"]))).toThrow();
    expect(
      tamper((q) => (q.quest!.finale = ["quest.boss", "quest.rival-a"])),
    ).toThrow();
    expect(tamper((q) => delete q.quest)).toThrow();
    expect(tamper((q) => delete q.config.quest)).toThrow();
  });

  it("a League save from before the gauntlet loads as a one-card stage", () => {
    const s = draw(draw(gymsFirst()));
    const { stages: _stages, step: _step, finale: _finale, ...rest } = s.quest!;
    const boss = catalog[6];
    const old = { ...s, quest: { ...rest, finale: boss } };
    const loaded = parseSession(JSON.stringify(old));
    expect(loaded.quest).toMatchObject({
      due: true,
      step: 0,
      finale: ["quest.boss"],
      stages: [{ label: "League", pick: 1, cards: [boss] }],
    });
    expect(currentCard(loaded).id).toBe("quest.boss");
  });

  it("catalog validation requires a reachable goal and unshuffled finale stages", () => {
    expect(() => validateCatalog(catalog, [pack])).not.toThrow();
    const rules = pack.quest!;
    for (const change of [
      { goal: 3 },
      { goal: 0 },
      { length: 2 },
      { finale: [] },
      { finale: [{ label: "Boss", pick: 2, cardIds: ["quest.boss"] }] },
      { finale: [{ label: "Boss", pick: 1, cardIds: ["quest.wild"] }] },
      { finale: [{ label: "Boss", pick: 1, cardIds: ["quest.missing"] }] },
      { finale: [{ label: " ", pick: 1, cardIds: ["quest.boss"] }] },
      { cardIds: ["quest.gym-a", "quest.wild"] },
      { cardIds: ["quest.gym-a", "quest.missing"] },
      { label: " " },
      { mode: "" },
    ])
      expect(() =>
        validateCatalog(catalog, [{ ...pack, quest: { ...rules, ...change } }]),
      ).toThrow("Invalid quest");
  });
});
