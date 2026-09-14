import { test, expect } from "vitest";
import { workshopSession } from "../src/workshop/session";
import { cards } from "../src/content/catalog";
test("seeded workshop preserves the pool and reproduces order", () => {
  const a = workshopSession("a", "core.left").session;
  expect(a).toEqual(workshopSession("a", "core.left").session);
  expect(a.order[0]).toBe("core.left");
  expect(new Set(a.order).size).toBe(cards.length);
  expect(a.order).not.toEqual(workshopSession("b", "core.left").session.order);
});
test("Core composition matches the content brief", () => {
  expect(cards).toHaveLength(30);
  expect(
    Object.fromEntries(
      ["sip", "group", "category", "challenge", "rule"].map((c) => [
        c,
        cards.filter((card) => card.category === c).length,
      ]),
    ),
  ).toEqual({ sip: 5, group: 8, category: 7, challenge: 6, rule: 4 });
});
