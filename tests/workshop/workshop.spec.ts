import { test, expect } from "@playwright/test";
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
  for (const id of ["core.cheers", "core.animals", "core.left"]) {
    await page.getByLabel("Card", { exact: true }).selectOption(id);
    await expect(page.locator(".study-rules p")).toBeVisible();
    await page.getByLabel("Enlarged text").check();
    expect(
      await page
        .locator(".study-rules")
        .evaluate((e) => e.scrollWidth <= e.clientWidth + 2),
    ).toBe(true);
    const fits = await page.locator(".game-card").evaluate((el) => {
      const card = el.getBoundingClientRect();
      const text = el.querySelector(".study-rules p")!.getBoundingClientRect();
      return (
        text.bottom <= card.bottom &&
        text.left >= card.left &&
        text.right <= card.right
      );
    });
    expect(fits).toBe(true);
    await page.getByLabel("Enlarged text").uncheck();
  }
  await page.getByRole("button", { name: "Replay reveal" }).click();
  await expect(page.getByRole("button", { name: "Reveal card" })).toBeVisible();
  await expect(page.locator(".card-stage")).not.toHaveClass(/deal|settle/);
  await page.getByRole("button", { name: "Reveal card" }).click();
  await expect(page.locator(".game-card")).toHaveClass(/face/);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
});

test("all Core study cards fit each preview size, including enlarged rules", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1400, height: 1100 });
  await page.goto("/?workshop=1");
  const picker = page.getByLabel("Card", { exact: true });
  const ids = await picker
    .locator("option")
    .evaluateAll((options) =>
      options.map((o) => (o as HTMLOptionElement).value),
    );
  for (const size of [
    "Small phone",
    "Large phone",
    "iPad",
    "Landscape",
    "Split view",
  ]) {
    await page.getByLabel("Viewport", { exact: true }).selectOption(size);
    let normalHeight: number | undefined;
    for (const id of ids) {
      await picker.selectOption(id);
      for (const large of [false, true]) {
        await page.getByLabel("Enlarged text").setChecked(large);
        if (!large) {
          const height = await page
            .locator(".game-card")
            .evaluate((el) => el.clientHeight);
          normalHeight ??= height;
          expect(
            Math.abs(height - normalHeight),
            `${size}: inconsistent normal card height for ${id}`,
          ).toBeLessThanOrEqual(1);
        }
        await expect(page.locator(".study-category")).toHaveCount(0);
        await expect(
          page.locator(".study-rules .card-pack-marks img"),
        ).toHaveAttribute("src", /art\/packs\/core.svg$/);
        expect(
          await page.locator(".game-card").evaluate((el) => {
            const box = el.getBoundingClientRect();
            return [
              ...el.querySelectorAll(".study-rules p,.study-title h2"),
            ].every((e) => {
              const r = e.getBoundingClientRect();
              return (
                r.left >= box.left - 2 &&
                r.right <= box.right + 2 &&
                r.bottom <= box.bottom + 2
              );
            });
          }),
          `${size} ${id} enlarged=${large}`,
        ).toBe(true);
      }
    }
  }
});
