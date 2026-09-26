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
  // Supplied sample set (40), classics (65), and researched expansion (145).
  expect(coreCards).toHaveLength(250);
  expect(
    Object.fromEntries(
      ["sip", "group", "category", "challenge", "rule"].map((c) => [
        c,
        coreCards.filter((card) => card.category === c).length,
      ]),
    ),
  ).toEqual({ sip: 47, group: 54, category: 41, challenge: 75, rule: 33 });
  expect(coreCards.filter((c) => c.dice)).toHaveLength(20);
});

test("all supplied custom rows remain available in their intended packs", () => {
  const house = packs.find((pack) => pack.id === "house")!;
  const vip = packs.find((pack) => pack.id === "vip")!;
  expect(house.cardIds).toEqual(
    Array.from({ length: 104 }, (_, offset) => offset + 3)
      .filter((row) => row !== 75) // blank CSV row
      .map((row) => `house.sheet-${String(row).padStart(3, "0")}`),
  );
  expect(vip.cardIds.slice(-4)).toEqual(
    [3, 4, 5, 6].map((row) => `vip.sheet-${String(row).padStart(3, "0")}`),
  );
  expect(cards).toHaveLength(369);
});
