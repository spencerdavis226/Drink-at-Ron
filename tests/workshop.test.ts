import { test, expect } from "vitest";
import { workshopSession, workshopCards } from "../src/workshop/session";
import { cards, packs } from "../src/content/catalog";
import { createSession } from "../src/game/engine";
test("seeded workshop preserves the pool and reproduces order", () => {
  const a = workshopSession("a", "core.house-special").session;
  expect(a).toEqual(workshopSession("a", "core.house-special").session);
  expect(a.order[0]).toBe("core.house-special");
  // Quest finales are catalog cards that never enter the shuffle.
  expect(new Set(a.order).size).toBe(
    new Set(packs.flatMap((p) => p.cardIds)).size,
  );
  expect(workshopCards.length).toBe(a.order.length + 1);
  expect(a.order).not.toEqual(
    workshopSession("b", "core.house-special").session.order,
  );
});
test("Core composition matches the trimmed content brief", () => {
  const core = packs.find((p) => p.id === "core")!;
  const coreCards = cards.filter((c) => core.cardIds.includes(c.id));
  // Sample set (31), trimmed classics (45), trimmed standard expansion (29);
  // the CABIIN-born cards moved to Cabin weekend.
  expect(coreCards).toHaveLength(105);
  expect(
    Object.fromEntries(
      ["sip", "group", "category", "challenge", "rule"].map((c) => [
        c,
        coreCards.filter((card) => card.category === c).length,
      ]),
    ),
  ).toEqual({ sip: 16, group: 22, category: 9, challenge: 43, rule: 15 });
  expect(coreCards.filter((c) => c.dice)).toHaveLength(36);
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
  expect(cards).toHaveLength(685); // 105 core + 102 house + 16 vip + 134 Pokémon (+1 quest finale) + 77 cabin + 250 likely
});

test("Cabin weekend owns its CABIIN cards and shares a few House rows", () => {
  const cabin = packs.find((p) => p.id === "cabin")!;
  const own = cabin.cardIds.filter((id) => id.startsWith("cabin."));
  const shared = cabin.cardIds.filter((id) => !id.startsWith("cabin."));
  expect(own).toHaveLength(77);
  expect(shared).toEqual(
    [12, 16, 24, 28, 40, 42, 53, 54].map(
      (row) => `house.sheet-${String(row).padStart(3, "0")}`,
    ),
  );
  // Moved, not duplicated: Core no longer carries the CABIIN-born cards.
  const core = packs.find((p) => p.id === "core")!;
  for (const id of ["smooth-brain", "samesies", "thanos-snap", "for-safety"]) {
    expect(core.cardIds).not.toContain(`core.${id}`);
    expect(own).toContain(`cabin.${id}`);
  }
});

test("Most Likely To is 250 standalone vote cards", () => {
  const likely = packs.find((p) => p.id === "likely")!;
  const voteCards = cards.filter((c) => likely.cardIds.includes(c.id));
  expect(voteCards).toHaveLength(250);
  for (const card of voteCards) {
    expect(card.title).toBe("Most Likely To");
    expect(card.category).toBe("group");
    expect(card.dice).toBeUndefined();
    expect(card.rules).toMatch(
      /Point on three: most votes (drinks [23]|finishes their drink|takes a shot)\.$/,
    );
  }
});

test("a Short game with Pokémon can always earn all eight badges", async () => {
  const pokemon = packs.find((p) => p.id === "pokemon")!;
  expect(pokemon.quest).toMatchObject({ goal: 8, finaleId: "pokemon.league" });
  const gyms = cards.filter((c) => c.quest === "pokemon");
  expect(gyms).toHaveLength(15);
  let seed = 11;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 40; i++) {
    const s = createSession(
      { version: 1, packIds: ["core", "house", "pokemon"], limit: 30 },
      cards,
      packs,
      random,
    );
    const early = s.order
      .slice(0, 29)
      .filter((id) => gyms.some((g) => g.id === id));
    expect(early.length).toBeGreaterThanOrEqual(8);
  }
});
