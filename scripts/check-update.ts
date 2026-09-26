/** Exercise real production builds on one origin without touching the deploy artifact. */
import { chromium, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, extname } from "node:path";
import { createServer } from "node:http";
import assert from "node:assert/strict";
import { createSession } from "../src/game/engine";
import { cards, packs } from "../src/content/catalog";
const base = process.env.BASE_PATH || "/";
const temp = await mkdtemp(join(tmpdir(), "ron-update-"));
let directory = resolve("dist");
const releases = ["update-test-B", "update-test-C"];
const builds = releases.map((release) => {
  const outDir = join(temp, release);
  execFileSync(
    "node",
    ["node_modules/vite/bin/vite.js", "build", "--outDir", outDir],
    { env: { ...process.env, VITE_RELEASE_ID: release }, stdio: "pipe" },
  );
  return outDir;
});
const types: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url!, "http://localhost").pathname;
    if (!pathname.startsWith(base)) {
      res.writeHead(404).end();
      return;
    }
    const relative =
      decodeURIComponent(pathname.slice(base.length)) || "index.html";
    const path = resolve(directory, relative);
    if (!path.startsWith(directory + "/")) {
      res.writeHead(404).end();
      return;
    }
    const body = await readFile(path);
    res
      .writeHead(200, {
        "content-type": types[extname(path)] || "application/octet-stream",
        "cache-control": "no-cache",
      })
      .end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const address = server.address() as { port: number };
/**
 * A new worker activating under the open page fires controllerchange. Set a
 * flag before forcing the check so the script can wait for the takeover
 * itself: with autoUpdate the worker never waits, it claims the page.
 */
async function switched(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { __swSwitched?: boolean }).__swSwitched = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      (window as unknown as { __swSwitched?: boolean }).__swSwitched = true;
    });
  });
}
async function forceUpdate(page: Page) {
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  });
  await page.waitForFunction(
    () => (window as unknown as { __swSwitched?: boolean }).__swSwitched,
  );
}
const release = (page: Page) =>
  page.locator("html").getAttribute("data-release");
const stored = (page: Page) =>
  page.evaluate(() => localStorage.getItem("drink-at-ron.session.v1"));
const settled = (page: Page) =>
  page.waitForFunction(
    () =>
      !document.querySelector(
        ".card-stage.flip,.card-stage.settle,.card-stage.deal",
      ),
  );
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${address.port}${base}`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  // An active custom-length save from the earlier setup must still complete
  // normally after the three-mode setup replaces the Custom control.
  const legacyCustom = createSession(
    { version: 1, packIds: ["core"], limit: 1 },
    cards,
    packs,
  );
  const plainCard = legacyCustom.cards.find((card) => !card.dice)!;
  legacyCustom.order = [
    plainCard.id,
    ...legacyCustom.order.filter((id) => id !== plainCard.id),
  ];
  await page.evaluate(
    (session) =>
      localStorage.setItem("drink-at-ron.session.v1", JSON.stringify(session)),
    legacyCustom,
  );
  await page.reload();
  await page.getByRole("button", { name: "Reveal card" }).click();
  await settled(page);
  const original = await release(page);
  const saved = await stored(page);

  // Build B ships while the card sits on the table: the open page keeps
  // playing, and the new worker takes control so every navigation is current.
  directory = builds[0];
  await switched(page);
  await forceUpdate(page);
  assert.equal(
    await page.getByRole("button", { name: "Update game" }).count(),
    0,
  );
  assert.equal(await stored(page), saved);
  assert.equal(await release(page), original);

  // A refresh mid-game already serves the new release, with the save intact.
  await page.reload();
  await settled(page);
  assert.equal(await release(page), releases[0]);
  assert.equal(await stored(page), saved);

  // Build C ships mid-game too, then the game finishes and Update game reloads.
  directory = builds[1];
  await switched(page);
  await forceUpdate(page);
  assert.equal(
    await page.getByRole("button", { name: "Update game" }).count(),
    0,
  );
  assert.equal(await release(page), releases[0]);
  await page.locator(".game-card").click();
  await page.getByRole("button", { name: "Update game" }).waitFor();
  const complete = await stored(page);
  await page.getByRole("button", { name: "Update game" }).click();
  await page.waitForFunction(
    (release) => document.documentElement.dataset.release === release,
    releases[1],
  );
  assert.equal(await stored(page), complete);
  await page.getByRole("button", { name: "Play again" }).waitFor();
  console.log(
    "Update flow passed: no mid-game reload, a refresh serves the latest, and the between-games update keeps the save.",
  );
} finally {
  await browser.close();
  await new Promise<void>((r) => server.close(() => r()));
  await rm(temp, { recursive: true, force: true });
}
