import { test, expect, type Page } from "@playwright/test";
import { createSession, advance } from "../../src/game/engine";
import { cards, packs } from "../../src/content/catalog";
const key = "drink-at-ron.session.v1";
const core = packs.find((p) => p.id === "core")!;
const plain = cards.filter((c) => !c.dice && core.cardIds.includes(c.id));
async function seed(page: Page, session: unknown) {
  await page.goto("./");
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key, session },
  );
  await page.reload();
}
function game(limit = 3) {
  const list = plain.slice(0, limit);
  return createSession(
    { version: 1, packIds: ["core"], limit: list.length },
    list,
    [{ ...core, cardIds: list.map((c) => c.id) }],
  );
}
// Reveal, discard, reveal: an active session that has a previous card.
const withHistory = () => advance(advance(advance(game(3))));

test("dialog enter and exit share the motion tokens", async ({ page }) => {
  await page.goto("./");
  const tokens = await page.locator("main").evaluate((el) => ({
    enter: getComputedStyle(el).getPropertyValue("--motion-dialog").trim(),
    exit: getComputedStyle(el).getPropertyValue("--motion-dialog-exit").trim(),
  }));
  expect(tokens).toEqual({ enter: "220ms", exit: "180ms" });
  await page.getByRole("button", { name: "Install app" }).click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((el) => getComputedStyle(el).animationDuration),
  ).toBe("0.22s");
  await page.keyboard.press("Escape");
  const closing = page.locator("dialog.closing");
  await expect(closing).toBeAttached();
  expect(
    await closing.evaluate((el) => getComputedStyle(el).animationDuration),
  ).toBe("0.18s");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("an exiting dialog is inert and cannot trigger its controls", async ({
  page,
}) => {
  await seed(page, game());
  await page.getByRole("button", { name: "Open game menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  const closing = page.locator("dialog.closing");
  await expect(closing).toHaveAttribute("inert", "");
  expect(
    await closing.evaluate((el) => getComputedStyle(el).pointerEvents),
  ).toBe("none");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Escape closes the menu and restores focus to its opener", async ({
  page,
}) => {
  await seed(page, game());
  const opener = page.getByRole("button", { name: "Open game menu" });
  await opener.click();
  await expect(page.getByRole("dialog")).toContainText("Paused");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("menu → Previous card → Back to game returns to play", async ({
  page,
}) => {
  const session = withHistory();
  await seed(page, session);
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page
    .getByRole("button", { name: "Previous card", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Previous card");
  await expect(page.locator(".previous-card .study-face")).toBeVisible();
  await page.getByRole("button", { name: "Back to game" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".game-card")).toBeVisible();
});

test("cancelling End game keeps the active session", async ({ page }) => {
  await seed(page, game());
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page.getByRole("button", { name: "End game", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Call it a night?");
  await page.getByRole("button", { name: "Keep playing" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".game-card")).toBeVisible();
  await page.reload();
  await expect(page.locator(".game-card")).toBeVisible();
});

test("a dialog can be reopened after it fully closes", async ({ page }) => {
  await seed(page, game());
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page.getByRole("button", { name: "Resume game" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Open game menu" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).not.toHaveClass(/closing/);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("reduced motion still opens and closes dialogs", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page, game());
  await page.getByRole("button", { name: "Open game menu" }).click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
