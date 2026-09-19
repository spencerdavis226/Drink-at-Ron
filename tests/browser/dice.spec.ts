import { test, expect, type Page } from "@playwright/test";
import { createSession } from "../../src/game/engine";
import { packs } from "../../src/content/catalog";
import { diceFixtures } from "../../src/workshop/dice-fixtures";
const key = "drink-at-ron.session.v1";
const ready = async (page: Page) =>
  expect(page.locator(".card-stage")).not.toHaveClass(
    /roll|flip|settle|deal|discard/,
  );
async function seed(page: Page, index = 0, limit = 2, count?: number) {
  const card = structuredClone(diceFixtures[index]);
  if (count)
    card.dice = {
      version: 1,
      count,
      sides: 6,
      instruction: "Tell a {total}-word tale together.",
    };
  const session = createSession(
    { version: 1, packIds: ["core"], limit },
    [card],
    [{ ...packs[0], cardIds: [card.id] }],
  );
  session.phase = "revealed";
  await page.goto("./");
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key, session },
  );
  await page.reload();
  return session;
}
const saved = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key);

test("dice roll commits once, survives reload, returns to the card, and keeps Previous Card", async ({
  page,
}) => {
  await seed(page);
  await expect(page.getByRole("button", { name: /Roll 2d6/ })).toBeVisible();
  await page.locator(".game-card").click();
  await page.locator(".game-card").evaluate((el) => {
    for (let i = 0; i < 10; i++) (el as HTMLElement).click();
  });
  const committed = await saved(page);
  expect(committed.roll.values).toHaveLength(2);
  expect(committed.discarded).toBe(0);
  await page.reload();
  await expect(page.locator('[data-dice-state="result"]')).toBeVisible();
  expect((await saved(page)).roll).toEqual(committed.roll);
  expect(
    await page
      .locator(".die-model")
      .evaluateAll((els) =>
        els.map((e) => Number((e as HTMLElement).dataset.value)),
      ),
  ).toEqual(committed.roll.values);
  await page.getByRole("button", { name: /Return to card/ }).click();
  await ready(page);
  await expect(page.locator(".resolved-instruction")).toHaveText(
    committed.roll.instruction,
  );
  await expect(page.locator(".rolled-total")).toHaveText(
    `Rolled ${committed.roll.total}`,
  );
  await page.reload();
  await expect(page.locator(".resolved-instruction")).toHaveText(
    committed.roll.instruction,
  );
  await page.locator(".game-card").click();
  await ready(page);
  expect((await saved(page)).roll).toBeNull();
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page
    .getByRole("button", { name: "Previous card", exact: true })
    .click();
  await expect(page.locator(".previous-card .rolled-total")).toHaveText(
    `Rolled ${committed.roll.total}`,
  );
  await expect(page.locator(".previous-card .resolved-instruction")).toHaveText(
    committed.roll.instruction,
  );
  await page.getByRole("button", { name: "Back to game" }).click();
  await page.getByRole("button", { name: "Reveal card" }).click();
  await ready(page);
  await expect(page.getByRole("button", { name: /Roll 2d6/ })).toBeVisible();
});

test("d20 ends only after result return and final dismissal, with keyboard and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page, 1, 1);
  await page.getByRole("button", { name: /Roll 1d20/ }).focus();
  await page.keyboard.press("Enter");
  await ready(page);
  const roll = (await saved(page)).roll;
  expect(roll.total).toBeGreaterThanOrEqual(1);
  expect(roll.total).toBeLessThanOrEqual(20);
  await expect(page.getByRole("status")).toContainText(`Rolled ${roll.total}`);
  await page.keyboard.press("Enter");
  await ready(page);
  await expect(page.locator(".resolved-instruction")).toBeVisible();
  expect((await saved(page)).phase).toBe("revealed");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Play again", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play again", exact: true }).click();
  await ready(page);
  expect((await saved(page)).roll).toBeNull();
});

test("canceling animation or hiding the app keeps the committed result", async ({
  page,
}) => {
  for (const interrupt of ["cancel", "hide"]) {
    await seed(page);
    await page.locator(".game-card").click();
    await expect(page.locator(".die-model").first()).toBeVisible();
    const before = (await saved(page)).roll;
    await page.evaluate((interrupt) => {
      if (interrupt === "cancel")
        document.getAnimations().forEach((a) => a.cancel());
      else {
        Object.defineProperty(document, "hidden", {
          value: true,
          configurable: true,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      }
    }, interrupt);
    await ready(page);
    expect((await saved(page)).roll).toEqual(before);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        value: false,
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(
      page.getByRole("button", { name: /Return to card/ }),
    ).toBeVisible();
  }
});

test("animation failure and four-die results still allow play at enlarged text", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Element.prototype.animate = function () {
      throw new Error("Renderer unavailable");
    };
  });
  await page.setViewportSize({ width: 320, height: 700 });
  await seed(page, 0, 1, 4);
  await page.addStyleTag({ content: ":root{font-size:24px}" });
  await page.locator(".game-card").click();
  await ready(page);
  expect((await saved(page)).roll.values).toHaveLength(4);
  await page.getByRole("button", { name: /Return to card/ }).click();
  await ready(page);
  await expect(page.locator(".resolved-instruction")).toBeVisible();
  expect(
    await page.locator(".game-card").evaluate((el) => {
      const a = el.getBoundingClientRect(),
        b = el.querySelector(".resolved-instruction")!.getBoundingClientRect();
      return b.bottom <= a.bottom && b.left >= a.left && b.right <= a.right;
    }),
  ).toBe(true);
});

test("dice work offline after installation without a second roll on reload", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Offline service-worker automation covered in Chromium; physical iOS remains separate.",
  );
  await seed(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.locator(".game-card").click();
  await ready(page);
  await expect(page.locator(".die-model")).toHaveCount(2);
  const roll = (await saved(page)).roll;
  await page.reload();
  await expect(page.locator('[data-dice-state="result"]')).toBeVisible();
  expect((await saved(page)).roll).toEqual(roll);
  await context.setOffline(false);
});
