import { expect, test } from "@playwright/test";
import { cards } from "../../src/content/catalog";

test("every authored title fits the two-line band at supported card widths", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/docs/studies/front-typography-2026-09-22/");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      document.fonts.check('700 30px "Source Serif 4 Title"'),
    ),
  ).toBe(true);

  for (const width of [260, 330, 480]) {
    await page.getByLabel("Card width").selectOption(String(width));
    for (const large of [false, true]) {
      await page.getByLabel("Enlarged title").setChecked(large);
      for (const card of cards) {
        await page.getByLabel("Title sample").selectOption(card.id);
        await expect(page.locator(".study-title h2")).toHaveText(card.title);
        const fit = await page.locator(".preview-card").evaluate((el) => {
          const title = el.querySelector<HTMLElement>(".study-title")!;
          const heading = title.querySelector<HTMLElement>("h2")!;
          const style = getComputedStyle(heading);
          return {
            size: parseFloat(style.fontSize),
            overflow:
              heading.getBoundingClientRect().height > title.clientHeight + 1 ||
              heading.scrollWidth > title.clientWidth + 1,
            lines: Math.round(
              heading.getBoundingClientRect().height /
                parseFloat(style.lineHeight),
            ),
          };
        });
        expect(fit.overflow, `${width}px ${card.id}`).toBe(false);
        expect(fit.lines, `${width}px ${card.id}`).toBeLessThanOrEqual(2);
        expect(fit.size, `${width}px ${card.id}`).toBeGreaterThanOrEqual(18);
      }
    }
  }
});

test("a wide title under the character limit shrinks without truncation", async ({
  page,
}) => {
  await page.goto(
    "/docs/studies/front-typography-2026-09-22/?width=260",
  );
  await page.evaluate(() => document.fonts.ready);
  const wide = "WWWWWWWW WWWWWWWW";
  await page.getByLabel("Try a title").fill(wide);
  await expect(page.locator(".study-title h2")).toHaveText(wide);
  const fit = await page.locator(".study-title").evaluate((title) => {
    const heading = title.querySelector<HTMLElement>("h2")!;
    return {
      size: parseFloat(getComputedStyle(heading).fontSize),
      overflow:
        heading.getBoundingClientRect().height > title.clientHeight + 1 ||
        heading.scrollWidth > title.clientWidth + 1,
    };
  });
  expect(fit.size).toBeLessThan(22.88);
  expect(fit.size).toBeGreaterThanOrEqual(18);
  expect(fit.overflow).toBe(false);

  // Old saved content can exceed today's authoring limit; its full text stays
  // in the scrollable title region rather than being rewritten or truncated.
  const legacy = "W".repeat(100);
  await page.getByLabel("Try a title").fill(legacy);
  await expect(page.locator(".study-title h2")).toHaveText(legacy);
  const title = page.locator(".study-title");
  await expect
    .poll(() => title.evaluate((el) => el.scrollHeight > el.clientHeight + 2))
    .toBe(true);
  await title.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
  await expect.poll(() => title.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
});
