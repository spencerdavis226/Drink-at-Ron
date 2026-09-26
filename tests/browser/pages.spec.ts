import { test, expect } from "@playwright/test";
import { createSession } from "../../src/game/engine";
import { cards, packs } from "../../src/content/catalog";
const key = "drink-at-ron.session.v1";
const plain = cards.find(
  (c) => !c.dice && packs.find((p) => p.id === "core")!.cardIds.includes(c.id),
)!;
// Seed one known non-dice card so reveal -> discard -> previous is deterministic.
async function seedPlain(page: import("@playwright/test").Page) {
  const session = createSession(
    { version: 1, packIds: ["core"], limit: 40 },
    [plain],
    [{ ...packs[0], cardIds: [plain.id] }],
  );
  session.phase = "hidden";
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key, session },
  );
  await page.reload();
}
test("@release Pages manifest, assets and production exclusion", async ({
  page,
  request,
  baseURL,
}) => {
  const failures: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failures.push(r.url());
  });
  await page.goto("./?workshop=1");
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Card workshop" }),
  ).toHaveCount(0);
  const manifestURL = await page
    .locator('link[rel="manifest"]')
    .getAttribute("href");
  const response = await request.get(new URL(manifestURL!, baseURL).href);
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  const base = new URL(baseURL!).pathname;
  expect(manifest.start_url).toBe(base);
  expect(manifest.scope).toBe(base);
  for (const icon of manifest.icons)
    expect(
      (await request.get(new URL(icon.src, response.url()).href)).ok(),
    ).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  expect(failures).toEqual([]);
});

test("Core logo matches selection, card, pause legend and previous card", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Choose add-ons" }).click();
  await expect(page.locator(".included-pack .pack-logo img")).toHaveAttribute(
    "src",
    /art\/packs\/core.svg$/,
  );
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await seedPlain(page);
  await page.getByRole("button", { name: "Reveal card", exact: true }).click();
  await expect(page.locator(".card-stage")).not.toHaveClass(/flip|settle|deal/);
  await expect(page.locator(".card-category")).toHaveCount(0);
  await expect(page.locator(".card-pack-marks img")).toHaveAttribute(
    "src",
    /art\/packs\/core.svg$/,
  );
  await page.locator(".game-card").click();
  await expect(page.locator(".card-stage")).not.toHaveClass(
    /discard|settle|deal/,
  );
  await page.getByRole("button", { name: "Open game menu" }).click();
  await expect(page.locator(".active-pack-list img")).toHaveAttribute(
    "src",
    /art\/packs\/core.svg$/,
  );
  await page
    .getByRole("button", { name: "Previous card", exact: true })
    .click();
  await expect(
    page.locator(".previous-card .card-pack-marks img"),
  ).toHaveAttribute("src", /art\/packs\/core.svg$/);
});
