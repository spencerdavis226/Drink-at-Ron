import { test, expect, type Page } from "@playwright/test";
import { createSession } from "../../src/game/engine";
import { cards, packs } from "../../src/content/catalog";
const key = "drink-at-ron.session.v1";
const diceCard = cards.find((c) => c.dice)!;
async function seedDice(page: Page) {
  const session = createSession(
    { version: 1, packIds: ["core"], limit: 1 },
    [diceCard],
    [{ ...packs[0], cardIds: [diceCard.id] }],
  );
  session.phase = "revealed";
  await page.goto("./");
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key, session },
  );
  await page.reload();
}
test("unselected packs stay readable and selection is unambiguous", async ({
  page,
}) => {
  await page.goto("./");
  const core = page.getByRole("button", { name: /house collection/ });
  const other = page.getByRole("button", { name: /VIP night/ });
  const unselected = await other.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      opacity: Number(style.opacity),
      filter: style.filter,
      mark: el.querySelector(".checkbox")!.textContent,
    };
  });
  // An available-but-unselected pack must not look disabled.
  expect(unselected.opacity).toBe(1);
  expect(unselected.filter).toBe("none");
  expect(unselected.mark).toBe("+");
  expect(await core.locator(".checkbox").innerText()).toBe("✓");
  // The title and pack mark share one copy slot, so a wrapping name cannot
  // displace the identity mark.
  expect(
    await core.evaluate((el) => {
      const copy = el.querySelector(".pack-copy")!;
      return (
        copy.querySelector("strong")!.parentElement === copy &&
        copy.querySelector(".pack-logo")!.parentElement === copy
      );
    }),
  ).toBe(true);
  await other.click();
  await expect(other).toHaveAttribute("aria-pressed", "true");
  await expect(other.locator(".checkbox")).toHaveText("✓");
});
test("selecting VIP night reveals its one-line setup reminder", async ({
  page,
}) => {
  await page.goto("./");
  const vip = page.getByRole("button", { name: /VIP night/ });
  await expect(page.locator(".pack-hint")).toHaveCount(0);
  await vip.click();
  const hint = page.locator(".pack-hint");
  await expect(hint).toHaveCount(1);
  await expect(hint).toContainText("guest of honor");
  await vip.click();
  await expect(page.locator(".pack-hint")).toHaveCount(0);
});
test("the Roll control reuses the painted surface and keeps a 44px target", async ({
  page,
}) => {
  await seedDice(page);
  const cta = page.locator(".roll-cta");
  await expect(cta).toBeVisible();
  const metrics = await cta.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      source: style.borderImageSource,
      height: el.getBoundingClientRect().height,
    };
  });
  expect(metrics.source).toContain("button.webp");
  expect(metrics.height).toBeGreaterThanOrEqual(44);
});
test("dialog copy sits on a quiet panel surface", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Install app" }).click();
  await page.locator("dialog[open]").waitFor();
  const surface = await page.locator("dialog[open]").evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      border: style.borderImageSource,
      background: style.backgroundImage,
    };
  });
  expect(surface.border).toContain("panel.webp");
  // The painted frame stays, but the interior is scrimmed for readable copy.
  expect(surface.background).toContain("panel.webp");
  expect(surface.background).toContain("linear-gradient");
});
