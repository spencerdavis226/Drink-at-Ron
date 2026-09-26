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
  await page.getByRole("button", { name: "Choose packs" }).click();
  const dialog = page.getByRole("dialog");
  const core = dialog.getByRole("button", { name: /The Core deck/ });
  const other = dialog.getByRole("button", { name: "VIP night", exact: true });
  await expect(core).toHaveAttribute("aria-pressed", "true");
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
  // The pack title and mark share one copy slot when a name wraps.
  expect(
    await other.evaluate((el) => {
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
  // Core is an ordinary opt-in pack now, too.
  await core.click();
  await expect(core).toHaveAttribute("aria-pressed", "false");
  await expect(dialog).not.toContainText("Always included");
});
test("selecting VIP night reveals its one-line setup reminder", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Choose packs" }).click();
  const vip = page
    .getByRole("dialog")
    .getByRole("button", { name: "VIP night", exact: true });
  await expect(page.locator(".pack-hint")).toHaveCount(0);
  await vip.click();
  const hint = page.locator(".pack-hint");
  await expect(hint).toHaveCount(1);
  await expect(hint).toContainText("guest of honor");
  await vip.click();
  await expect(page.locator(".pack-hint")).toHaveCount(0);
});
test("@release House and VIP are selectable add-ons and Core can be deselected", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("./");
  await page.getByRole("button", { name: "Choose packs" }).click();
  const dialog = page.getByRole("dialog");
  const vip = dialog.getByRole("button", { name: "VIP night", exact: true });
  const house = dialog.getByRole("button", { name: /The House deck/ });
  await expect(vip).toHaveAttribute("aria-pressed", "false");
  await expect(house).toHaveAttribute("aria-pressed", "false");
  expect(
    await dialog.evaluate((dialogEl) => {
      const rect = dialogEl.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= innerWidth;
    }),
  ).toBe(true);
  await house.click();
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  const session = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(session.config.packIds).toEqual(["core", "house"]);
  expect(session.cards).toHaveLength(219);
  expect(
    session.cards.some((card: { id: string }) => card.id === "house.sheet-091"),
  ).toBe(true);
  expect(
    session.cards.some((card: { id: string }) => card.id === "house.sheet-106"),
  ).toBe(false);
});
test("the card is the only dice control and keeps a generous target", async ({
  page,
}) => {
  await seedDice(page);
  await expect(page.locator(".roll-cta")).toHaveCount(0);
  const card = page.locator(".game-card");
  await expect(card).toHaveAccessibleName(/^Roll /);
  const box = await card.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
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
