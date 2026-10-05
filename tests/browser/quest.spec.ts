import { test, expect, type Page } from "@playwright/test";
import { createSession } from "../../src/game/engine";
import { cards, packs } from "../../src/content/catalog";
const key = "drink-at-ron.session.v1";

// A Pokémon game one badge short of the League, with a plain gym card
// (Jasmine, no dice) revealed.
async function seedOneBadgeShort(page: Page) {
  const session = createSession(
    { version: 1, packIds: ["pokemon"], limit: null },
    cards,
    packs,
  );
  session.order = [
    "pokemon.jasmine",
    ...session.order.filter((id) => id !== "pokemon.jasmine"),
  ];
  session.phase = "revealed";
  session.quests![0].count = 7;
  await page.goto("./");
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key, session },
  );
  await page.reload();
}

for (const width of [320, 390])
  test(`@release the badge meter fills and deals the League at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 700 });
    await seedOneBadgeShort(page);
    const meter = page.locator(".quest-meter");
    await expect(meter).toHaveAccessibleName("Badges: 7 of 8");
    await expect(meter).not.toHaveClass(/due/);
    // The meter shares the top row with the medallion without overlapping it.
    const [left, middle] = await Promise.all([
      meter.boundingBox(),
      page.locator(".progress").boundingBox(),
    ]);
    expect(left!.x).toBeGreaterThanOrEqual(0);
    expect(left!.x + left!.width).toBeLessThanOrEqual(middle!.x);
    await page.screenshot({ path: info.outputPath(`meter-${width}.png`) });

    await page.locator(".game-card").click();
    await expect(meter).toHaveAccessibleName("Badges: 8 of 8");
    await expect(meter).toHaveClass(/due/);
    await page.getByRole("button", { name: "Reveal card" }).click();
    await expect(page.locator(".study-title h2")).toHaveText("Pokémon League");
    await expect(page.locator(".game-card")).toHaveAccessibleName(/^Roll /);
    await page.screenshot({ path: info.outputPath(`league-${width}.png`) });

    // The finale survives a reload, then puts the meter back to zero.
    await page.reload();
    await expect(page.locator(".study-title h2")).toHaveText("Pokémon League");
    const saved = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      key,
    );
    expect(saved.quests[0]).toMatchObject({ count: 8, due: true, shown: 0 });
  });

test("packs without a quest show no meter", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator(".progress")).toBeVisible();
  await expect(page.locator(".quest-meter")).toHaveCount(0);
});
