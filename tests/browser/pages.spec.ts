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
  await page.goto("./?review=1");
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Card review" })).toHaveCount(
    0,
  );
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
  expect(manifest.orientation).toBe("portrait");
  // The installed Home Screen strip, the launch background and the app's top
  // band are all painted from this colour, so the page root must agree.
  const background = manifest.background_color as string;
  const asRgb = `rgb(${[1, 3, 5]
    .map((index) => parseInt(background.slice(index, index + 2), 16))
    .join(", ")})`;
  expect(background).toBe(manifest.theme_color);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundColor,
    ),
  ).toBe(asRgb);
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--chrome")
        .trim(),
    ),
  ).toBe(background);
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
  await page.getByRole("button", { name: "Choose packs" }).click();
  await expect(
    page
      .getByRole("button", { name: /The Core deck/ })
      .locator(".pack-logo img"),
  ).toHaveAttribute("src", /art\/packs\/core.svg$/);
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await seedPlain(page);
  await page.getByRole("button", { name: "Reveal card", exact: true }).click();
  await expect(page.locator(".card-stage")).not.toHaveClass(/flip|settle|deal/);
  await expect(page.locator(".card-category")).toHaveCount(0);
  await expect(page.locator(".card-pack-marks .pack-logo")).toHaveAttribute(
    "data-seal",
    /art\/packs\/core-seal.svg$/,
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
    page.locator(".previous-card .card-pack-marks .pack-logo"),
  ).toHaveAttribute("data-seal", /art\/packs\/core-seal.svg$/);
});
