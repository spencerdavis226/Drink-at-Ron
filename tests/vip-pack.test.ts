import { expect, test } from "vitest";
import { cards, packs, validateCatalog } from "../src/content/catalog";
import type { PackDefinition } from "../src/game/types";

const vip = packs.find((p) => p.id === "vip")!;
const vipCards = cards.filter((c) => vip.cardIds.includes(c.id));

test("VIP night is a registered pack with its own mark and setup hint", () => {
  expect(vip).toBeDefined();
  expect(vip.title).toBe("VIP night");
  expect(vip.logo).toBe("art/packs/vip.svg");
  expect(vip.setupHint).toBeTruthy();
  // Every registered pack keeps a distinct logo path.
  const logos = packs.map((p) => p.logo);
  expect(new Set(logos).size).toBe(logos.length);
});

test("every VIP card is namespaced and centered on the VIP", () => {
  expect(vipCards.length).toBeGreaterThanOrEqual(10);
  for (const card of vipCards) {
    expect(card.id.startsWith("vip.")).toBe(true);
    // The pack's contract: every rule involves the VIP, positive or negative.
    expect(card.rules).toContain("VIP");
    expect(card.rules.trim().split(/\s+/).length).toBeLessThan(45);
  }
});

test("VIP night keeps a spread of card categories", () => {
  const byCategory = Object.fromEntries(
    ["sip", "group", "category", "challenge", "rule"].map((category) => [
      category,
      vipCards.filter((card) => card.category === category).length,
    ]),
  );
  expect(byCategory).toEqual({
    sip: 3,
    group: 3,
    category: 2,
    challenge: 2,
    rule: 2,
  });
});

test("an empty pack setup hint fails catalog validation", () => {
  const broken: PackDefinition = { ...vip, setupHint: "   " };
  expect(() => validateCatalog(cards, [broken])).toThrow(
    "Invalid pack setup hint",
  );
});
