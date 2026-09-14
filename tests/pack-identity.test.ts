import { expect, test } from "vitest";
import { cardPacks } from "../src/presentation/packs";
import { packs, validateCatalog } from "../src/content/catalog";
import type { PackDefinition } from "../src/game/types";
const shared: PackDefinition = {
  version: 1,
  id: "fireside",
  title: "Fireside",
  description: "Stories",
  cardIds: ["core.cheers"],
  logo: "art/packs/fireside.svg",
};
test("shared cards show only selected pack marks in catalog order", () => {
  const catalog = [...packs, shared];
  expect(
    cardPacks("core.cheers", ["fireside"], catalog).map((p) => p.id),
  ).toEqual(["fireside"]);
  expect(
    cardPacks("core.cheers", ["fireside", "core"], catalog).map((p) => p.id),
  ).toEqual(["core", "fireside"]);
  expect(cardPacks("core.cheers", [], catalog)).toEqual([]);
});
test("retired namespaced cards retain known origin without inventing unknown marks", () => {
  expect(cardPacks("core.retired", ["core"]).map((p) => p.id)).toEqual([
    "core",
  ]);
  expect(cardPacks("unknown.retired", ["unknown"])).toEqual([]);
});
test("invalid logo paths fail catalog validation", () => {
  expect(() =>
    validateCatalog([], [{ ...shared, logo: "https://example.com/logo.svg" }]),
  ).toThrow("Invalid pack logo");
});
