import { test, expect, type Page } from "@playwright/test";
import { createSession } from "../../src/game/engine";
import { packs } from "../../src/content/catalog";
import { diceFixtures } from "../../src/workshop/dice-fixtures";
const key = "drink-at-ron.session.v1";
async function seed(page: Page, index = 0) {
  const card = diceFixtures[index];
  const session = createSession(
    { version: 1, packIds: ["core"], limit: 2 },
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
  await expect(
    page.getByRole("button", { name: "ROLL", exact: true }),
  ).toBeVisible();
}
const saved = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key);
for (const index of [0, 1])
  test(`library renders saved ${index ? "d20" : "2d6"} faces across screen`, async ({
    page,
  }, info) => {
    const external: string[] = [];
    page.on("request", (request) => {
      if (
        !request.url().startsWith("http://127.0.0.1:") &&
        !request.url().startsWith("data:")
      )
        external.push(request.url());
    });
    await seed(page, index);
    const bounds = await page.locator("dialog").boundingBox();
    expect(bounds!.width).toBe(page.viewportSize()!.width);
    await page.getByRole("button", { name: "ROLL", exact: true }).click();
    const committed = await saved(page);
    await expect(page.locator(".full-dice-stage")).toHaveAttribute(
      "data-renderer",
      `settled:${committed.roll.values.join(",")}`,
      { timeout: 15000 },
    );
    console.log(
      info.project.name,
      index,
      "startup ms",
      await page.locator(".full-dice-stage").getAttribute("data-startup-ms"),
    );
    await page.screenshot({ path: info.outputPath(`settled-${index}.png`) });
    expect((await saved(page)).roll).toEqual(committed.roll);
    expect(external).toEqual([]);
    await page
      .getByRole("button", { name: "Return to card", exact: true })
      .click();
    await expect(page.locator("dialog")).toHaveCount(0);
    expect((await saved(page)).roll.returned).toBe(true);
    expect((await saved(page)).discarded).toBe(0);
  });
test("reload and reduced motion restore static saved result without replay", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page);
  await page.getByRole("button", { name: "ROLL", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Return to card", exact: true }),
  ).toBeEnabled();
  const committed = await saved(page);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Return to card", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".full-dice-stage canvas")).toHaveCount(0);
  expect((await saved(page)).roll).toEqual(committed.roll);
});
test("Escape interrupts safely and preserves the committed roll", async ({
  page,
}) => {
  await seed(page);
  await page.getByRole("button", { name: "ROLL", exact: true }).click();
  const committed = await saved(page);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Return to card", exact: true }),
  ).toBeEnabled();
  expect((await saved(page)).roll).toEqual(committed.roll);
  await page
    .getByRole("button", { name: "Return to card", exact: true })
    .click();
  await expect(page.locator(".game-card")).toBeFocused();
});
test("offline library roll and relaunch preserve result", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName === "webkit",
    "Playwright WebKit offline navigation fails here; verify installed iOS offline separately.",
  );
  await seed(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "ROLL", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Return to card", exact: true }),
  ).toBeEnabled({ timeout: 15000 });
  await expect(page.locator(".full-dice-stage")).toHaveAttribute(
    "data-renderer",
    /^settled:/,
  );
  const committed = await saved(page);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Return to card", exact: true }),
  ).toBeVisible();
  expect((await saved(page)).roll).toEqual(committed.roll);
  await context.setOffline(false);
});
test("WebGL failure uses a static result without blocking return", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await seed(page);
  await page.getByRole("button", { name: "ROLL", exact: true }).click();
  await expect(page.locator(".full-dice-stage")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await expect(
    page.getByRole("button", { name: "Return to card", exact: true }),
  ).toBeEnabled();
  expect((await saved(page)).roll.returned).toBe(false);
});
test("resize interruption settles without another roll", async ({ page }) => {
  await seed(page);
  await page.getByRole("button", { name: "ROLL", exact: true }).click();
  const committed = await saved(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(
    page.getByRole("button", { name: "Return to card", exact: true }),
  ).toBeEnabled();
  expect((await saved(page)).roll).toEqual(committed.roll);
  await page.reload();
  await expect(page.locator(".full-dice-stage canvas")).toHaveCount(0);
});
test("backgrounding stops animation and preserves the saved outcome", async ({
  page,
}) => {
  await seed(page);
  await page.getByRole("button", { name: "ROLL", exact: true }).click();
  const committed = await saved(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    page.getByRole("button", { name: "Return to card", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".full-dice-stage canvas")).toHaveCount(0);
  expect((await saved(page)).roll).toEqual(committed.roll);
});
