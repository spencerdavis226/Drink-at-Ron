import { test, expect, type Page } from "@playwright/test";
import { createSession } from "../../src/game/engine";
import { cards, packs } from "../../src/content/catalog";
const key = "drink-at-ron.session.v1";

// A Pokémon League game one badge short, with a gym leader without dice
// (Jasmine) revealed.
async function seedOneBadgeShort(page: Page) {
  const session = createSession(
    { version: 1, packIds: ["pokemon"], limit: null, quest: "pokemon" },
    cards,
    packs,
  );
  session.order = [
    "pokemon.gym-jasmine",
    ...session.order.filter((id) => id !== "pokemon.gym-jasmine"),
  ];
  session.phase = "revealed";
  session.quest!.count = 7;
  // A known gauntlet, so the first finale card is predictable.
  session.quest!.finale = [
    "pokemon.legendary-articuno",
    "pokemon.elite-lorelei",
    "pokemon.elite-bruno",
    "pokemon.elite-agatha",
    "pokemon.elite-will",
    "pokemon.league-champion-blue",
  ];
  await page.goto("./");
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key, session },
  );
  await page.reload();
}

for (const width of [320, 390])
  test(`@release the badge meter fills and deals the League at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 700 });
    await seedOneBadgeShort(page);
    const meter = page.locator(".quest-meter");
    await expect(meter).toHaveAccessibleName("Badges: 7 of 8");
    await expect(meter).not.toHaveClass(/due/);
    // The meter shares the top row with the medallion without overlapping it.
    const [left, middle] = await Promise.all([
      meter.boundingBox(),
      page.locator(".progress").boundingBox(),
    ]);
    expect(left!.x).toBeGreaterThanOrEqual(0);
    expect(left!.x + left!.width).toBeLessThanOrEqual(middle!.x);
    // A gym leader carries its ribbon and stays inside the card.
    const ribbon = page.locator(".game-card .card-ribbon");
    await expect(ribbon).toHaveText("Gym Leader · Mineral Badge");
    const [card, banner] = await Promise.all([
      page.locator(".game-card").boundingBox(),
      ribbon.boundingBox(),
    ]);
    expect(banner!.x).toBeGreaterThan(card!.x);
    expect(banner!.x + banner!.width).toBeLessThan(card!.x + card!.width);
    await page.screenshot({ path: info.outputPath(`meter-${width}.png`) });

    // The eighth badge opens the gauntlet: the Legendary comes first.
    await page.locator(".game-card").click();
    await expect(meter).toHaveAccessibleName("Legendary");
    await expect(meter).toHaveClass(/due/);
    await page.getByRole("button", { name: "Reveal card" }).click();
    await expect(page.locator(".study-title h2")).toHaveText("Articuno");
    await expect(ribbon).toHaveText("Legendary Encounter");
    await expect(page.locator(".game-card")).toHaveAccessibleName(/^Roll /);

    // The gauntlet survives a reload.
    await page.reload();
    await expect(page.locator(".study-title h2")).toHaveText("Articuno");
    const saved = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      key,
    );
    expect(saved.quest).toMatchObject({ count: 8, due: true, step: 0 });
  });

test("@release Pokémon League is a mode that holds its pack on", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("./");
  const mode = page.getByRole("button", {
    name: "Pokémon League, Earn 8 badges",
  });
  await mode.click();
  await expect(mode).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Short, 30 cards" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.screenshot({ path: info.outputPath("setup-320.png") });
  // Its pack is on and cannot be switched off while the mode is chosen.
  await page.getByRole("button", { name: "Choose packs" }).click();
  const pokemon = page
    .getByRole("dialog")
    .getByRole("button", { name: /Pokémon night/ });
  await expect(pokemon).toHaveAttribute("aria-pressed", "true");
  await expect(pokemon).toHaveAttribute("aria-disabled", "true");
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator(".progress")).toBeVisible();
  await expect(page.locator(".quest-meter")).toHaveAccessibleName(
    "Badges: 0 of 8",
  );
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(saved.config).toMatchObject({
    packIds: ["core", "pokemon"],
    limit: null,
    quest: "pokemon",
  });
});

test("a plain mode plays the Pokémon pack without a meter", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Choose packs" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Pokémon night/ })
    .click();
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator(".progress")).toBeVisible();
  await expect(page.locator(".quest-meter")).toHaveCount(0);
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(saved.config.quest).toBeUndefined();
  expect(saved.quest).toBeUndefined();
});

test("the Elite Four count through the meter, and the Champion ends the run", async ({
  page,
}) => {
  const session = createSession(
    { version: 1, packIds: ["pokemon"], limit: null, quest: "pokemon" },
    cards,
    packs,
  );
  // Mid-gauntlet: the Legendary and one Elite Four member are behind us.
  Object.assign(session.quest!, {
    count: 8,
    due: true,
    step: 2,
    finale: [
      "pokemon.legendary-mewtwo",
      "pokemon.elite-karen",
      "pokemon.elite-bruno",
      "pokemon.elite-phoebe",
      "pokemon.elite-drake",
      "pokemon.league-champion-lance",
    ],
  });
  session.discarded = 2;
  session.previousId = "pokemon.elite-karen";
  session.phase = "revealed";
  await page.goto("./");
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key, session },
  );
  await page.reload();
  const meter = page.locator(".quest-meter");
  await expect(meter).toHaveAccessibleName("Elite Four: 2 of 4");
  await expect(page.locator(".study-title h2")).toHaveText("Bruno");
  await expect(page.locator(".game-card .card-ribbon")).toHaveText(
    "Elite Four · Fighting",
  );
  await page.locator(".game-card").click();
  await expect(meter).toHaveAccessibleName("Elite Four: 3 of 4");
});
