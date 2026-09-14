import { test, expect } from "@playwright/test";
const key = "drink-at-ron.session.v1";
async function ready(page: import("@playwright/test").Page) {
  await expect(page.locator(".card-stage")).not.toHaveClass(
    /flip|discard|settle|deal/,
  );
}
test("full custom game, rapid taps, restore, previous card, replay and settings", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await page.getByRole("button", { name: "Custom deck size" }).click();
  await page.getByLabel("Number of cards").fill("2");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Reveal card" }).click();
  await page.locator(".game-card").evaluate((el) => {
    for (let i = 0; i < 8; i++) (el as HTMLElement).click();
  });
  await ready(page);
  await expect(page.locator(".card-front")).toHaveCSS(
    "border-top-width",
    "0px",
  );
  const title = await page.locator(".study-title h2").innerText();
  await page.reload();
  await expect(page.locator(".study-title h2")).toHaveText(title);
  await expect(page.locator(".progress")).toContainText("1 / 2");
  await page.locator(".game-card").click();
  await ready(page);
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page.getByRole("button", { name: "Previous card" }).click();
  await expect(page.locator(".previous-card h2")).toHaveText(title);
  await expect(page.locator(".previous-card .study-face")).toBeVisible();
  await expect(page.locator(".previous-card")).toHaveCSS(
    "border-top-width",
    "0px",
  );
  await page.getByRole("button", { name: "Back to game" }).click();
  await expect(page.locator(".progress")).toContainText("2 / 2");
  await page.getByRole("button", { name: "Reveal card" }).click();
  await ready(page);
  await expect(page.locator(".game-card")).toHaveClass(/face/);
  await page.locator(".game-card").click();
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  await page.getByRole("button", { name: "Play again" }).click();
  await expect(page.locator(".progress")).toContainText("1 / 2");
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page.getByRole("button", { name: "End game", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Call it a night?");
  await page.getByRole("button", { name: "Keep playing" }).click();
  await expect(page.locator(".game-card")).toBeVisible();
  expect(errors).toEqual([]);
});
test("empty pack and invalid custom size prevent play", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: /The house collection/ }).click();
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: /The house collection/ }).click();
  await page.getByRole("button", { name: "Custom deck size" }).click();
  for (const value of ["0", "501", "1.5"]) {
    await page.getByLabel("Number of cards").fill(value);
    await expect(
      page.getByRole("button", { name: "Play", exact: true }),
    ).toBeDisabled();
  }
});
test("corrupt save recovery", async ({ page }) => {
  await page.goto("./");
  await page.evaluate((k) => localStorage.setItem(k, '{"bad":true}'), key);
  await page.reload();
  await expect(page.getByText("This save lost")).toBeVisible();
  await page.getByRole("button", { name: "Return to setup" }).click();
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();
});
test("storage failure still allows play", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw Error("blocked");
    };
  });
  await page.goto("./");
  await expect(page.getByText(/Saving is unavailable/)).toBeVisible();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Reveal card" }).click();
  await expect(page.locator(".study-title h2")).toBeVisible();
});
test("portrait, landscape, iPad and large text retain readable rules", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  for (const viewport of [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 320, height: 700 },
  ]) {
    await page.setViewportSize(viewport);
    await page.getByRole("button", { name: "Reveal card" }).click();
    await ready(page);
    await expect(page.locator(".study-rules p")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator(".game-card").click();
    await ready(page);
  }
  await page.addStyleTag({ content: ":root {font-size:24px}" });
  await page.getByRole("button", { name: "Reveal card" }).click();
  await ready(page);
  const clipped = await page
    .locator(".game-card")
    .evaluate((el) => el.scrollHeight > el.clientHeight + 2);
  expect(clipped).toBe(false);
});
test("reduced motion and keyboard play", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Reveal card" }).focus();
  await page.keyboard.press("Enter");
  await ready(page);
  await expect(page.locator(".study-title h2")).toBeVisible();
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("offline reload keeps the same revealed card", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Playwright WebKit does not expose service worker control; verify installed iOS manually.",
  );
  await page.goto("./");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Reveal card" }).click();
  await ready(page);
  const title = await page.locator(".study-title h2").innerText();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".study-title h2")).toHaveText(title);
  expect(
    await page
      .locator(".study-illustration img")
      .evaluate((el) => (el as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
});

test("every sample card fits at enlarged text on a small phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("./");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  const original = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!),
    key,
  );
  for (const card of original.cards) {
    const state = {
      ...original,
      order: [
        card.id,
        ...original.order.filter((id: string) => id !== card.id),
      ],
      phase: "revealed",
    };
    await page.evaluate(
      ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
      { key, state },
    );
    await page.reload();
    await page.addStyleTag({ content: ":root {font-size:24px}" });
    await expect(page.locator(".study-title h2")).toHaveText(card.title);
    const fits = await page.locator(".game-card").evaluate((el) => {
      const box = el.getBoundingClientRect();
      const text = el.querySelector(".study-rules")!.getBoundingClientRect();
      return (
        text.left >= box.left &&
        text.right <= box.right &&
        text.bottom <= box.bottom &&
        text.top >= box.top
      );
    });
    expect(fits, card.title).toBe(true);
  }
});
test("custom size persists before starting and interruption restores a stable card", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Custom deck size" }).click();
  await page.getByLabel("Number of cards").fill("37");
  await page.reload();
  await expect(page.getByLabel("Number of cards")).toHaveValue("37");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Reveal card" }).click();
  await page.reload();
  await expect(page.locator(".game-card")).toHaveClass(/face/);
  await expect(page.locator(".card-stage")).not.toHaveClass(
    /flip|discard|settle|deal/,
  );
  await ready(page);
  await page.locator(".game-card").click();
  await page.reload();
  await expect(page.locator(".card-stage")).not.toHaveClass(
    /flip|discard|settle|deal/,
  );
  await expect(page.locator(".game-card")).toBeVisible();
});

test("minimal interface and a real two-sided flip", async ({ page }) => {
  await page.goto("./");
  await expect(
    page.locator(".helper, .footnote, .eyebrow, .tap-hint"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator(".card-front")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  await page.getByRole("button", { name: "Reveal card" }).click();
  await ready(page);
  await expect(page.locator(".card-front")).toHaveAttribute(
    "aria-hidden",
    "false",
  );
  const rotation = await page
    .locator(".card-rotator")
    .evaluate((el) => getComputedStyle(el).transform);
  expect(rotation).toContain("matrix3d(-1");
  await page.locator(".game-card").click();
  await ready(page);
  await expect(page.getByRole("button", { name: "Reveal card" })).toBeVisible();
  await expect(page.locator(".card-front")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  await expect(page.locator(".progress")).toContainText("2 / 40");
});

test("legacy sound preferences migrate and tavern switches persist", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate(() =>
    localStorage.setItem(
      "drink-at-ron.settings.v1",
      JSON.stringify({
        config: { version: 1, packIds: ["core"], limit: 40 },
        sound: true,
        choice: "40",
        customSize: "40",
      }),
    ),
  );
  await page.reload();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Open game menu" }).click();
  await expect(page.getByRole("switch", { name: /Effects/ })).toBeChecked();
  await expect(
    page.getByRole("switch", { name: /Ambience/ }),
  ).not.toBeChecked();
  await expect(page.getByRole("switch", { name: /Atmosphere/ })).toBeChecked();
  await page.getByRole("switch", { name: /Ambience/ }).click();
  await page.getByRole("switch", { name: /Atmosphere/ }).click();
  await page.reload();
  await page.getByRole("button", { name: "Open game menu" }).click();
  await expect(page.getByRole("switch", { name: /Ambience/ })).toBeChecked();
  await expect(
    page.getByRole("switch", { name: /Atmosphere/ }),
  ).not.toBeChecked();
});
test("unavailable or rejected audio never blocks gameplay", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    window.AudioContext = class {
      constructor() {
        throw Error("Audio unavailable");
      }
    } as unknown as typeof AudioContext;
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page.getByRole("switch", { name: /Effects/ }).click();
  await page.getByRole("switch", { name: /Ambience/ }).click();
  await page.getByRole("button", { name: "Resume game" }).click();
  await page.getByRole("button", { name: "Reveal card" }).click();
  await ready(page);
  await expect(page.locator(".study-title h2")).toBeVisible();
  expect(errors).toEqual([]);
});
test("canceled animations and backgrounding settle without additional draws", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Reveal card" }).click();
  await page
    .locator(".game-card")
    .evaluate((el) => el.getAnimations().forEach((a) => a.cancel()));
  await ready(page);
  await page.locator(".game-card").click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".card-stage")).not.toHaveClass(
    /flip|discard|settle|deal/,
  );
  await expect(page.locator(".progress")).toContainText("2 / 40");
  await expect(page.locator(".atmosphere")).toHaveClass(/suspended/);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".progress")).toContainText("2 / 40");
  await page.reload();
  await expect(page.locator(".progress")).toContainText("2 / 40");
});
test("offline uses local Grenze and painted controls", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Installed Safari offline remains a physical-device check",
  );
  await page.goto("./");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() => document.fonts.check("600 24px Grenze")),
  ).toBe(true);
  expect(
    await page
      .locator(".primary")
      .evaluate((el) => getComputedStyle(el).borderImageSource),
  ).toContain("button.webp");
  expect(
    await page
      .locator(".pack-copy .pack-logo img")
      .evaluate((el) => (el as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Install app" }).click();
  await expect(page.getByText("Ready for offline play")).toBeVisible();
});
test("readable fallback when artwork fails and keyboard focus returns", async ({
  page,
}) => {
  await page.route("**/art/tankard.webp", (route) => route.abort());
  await page.goto("./");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Reveal card" }).click();
  await ready(page);
  await expect(page.locator(".study-rules p")).toBeVisible();
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open game menu" }),
  ).toBeFocused();
});

test("rejected audio resume stays silent without an unhandled error", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    AudioContext.prototype.resume = () =>
      Promise.reject(Error("NotAllowedError"));
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Open game menu" }).click();
  await page.getByRole("switch", { name: /Ambience/ }).click();
  await page.getByRole("switch", { name: /Effects/ }).click();
  await page.getByRole("button", { name: "Resume game" }).click();
  await page.getByRole("button", { name: "Reveal card" }).click();
  await ready(page);
  expect(errors).toEqual([]);
});
