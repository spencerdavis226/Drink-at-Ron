/** Exercise two actual production builds on one origin without touching the deploy artifact. */
import { chromium } from "@playwright/test";
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
const second = join(temp, "second");
execFileSync(
  "node",
  ["node_modules/vite/bin/vite.js", "build", "--outDir", second],
  { env: { ...process.env, VITE_RELEASE_ID: "update-test-B" }, stdio: "pipe" },
);
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
  await page.waitForFunction(
    () => !document.querySelector(".card-stage.flip,.card-stage.settle"),
  );
  const saved = await page.evaluate(() =>
    localStorage.getItem("drink-at-ron.session.v1"),
  );
  directory = second;
  await page.evaluate(async () => {
    const r = await navigator.serviceWorker.ready;
    await r.update();
  });
  await page.waitForFunction(
    async () => !!(await navigator.serviceWorker.ready).waiting,
  );
  assert.equal(
    await page.getByRole("button", { name: "Update game" }).count(),
    0,
  );
  assert.equal(
    await page.evaluate(() => localStorage.getItem("drink-at-ron.session.v1")),
    saved,
  );
  assert.notEqual(
    await page.locator("html").getAttribute("data-release"),
    "update-test-B",
  );
  await page.locator(".game-card").click();
  await page.getByRole("button", { name: "Update game" }).waitFor();
  const complete = await page.evaluate(() =>
    localStorage.getItem("drink-at-ron.session.v1"),
  );
  await page.getByRole("button", { name: "Update game" }).click();
  await page.waitForFunction(
    () => document.documentElement.dataset.release === "update-test-B",
  );
  assert.equal(
    await page.evaluate(() => localStorage.getItem("drink-at-ron.session.v1")),
    complete,
  );
  await page.getByRole("button", { name: "Play again" }).waitFor();
  console.log(
    "Two-build update passed: waits during play, offered between games, saves preserved.",
  );
} finally {
  await browser.close();
  await new Promise<void>((r) => server.close(() => r()));
  await rm(temp, { recursive: true, force: true });
}
