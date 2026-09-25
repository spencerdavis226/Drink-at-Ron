import { test, expect } from "vitest";
import { workshopSession, workshopCards } from "../src/workshop/session";
import { cards, packs } from "../src/content/catalog";
test("seeded workshop preserves the pool and reproduces order", () => {
  const a = workshopSession("a", "core.house-special").session;
  expect(a).toEqual(workshopSession("a", "core.house-special").session);
  expect(a.order[0]).toBe("core.house-special");
  expect(new Set(a.order).size).toBe(workshopCards.length);
  expect(a.order).not.toEqual(
    workshopSession("b", "core.house-special").session.order,
  );
});
test("Core composition matches the content brief", () => {
  const core = packs.find((p) => p.id === "core")!;
  const coreCards = cards.filter((c) => core.cardIds.includes(c.id));
  // Supplied sample set (40) plus the classic / King's Cup basics (65).
  expect(coreCards).toHaveLength(105);
  expect(
    Object.fromEntries(
      ["sip", "group", "category", "challenge", "rule"].map((c) => [
        c,
        coreCards.filter((card) => card.category === c).length,
      ]),
    ),
  ).toEqual({ sip: 17, group: 24, category: 11, challenge: 35, rule: 18 });
  expect(cards.filter((c) => c.dice)).toHaveLength(20);
});
