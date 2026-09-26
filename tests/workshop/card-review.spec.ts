import { test, expect } from "@playwright/test";
import { cards } from "../../src/content/catalog";

const storageKey = "drink-at-ron.card-review.v1";
const total = cards.length;

test("card review autosaves decisions and exports a Codex handoff", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto("/?review=1");
  await page.evaluate((key) => localStorage.removeItem(key), storageKey);
  await page.reload();

  await expect(
    page.getByRole("heading", { name: "Card review" }),
  ).toBeVisible();
  await expect(page.getByText(`0 / ${total} reviewed`)).toBeVisible();

  await page.getByRole("button", { name: "Approve & next" }).click();
  await expect(page.getByText(`1 / ${total} reviewed`)).toBeVisible();
  await page
    .getByRole("button", { name: "Change", exact: true })
    .last()
    .click();
  await page.getByLabel("Replacement title").fill("Revised Bar Tab");
  await page
    .getByLabel("Replacement body text")
    .fill("Give 2. Keep it civilized.");
  await page.getByLabel("Notes for Codex").fill("Lower the pour.");
  await page.getByRole("button", { name: "Save change & next" }).click();

  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
  expect(saved["core.house-special"].status).toBe("approved");
  expect(saved["core.bar-tab"]).toMatchObject({
    status: "change",
    proposedTitle: "Revised Bar Tab",
    proposedRules: "Give 2. Keep it civilized.",
    note: "Lower the pour.",
  });

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download handoff" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^drink-at-ron-card-review-.*\.md$/);
  const contents = await (await file.createReadStream()).toArray();
  const handoff = Buffer.concat(contents).toString("utf8");
  expect(handoff).toContain("### core.bar-tab");
  expect(handoff).toContain('Requested title: "Revised Bar Tab"');
  expect(handoff).toContain('Reviewer note: "Lower the pour."');

  await page.reload();
  await expect(page.getByText(`2 / ${total} reviewed`)).toBeVisible();
});
