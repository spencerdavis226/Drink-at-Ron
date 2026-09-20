import { test, expect, type Page } from "@playwright/test";
import { createSession } from "../../src/game/engine";
import { cards, packs } from "../../src/content/catalog";
const key = "drink-at-ron.session.v1";
test.beforeEach(async ({ page }) => {
  const ok = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  });
  test.skip(!ok, "WebGL unavailable (e.g. Linux CI WebKit)");
});
const diceIds = ["dice.toast", "dice.title"] as const;
async function seed(page: Page, index = 0) {
  const card = cards.find((c) => c.id === diceIds[index])!;
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
  await expect(page.locator(".roll-cta")).toHaveText(/^Roll /);
}
const saved = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key);
for (const index of [0, 1])
  test(`dice overlay renders saved ${index ? "d20" : "2d6"} faces over the card`, async ({
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
    // The card stays in the layout behind the transparent stage, undimmed.
    await expect(page.locator(".game-card")).toBeVisible();
    const bounds = await page.locator(".roll-layer").boundingBox();
    expect(bounds!.width).toBe(page.viewportSize()!.width);
    await page.locator(".roll-cta").click();
    const committed = await saved(page);
    await expect(page.locator(".roll-stage")).toHaveAttribute(
      "data-renderer",
      `settled:${committed.roll.values.join(",")}`,
      { timeout: 15000 },
    );
    console.log(
      info.project.name,
      index,
      "startup ms",
      await page.locator(".roll-stage").getAttribute("data-startup-ms"),
    );
    await page.screenshot({ path: info.outputPath(`settled-${index}.png`) });
    expect((await saved(page)).roll).toEqual(committed.roll);
    expect(external).toEqual([]);
    await expect(page.locator(".roll-cta")).toHaveText("Continue");
    await page.locator(".roll-cta").click();
    await expect(page.locator(".roll-layer")).toHaveCount(0);
    expect((await saved(page)).roll.returned).toBe(true);
    expect((await saved(page)).discarded).toBe(0);
  });
test("a restored unrolled dice card rolls from the CTA with Effects enabled", async ({
  page,
}) => {
  await seed(page);
  await page.evaluate(() =>
    localStorage.setItem(
      "drink-at-ron.settings.v1",
      JSON.stringify({
        config: { version: 1, packIds: ["core"], limit: 2 },
        sound: true,
        choice: "40",
        customSize: "40",
      }),
    ),
  );
  await page.reload();
  const cta = page.locator(".roll-cta");
  await expect(cta).toHaveText(/^Roll /);
  await cta.click();
  await expect(page.locator(".roll-stage")).toHaveAttribute(
    "data-renderer",
    /^settled:/,
    { timeout: 15000 },
  );
  await expect(page.locator(".roll-cta")).toHaveText("Continue");
  expect(await page.locator(".roll-stage").getAttribute("data-stop-reason")).toBe(
    "",
  );
});
test("repeated rolls settle, never fall back, and are never a weak plop", async ({
  page,
}) => {
  const durations: number[] = [];
  for (let i = 0; i < 6; i++) {
    await seed(page, i % 2);
    await page.locator(".roll-cta").click();
    await expect(page.locator(".roll-stage")).toHaveAttribute(
      "data-renderer",
      /^settled:/,
      { timeout: 15000 },
    );
    expect(
      await page.locator(".roll-stage").getAttribute("data-stop-reason"),
    ).toBe("");
    durations.push(
      Number(await page.locator(".roll-stage").getAttribute("data-roll-ms")),
    );
  }
  console.log("roll ms", durations.join(", "));
  for (const ms of durations) {
    expect(ms).toBeGreaterThan(700);
    expect(ms).toBeLessThan(6000);
  }
});
test("reload and reduced motion restore static saved result without replay", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page);
  // Reduced motion commits the roll with no dice animation.
  await page.locator(".roll-cta").click();
  await expect(page.locator(".roll-cta")).toHaveText("Continue");
  const committed = await saved(page);
  await page.reload();
  await expect(page.locator(".roll-cta")).toHaveText("Continue");
  await expect(page.locator(".roll-stage canvas")).toHaveCount(0);
  expect((await saved(page)).roll).toEqual(committed.roll);
});
test("dragging the resolved rules does not return or discard", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page);
  await page.locator(".roll-cta").click();
  await expect(page.locator(".roll-cta")).toHaveText("Continue");
  const box = (await page.locator(".study-rules").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 30, {
    steps: 5,
  });
  await page.mouse.up();
  await expect(page.locator(".roll-cta")).toHaveText("Continue");
  expect((await saved(page)).roll.returned).toBe(false);
  expect((await saved(page)).discarded).toBe(0);
  // A stationary tap on the card still returns, then the next action discards.
  await page.locator(".game-card").click();
  await expect(page.locator(".roll-layer")).toHaveCount(0);
  expect((await saved(page)).roll.returned).toBe(true);
  await page.locator(".game-card").click();
  await expect.poll(async () => (await saved(page)).discarded).toBe(1);
});
test("Escape interrupts safely and preserves the committed roll", async ({
  page,
}) => {
  await seed(page);
  await page.locator(".roll-cta").click();
  const committed = await saved(page);
  await page.keyboard.press("Escape");
  await expect(page.locator(".roll-cta")).toHaveText("Continue");
  expect((await saved(page)).roll).toEqual(committed.roll);
  await page.locator(".roll-cta").click();
  await expect(page.locator(".roll-layer")).toHaveCount(0);
  await expect(page.locator(".game-card")).toBeFocused();
});
test("offline dice roll and relaunch preserve result", async ({
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
  await page.locator(".roll-cta").click();
  await expect(page.locator(".roll-cta")).toHaveText("Continue", {
    timeout: 15000,
  });
  await expect(page.locator(".roll-stage")).toHaveAttribute(
    "data-renderer",
    /^settled:/,
  );
  const committed = await saved(page);
  await page.reload();
  await expect(page.locator(".roll-cta")).toHaveText("Continue");
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
  await page.locator(".roll-cta").click();
  await expect(page.locator(".roll-stage")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await expect(page.locator(".roll-cta")).toHaveText("Continue");
  expect((await saved(page)).roll.returned).toBe(false);
});
test("resize interruption settles without another roll", async ({ page }) => {
  await seed(page);
  await page.locator(".roll-cta").click();
  const committed = await saved(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator(".roll-cta")).toHaveText("Continue");
  expect((await saved(page)).roll).toEqual(committed.roll);
  await page.reload();
  await expect(page.locator(".roll-stage canvas")).toHaveCount(0);
});
test("backgrounding stops animation and preserves the saved outcome", async ({
  page,
}) => {
  await seed(page);
  await page.locator(".roll-cta").click();
  const committed = await saved(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".roll-cta")).toHaveText("Continue");
  await expect(page.locator(".roll-stage canvas")).toHaveCount(0);
  expect((await saved(page)).roll).toEqual(committed.roll);
});
