import { test, expect, type Page } from "@playwright/test";
import { createSession, advance } from "../../src/game/engine";
import { cards, packs } from "../../src/content/catalog";
const key = "drink-at-ron.session.v1";
const core = packs.find((p) => p.id === "core")!;
const house = packs.find((p) => p.id === "house")!;
const vip = packs.find((p) => p.id === "vip")!;
const plain = cards.filter((c) => !c.dice && core.cardIds.includes(c.id));
const longestRule = [...plain].sort(
  (a, b) => b.rules.length - a.rules.length,
)[0];
const longestTitle = [...plain].sort(
  (a, b) => b.title.length - a.title.length,
)[0];
const ruleCard = plain.find((c) => c.category === "rule")!;
const samples = [longestRule, longestTitle, ruleCard];
function revealed(card: (typeof cards)[number], list = [card]) {
  const session = createSession(
    { version: 1, packIds: ["core"], limit: list.length },
    list,
    [{ ...packs[0], cardIds: list.map((c) => c.id) }],
  );
  session.phase = "revealed";
  return session;
}
async function seed(page: Page, session: unknown) {
  await page.goto("./");
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key, session },
  );
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
}
test("@release Core instructions fit at 390x844 with ratio, pack mark and no CTA occlusion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const card of samples) {
    await seed(page, revealed(card));
    await expect(page.locator(".study-rules p")).toBeVisible();
    await expect(page.locator(".study-rules")).toHaveAttribute(
      "data-overflow",
      "none",
    );
    const m = await page.evaluate(() => {
      const rules = document.querySelector(".study-rules")!;
      const card = document
        .querySelector(".game-card")!
        .getBoundingClientRect();
      return {
        // 2px tolerance matches the overflow-affordance threshold (subpixel).
        fit: rules.scrollHeight <= rules.clientHeight + 2,
        fontSize: parseFloat(
          getComputedStyle(rules.querySelector("p")!).fontSize,
        ),
        ratio: card.width / card.height,
        mark: !!document.querySelector(
          ".card-footer .card-pack-marks .pack-logo-seal",
        ),
      };
    });
    expect(m.fit, `${card.id} rules should fit at 390x844`).toBe(true);
    expect(m.fontSize, `${card.id} readable table text`).toBeGreaterThanOrEqual(
      26,
    );
    expect(Math.abs(m.ratio - 2 / 3), `${card.id} ratio`).toBeLessThan(0.01);
    expect(m.mark, `${card.id} keeps its pack mark`).toBe(true);
  }
});
test("card parchment stays plain without an icon lattice or tint", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page, revealed(samples[0]));
  await expect(page.locator(".study-rules p")).toHaveText(samples[0].rules);
  await expect(
    page.locator(".card-imprint-lattice, .card-imprint-tint"),
  ).toHaveCount(0);
  await expect(page.locator(".card-footer .pack-logo")).toBeVisible();
});
test("Core, House and VIP seals stay inside the parchment at supported widths", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize(viewport);
    for (const pack of [core, house, vip]) {
      const card = cards.find((candidate) =>
        pack.cardIds.includes(candidate.id),
      )!;
      const session = createSession(
        {
          version: 1,
          packIds: pack.id === "core" ? ["core"] : ["core", pack.id],
          limit: 1,
        },
        [card],
        [core, house, vip],
      );
      session.phase = "revealed";
      await seed(page, session);
      const mark = page.locator(".card-footer .pack-logo");
      await expect(mark).toHaveAttribute(
        "data-seal",
        new RegExp(`art/packs/${pack.id}-seal\\.svg$`),
      );
      const geometry = await mark.evaluate((element) => {
        const seal = element.getBoundingClientRect();
        const parchment = element
          .closest(".study-body")!
          .getBoundingClientRect();
        const ink = getComputedStyle(
          element.querySelector(".pack-logo-seal")!,
          "::before",
        );
        return {
          inside:
            seal.left >= parchment.left &&
            seal.right <= parchment.right &&
            seal.top >= parchment.top &&
            seal.bottom <= parchment.bottom,
          mask: ink.maskImage || ink.webkitMaskImage,
        };
      });
      expect(
        geometry.inside,
        `${pack.id} seal stays inside at ${viewport.width}px`,
      ).toBe(true);
      expect(geometry.mask).toContain(`${pack.id}-seal.svg`);
    }
  }
});
test("Previous Card owns the same 2:3 geometry as gameplay", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const [a, b] = plain;
  let session = createSession(
    { version: 1, packIds: ["core"], limit: 3 },
    [a, b],
    [{ ...packs[0], cardIds: [a.id, b.id] }],
  );
  session = advance(advance(advance(session))); // reveal, discard, reveal
  await seed(page, session);
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page
    .getByRole("button", { name: "Previous card", exact: true })
    .click();
  const ratio = await page
    .locator(".previous-card")
    .evaluate((el) => el.clientWidth / el.clientHeight);
  expect(Math.abs(ratio - 2 / 3)).toBeLessThan(0.01);
  const fits = await page.locator(".previous-card").evaluate((el) => {
    const card = el.getBoundingClientRect();
    const parent = el.parentElement!.getBoundingClientRect();
    return card.left >= parent.left && card.right <= parent.right;
  });
  expect(fits, "Previous Card must not clip its right rail in the dialog").toBe(
    true,
  );
  await expect(
    page.locator(".previous-card .card-pack-marks .pack-logo-seal"),
  ).toBeVisible();
  await page.setViewportSize({ width: 320, height: 568 });
  const back = await page
    .getByRole("button", { name: "Back to game" })
    .boundingBox();
  expect(back, "Back to game stays visible on a short phone").not.toBeNull();
  expect(back!.y).toBeGreaterThanOrEqual(0);
  expect(back!.y + back!.height).toBeLessThanOrEqual(568);
});
test("an iOS top inset keeps topbar controls below the status-bar frost", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("./");
  // Browser emulation cannot produce env() insets; pose an iPhone 15 Pro
  // inset so the Home Screen layout is measurable.
  await page.addStyleTag({ content: ":root { --top-safe: 59px }" });
  const install = await page
    .getByRole("button", { name: "Install app" })
    .boundingBox();
  expect(install, "Install control is laid out").not.toBeNull();
  // 59px inset + 20px clearance keeps the control out of the iOS 27 frost.
  expect(install!.y).toBeGreaterThanOrEqual(79);
  const chrome = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      chrome: root.getPropertyValue("--chrome").trim(),
      html: root.backgroundColor,
      layers: getComputedStyle(document.body, "::before").backgroundImage,
    };
  });
  expect(chrome.chrome).toBe("#17100c");
  expect(chrome.html).toBe("rgb(23, 16, 12)");
  // The flat status-bar band and the bottom blend into the system strip use
  // the same page colour the installed app is sampled from.
  expect(
    chrome.layers.match(/rgb\(23, 16, 12\)/g)?.length ?? 0,
  ).toBeGreaterThanOrEqual(2);

  await seed(page, revealed(longestRule));
  await page.addStyleTag({ content: ":root { --top-safe: 59px }" });
  const menu = await page
    .getByRole("button", { name: "Open game menu" })
    .boundingBox();
  expect(menu, "game menu is laid out").not.toBeNull();
  expect(menu!.y).toBeGreaterThanOrEqual(79);
});
test("@release a short phone scrolls long rules with a visible overflow affordance", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await seed(page, revealed(longestRule));
  // Enlarged text guarantees the longest plain rule overflows the short phone.
  await page.addStyleTag({ content: ":root {font-size:24px}" });
  await expect(page.locator(".study-rules")).toHaveAttribute(
    "data-overflow",
    "bottom",
  );
  expect(
    await page
      .locator(".study-rules p")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(39);
});
test("legacy artwork references keep their saved text on the shared ornate front", async ({
  page,
}) => {
  for (const card of [
    cards.find((c) => c.id === "core.cheers-idiots")!,
    plain[0],
  ]) {
    await seed(page, revealed(card));
    await expect(page.locator(".study-title h2")).toHaveText(card.title);
    await expect(page.locator(".study-rules p")).toHaveText(card.rules);
    await expect(page.locator(".study-illustration")).toHaveCount(0);
    expect(
      await page
        .locator(".study-face")
        .evaluate((el) => getComputedStyle(el).backgroundImage),
    ).toContain("ornate-teal-frame");
  }
});

test("ornate surface loads as one complete frame", async ({ page }) => {
  await seed(page, revealed(plain[0]));
  const size = await page.locator(".study-face").evaluate(async (el) => {
    const url = getComputedStyle(el).backgroundImage.match(
      /url\(["']?(.*?)["']?\)/,
    )![1];
    const image = new Image();
    image.src = url;
    await image.decode();
    return [image.naturalWidth, image.naturalHeight];
  });
  expect(size).toEqual([768, 1152]);
});

test("missing frame keeps readable leather and parchment fallback surfaces", async ({
  page,
}) => {
  await page.route("**/*ornate-teal-frame*", (route) => route.abort());
  await seed(page, revealed(plain[0]));
  const background = await page
    .locator(".study-face")
    .evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(background).toContain("linear-gradient");
  expect(background).toContain("rgb(244, 223, 180)");
  await expect(page.locator(".study-title h2")).toHaveText(plain[0].title);
  await expect(page.locator(".study-rules p")).toHaveText(plain[0].rules);
});
