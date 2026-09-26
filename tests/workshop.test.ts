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
  // Supplied sample set (40), classics (65), voice/dice expansion (114), and
  // every supplied house row (103) merged into one always-on deck.
  expect(coreCards).toHaveLength(322);
  expect(
    Object.fromEntries(
      ["sip", "group", "category", "challenge", "rule"].map((c) => [
        c,
        coreCards.filter((card) => card.category === c).length,
      ]),
    ),
  ).toEqual({ sip: 55, group: 57, category: 39, challenge: 125, rule: 46 });
  expect(coreCards.filter((c) => c.dice)).toHaveLength(80);
});

test("all supplied custom rows remain available in Core and VIP night", () => {
  const core = packs.find((pack) => pack.id === "core")!;
  const vip = packs.find((pack) => pack.id === "vip")!;
  const sheetRows = Array.from({ length: 104 }, (_, offset) => offset + 3)
    .filter((row) => row !== 75) // blank CSV row
    .map((row) => `house.sheet-${String(row).padStart(3, "0")}`);
  for (const id of sheetRows) expect(core.cardIds).toContain(id);
  expect(vip.cardIds.slice(-4)).toEqual(
    [3, 4, 5, 6].map((row) => `vip.sheet-${String(row).padStart(3, "0")}`),
  );
  expect(cards).toHaveLength(338);
});
