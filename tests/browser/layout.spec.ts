import { test, expect, type Page } from "@playwright/test";
import { createSession, advance } from "../../src/game/engine";
import { cards, packs } from "../../src/content/catalog";
const key = "drink-at-ron.session.v1";
const core = packs.find((p) => p.id === "core")!;
const plain = cards.filter((c) => !c.dice && core.cardIds.includes(c.id));
const longestRule = [...plain].sort(
  (a, b) => b.rules.length - a.rules.length,
)[0];
const longestTitle = [...plain].sort(
  (a, b) => b.title.length - a.title.length,
)[0];
const ruleCard = plain.find((c) => c.category === "rule")!;
const samples = [longestRule, longestTitle, ruleCard];
function revealed(card: (typeof cards)[number], list = [card]) {
  const session = createSession(
    { version: 1, packIds: ["core"], limit: list.length },
    list,
    [{ ...packs[0], cardIds: list.map((c) => c.id) }],
  );
  session.phase = "revealed";
  return session;
}
async function seed(page: Page, session: unknown) {
  await page.goto("./");
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key, session },
  );
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
}
test("Core instructions fit at 390x844 with ratio, pack mark and no CTA occlusion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const card of samples) {
    await seed(page, revealed(card));
    await expect(page.locator(".study-rules p")).toBeVisible();
    await expect(page.locator(".study-rules")).toHaveAttribute(
      "data-overflow",
      "none",
    );
    const m = await page.evaluate(() => {
      const rules = document.querySelector(".study-rules")!;
      const card = document
        .querySelector(".game-card")!
        .getBoundingClientRect();
      return {
        // 2px tolerance matches the overflow-affordance threshold (subpixel).
        fit: rules.scrollHeight <= rules.clientHeight + 2,
        ratio: card.width / card.height,
        mark: !!document.querySelector(".card-footer .card-pack-marks img"),
      };
    });
    expect(m.fit, `${card.id} rules should fit at 390x844`).toBe(true);
    expect(Math.abs(m.ratio - 2 / 3), `${card.id} ratio`).toBeLessThan(0.01);
    expect(m.mark, `${card.id} keeps its pack mark`).toBe(true);
  }
});
test("Previous Card owns the same 2:3 geometry as gameplay", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const [a, b] = plain;
  let session = createSession(
    { version: 1, packIds: ["core"], limit: 3 },
    [a, b],
    [{ ...packs[0], cardIds: [a.id, b.id] }],
  );
  session = advance(advance(advance(session))); // reveal, discard, reveal
  await seed(page, session);
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page
    .getByRole("button", { name: "Previous card", exact: true })
    .click();
  const ratio = await page
    .locator(".previous-card")
    .evaluate((el) => el.clientWidth / el.clientHeight);
  expect(Math.abs(ratio - 2 / 3)).toBeLessThan(0.01);
  await expect(
    page.locator(".previous-card .card-pack-marks img"),
  ).toBeVisible();
});
test("a short phone scrolls long rules with a visible overflow affordance", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await seed(page, revealed(longestRule));
  // Enlarged text guarantees the longest plain rule overflows the short phone.
  await page.addStyleTag({ content: ":root {font-size:24px}" });
  await expect(page.locator(".study-rules")).toHaveAttribute(
    "data-overflow",
    "bottom",
  );
});
test("artwork scene comes from the registry, not the card id", async ({
  page,
}) => {
  const cheers = cards.find((c) => c.id === "core.cheers-idiots")!;
  const placeholder = plain.find((c) => c.artwork === "art/tankard.webp")!;
  await seed(page, revealed(cheers));
  const image = page.locator(".study-illustration img");
  await expect(image).toHaveClass(/painted-scene/);
  await expect
    .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await seed(page, revealed(placeholder));
  await expect(page.locator(".study-illustration img")).toHaveClass(
    /placeholder-scene/,
  );
});
