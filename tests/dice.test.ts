import { describe, expect, it, vi } from "vitest";
import { advance, createSession, replaySession } from "../src/game/engine";
import {
  rollDice,
  returnToCard,
  validateDice,
  resolveInstruction,
} from "../src/game/dice";
import { parseSession } from "../src/app/persistence";
import { PresentationController } from "../src/presentation/controller";
import { diceFixtures } from "../src/workshop/dice-fixtures";
import { cards, packs, validateCatalog } from "../src/content/catalog";
import { dieFaces } from "../src/presentation/dice/geometry";
import type { DiceDefinition } from "../src/game/types";
const fixture = diceFixtures[0];
const session = (limit: number | null = 2, card = fixture) =>
  createSession(
    { version: 1, packIds: ["core"], limit },
    [card],
    [{ ...packs[0], cardIds: [card.id] }],
    () => 0.3,
  );
const revealed = () => advance(session());
const settle = (c: PresentationController) => {
  while (c.getSnapshot().motion) c.finish(c.getSnapshot().transition);
};

describe("dice content", () => {
  it("validates fixtures without expanding the production Core", () => {
    validateCatalog(diceFixtures, []);
    expect(cards).toHaveLength(30);
    expect(cards.some((c) => c.dice)).toBe(false);
  });
  it.each([0, 5, 1.5, -1, NaN])("rejects unsupported count %s", (count) =>
    expect(() => validateDice({ ...fixture.dice, count })).toThrow(),
  );
  it.each([
    { sides: 8 },
    { version: 2 },
    { outcomes: [] },
    { outcomes: [{ min: 2, max: 11, instruction: "Toast" }] },
    {
      outcomes: [
        { min: 2, max: 7, instruction: "Toast" },
        { min: 7, max: 12, instruction: "Toast" },
      ],
    },
    { outcomes: [{ min: 3, max: 12, instruction: "Toast" }] },
    { outcomes: [{ min: 2, max: 12, instruction: "" }] },
    { instruction: "{player}" },
    { instruction: "Toast", outcomes: fixture.dice!.outcomes },
  ])("rejects invalid specification %j", (patch) =>
    expect(() => validateDice({ ...fixture.dice, ...patch })).toThrow(),
  );
  it("resolves every range boundary and only known placeholders", () => {
    for (const card of diceFixtures) {
      const d = card.dice!;
      for (let total = d.count; total <= d.sides * d.count; total++)
        expect(resolveInstruction(d, total)).toBeTruthy();
    }
    const d: DiceDefinition = {
      version: 1,
      count: 4,
      sides: 20,
      instruction: "Tell a {total}-word tale.",
    };
    validateDice(d);
    expect(resolveInstruction(d, 80)).toBe("Tell a 80-word tale.");
    expect(resolveInstruction(fixture.dice!, 6)).toMatch(/^Give/);
    expect(resolveInstruction(fixture.dice!, 7)).toMatch(/^Choose/);
  });
});
describe("dice transactions and saves", () => {
  it("commits one roll, locks repeat taps, and separates return from discard", () => {
    const persist = vi.fn(),
      shuffleRandom = vi.fn(() => 0.1),
      diceRandom = vi.fn(() => 0.9999);
    const c = new PresentationController(
      revealed(),
      persist,
      () => {},
      shuffleRandom,
      diceRandom,
    );
    c.tap();
    for (let i = 0; i < 20; i++) c.tap();
    expect(persist).toHaveBeenCalledTimes(1);
    expect(diceRandom).toHaveBeenCalledTimes(2);
    expect(shuffleRandom).not.toHaveBeenCalled();
    expect(c.getSnapshot().session!.roll?.values).toEqual([6, 6]);
    const saved = parseSession(JSON.stringify(c.getSnapshot().session));
    const restored = new PresentationController(saved, vi.fn());
    expect(restored.getSnapshot().motion).toBeNull();
    settle(c);
    expect(persist).toHaveBeenCalledTimes(1);
    c.tap();
    c.tap();
    expect(persist).toHaveBeenCalledTimes(2);
    expect(c.getSnapshot().session!.discarded).toBe(0);
    settle(c);
    c.tap();
    expect(persist).toHaveBeenCalledTimes(3);
    expect(c.getSnapshot().session!.discarded).toBe(1);
  });
  it("cancellation and background settling preserve results without replaying sound", () => {
    const persist = vi.fn(),
      effect = vi.fn(),
      c = new PresentationController(revealed(), persist, effect);
    c.tap();
    const state = c.getSnapshot().session;
    const old = c.getSnapshot().transition;
    c.settleAll();
    c.finish(old);
    expect(c.getSnapshot().session).toBe(state);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledWith("roll-cancel");
    effect.mockClear();
    new PresentationController(
      parseSession(JSON.stringify(state)),
      persist,
      effect,
    );
    expect(effect).not.toHaveBeenCalled();
  });
  it("never discards an unresolved roll and never rerolls an accepted one", () => {
    const s = revealed();
    expect(advance(s)).toBe(s);
    const rolled = rollDice(s, () => 0);
    expect(rolled.roll?.total).toBe(2);
    expect(advance(rolled)).toBe(rolled);
    expect(
      rollDice(rolled, () => {
        throw Error("must not sample");
      }),
    ).toBe(rolled);
    expect(rollDice(session())).toEqual(session());
  });
  it("keeps last results read-only across cycles and resets them on replay", () => {
    let s = rollDice(advance(session(null)), () => 0);
    s = returnToCard(s);
    const previous = s.roll;
    s = advance(s);
    expect(s.roll).toBeNull();
    expect(s.previousRoll).toBe(previous);
    s = rollDice(advance(s), () => 0.999);
    expect(s.roll?.total).toBe(12);
    expect(s.previousRoll?.total).toBe(2);
    expect(parseSession(JSON.stringify(s))).toEqual(s);
    const replay = replaySession(s);
    expect(replay.roll).toBeNull();
    expect(replay.previousRoll).toBeNull();
  });
  it("holds the final card until its result is returned and dismissed", () => {
    const c = new PresentationController(advance(session(1)), vi.fn());
    c.tap();
    settle(c);
    expect(c.getSnapshot().session!.phase).toBe("revealed");
    c.tap();
    settle(c);
    c.tap();
    settle(c);
    expect(c.getSnapshot().session!.phase).toBe("complete");
    expect(
      parseSession(JSON.stringify(c.getSnapshot().session)).roll?.returned,
    ).toBe(true);
  });
  it("migrates legacy saves without touching their snapshots, choices or order", () => {
    const current = advance(
      createSession(
        { version: 1, packIds: ["core"], limit: 40 },
        cards,
        packs,
        () => 0.2,
      ),
    );
    const { roll, previousRoll, ...legacy } = current;
    const raw = { ...legacy, version: 1 };
    expect(parseSession(JSON.stringify(raw))).toEqual({
      ...raw,
      version: 2,
      roll: null,
      previousRoll: null,
    });
  });
  it("deeply snapshots dice content", () => {
    const local = structuredClone(fixture);
    const s = session(2, local);
    local.dice!.outcomes![0].instruction = "Changed";
    expect(s.cards[0].dice!.outcomes![0].instruction).not.toBe("Changed");
  });
  it.each([
    { total: 99 },
    { values: [7, 1] },
    { values: [1] },
    { instruction: "Tampered" },
    { returned: "yes" },
  ])("rejects tampered results %j", (patch) => {
    const s = rollDice(revealed(), () => 0);
    expect(() =>
      parseSession(JSON.stringify({ ...s, roll: { ...s.roll, ...patch } })),
    ).toThrow();
  });
  it("rejects hidden results, unresolved prior rolls, and missing v2 fields", () => {
    const s = rollDice(revealed(), () => 0);
    expect(() =>
      parseSession(JSON.stringify({ ...s, phase: "hidden" })),
    ).toThrow();
    const discarded = advance(returnToCard(s));
    expect(() =>
      parseSession(
        JSON.stringify({
          ...discarded,
          previousRoll: { ...discarded.previousRoll, returned: false },
        }),
      ),
    ).toThrow();
    expect(() =>
      parseSession(JSON.stringify({ ...s, roll: undefined })),
    ).toThrow();
  });
  it.each([0, 0.049999, 0.05, 0.499, 0.999999])(
    "maps random sample %s to a legal d20 result",
    (sample) => {
      const s = rollDice(advance(session(1, diceFixtures[1])), () => sample);
      expect(s.roll?.values).toEqual([1 + Math.floor(sample * 20)]);
    },
  );
});
describe("dice rendering geometry", () => {
  it.each([6, 20] as const)(
    "has %i unique outward faces and exact landing orientations",
    (sides) => {
      const faces = dieFaces(sides);
      expect(faces).toHaveLength(sides);
      expect(new Set(faces.map((f) => f.value)).size).toBe(sides);
      for (const f of faces) {
        expect(f.width).toBeGreaterThan(0);
        expect(f.height).toBeGreaterThan(0);
        const m = f.landing.slice(9, -1).split(",").map(Number);
        const rotated = [0, 1, 2].map(
          (i) =>
            m[i] * f.normal[0] +
            m[i + 4] * f.normal[1] +
            m[i + 8] * f.normal[2],
        );
        expect(rotated[0]).toBeCloseTo(0);
        expect(rotated[1]).toBeCloseTo(0);
        expect(rotated[2]).toBeCloseTo(1);
      }
    },
  );
});
