import { test, expect } from "vitest";
import { workshopSession, workshopCards } from "../src/workshop/session";
import { cards, packs } from "../src/content/catalog";
test("seeded workshop preserves the pool and reproduces order", () => {
  const a = workshopSession("a", "core.left").session;
  expect(a).toEqual(workshopSession("a", "core.left").session);
  expect(a.order[0]).toBe("core.left");
  expect(new Set(a.order).size).toBe(workshopCards.length);
  expect(a.order).not.toEqual(workshopSession("b", "core.left").session.order);
});
test("Core composition matches the content brief", () => {
  const core = packs.find((p) => p.id === "core")!;
  const coreCards = cards.filter((c) => core.cardIds.includes(c.id));
  expect(coreCards).toHaveLength(30);
  expect(
    Object.fromEntries(
      ["sip", "group", "category", "challenge", "rule"].map((c) => [
        c,
        coreCards.filter((card) => card.category === c).length,
      ]),
    ),
  ).toEqual({ sip: 5, group: 8, category: 7, challenge: 6, rule: 4 });
  expect(cards.filter((c) => c.dice)).toHaveLength(2);
});
