import { test, expect } from "@playwright/test";
import { packs } from "../../src/content/catalog";
const preview = (page: import("@playwright/test").Page) =>
  page.frameLocator("iframe");
test("workshop previews are isolated, readable, and use real motion", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("workshop-sentinel", "unchanged"),
  );
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  await page.goto("/?workshop=1");
  await expect(
    page.getByRole("heading", { name: "Card workshop" }),
  ).toBeVisible();
  const frame = preview(page);
  for (const id of [
    "core.house-special",
    "core.categories",
    "core.rulemaster",
  ]) {
    await page.getByLabel("Card", { exact: true }).selectOption(id);
    await expect(frame.locator(".study-rules p")).toBeVisible();
    await page.getByLabel("Enlarged text").check();
    expect(
      await frame
        .locator(".study-rules")
        .evaluate((e) => e.scrollWidth <= e.clientWidth + 2),
    ).toBe(true);
    const fits = await frame.locator(".game-card").evaluate((el) => {
      const card = el.getBoundingClientRect();
      const rules = el.querySelector(".study-rules")!.getBoundingClientRect();
      return (
        rules.bottom <= card.bottom &&
        rules.left >= card.left &&
        rules.right <= card.right
      );
    });
    expect(fits).toBe(true);
    await page.getByLabel("Enlarged text").uncheck();
  }
  await page.getByRole("button", { name: "Replay reveal" }).click();
  await expect(
    frame.getByRole("button", { name: "Reveal card" }),
  ).toBeVisible();
  await expect(frame.locator(".card-stage")).not.toHaveClass(/deal|settle/);
  await frame.getByRole("button", { name: "Reveal card" }).click();
  await expect(frame.locator(".game-card")).toHaveClass(/face/);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
});
test("viewport presets set real width and height on the preview", async ({
  page,
}) => {
  await page.goto("/?workshop=1");
  const frame = page.locator("iframe");
  for (const [name, width, height] of [
    ["Small phone", 320, 568],
    ["Phone 390", 390, 844],
    ["Large phone", 430, 932],
    ["iPad", 768, 1024],
    ["Landscape", 844, 390],
    ["Split view", 375, 667],
  ] as const) {
    await page.getByLabel("Viewport", { exact: true }).selectOption(name);
    expect(
      await frame.evaluate((el) => ({
        w: el.clientWidth,
        h: el.clientHeight,
      })),
      `${name} preview viewport`,
    ).toEqual({ w: width, h: height });
  }
});
// One test per viewport. A single combined sweep exceeded its budget on the
// software-rendered CI WebKit runner; splitting keeps the same assertions while
// giving each viewport its own budget.
for (const size of [
  "Small phone",
  "Large phone",
  "iPad",
  "Landscape",
  "Split view",
]) {
  test(`all study cards retain their ratio at ${size}`, async ({ page }) => {
    // 40 sample cards (14 with dice) plus the VIP pack; each iteration
    // re-reads the preview, and software-rendered WebKit is the slow case.
    test.setTimeout(600000);
    await page.setViewportSize({ width: 1400, height: 1100 });
    await page.goto("/?workshop=1");
    const picker = page.getByLabel("Card", { exact: true });
    const ids = await picker
      .locator("option")
      .evaluateAll((options) =>
        options.map((o) => (o as HTMLOptionElement).value),
      );
    const frame = preview(page);
    await page.getByLabel("Viewport", { exact: true }).selectOption(size);
    let normalHeight: number | undefined;
    for (const id of ids) {
      await picker.selectOption(id);
      for (const large of [false, true]) {
        await page.getByLabel("Enlarged text").setChecked(large);
        if (!large) {
          const height = await frame
            .locator(".game-card")
            .evaluate((el) => el.clientHeight);
          normalHeight ??= height;
          expect(
            Math.abs(height - normalHeight),
            `${size}: inconsistent normal card height for ${id}`,
          ).toBeLessThanOrEqual(1);
        }
        await expect(frame.locator(".study-category")).toHaveCount(0);
        const logo = packs.find((p) => p.cardIds.includes(id))!.logo!;
        await expect(frame.locator(".card-pack-marks img")).toHaveAttribute(
          "src",
          new RegExp(`${logo.replace(/\//g, "\\/")}$`),
        );
        expect(
          await frame.locator(".game-card").evaluate((el) => {
            const box = el.getBoundingClientRect();
            const rules = el
              .querySelector(".study-rules")!
              .getBoundingClientRect();
            return (
              Math.abs(el.clientWidth / el.clientHeight - 2 / 3) < 0.01 &&
              Math.abs(
                (el.querySelector(".card-back") as HTMLElement).clientWidth -
                  (el.querySelector(".card-front") as HTMLElement).clientWidth,
              ) < 1 &&
              Math.abs(
                (el.querySelector(".card-back") as HTMLElement).clientHeight -
                  (el.querySelector(".card-front") as HTMLElement).clientHeight,
              ) < 1 &&
              rules.left >= box.left - 2 &&
              rules.right <= box.right + 2 &&
              rules.bottom <= box.bottom + 2 &&
              [...el.querySelectorAll(".study-title h2")].every((e) => {
                const r = e.getBoundingClientRect();
                return (
                  r.left >= box.left - 2 &&
                  r.right <= box.right + 2 &&
                  r.bottom <= box.bottom + 2
                );
              })
            );
          }),
          `${size} ${id} enlarged=${large}`,
        ).toBe(true);
      }
    }
  });
}
test("the dev force-motion override reaches the presentation controller", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?workshop=1&force-motion=1");
  await page
    .getByLabel("Card", { exact: true })
    .selectOption("core.house-special");
  const frame = preview(page);
  const navigated = page.waitForEvent(
    "framenavigated",
    (f) => f !== page.mainFrame(),
  );
  await page.getByRole("button", { name: "Replay reveal" }).click();
  await navigated;
  await frame.getByRole("button", { name: "Reveal card" }).click();
  // Reduced Motion would settle instantly; the override keeps the flip running
  // so the motion can be reviewed on a machine with it enabled.
  expect(await frame.locator(".card-stage").getAttribute("class")).toContain(
    "flip",
  );
  await expect(frame.locator(".game-card")).toHaveClass(/face/);
});
test("the production overlay is contained and seeded replay repeats outcomes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?workshop=1");
  await page.getByLabel("Card", { exact: true }).selectOption("core.dice-tax");
  const frame = preview(page);
  await expect(frame.locator(".roll-layer")).toBeVisible();
  const iframeBox = (await page.locator("iframe").boundingBox())!;
  const layerBox = (await frame.locator(".roll-layer").boundingBox())!;
  expect(layerBox.x).toBeGreaterThanOrEqual(iframeBox.x - 1);
  expect(layerBox.y).toBeGreaterThanOrEqual(iframeBox.y - 1);
  expect(layerBox.x + layerBox.width).toBeLessThanOrEqual(
    iframeBox.x + iframeBox.width + 1,
  );
  expect(layerBox.y + layerBox.height).toBeLessThanOrEqual(
    iframeBox.y + iframeBox.height + 1,
  );
  // A fresh dev preview mounts a fresh seed, so the same seed replays the same
  // dice outcome; without resetting `diceRandom` the second roll would differ.
  const run = async () => {
    const navigated = page.waitForEvent(
      "framenavigated",
      (f) => f !== page.mainFrame(),
    );
    await page.getByRole("button", { name: "Replay reveal" }).click();
    await navigated;
    await frame.getByRole("button", { name: "Reveal card" }).click();
    await expect(frame.locator(".game-card")).toHaveAccessibleName(/^Roll /);
    await frame.locator(".game-card").click();
    await expect(frame.locator(".resolved-instruction")).toBeVisible();
    return frame.locator(".resolved-instruction").innerText();
  };
  const first = await run();
  const second = await run();
  expect(second).toBe(first);
});
