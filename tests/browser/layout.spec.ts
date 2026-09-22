import { test, expect, type Page } from "@playwright/test";
import { createSession, advance } from "../../src/game/engine";
import { cards, packs } from "../../src/content/catalog";
const key = "drink-at-ron.session.v1";
const core = packs.find((p) => p.id === "core")!;
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
test("Core instructions fit at 390x844 with ratio, pack mark and no CTA occlusion", async ({
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
        ratio: card.width / card.height,
        mark: !!document.querySelector(".card-footer .card-pack-marks img"),
      };
    });
    expect(m.fit, `${card.id} rules should fit at 390x844`).toBe(true);
    expect(Math.abs(m.ratio - 2 / 3), `${card.id} ratio`).toBeLessThan(0.01);
    expect(m.mark, `${card.id} keeps its pack mark`).toBe(true);
  }
});
test("the imprint is decorative, clipped to the parchment, and under the rules", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page, revealed(samples[0]));
  await expect(page.locator(".card-imprint-lattice")).toHaveCount(1);
  const m = await page.evaluate(() => {
    const lattice = document.querySelector(".card-imprint-lattice")!;
    const rules = document.querySelector(".study-rules")!;
    const body = document.querySelector(".study-body")!;
    const style = getComputedStyle(lattice);
    const box = lattice.getBoundingClientRect();
    const bodyBox = body.getBoundingClientRect();
    return {
      pointer: style.pointerEvents,
      opacity: Number(style.opacity),
      latticeZ: Number(style.zIndex),
      rulesZ: Number(getComputedStyle(rules).zIndex),
      masked: style.maskImage !== "none" || style.webkitMaskImage !== "none",
      // The lattice is clipped to the parchment panel, never over the frame.
      inside: box.left >= bodyBox.left - 1 && box.right <= bodyBox.right + 1,
      motifs: lattice.querySelectorAll("pattern").length,
    };
  });
  expect(m.pointer).toBe("none");
  expect(m.opacity).toBeLessThan(0.15);
  expect(m.rulesZ).toBeGreaterThan(m.latticeZ);
  expect(m.masked).toBe(true);
  expect(m.inside).toBe(true);
  expect(m.motifs).toBe(1);
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
    page.locator(".previous-card .card-pack-marks img"),
  ).toBeVisible();
});
test("a short phone scrolls long rules with a visible overflow affordance", async ({
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
});
test("artwork scene comes from the registry, not the card id", async ({
  page,
}) => {
  const cheers = cards.find((c) => c.id === "core.cheers-idiots")!;
  const placeholder = plain.find((c) => c.artwork === "art/tankard.webp")!;
  await seed(page, revealed(cheers));
  const image = page.locator(".study-illustration img");
  await expect(image).toHaveClass(/painted-scene/);
  await expect
    .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await seed(page, revealed(placeholder));
  await expect(page.locator(".study-illustration img")).toHaveClass(
    /placeholder-scene/,
  );
});

test("illustrations change inside the opening without painting over the frame", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page, revealed(cards.find((c) => c.id === "core.cheers-idiots")!));
  await page.addStyleTag({
    content:
      ".card-stage{transform:none}.study-illustration img{visibility:hidden}.study-illustration{background:red}",
  });
  const face = page.locator(".study-face");
  const red = await face.screenshot();
  await page.addStyleTag({ content: ".study-illustration{background:blue}" });
  const blue = await face.screenshot();
  const sharp = (await import("sharp")).default;
  const a = await sharp(red)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const b = await sharp(blue).ensureAlpha().raw().toBuffer();
  const pixel = (data: Buffer, x: number, y: number) => {
    const offset =
      (Math.floor(y * a.info.height) * a.info.width +
        Math.floor(x * a.info.width)) *
      4;
    return [...data.subarray(offset, offset + 4)];
  };
  // The aperture changes, but the top ornament, side rails and title stay intact.
  expect(pixel(a.data, 0.5, 0.2)).not.toEqual(pixel(b, 0.5, 0.2));
  for (const [x, y] of [
    [0.5, 0.065],
    [0.05, 0.25],
    [0.95, 0.25],
    [0.5, 0.46],
  ]) {
    expect(pixel(a.data, x, y)).toEqual(pixel(b, x, y));
  }
});

test("failed scene and placeholder leave the original leather visible", async ({
  page,
}) => {
  await page.route("**/art/cheers.webp", (route) => route.abort());
  await page.route("**/art/tankard.webp", (route) => route.abort());
  await seed(page, revealed(cards.find((c) => c.id === "core.cheers-idiots")!));
  await expect(page.locator(".study-illustration img")).toHaveCSS(
    "visibility",
    "hidden",
  );
  const background = await page
    .locator(".study-face")
    .evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(background).toContain("continuous-frame");
  await expect(page.locator(".study-rules")).toBeVisible();
});
