import { test, expect, type Page } from "@playwright/test";
import { createSession } from "../../src/game/engine";
import { cards, packs } from "../../src/content/catalog";
const key = "drink-at-ron.session.v1";
const cheers = cards.find((c) => c.id === "core.cheers")!;
const diceCard = cards.find((c) => c.dice)!;
function sessionFor(
  card: (typeof cards)[number],
  phase: "hidden" | "revealed",
) {
  const session = createSession(
    { version: 1, packIds: ["core"], limit: 1 },
    [card],
    [{ ...packs[0], cardIds: [card.id] }],
  );
  session.phase = phase;
  return session;
}
async function seed(page: Page, session: unknown) {
  await page.goto("./");
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key, session },
  );
  await page.reload();
}
test("the reveal turns through edge-on instead of presenting the front early", async ({
  page,
}) => {
  // Install the clock so the controller's completion timeout cannot settle the
  // turn while we inspect it.
  await page.clock.install();
  await seed(page, sessionFor(cheers, "hidden"));
  await page.getByRole("button", { name: "Reveal card" }).click();
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .some(
        (a) =>
          a instanceof CSSTransition && a.transitionProperty === "transform",
      ),
  );
  const turn = await page.evaluate(() => {
    const rotator = document.querySelector(".card-rotator") as HTMLElement;
    const duration = parseFloat(getComputedStyle(rotator).transitionDuration);
    const animations = document.getAnimations();
    const scale = () => {
      const value = getComputedStyle(rotator).transform;
      if (value === "none") return 1;
      const body = value.slice(value.indexOf("(") + 1);
      return Number(body.match(/-?\d*\.?\d+(?:e-?\d+)?/i)![0]);
    };
    const at = (ms: number) => {
      for (const a of animations) {
        a.pause();
        a.currentTime = ms;
      }
      return scale();
    };
    return { duration, early: at(70), late: at(420) };
  });
  // +1 is the card back, -1 the front, 0 edge-on.
  expect(
    turn.early,
    "the back is still face-on early in the turn",
  ).toBeGreaterThan(0.5);
  expect(turn.late, "the front is presented before the end").toBeLessThan(-0.5);
  // One token owns the flip phase (theme.motion.flip === 560ms).
  expect(Math.abs(turn.duration - 0.56)).toBeLessThan(0.01);
});
test("the lifted card owns its shadow and the glint turns with the front", async ({
  page,
}) => {
  await seed(page, sessionFor(cheers, "hidden"));
  const layers = await page.evaluate(() => {
    const card = document.querySelector(".game-card") as HTMLElement;
    const rotator = document.querySelector(".card-rotator") as HTMLElement;
    const front = document.querySelector(".card-front") as HTMLElement;
    const glint = document.querySelector(".reveal-glint") as HTMLElement;
    const frontStyle = getComputedStyle(front);
    return {
      cardShadow: getComputedStyle(card).boxShadow,
      rotatorShadow: getComputedStyle(rotator).boxShadow,
      glintInFront: front.contains(glint),
      frontOverflow: frontStyle.overflow,
      frontPosition: frontStyle.position,
    };
  });
  // A shadow on the un-rotating button rendered as a stationary rectangular
  // slab behind the edge-on surface; it belongs on the turning quad.
  expect(layers.cardShadow).toBe("none");
  expect(layers.rotatorShadow).not.toBe("none");
  // The highlight lives on the front surface so it turns and clips with it.
  expect(layers.glintInFront).toBe(true);
  expect(layers.frontOverflow).toBe("hidden");
  expect(layers.frontPosition).toBe("relative");
});
test("the dice-ready accent animates opacity, never box-shadow", async ({
  page,
}) => {
  await seed(page, sessionFor(diceCard, "revealed"));
  await expect(page.locator(".study-face.dice-ready")).toHaveCount(1);
  const accent = await page.evaluate(() => {
    const face = document.querySelector(".study-face.dice-ready")!;
    const before = getComputedStyle(face, "::before");
    let glow: string[] = [];
    let pulse = false;
    for (const sheet of document.styleSheets) {
      for (const rule of sheet.cssRules) {
        if (!(rule instanceof CSSKeyframesRule)) continue;
        if (rule.name === "dice-ready-pulse") pulse = true;
        if (rule.name === "dice-ready-glow")
          glow = [...rule.cssRules].map(
            (frame) => (frame as CSSKeyframeRule).style.cssText,
          );
      }
    }
    return {
      name: before.animationName,
      shadow: before.boxShadow,
      glow,
      pulse,
    };
  });
  // The old continuous box-shadow pulse is gone; the accent is compositor-only.
  expect(accent.pulse).toBe(false);
  expect(accent.name).toBe("dice-ready-glow");
  expect(accent.glow.some((frame) => /opacity/i.test(frame))).toBe(true);
  expect(accent.glow.some((frame) => /box-shadow/i.test(frame))).toBe(false);
  expect(accent.shadow).not.toBe("none");
});
test("reduced motion keeps the dice-ready accent static", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page, sessionFor(diceCard, "revealed"));
  await expect(page.locator(".study-face.dice-ready")).toHaveCount(1);
  const name = await page
    .locator(".study-face.dice-ready")
    .evaluate((el) => getComputedStyle(el, "::before").animationName);
  expect(name).toBe("none");
});
