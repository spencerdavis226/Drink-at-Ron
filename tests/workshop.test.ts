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
test("Core composition matches the trimmed content brief", () => {
  const core = packs.find((p) => p.id === "core")!;
  const coreCards = cards.filter((c) => core.cardIds.includes(c.id));
  // Sample set (34), trimmed classics (45), trimmed standard expansion (38).
  expect(coreCards).toHaveLength(117);
  expect(
    Object.fromEntries(
      ["sip", "group", "category", "challenge", "rule"].map((c) => [
        c,
        coreCards.filter((card) => card.category === c).length,
      ]),
    ),
  ).toEqual({ sip: 18, group: 23, category: 9, challenge: 51, rule: 16 });
  expect(coreCards.filter((c) => c.dice)).toHaveLength(39);
});

test("each supplied sheet row lands in the House deck and VIP night", () => {
  const core = packs.find((p) => p.id === "core")!;
  const house = packs.find((p) => p.id === "house")!;
  const vip = packs.find((p) => p.id === "vip")!;
  // Rows 3–106 minus the blank row 75 and the description-less row 106.
  const sheetRows = Array.from({ length: 104 }, (_, offset) => offset + 3)
    .filter((row) => row !== 75 && row !== 106)
    .map((row) => `house.sheet-${String(row).padStart(3, "0")}`);
  expect(house.cardIds).toHaveLength(102);
  for (const id of sheetRows) expect(house.cardIds).toContain(id);
  // The generated main deck no longer carries the supplied sheet.
  expect(core.cardIds.some((id) => id.startsWith("house."))).toBe(false);
  expect(vip.cardIds.slice(-4)).toEqual(
    [3, 4, 5, 6].map((row) => `vip.sheet-${String(row).padStart(3, "0")}`),
  );
  expect(cards).toHaveLength(369); // 117 core + 102 house + 16 vip + 134 Pokémon
});
